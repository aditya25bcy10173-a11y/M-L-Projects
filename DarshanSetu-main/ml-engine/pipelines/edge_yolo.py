import cv2
import time
import json
import yaml
import numpy as np
import paho.mqtt.client as mqtt
from ultralytics import YOLO
from kalman_fusion import AdaptiveCrowdKalman

# Load active site configuration
with open("../config/sites/dwarka.yaml", "r") as f:
    site_config = yaml.safe_load(f)

site_id = site_config["site_id"]
zone_id = site_config["zones"][0]["id"]  # sanctum_approach

# Initialize MQTT Client
mqtt_client = mqtt.Client()
mqtt_client.connect("localhost", 1883, 60)
mqtt_client.loop_start()

# Load YOLOv8 Nano model (downloads automatically on first run)
model = YOLO("yolov8n.pt")
kalman_engine = AdaptiveCrowdKalman(initial_occupancy=20)

print(f"🚀 Starting Edge CV Engine for Site: {site_id}, Zone: {zone_id}...")

# Check for physical camera or fallback to simulated video stream
try:
    cap = cv2.VideoCapture(0)
    use_webcam = cap.isOpened()
    if not use_webcam:
        print("ℹ️ No physical camera detected — running on simulated video stream.")
except Exception:
    use_webcam = False

frame_count = 0

try:
    while True:
        if use_webcam:
            ret, frame = cap.read()
            if not ret:
                break
            results = model(frame, verbose=False)
            # Count detected persons (class 0 in COCO dataset)
            boxes = results[0].boxes
            cctv_person_count = sum(1 for box in boxes if int(box.cls[0]) == 0)
        else:
            # Simulated CCTV person count with realistic variance
            cctv_person_count = int(25 + np.random.normal(0, 3))
            time.sleep(1)

        # 1. Predict step with simulated gate flow pulse
        gate_flow = np.random.choice([0, 1, 2], p=[0.6, 0.3, 0.1])
        kalman_engine.predict(net_gate_flow=gate_flow)

        # 2. Correct step using CCTV person count
        fused_occupancy = kalman_engine.correct(cctv_count=cctv_person_count)

        # 3. Determine safety status against site config thresholds
        status = "NORMAL"
        if fused_occupancy > 40:
            status = "CRITICAL"
        elif fused_occupancy > 30:
            status = "WARNING"

        # 4. Construct telemetry JSON payload
        payload = {
            "siteId": site_id,
            "locationId": zone_id,
            "cctvCount": cctv_person_count,
            "fusedOccupancy": fused_occupancy,
            "status": status,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }

        # 5. Publish to MQTT broker
        mqtt_topic = f"temple/{site_id}/{zone_id}/telemetry"
        mqtt_client.publish(mqtt_topic, json.dumps(payload))
        print(f"📡 Published to {mqtt_topic} ➔ CCTV: {cctv_person_count} | Fused: {fused_occupancy} | Status: {status}")

        frame_count += 1
        if frame_count >= 10:  # Run 10 telemetry pulses for clean test run
            break

except KeyboardInterrupt:
    print("\nStopping Edge Engine...")

finally:
    if use_webcam:
        cap.release()
    mqtt_client.loop_stop()
    mqtt_client.disconnect()
    print("✅ Edge CV Telemetry Engine finished test run successfully.")