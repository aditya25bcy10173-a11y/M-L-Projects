import time
import json
import random
import paho.mqtt.client as mqtt

# MQTT Broker Config
BROKER = "localhost"
PORT = 1883
TOPIC = "temple/dwarka/gate1/inflow"

client = mqtt.Client()
client.connect(BROKER, PORT, 60)
client.loop_start()

print(f"📡 ESP32 Dual-IR Gate Sensor Simulator Active.")
print(f"   Publishing real-time entry pulses to topic: '{TOPIC}'...\n")

try:
    count = 0
    while True:
        # Simulate IR Dual-Beam logic:
        # Beam A -> Beam B sequence = Entry (+1)
        # Randomly flag long beam break (multi-person tailgate)
        suspected_multi = random.random() < 0.15  # 15% chance of multi-person tailgate
        flow = 2 if suspected_multi else 1
        
        payload = {
            "siteId": "dwarka",
            "gateId": "gate1",
            "netFlow": flow,
            "suspectedMultiCrossing": suspected_multi,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }

        client.publish(TOPIC, json.dumps(payload))
        count += 1
        print(f"🚪 [Gate Pulse #{count}] Pilgrim Entry ➔ Net Flow: +{flow} | Multi-Person Flag: {suspected_multi}")

        time.sleep(2)  # Simulate 1 person passing every 2 seconds

        if count >= 10:  # Run 10 gate pulses for test
            break

except KeyboardInterrupt:
    print("\nStopping ESP32 Simulator...")

finally:
    client.loop_stop()
    client.disconnect()
    print("✅ ESP32 Gate Simulator test completed successfully.")