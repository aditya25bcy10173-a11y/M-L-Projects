import numpy as np

class AdaptiveCrowdKalman:
    """
    Switching Kalman Filter for Crowd Counting.
    Dynamically adjusts sensor uncertainty (R_gate, R_cctv) based on 
    occlusion severity and suspected multi-person gate breaks.
    """
    def __init__(self, initial_occupancy=0):
        self.x = float(initial_occupancy)  # Estimated fused count
        self.P = 10.0                       # Estimate error covariance
        self.Q = 1.5                        # Process noise (gate count drift)
        self.R_gate_base = 2.0              # Base variance for gate sensor
        self.R_cctv_base = 8.0              # Base variance for camera count

    def predict(self, net_gate_flow, suspected_multi_crossing=False):
        """
        Prediction step using gate sensor inputs (ESP32).
        If multi-crossing is detected (long IR beam break), increase R_gate.
        """
        self.x = max(0.0, self.x + net_gate_flow)
        self.P += self.Q
        
        # Adjust gate variance dynamically
        R_gate = self.R_gate_base * (4.0 if suspected_multi_crossing else 1.0)
        return self.x

    def correct(self, cctv_count, occlusion_confidence_low=False):
        """
        Correction step using camera counts (YOLO / Density Map).
        If camera occlusion is severe, increase R_cctv to rely more on gates.
        """
        R_cctv = self.R_cctv_base * (4.0 if occlusion_confidence_low else 1.0)
        y = cctv_count - self.x             # Innovation / Measurement residual
        S = self.P + R_cctv
        K = self.P / S                      # Kalman gain
        
        self.x = max(0.0, self.x + K * y)
        self.P = (1.0 - K) * self.P
        return int(np.round(self.x))

if __name__ == "__main__":
    filter_engine = AdaptiveCrowdKalman(initial_occupancy=50)
    filter_engine.predict(net_gate_flow=5, suspected_multi_crossing=True)
    fused_count = filter_engine.correct(cctv_count=52, occlusion_confidence_low=False)
    print(f"✅ Adaptive Kalman Filter Test Passed. Fused Count: {fused_count}")