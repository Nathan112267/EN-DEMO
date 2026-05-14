#include <Wire.h>
#include <Adafruit_MPR121.h>
#include <BleKeyboard.h>

// Pura X BackTouch HID
// Hardware: ESP32 + MPR121 + copper foil on electrode E0.
// Optional swipe pads: E1 as left segment, E2 as right segment.
// Libraries:
// - Adafruit MPR121
// - ESP32 BLE Keyboard by T-vK

namespace {
constexpr uint8_t kMpr121Address = 0x5A;
constexpr uint8_t kTouchElectrode = 0;
constexpr uint8_t kSwipeLeftElectrode = 1;
constexpr uint8_t kSwipeRightElectrode = 2;
constexpr uint8_t kTouchThreshold = 12;
constexpr uint8_t kReleaseThreshold = 6;
constexpr unsigned long kDebounceMs = 30;
constexpr unsigned long kPollMs = 8;
constexpr unsigned long kSwipeWindowMs = 420;
constexpr unsigned long kSwipeCooldownMs = 260;

Adafruit_MPR121 cap = Adafruit_MPR121();
BleKeyboard bleKeyboard("PuraX BackTouch", "N2 Demo", 100);

bool stableTouched = false;
bool candidateTouched = false;
bool previousSwipeLeft = false;
bool previousSwipeRight = false;
uint8_t lastSwipeElectrode = 255;
unsigned long candidateSince = 0;
unsigned long lastPoll = 0;
unsigned long lastSwipeAt = 0;
unsigned long lastSwipeSentAt = 0;

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

void sendSwipe(int direction) {
  if (!bleKeyboard.isConnected()) {
    return;
  }

  if (direction > 0) {
    bleKeyboard.write(KEY_RIGHT_ARROW);
    Serial.println("E1 -> E2 swipe -> ArrowRight");
  } else {
    bleKeyboard.write(KEY_LEFT_ARROW);
    Serial.println("E2 -> E1 swipe -> ArrowLeft");
  }
}

void handleSwipeEdge(uint8_t electrode, unsigned long now) {
  if (now - lastSwipeSentAt < kSwipeCooldownMs) {
    return;
  }

  if (lastSwipeElectrode != 255 && now - lastSwipeAt <= kSwipeWindowMs) {
    if (lastSwipeElectrode == kSwipeLeftElectrode && electrode == kSwipeRightElectrode) {
      sendSwipe(1);
      lastSwipeSentAt = now;
      lastSwipeElectrode = 255;
      return;
    }
    if (lastSwipeElectrode == kSwipeRightElectrode && electrode == kSwipeLeftElectrode) {
      sendSwipe(-1);
      lastSwipeSentAt = now;
      lastSwipeElectrode = 255;
      return;
    }
  }

  lastSwipeElectrode = electrode;
  lastSwipeAt = now;
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
  Serial.println("PuraX BackTouch ready. E0=hold, E1->E2=right, E2->E1=left.");
}

void loop() {
  const unsigned long now = millis();
  if (now - lastPoll < kPollMs) {
    delay(1);
    return;
  }
  lastPoll = now;

  const uint16_t touched = cap.touched();
  const bool rawTouched = bitRead(touched, kTouchElectrode);
  const bool swipeLeft = bitRead(touched, kSwipeLeftElectrode);
  const bool swipeRight = bitRead(touched, kSwipeRightElectrode);

  if (rawTouched != candidateTouched) {
    candidateTouched = rawTouched;
    candidateSince = now;
  }

  if (candidateTouched != stableTouched && now - candidateSince >= kDebounceMs) {
    stableTouched = candidateTouched;
    sendHeldState(stableTouched);
  }

  if (swipeLeft && !previousSwipeLeft) {
    handleSwipeEdge(kSwipeLeftElectrode, now);
  }
  if (swipeRight && !previousSwipeRight) {
    handleSwipeEdge(kSwipeRightElectrode, now);
  }
  previousSwipeLeft = swipeLeft;
  previousSwipeRight = swipeRight;

  if (lastSwipeElectrode != 255 && now - lastSwipeAt > kSwipeWindowMs) {
    lastSwipeElectrode = 255;
  }

  if (!bleKeyboard.isConnected() && stableTouched) {
    stableTouched = false;
    candidateTouched = false;
    previousSwipeLeft = false;
    previousSwipeRight = false;
    lastSwipeElectrode = 255;
  }
}
