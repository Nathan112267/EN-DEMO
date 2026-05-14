# PuraX BackTouch HID Firmware

ESP32 + MPR121 + 铜箔背触输入。固件把 MPR121 的 `E0` 触摸状态模拟成 BLE 键盘空格键：触摸时 `Space down`，松开时 `Space up`。卡片打开后，`E1 -> E2` 滑动会发送 `ArrowRight`，`E2 -> E1` 滑动会发送 `ArrowLeft`。

## Hardware

- ESP32 development board
- Adafruit MPR121 capacitive touch breakout
- 铜箔胶带一片，接到 MPR121 `E0`
- 可选滑动铜箔两片或一条分成左右两段：左段接 `E1`，右段接 `E2`
- 一层薄绝缘材料覆盖铜箔，避免手指直接接触金属导致不稳定和磨损

## Wiring

| MPR121 | ESP32 |
| --- | --- |
| `VCC` | `3.3V` |
| `GND` | `GND` |
| `SDA` | ESP32 I2C `SDA` |
| `SCL` | ESP32 I2C `SCL` |
| `E0` | 铜箔胶带 |
| `E1` | 左侧滑动铜箔 |
| `E2` | 右侧滑动铜箔 |

只接 `E0` 时，按住背触选图能力仍然可用。要让卡片内左右滑动切换界面，需要额外接 `E1/E2` 两段铜箔。

默认使用 `Wire.begin()`，也就是当前 ESP32 板子的默认 I2C 引脚。若你的板子需要固定引脚，可把固件里的 `Wire.begin();` 改成例如 `Wire.begin(8, 9);` 或你的板子对应 SDA/SCL。

## Arduino Libraries

在 Arduino IDE Library Manager 安装：

- `Adafruit MPR121`
- `ESP32 BLE Keyboard` by T-vK

开发板选择你的 ESP32 型号，烧录 `backtouch-hid.ino`。

## Use

1. 烧录后打开手机蓝牙，配对 `PuraX BackTouch`。
2. 手机打开 `/scene6/` 或 `/hardware-ai-picker/`。
3. 按住背面铜箔，页面进入“背触已按住”状态。
4. 保持按住并点击图片，页面会弹出 Scene 3 风格 AI 识别卡片。
5. 卡片打开后，从 `E1` 滑到 `E2` 切到下一界面，从 `E2` 滑到 `E1` 切回上一界面。

## Defaults

- BLE HID device name: `PuraX BackTouch`
- MPR121 address: `0x5A`
- Hold electrode: `E0`
- Swipe electrodes: `E1` left, `E2` right
- Touch threshold: `12`
- Release threshold: `6`
- Software debounce: `30ms`
- Swipe window: `420ms`
- Swipe cooldown: `260ms`
