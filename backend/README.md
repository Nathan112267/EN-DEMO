# 实时唇语识别后端

这个目录提供一个轻量 `FastAPI` 服务，前端会把浏览器摄像头切成连续短视频片段，并把浏览器里提取的稳定人脸点位一并送到这里做推理。

## 目录职责

- `app.py`: HTTP 服务，暴露 `/api/health` 和 `/api/infer`
- `engines/external_vsr.py`: 对接 `mpc001/Visual_Speech_Recognition_for_Multiple_Languages`
- `engines/demo.py`: 模型未装好时的占位引擎

## 最小启动

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
python3 -m uvicorn backend.app:app --reload --port 8000
```

## 接中文 CMLR 模型

1. 克隆开源仓库到本地，例如：

```bash
git clone https://github.com/mpc001/Visual_Speech_Recognition_for_Multiple_Languages backend/vendor/Visual_Speech_Recognition_for_Multiple_Languages
```

2. 安装它需要的依赖：

```bash
pip install -r backend/requirements-vsr.txt
pip install -r backend/vendor/Visual_Speech_Recognition_for_Multiple_Languages/requirements.txt
```

3. 下载并放置中文模型资源。这个仓库的中文配置文件是：

```text
configs/CMLR_V_WER8.0.ini
```

对应的配置里会读取这些相对路径：

```text
benchmarks/CMLR/models/CMLR_V_WER8.0/model.pth
benchmarks/CMLR/models/CMLR_V_WER8.0/model.json
benchmarks/CMLR/language_models/lm_zh/model.pth
benchmarks/CMLR/language_models/lm_zh/model.json
```

4. 配置环境变量：

```bash
export LIPREAD_ENGINE=external_vsr
export LIPREAD_REPO_DIR="$PWD/backend/vendor/Visual_Speech_Recognition_for_Multiple_Languages"
export LIPREAD_CONFIG="$LIPREAD_REPO_DIR/configs/CMLR_V_WER8.0.ini"
export LIPREAD_GPU_IDX=-1
export LIPREAD_DETECTOR=mediapipe
```

5. 启动服务：

```bash
python3 -m uvicorn backend.app:app --reload --port 8000
```

## 实时方式说明

这个项目当前做的是“滑动窗口近实时”：

- 浏览器先在本地提取人脸稳定点
- 浏览器每次录制约 1.8 秒视频片段
- 每段上传到后端
- 后端把浏览器 landmarks 对齐到真实视频帧数，再调用开源仓库的 `infer.py`
- 识别文本返回到网页并连续滚动显示

所以体验上是实时的，但底层不是逐帧零延迟。

## 为什么这样接

官方仓库默认会在 Python 端做嘴部相关的人脸检测，但在某些本机无头环境里，这一步会遇到 `NSOpenGLPixelFormat` 之类的图形初始化问题。现在这个版本优先使用浏览器端 landmarks：

- 浏览器侧关键点和录制来自同一张 canvas，分段更容易对齐
- 后端仍然调用官方中文 `CMLR_V_WER8.0` 模型
- 如果浏览器没有采到足够稳定的人脸点位，该片段会直接跳过，而不是把一个坏片段送进模型
