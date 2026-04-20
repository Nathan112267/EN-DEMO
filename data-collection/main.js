import "./style.css";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import faceDetectorModelUrl from "../backend/face_detector.task?url";
import { PHRASE_LIBRARY } from "../src/phrase-library.js";

const TARGET_PER_PHRASE = 12;
const MIN_TRACKED_SAMPLES = 8;
const MAX_TAKE_MS = 6000;
const CAPTURE_FPS = 25;
const SPEAKER_STORAGE_KEY = "lipsight-speaker-id";

const phraseMap = new Map(PHRASE_LIBRARY.map((entry) => [entry.id, entry]));

const ui = {
  startCameraButton: document.querySelector("#startCameraButton"),
  toggleCaptureButton: document.querySelector("#toggleCaptureButton"),
  trainModelButton: document.querySelector("#trainModelButton"),
  exportManifestButton: document.querySelector("#exportManifestButton"),
  refreshDatasetButton: document.querySelector("#refreshDatasetButton"),
  speakerIdInput: document.querySelector("#speakerIdInput"),
  backendState: document.querySelector("#backendState"),
  currentPhraseLabel: document.querySelector("#currentPhraseLabel"),
  currentPhraseMeta: document.querySelector("#currentPhraseMeta"),
  overallProgressValue: document.querySelector("#overallProgressValue"),
  overallProgressFill: document.querySelector("#overallProgressFill"),
  overallProgressMeta: document.querySelector("#overallProgressMeta"),
  datasetPath: document.querySelector("#datasetPath"),
  cameraVideo: document.querySelector("#cameraVideo"),
  trackingCanvas: document.querySelector("#trackingCanvas"),
  cameraStatePill: document.querySelector("#cameraStatePill"),
  trackerState: document.querySelector("#trackerState"),
  trackerMode: document.querySelector("#trackerMode"),
  cameraResolution: document.querySelector("#cameraResolution"),
  totalSamplesValue: document.querySelector("#totalSamplesValue"),
  selectedPhraseCount: document.querySelector("#selectedPhraseCount"),
  takeStatus: document.querySelector("#takeStatus"),
  phraseGrid: document.querySelector("#phraseGrid"),
  sampleList: document.querySelector("#sampleList"),
};

const state = {
  stream: null,
  captureStream: null,
  recorder: null,
  isRecording: false,
  detector: null,
  detectorPromise: null,
  processingTimer: null,
  recordingTimer: null,
  latestDetection: null,
  latestLandmarks: null,
  activeTake: null,
  selectedPhraseId: PHRASE_LIBRARY[0]?.id || "",
  datasetStatus: null,
  captureCanvas: document.createElement("canvas"),
  captureContext: null,
  trackingContext: null,
};

state.captureContext = state.captureCanvas.getContext("2d", { willReadFrequently: true });
state.trackingContext = ui.trackingCanvas.getContext("2d");

function apiUrl(path) {
  return path;
}

function getSelectedPhrase() {
  return phraseMap.get(state.selectedPhraseId) || PHRASE_LIBRARY[0];
}

function setCameraState(label, active = false) {
  ui.cameraStatePill.textContent = label;
  ui.cameraStatePill.dataset.active = active ? "true" : "false";
}

function setStartCameraButton() {
  ui.startCameraButton.textContent = state.stream ? "关闭摄像头" : "打开摄像头";
}

function setTrackerState(label, detail = "") {
  ui.trackerState.textContent = label;
  ui.trackerMode.textContent = detail || label;
}

function setTakeStatus(message, tone = "neutral") {
  ui.takeStatus.textContent = message;
  ui.takeStatus.dataset.tone = tone;
}

function setBackendState(message, online = false) {
  ui.backendState.textContent = message;
  ui.backendState.dataset.online = online ? "true" : "false";
}

function setRecordingButton() {
  ui.toggleCaptureButton.disabled = !state.stream;
  ui.toggleCaptureButton.textContent = state.isRecording ? "结束并保存" : "录这一条";
}

function setTrainingButton(isBusy = false) {
  ui.trainModelButton.disabled = isBusy;
  ui.trainModelButton.textContent = isBusy ? "训练中…" : "训练固定句模型";
}

function readSpeakerId() {
  return ui.speakerIdInput.value.trim() || "speaker-01";
}

function persistSpeakerId() {
  window.localStorage.setItem(SPEAKER_STORAGE_KEY, readSpeakerId());
}

async function readResponsePayload(response) {
  const rawText = await response.text();
  if (!rawText) {
    return { data: null, rawText: "" };
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
  state.trackingContext?.clearRect(0, 0, ui.trackingCanvas.width, ui.trackingCanvas.height);
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

  context.strokeStyle = "rgba(193, 73, 40, 0.94)";
  context.lineWidth = 2;
  context.setLineDash([10, 8]);
  context.strokeRect(originX * scaleX, originY * scaleY, width * scaleX, height * scaleY);
  context.setLineDash([]);

  if (!state.latestLandmarks) {
    return;
  }

  const colors = ["#c14928", "#c14928", "#d18b3c", "#f8f0d8"];
  state.latestLandmarks.forEach((point, index) => {
    context.beginPath();
    context.fillStyle = colors[index] || "#f8f0d8";
    context.arc(point[0] * scaleX, point[1] * scaleY, index === 3 ? 5.6 : 4.2, 0, Math.PI * 2);
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
    return state.detector;
  })().catch((error) => {
    state.detectorPromise = null;
    state.detector = null;
    const message = error instanceof Error ? error.message : "browser tracker unavailable";
    setTrackerState("error", message);
    setTakeStatus(`关键点模型初始化失败：${message}`, "error");
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

  if (state.isRecording && state.activeTake) {
    state.activeTake.landmarks.push(landmarks);
  }
}

function startProcessingLoop() {
  if (state.processingTimer) {
    return;
  }

  processFrame();
  state.processingTimer = window.setInterval(processFrame, Math.round(1000 / CAPTURE_FPS));
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
  state.captureStream = state.captureCanvas.captureStream(CAPTURE_FPS);
  ui.cameraResolution.textContent = `${rawWidth} x ${rawHeight} -> ${captureSize.width} x ${captureSize.height}`;

  setCameraState("camera online", true);
  setStartCameraButton();
  setRecordingButton();
  setTakeStatus("摄像头已打开，等 Tracker 进入 tracking 后再录。", "neutral");
  startProcessingLoop();
  drawTrackingOverlay();

  void ensureFaceDetector();
}

function stopCamera() {
  if (!state.stream) {
    return;
  }

  stopRecording();
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
  setStartCameraButton();
  setTrackerState("idle", "browser tracker idle");
  setRecordingButton();
  clearTrackingOverlay();
}

function clearRecordingTimer() {
  if (!state.recordingTimer) {
    return;
  }
  window.clearTimeout(state.recordingTimer);
  state.recordingTimer = null;
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

function finalizeRecordingStop(detail = "当前录制已结束。") {
  state.recorder = null;
  state.activeTake = null;
  clearRecordingTimer();
  state.isRecording = false;
  setRecordingButton();
  setCameraState(state.stream ? "camera online" : "camera idle", Boolean(state.stream));
  setTakeStatus(detail, "neutral");
}

function formatDate(value) {
  if (!value) {
    return "未知时间";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "未知时间";
  }

  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCountForPhrase(phraseId) {
  return state.datasetStatus?.counts?.[phraseId] || 0;
}

function renderPhraseGrid() {
  ui.phraseGrid.innerHTML = PHRASE_LIBRARY.map((entry) => {
    const count = getCountForPhrase(entry.id);
    const progress = Math.min(100, Math.round((count / TARGET_PER_PHRASE) * 100));
    const selected = entry.id === state.selectedPhraseId;

    return `
      <button class="phrase-card${selected ? " is-selected" : ""}" data-phrase-id="${entry.id}" type="button">
        <div class="phrase-card-head">
          <p class="phrase-kicker">${entry.category}</p>
          <p class="phrase-count">${count} / ${TARGET_PER_PHRASE}</p>
        </div>
        <p class="phrase-title">${entry.canonical}</p>
        <p class="phrase-meta">${entry.aliases.slice(0, 2).join(" · ")}</p>
        <div class="mini-progress" aria-hidden="true">
          <span style="width:${progress}%"></span>
        </div>
      </button>
    `;
  }).join("");
}

function updateSelectedPhraseUi() {
  const phrase = getSelectedPhrase();
  const count = getCountForPhrase(phrase.id);
  ui.currentPhraseLabel.textContent = phrase.canonical;
  ui.currentPhraseMeta.textContent = `${phrase.category} · 已录 ${count} 条 · 建议至少 ${TARGET_PER_PHRASE} 条`;
  ui.selectedPhraseCount.textContent = `${count} / ${TARGET_PER_PHRASE}`;
}

function renderSampleList() {
  const samples = state.datasetStatus?.recent_samples || [];
  if (!samples.length) {
    ui.sampleList.innerHTML = `
      <li class="sample-empty">
        还没有样本。选中一句后，打开摄像头开始录第一条。
      </li>
    `;
    return;
  }

  ui.sampleList.innerHTML = samples.map((sample) => {
    const phrase = phraseMap.get(sample.phrase_id);
    return `
      <li class="sample-item">
        <div class="sample-copy">
          <p class="sample-title">${phrase?.canonical || sample.phrase_text || sample.phrase_id}</p>
          <p class="sample-meta">
            ${sample.speaker_id || "speaker-01"} · ${formatDate(sample.created_at)} · ${sample.duration_ms || "-"} ms · ${sample.tracked_samples || 0} landmarks
          </p>
          <p class="sample-path">${sample.video_path}</p>
        </div>
        <button class="sample-delete" data-sample-id="${sample.sample_id}" type="button">删除</button>
      </li>
    `;
  }).join("");
}

function updateProgressUi() {
  const total = state.datasetStatus?.total_samples || 0;
  const targetTotal = PHRASE_LIBRARY.length * TARGET_PER_PHRASE;
  const progress = Math.min(100, Math.round((total / targetTotal) * 100));
  ui.totalSamplesValue.textContent = String(total);
  ui.overallProgressValue.textContent = `${total} / ${targetTotal}`;
  ui.overallProgressFill.style.width = `${progress}%`;
  ui.overallProgressMeta.textContent = `7 句 × 每句目标 ${TARGET_PER_PHRASE} 条 · 当前 ${progress}%`;
  ui.datasetPath.textContent = state.datasetStatus?.root_dir || "等待后端连接…";
}

function updateDatasetUi() {
  renderPhraseGrid();
  updateSelectedPhraseUi();
  updateProgressUi();
  renderSampleList();
}

function chooseNextPhraseId() {
  const counts = PHRASE_LIBRARY.map((entry) => ({
    id: entry.id,
    count: getCountForPhrase(entry.id),
  }));
  const minimum = Math.min(...counts.map((entry) => entry.count));
  const candidates = counts.filter((entry) => entry.count === minimum).map((entry) => entry.id);
  const currentIndex = candidates.indexOf(state.selectedPhraseId);

  if (currentIndex >= 0 && currentIndex < candidates.length - 1) {
    return candidates[currentIndex + 1];
  }

  return candidates[0] || state.selectedPhraseId;
}

async function refreshDatasetStatus() {
  try {
    const response = await fetch(apiUrl("/api/dataset/status"));
    const { data, rawText } = await readResponsePayload(response);
    if (!response.ok || !data) {
      throw new Error(rawText || `状态拉取失败，HTTP ${response.status}`);
    }

    const payload = data;
    state.datasetStatus = payload;
    setBackendState("dataset api online", true);
    updateDatasetUi();
  } catch (error) {
    setBackendState("dataset api offline", false);
    ui.datasetPath.textContent = "后端未连接";
    setTakeStatus(
      error instanceof Error ? `后端未连接：${error.message}` : "后端未连接，暂时无法保存样本。",
      "error"
    );
  }
}

async function uploadTake(blob, take, durationMs) {
  const trackedSamples = take.landmarks.filter(Boolean).length;
  if (trackedSamples < MIN_TRACKED_SAMPLES) {
    setTakeStatus(
      `这条只采到 ${trackedSamples} 帧稳定关键点，低于 ${MIN_TRACKED_SAMPLES} 帧门槛，建议重录。`,
      "warning"
    );
    return;
  }

  const phrase = getSelectedPhrase();
  const formData = new FormData();
  formData.append("video", blob, `sample-${phrase.id}${extensionForMimeType(blob.type)}`);
  formData.append("phrase_id", phrase.id);
  formData.append("phrase_text", phrase.canonical);
  formData.append("speaker_id", readSpeakerId());
  formData.append("duration_ms", String(durationMs));
  formData.append("tracked_samples", String(trackedSamples));
  formData.append("client_capture_fps", String(CAPTURE_FPS));
  formData.append("client_video_width", String(state.captureCanvas.width));
  formData.append("client_video_height", String(state.captureCanvas.height));
  formData.append("tracker_mode", "browser-face-detector");
  formData.append("landmarks_json", JSON.stringify(take.landmarks));

  const response = await fetch(apiUrl("/api/dataset/samples"), {
    method: "POST",
    body: formData,
  });
  const { data, rawText } = await readResponsePayload(response);

  if (!response.ok) {
    const detail = data?.detail?.message || data?.message || rawText || `保存失败，HTTP ${response.status}`;
    throw new Error(detail);
  }

  state.datasetStatus = data?.dataset || state.datasetStatus;
  updateDatasetUi();

  const nextPhraseId = chooseNextPhraseId();
  state.selectedPhraseId = nextPhraseId;
  updateDatasetUi();

  setTakeStatus(
    `已保存一条「${phrase.canonical}」样本，时长 ${(durationMs / 1000).toFixed(1)} 秒。`,
    "success"
  );
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
    setTakeStatus(`录制失败：${message}`, "error");
    if (recorder.state !== "inactive") {
      recorder.stop();
    } else {
      finalizeRecordingStop("浏览器录制器异常，已经停止。");
    }
  };

  recorder.onstop = async () => {
    clearRecordingTimer();

    const blob = take.blobs.length
      ? new Blob(take.blobs, { type: take.blobs[0].type || recorder.mimeType || "video/webm" })
      : null;
    const durationMs = Math.round(performance.now() - take.startedAt);

    if (!blob || blob.size === 0) {
      finalizeRecordingStop("这条录制为空，没有保存。");
      return;
    }

    finalizeRecordingStop("正在保存这一条样本…");
    try {
      await uploadTake(blob, take, durationMs);
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存失败";
      setTakeStatus(`样本保存失败：${message}`, "error");
    }
  };

  recorder.start();
  clearRecordingTimer();
  state.recordingTimer = window.setTimeout(() => {
    if (recorder.state !== "inactive") {
      recorder.stop();
    }
  }, MAX_TAKE_MS);
}

async function startRecording() {
  if (!state.stream) {
    await startCamera();
  }

  if (state.isRecording || !state.captureStream) {
    return;
  }

  await ensureFaceDetector();

  state.isRecording = true;
  setRecordingButton();
  setCameraState("recording sample", true);
  setTakeStatus(`开始录制「${getSelectedPhrase().canonical}」，说完后点“结束并保存”。`, "recording");
  startSentenceRecorder();
}

function stopRecording() {
  if (!state.recorder || state.recorder.state === "inactive") {
    finalizeRecordingStop();
    return;
  }

  state.recorder.stop();
}

async function deleteSample(sampleId) {
  const response = await fetch(apiUrl(`/api/dataset/samples/${sampleId}`), {
    method: "DELETE",
  });
  const { data, rawText } = await readResponsePayload(response);

  if (!response.ok) {
    const detail = data?.detail?.message || data?.message || rawText || `删除失败，HTTP ${response.status}`;
    throw new Error(detail);
  }

  state.datasetStatus = data?.dataset || state.datasetStatus;
  updateDatasetUi();
  setTakeStatus("样本已删除。", "neutral");
}

async function exportManifest() {
  const response = await fetch(apiUrl("/api/dataset/manifest"));
  const { data, rawText } = await readResponsePayload(response);

  if (!response.ok || !data) {
    throw new Error(data?.detail?.message || rawText || `导出失败，HTTP ${response.status}`);
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `lipsight-dataset-manifest-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function trainModel() {
  setTrainingButton(true);
  try {
    const response = await fetch(apiUrl("/api/dataset/train-fixed-commands"), {
      method: "POST",
    });
    const { data, rawText } = await readResponsePayload(response);
    if (!response.ok || !data) {
      throw new Error(data?.detail?.message || rawText || `训练失败，HTTP ${response.status}`);
    }

    const artifact = data.artifact || {};
    const accuracy = Math.round((artifact.best_accuracy || 0) * 100);
    const engineStatus = data.engine_status || {};
    const autoActivated = Boolean(artifact.auto_activated);
    setTakeStatus(
      autoActivated
        ? `训练完成：${artifact.trained_samples || 0} 条样本，闭集校正留一验证约 ${accuracy}% ，当前已启用 fixed command 引擎。`
        : `训练完成：${artifact.trained_samples || 0} 条样本，但留一验证只有 ${accuracy}% ，系统暂时继续保留 ${engineStatus.engine || "external_vsr"}。`,
      "success"
    );
  } finally {
    setTrainingButton(false);
  }
}

function bindEvents() {
  ui.startCameraButton.addEventListener("click", async () => {
    if (state.stream) {
      stopCamera();
      setTakeStatus("摄像头已关闭。", "neutral");
      return;
    }

    try {
      await startCamera();
    } catch (error) {
      const message = error instanceof Error ? error.message : "无法打开摄像头";
      setTakeStatus(`摄像头启动失败：${message}`, "error");
    }
  });

  ui.toggleCaptureButton.addEventListener("click", async () => {
    if (state.isRecording) {
      stopRecording();
      return;
    }

    try {
      await startRecording();
    } catch (error) {
      const message = error instanceof Error ? error.message : "无法开始录制";
      setTakeStatus(`录制启动失败：${message}`, "error");
    }
  });

  ui.refreshDatasetButton.addEventListener("click", () => {
    void refreshDatasetStatus();
  });

  ui.exportManifestButton.addEventListener("click", async () => {
    try {
      await exportManifest();
      setTakeStatus("Manifest 已导出到浏览器下载目录。", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "导出失败";
      setTakeStatus(`导出失败：${message}`, "error");
    }
  });

  ui.trainModelButton.addEventListener("click", async () => {
    try {
      await trainModel();
    } catch (error) {
      const message = error instanceof Error ? error.message : "训练失败";
      setTakeStatus(`训练失败：${message}`, "error");
    }
  });

  ui.speakerIdInput.addEventListener("change", persistSpeakerId);
  ui.speakerIdInput.addEventListener("blur", persistSpeakerId);

  ui.phraseGrid.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest("[data-phrase-id]");
    if (!button) {
      return;
    }

    state.selectedPhraseId = button.dataset.phraseId || state.selectedPhraseId;
    updateDatasetUi();
    setTakeStatus(`已切换到「${getSelectedPhrase().canonical}」。`, "neutral");
  });

  ui.sampleList.addEventListener("click", async (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest("[data-sample-id]");
    if (!button) {
      return;
    }

    const sampleId = button.dataset.sampleId;
    if (!sampleId) {
      return;
    }

    const shouldDelete = window.confirm("确定删除这条样本吗？");
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteSample(sampleId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "删除失败";
      setTakeStatus(`删除失败：${message}`, "error");
    }
  });

  window.addEventListener("resize", () => {
    drawTrackingOverlay();
  });

  window.addEventListener("beforeunload", () => {
    stopRecording();
    stopCamera();
  });
}

function bootstrap() {
  const storedSpeaker = window.localStorage.getItem(SPEAKER_STORAGE_KEY);
  if (storedSpeaker) {
    ui.speakerIdInput.value = storedSpeaker;
  }

  setCameraState("camera idle", false);
  setStartCameraButton();
  setTrackerState("idle", "browser tracker idle");
  setRecordingButton();
  setTrainingButton(false);
  updateDatasetUi();
  bindEvents();
  void refreshDatasetStatus();
}

bootstrap();
