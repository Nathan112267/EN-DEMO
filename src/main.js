import "./style.css";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import faceDetectorModelUrl from "../backend/face_detector.task?url";
import { PHRASE_LIBRARY, matchPhraseToLibrary } from "./phrase-library.js";

const ui = {
  startCameraButton: document.querySelector("#startCameraButton"),
  toggleReadingButton: document.querySelector("#toggleReadingButton"),
  refreshStatusButton: document.querySelector("#refreshStatusButton"),
  clearLogButton: document.querySelector("#clearLogButton"),
  backendUrlInput: document.querySelector("#backendUrlInput"),
  cameraVideo: document.querySelector("#cameraVideo"),
  trackingCanvas: document.querySelector("#trackingCanvas"),
  cameraStatePill: document.querySelector("#cameraStatePill"),
  heroBackendStatus: document.querySelector("#heroBackendStatus"),
  cameraResolution: document.querySelector("#cameraResolution"),
  trackerState: document.querySelector("#trackerState"),
  trackerMode: document.querySelector("#trackerMode"),
  chunkWindow: document.querySelector("#chunkWindow"),
  queueDepth: document.querySelector("#queueDepth"),
  latestLatency: document.querySelector("#latestLatency"),
  matchedCommand: document.querySelector("#matchedCommand"),
  matchedMeta: document.querySelector("#matchedMeta"),
  latestTranscript: document.querySelector("#latestTranscript"),
  resultMeta: document.querySelector("#resultMeta"),
  engineName: document.querySelector("#engineName"),
  engineReady: document.querySelector("#engineReady"),
  backendSummary: document.querySelector("#backendSummary"),
  resultLog: document.querySelector("#resultLog"),
  phraseLibrary: document.querySelector("#phraseLibrary"),
  setupCode: document.querySelector("#setupCode"),
};

const state = {
  stream: null,
  captureStream: null,
  recorder: null,
  isReading: false,
  queue: [],
  sending: false,
  chunkIndex: 0,
  health: null,
  maxSentenceMs: 6000,
  captureFps: 25,
  processingTimer: null,
  recordingTimer: null,
  detector: null,
  detectorPromise: null,
  latestDetection: null,
  latestLandmarks: null,
  activeTake: null,
  captureCanvas: document.createElement("canvas"),
  captureContext: null,
  trackingContext: null,
};

state.captureContext = state.captureCanvas.getContext("2d", { willReadFrequently: true });
state.trackingContext = ui.trackingCanvas.getContext("2d");

const setupCommands = [
  "python3 -m venv .venv",
  "source .venv/bin/activate",
  "pip install -r backend/requirements.txt",
  "pip install -r backend/requirements-vsr.txt",
  "git clone https://github.com/mpc001/Visual_Speech_Recognition_for_Multiple_Languages backend/vendor/Visual_Speech_Recognition_for_Multiple_Languages",
  "export LIPREAD_ENGINE=external_vsr",
  "export LIPREAD_REPO_DIR=\"$PWD/backend/vendor/Visual_Speech_Recognition_for_Multiple_Languages\"",
  "export LIPREAD_CONFIG=\"$LIPREAD_REPO_DIR/configs/CMLR_V_WER8.0.ini\"",
  "python3 -m uvicorn backend.app:app --reload --port 8000",
].join("\n");

ui.setupCode.textContent = setupCommands;
ui.chunkWindow.textContent = `手动结束 · 最长 ${(state.maxSentenceMs / 1000).toFixed(0)} 秒`;

function apiUrl(path) {
  const raw = ui.backendUrlInput.value.trim().replace(/\/$/, "");
  return raw ? `${raw}${path}` : path;
}

function setCameraState(label, active = false) {
  ui.cameraStatePill.textContent = label;
  ui.cameraStatePill.dataset.active = active ? "true" : "false";
}

function setTrackerState(label, detail = "") {
  ui.trackerState.textContent = label;
  ui.trackerMode.textContent = detail || label;
}

function setReadingButton() {
  ui.toggleReadingButton.disabled = !state.stream;
  ui.toggleReadingButton.textContent = state.isReading ? "结束并识别" : "录一句";
}

function setTranscript(text, meta) {
  if (ui.latestTranscript) {
    ui.latestTranscript.textContent = text;
  }
  if (ui.resultMeta) {
    ui.resultMeta.textContent = meta;
  }
}

function setMatchedCommand(text, meta) {
  ui.matchedCommand.textContent = text;
  ui.matchedMeta.textContent = meta;
}

function renderPhraseLibrary() {
  ui.phraseLibrary.innerHTML = PHRASE_LIBRARY.map((entry) => {
    const examples = [entry.canonical, ...entry.aliases.slice(0, 2)].join(" · ");
    return `
      <article class="library-card">
        <p class="library-kicker">${entry.category}</p>
        <p class="library-title">${entry.canonical}</p>
        <p class="library-meta">${examples}</p>
      </article>
    `;
  }).join("");
}

async function readResponsePayload(response) {
  const rawText = await response.text();
  if (!rawText) {
    return {
      data: null,
      rawText: "",
    };
  }

  try {
    return {
      data: JSON.parse(rawText),
      rawText,
    };
  } catch (_error) {
    return {
      data: null,
      rawText,
    };
  }
}

function addLogRow(kind, title, detail) {
  const item = document.createElement("li");
  item.className = "log-item";
  item.innerHTML = `
    <span class="log-kind">${kind}</span>
    <div>
      <p class="log-line">${title}</p>
      <p class="log-subline">${detail}</p>
    </div>
  `;
  ui.resultLog.prepend(item);
  while (ui.resultLog.children.length > 8) {
    ui.resultLog.removeChild(ui.resultLog.lastElementChild);
  }
}

function updateQueueUi() {
  ui.queueDepth.textContent = `${state.queue.length}${state.sending ? " + 1" : ""}`;
}

function updateHealthUi(payload, errorText = "") {
  if (!payload) {
    ui.engineName.textContent = "unreachable";
    ui.engineReady.textContent = "no";
    ui.backendSummary.textContent = errorText || "后端不可达，请确认 FastAPI 服务是否已启动。";
    ui.heroBackendStatus.textContent = "backend offline";
    return;
  }

  ui.engineName.textContent = payload.engine || "-";
  ui.engineReady.textContent = payload.ready ? "yes" : "no";
  ui.backendSummary.textContent = payload.summary || "后端已连接。";
  ui.heroBackendStatus.textContent = payload.ready ? "backend ready" : "needs model setup";
}

async function refreshHealth() {
  try {
    const response = await fetch(apiUrl("/api/health"));
    const payload = await response.json();
    state.health = payload;
    updateHealthUi(payload);
  } catch (error) {
    state.health = null;
    updateHealthUi(null, error instanceof Error ? error.message : "unknown error");
  }
}

function pickRecorderOptions() {
  const mimeTypes = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "",
  ];

  for (const mimeType of mimeTypes) {
    if (!mimeType || MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType ? { mimeType, videoBitsPerSecond: 1_600_000 } : undefined;
    }
  }

  return undefined;
}

function extensionForMimeType(mimeType) {
  const normalized = (mimeType || "").toLowerCase();
  if (normalized.includes("mp4")) {
    return ".mp4";
  }
  if (normalized.includes("quicktime")) {
    return ".mov";
  }
  if (normalized.includes("ogg")) {
    return ".ogv";
  }
  return ".webm";
}

function waitForVideoMetadata(video) {
  if (video.readyState >= 1) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    video.addEventListener("loadedmetadata", () => resolve(), { once: true });
  });
}

function configureCaptureCanvas(sourceWidth, sourceHeight) {
  const maxWidth = 832;
  const scale = sourceWidth > maxWidth ? maxWidth / sourceWidth : 1;
  const width = Math.max(256, Math.round(sourceWidth * scale));
  const height = Math.max(256, Math.round(sourceHeight * scale));

  if (state.captureCanvas.width !== width || state.captureCanvas.height !== height) {
    state.captureCanvas.width = width;
    state.captureCanvas.height = height;
  }

  return { width, height };
}

function syncTrackingCanvasSize() {
  const rect = ui.cameraVideo.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const nextWidth = Math.max(1, Math.round(rect.width * dpr));
  const nextHeight = Math.max(1, Math.round(rect.height * dpr));

  if (ui.trackingCanvas.width !== nextWidth || ui.trackingCanvas.height !== nextHeight) {
    ui.trackingCanvas.width = nextWidth;
    ui.trackingCanvas.height = nextHeight;
  }

  return { rect, dpr };
}

function pickPrimaryDetection(detections) {
  if (!detections?.length) {
    return null;
  }

  let bestDetection = detections[0];
  let bestArea =
    (bestDetection.boundingBox?.width || 0) * (bestDetection.boundingBox?.height || 0);

  for (const detection of detections.slice(1)) {
    const area = (detection.boundingBox?.width || 0) * (detection.boundingBox?.height || 0);
    if (area > bestArea) {
      bestDetection = detection;
      bestArea = area;
    }
  }

  return bestDetection;
}

function extractStableLandmarks(detection, width, height) {
  if (!detection?.keypoints?.length) {
    return null;
  }

  const labeledKeypoints = new Map(
    detection.keypoints.map((keypoint) => [
      (keypoint.label || "").toUpperCase().replace(/ /g, "_"),
      keypoint,
    ])
  );

  const ordered = ["RIGHT_EYE", "LEFT_EYE", "NOSE_TIP", "MOUTH_CENTER"].map((label) =>
    labeledKeypoints.get(label)
  );

  const selected = ordered.every(Boolean) ? ordered : detection.keypoints.slice(0, 4);
  if (selected.length < 4) {
    return null;
  }

  return selected.map((keypoint) => [
    Math.round(keypoint.x * width),
    Math.round(keypoint.y * height),
  ]);
}

function clearTrackingOverlay() {
  if (!state.trackingContext) {
    return;
  }
  state.trackingContext.clearRect(0, 0, ui.trackingCanvas.width, ui.trackingCanvas.height);
}

function drawTrackingOverlay() {
  if (!state.trackingContext) {
    return;
  }

  const { rect, dpr } = syncTrackingCanvasSize();
  const context = state.trackingContext;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, ui.trackingCanvas.width, ui.trackingCanvas.height);
  context.scale(dpr, dpr);

  if (!state.latestDetection?.boundingBox || !state.captureCanvas.width || !state.captureCanvas.height) {
    return;
  }

  const scaleX = rect.width / state.captureCanvas.width;
  const scaleY = rect.height / state.captureCanvas.height;
  const { originX, originY, width, height } = state.latestDetection.boundingBox;

  context.strokeStyle = "rgba(244, 90, 63, 0.95)";
  context.lineWidth = 2;
  context.setLineDash([10, 8]);
  context.strokeRect(originX * scaleX, originY * scaleY, width * scaleX, height * scaleY);
  context.setLineDash([]);

  if (!state.latestLandmarks) {
    return;
  }

  const colors = ["#f45a3f", "#f45a3f", "#f0b05c", "#fff4d1"];
  state.latestLandmarks.forEach((point, index) => {
    context.beginPath();
    context.fillStyle = colors[index] || "#fff4d1";
    context.arc(point[0] * scaleX, point[1] * scaleY, index === 3 ? 5.5 : 4.25, 0, Math.PI * 2);
    context.fill();
  });
}

async function ensureFaceDetector() {
  if (state.detector) {
    return state.detector;
  }

  if (state.detectorPromise) {
    return state.detectorPromise;
  }

  setTrackerState("loading", "初始化浏览器关键点模型…");
  state.detectorPromise = (async () => {
    const wasmRoot = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm";
    const vision = await FilesetResolver.forVisionTasks(wasmRoot);
    state.detector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: faceDetectorModelUrl,
        delegate: "CPU",
      },
      runningMode: "VIDEO",
      minDetectionConfidence: 0.45,
      minSuppressionThreshold: 0.3,
    });
    setTrackerState("ready", "browser tracker ready");
    addLogRow("tracker", "浏览器关键点已就绪", "接下来录制的分段会附带稳定点。");
    return state.detector;
  })().catch((error) => {
    state.detectorPromise = null;
    state.detector = null;
    const message = error instanceof Error ? error.message : "browser tracker unavailable";
    setTrackerState("error", message);
    addLogRow("error", "浏览器关键点初始化失败", message);
    throw error;
  });

  return state.detectorPromise;
}

function processFrame() {
  if (!state.stream || !state.captureContext) {
    return;
  }

  const sourceWidth = ui.cameraVideo.videoWidth;
  const sourceHeight = ui.cameraVideo.videoHeight;
  if (!sourceWidth || !sourceHeight) {
    return;
  }

  const { width, height } = configureCaptureCanvas(sourceWidth, sourceHeight);
  state.captureContext.drawImage(ui.cameraVideo, 0, 0, width, height);

  let landmarks = null;
  if (state.detector) {
    const detectionResult = state.detector.detectForVideo(state.captureCanvas, performance.now());
    const detection = pickPrimaryDetection(detectionResult.detections);
    state.latestDetection = detection;
    state.latestLandmarks = detection ? extractStableLandmarks(detection, width, height) : null;
    landmarks = state.latestLandmarks;

    if (detection && landmarks) {
      setTrackerState("tracking", "browser landmarks locked");
    } else if (detection) {
      setTrackerState("partial", "检测到人脸，但关键点不完整");
    } else {
      setTrackerState("searching", "请把正脸和嘴部放进取景框");
    }
  }

  drawTrackingOverlay();

  if (state.isReading && state.activeTake) {
    state.activeTake.landmarks.push(landmarks);
  }
}

function startProcessingLoop() {
  if (state.processingTimer) {
    return;
  }

  processFrame();
  state.processingTimer = window.setInterval(processFrame, Math.round(1000 / state.captureFps));
}

function stopProcessingLoop() {
  if (!state.processingTimer) {
    return;
  }
  window.clearInterval(state.processingTimer);
  state.processingTimer = null;
}

async function startCamera() {
  if (state.stream) {
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: "user",
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  });

  state.stream = stream;
  ui.cameraVideo.srcObject = stream;
  await waitForVideoMetadata(ui.cameraVideo);
  await ui.cameraVideo.play();

  const rawWidth = ui.cameraVideo.videoWidth || 1280;
  const rawHeight = ui.cameraVideo.videoHeight || 720;
  const captureSize = configureCaptureCanvas(rawWidth, rawHeight);
  state.captureStream = state.captureCanvas.captureStream(state.captureFps);
  ui.cameraResolution.textContent = `${rawWidth} x ${rawHeight} -> ${captureSize.width} x ${captureSize.height}`;

  setCameraState("camera online", true);
  setReadingButton();
  setTrackerState("warming", "浏览器关键点模型加载中");
  startProcessingLoop();
  drawTrackingOverlay();
  addLogRow("camera", "摄像头已打开", "现在可以按“录一句”，说完后再结束并识别。");

  void ensureFaceDetector();
}

function stopCamera() {
  if (!state.stream) {
    return;
  }

  stopReading();
  stopProcessingLoop();
  state.stream.getTracks().forEach((track) => track.stop());
  state.captureStream?.getTracks().forEach((track) => track.stop());
  state.stream = null;
  state.captureStream = null;
  state.latestDetection = null;
  state.latestLandmarks = null;
  state.activeTake = null;
  ui.cameraVideo.srcObject = null;
  ui.cameraResolution.textContent = "未启动";
  setCameraState("camera idle", false);
  setTrackerState("idle", "browser tracker idle");
  setReadingButton();
  clearTrackingOverlay();
}

function enqueueBlob(blob, landmarks) {
  if (!blob || blob.size === 0) {
    return;
  }

  const trackedSamples = landmarks.filter(Boolean).length;
  state.queue.push({
    blob,
    mimeType: blob.type || "",
    extension: extensionForMimeType(blob.type),
    landmarks,
    trackedSamples,
    chunkIndex: state.chunkIndex++,
    startedAt: new Date().toISOString(),
  });
  updateQueueUi();
  void drainQueue();
}

async function drainQueue() {
  if (state.sending || state.queue.length === 0) {
    return;
  }

  state.sending = true;
  updateQueueUi();
  const job = state.queue.shift();
  if (!job) {
    state.sending = false;
    updateQueueUi();
    return;
  }

  try {
    if (job.trackedSamples < 6) {
      const message = "浏览器没有采到足够稳定的人脸关键点，这一句已跳过。";
      setTranscript("当前句子已跳过。", message);
      addLogRow("skip", `句子 ${job.chunkIndex} 已跳过`, message);
      return;
    }

    const formData = new FormData();
    formData.append("video", job.blob, `chunk-${job.chunkIndex}${job.extension}`);
    formData.append("chunk_index", String(job.chunkIndex));
    formData.append("client_started_at", job.startedAt);
    formData.append("client_capture_fps", String(state.captureFps));
    formData.append("client_video_width", String(state.captureCanvas.width));
    formData.append("client_video_height", String(state.captureCanvas.height));
    formData.append("tracker_mode", "browser-face-detector");
    formData.append("landmarks_json", JSON.stringify(job.landmarks));

    const sentAt = performance.now();
    const response = await fetch(apiUrl("/api/infer"), {
      method: "POST",
      body: formData,
    });
    const { data: payload, rawText } = await readResponsePayload(response);

    if (!response.ok) {
      const detail =
        payload?.detail?.message ||
        payload?.message ||
        rawText ||
        `推理失败，HTTP ${response.status}`;
      throw new Error(detail);
    }

    if (!payload) {
      throw new Error("后端没有返回 JSON。通常是 `8000` 端口的推理服务没启动，或代理请求被中断。");
    }

    const latency = payload.latency_ms ?? Math.round(performance.now() - sentAt);
    const detail = payload.details || {};
    const correctedTranscript = detail.corrected_transcript;
    const correctionConfidence = detail.correction_confidence ?? payload.confidence ?? null;
    const bestMatch = correctedTranscript
      ? matchPhraseToLibrary(correctedTranscript)
      : matchPhraseToLibrary(payload.transcript || "");
    if (correctedTranscript && bestMatch) {
      const matchScore = Math.round((correctionConfidence || 0) * 100);
      setMatchedCommand(
        correctedTranscript,
        `${bestMatch.entry.category} · fixed command model · ${matchScore}% · 原始输出「${payload.transcript || "-"}」`
      );
    } else if (bestMatch) {
      const matchScore = Math.round(bestMatch.score * 100);
      const matchHint =
        bestMatch.level === "high"
          ? "高置信匹配"
          : bestMatch.level === "medium"
            ? "中等置信匹配"
            : "低置信匹配，建议重录";
      setMatchedCommand(
        bestMatch.entry.canonical,
        `${bestMatch.entry.category} · ${matchHint} · ${matchScore}% · 原始输出「${payload.transcript || "-"}」`
      );
    } else {
      setMatchedCommand("未命中固定句库", "这一句和当前固定句库差异太大，建议重录。");
    }

    const meta = `engine ${payload.engine} · sentence ${job.chunkIndex} · ${job.mimeType || "video/unknown"} · ${detail.input_mode || "unknown"} · ${detail.usable_landmark_samples ?? job.trackedSamples} samples`;
    ui.latestLatency.textContent = `${latency} ms`;
    setTranscript(payload.transcript || "模型返回空结果", meta);
    addLogRow(
      "hyp",
      correctedTranscript || bestMatch?.entry.canonical || payload.transcript || "空输出",
      `句子 ${job.chunkIndex} · ${latency} ms · 原始「${payload.transcript || "-"}」`
    );
  } catch (error) {
    let message = error instanceof Error ? error.message : "unknown error";
    if (message === "Failed to fetch") {
      message = "无法连接到后端推理服务。请确认 `python3 -m uvicorn backend.app:app --reload --port 8000` 正在运行。";
    }
    if (message.includes("EBML header parsing failed")) {
      message = "浏览器上传的片段不是完整视频文件，已停止使用分片流模式并改为独立短录制。请刷新页面后重试。";
    }
    setMatchedCommand("请重录这一句", "当前没有稳定命中固定句库。");
    setTranscript("当前句子未能完成推理。", message);
    addLogRow("error", `句子 ${job.chunkIndex} 推理失败`, message);
  } finally {
    state.sending = false;
    updateQueueUi();
    if (state.queue.length > 0) {
      void drainQueue();
    }
  }
}

function clearRecordingTimer() {
  if (!state.recordingTimer) {
    return;
  }
  window.clearTimeout(state.recordingTimer);
  state.recordingTimer = null;
}

function finalizeReadingStop(statusDetail = "摄像头仍可继续预览。") {
  state.recorder = null;
  state.activeTake = null;
  clearRecordingTimer();
  state.isReading = false;
  setReadingButton();
  setCameraState(state.stream ? "camera online" : "camera idle", Boolean(state.stream));
  addLogRow("stream", "本句录制结束", statusDetail);
}

function startSentenceRecorder() {
  if (!state.captureStream) {
    return;
  }

  const recorder = new MediaRecorder(state.captureStream, pickRecorderOptions());
  const take = {
    blobs: [],
    landmarks: [],
    startedAt: performance.now(),
  };

  state.recorder = recorder;
  state.activeTake = take;

  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      take.blobs.push(event.data);
    }
  };

  recorder.onerror = (event) => {
    const message = event.error?.message || "浏览器录制器发生错误";
    setTranscript("识别录制失败。", message);
    addLogRow("error", "浏览器录制器异常", message);
    if (recorder.state !== "inactive") {
      recorder.stop();
    } else {
      finalizeReadingStop("浏览器录制器异常，已经停止。");
    }
  };

  recorder.onstop = () => {
    clearRecordingTimer();

    const blob = take.blobs.length
      ? new Blob(take.blobs, { type: take.blobs[0].type || recorder.mimeType || "video/webm" })
      : null;
    const durationMs = Math.round(performance.now() - take.startedAt);

    if (blob && blob.size > 0) {
      enqueueBlob(blob, take.landmarks.slice());
      finalizeReadingStop(`本句已提交识别，录制时长约 ${(durationMs / 1000).toFixed(1)} 秒。`);
      return;
    }

    finalizeReadingStop("本句录制为空，没有提交到模型。");
  };

  recorder.start();
  clearRecordingTimer();
  state.recordingTimer = window.setTimeout(() => {
    if (recorder.state !== "inactive") {
      addLogRow("stream", "达到最长录制时长", "已自动结束本句并提交识别。");
      recorder.stop();
    }
  }, state.maxSentenceMs);
}

async function startReading() {
  if (!state.stream) {
    await startCamera();
  }

  if (state.isReading || !state.captureStream) {
    return;
  }

  await ensureFaceDetector();

  state.isReading = true;
  setReadingButton();
  setCameraState("sentence recording", true);
  addLogRow(
    "stream",
    "开始录一句",
    `现在开始说这一句，说完后再点一次“结束并识别”。最长 ${(state.maxSentenceMs / 1000).toFixed(0)} 秒。`
  );
  startSentenceRecorder();
}

function stopReading() {
  if (!state.recorder || state.recorder.state === "inactive") {
    finalizeReadingStop();
    return;
  }

  state.recorder.stop();
}

ui.startCameraButton.addEventListener("click", async () => {
  if (state.stream) {
    stopCamera();
    addLogRow("camera", "摄像头已关闭", "预览、录制和关键点采样都已停止。");
    return;
  }

  try {
    await startCamera();
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法打开摄像头";
    addLogRow("error", "摄像头启动失败", message);
    setTranscript("摄像头启动失败。", message);
  }
});

ui.toggleReadingButton.addEventListener("click", async () => {
  if (state.isReading) {
    stopReading();
    return;
  }

  try {
    await startReading();
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法开始录这一句";
    addLogRow("error", "单句录制启动失败", message);
    setTranscript("单句录制启动失败。", message);
  }
});

ui.refreshStatusButton.addEventListener("click", () => {
  void refreshHealth();
});

ui.clearLogButton.addEventListener("click", () => {
  ui.resultLog.innerHTML = "";
});

ui.backendUrlInput.addEventListener("change", () => {
  void refreshHealth();
});

window.addEventListener("resize", () => {
  drawTrackingOverlay();
});

window.addEventListener("beforeunload", () => {
  stopReading();
  stopCamera();
});

setReadingButton();
setCameraState("camera idle", false);
setTrackerState("idle", "browser tracker idle");
setMatchedCommand("等待摄像头和后端就绪。", "当前会把模型输出映射到固定句库。");
renderPhraseLibrary();
void refreshHealth();
window.setInterval(() => {
  void refreshHealth();
}, 12000);
