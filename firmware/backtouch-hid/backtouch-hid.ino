#include <Wire.h>
#include <Adafruit_MPR121.h>
#include <BleKeyboard.h>

// Pura X BackTouch HID
// Hardware: ESP32 + MPR121 + copper foil on electrode E0.
// Libraries:
// - Adafruit MPR121
// - ESP32 BLE Keyboard by T-vK

namespace {
constexpr uint8_t kMpr121Address = 0x5A;
constexpr uint8_t kTouchElectrode = 0;
constexpr uint8_t kTouchThreshold = 12;
constexpr uint8_t kReleaseThreshold = 6;
constexpr unsigned long kDebounceMs = 30;
constexpr unsigned long kPollMs = 8;

Adafruit_MPR121 cap = Adafruit_MPR121();
BleKeyboard bleKeyboard("PuraX BackTouch", "N2 Demo", 100);

bool stableTouched = false;
bool candidateTouched = false;
unsigned long candidateSince = 0;
unsigned long lastPoll = 0;

void sendHeldState(bool held) {
  if (!bleKeyboard.isConnected()) {
    return;
  }

  if (held) {
    bleKeyboard.press(' ');
    Serial.println("E0 touched -> Space down");
  } else {
    bleKeyboard.release(' ');
    Serial.println("E0 released -> Space up");
  }
}
}  // namespace

void setup() {
  Serial.begin(115200);
  delay(200);

  Wire.begin();

  if (!cap.begin(kMpr121Address)) {
    Serial.println("MPR121 not found at 0x5A. Check VCC/GND/SDA/SCL wiring.");
    while (true) {
      delay(1000);
    }
  }

  cap.setThresholds(kTouchThreshold, kReleaseThreshold);

  bleKeyboard.begin();
  Serial.println("PuraX BackTouch ready. Pair BLE device, then touch E0 copper foil.");
}

void loop() {
  const unsigned long now = millis();
  if (now - lastPoll < kPollMs) {
    delay(1);
    return;
  }
  lastPoll = now;

  const bool rawTouched = bitRead(cap.touched(), kTouchElectrode);

  if (rawTouched != candidateTouched) {
    candidateTouched = rawTouched;
    candidateSince = now;
  }

  if (candidateTouched != stableTouched && now - candidateSince >= kDebounceMs) {
    stableTouched = candidateTouched;
    sendHeldState(stableTouched);
  }

  if (!bleKeyboard.isConnected() && stableTouched) {
    stableTouched = false;
    candidateTouched = false;
  }
}
