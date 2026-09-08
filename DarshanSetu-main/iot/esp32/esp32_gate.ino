/*
 * KshemYatra — ESP32 Dual-IR Gate Sensor Firmware
 * Hardware Pins: GPIO 12 (Outer IR Beam A), GPIO 13 (Inner IR Beam B)
 */

#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "192.168.1.100"; // IP of KshemYatra Mosquitto broker

#define IR_BEAM_A 12
#define IR_BEAM_B 13

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  pinMode(IR_BEAM_A, INPUT_PULLUP);
  pinMode(IR_BEAM_B, INPUT_PULLUP);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Dual IR Beam sequence detection
  if (digitalRead(IR_BEAM_A) == LOW) {
    unsigned long startTime = millis();
    while (millis() - startTime < 1000) {
      if (digitalRead(IR_BEAM_B) == LOW) {
        // Inflow detected!
        char msg[128];
        snprintf(msg, 128, "{\"siteId\":\"dwarka\",\"gateId\":\"gate1\",\"netFlow\":1}");
        client.publish("temple/dwarka/gate1/inflow", msg);
        delay(800); // Debounce delay
        break;
      }
    }
  }
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ESP32_Gate_1")) {
      Serial.println("Connected to MQTT Broker");
    } else {
      delay(2000);
    }
  }
}