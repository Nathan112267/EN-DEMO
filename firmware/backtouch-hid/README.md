# PuraX BackTouch HID Firmware

ESP32 + MPR121 + 铜箔背触输入。固件把 MPR121 的 `E0` 触摸状态模拟成 BLE 键盘空格键：触摸时 `Space down`，松开时 `Space up`。网页只需要监听 `Space`，手机上也能用。

## Hardware

- ESP32 development board
- Adafruit MPR121 capacitive touch breakout
- 铜箔胶带一片，接到 MPR121 `E0`
- 一层薄绝缘材料覆盖铜箔，避免手指直接接触金属导致不稳定和磨损

## Wiring

| MPR121 | ESP32 |
| --- | --- |
| `VCC` | `3.3V` |
| `GND` | `GND` |
| `SDA` | ESP32 I2C `SDA` |
| `SCL` | ESP32 I2C `SCL` |
| `E0` | 铜箔胶带 |

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

## Defaults

- BLE HID device name: `PuraX BackTouch`
- MPR121 address: `0x5A`
- Electrode: `E0`
- Touch threshold: `12`
- Release threshold: `6`
- Software debounce: `30ms`
