import os
import datetime
import joblib
import pandas as pd
import numpy as np
import redis

# Connect to Redis
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

def predict_future_forecasts():
    # Load model package
    models_dict = joblib.load("models/crowd_forecast_model.joblib")
    
    # Generate 14 days of future dates
    today = datetime.date.today()
    future_dates = [today + datetime.timedelta(days=i) for i in range(14)]
    
    # Static synodic parameters for lunar phase
    SYNODIC, EPOCH = 29.530588853, pd.Timestamp("2000-01-06 18:14")

    for site_id, config in models_dict.items():
        model = config['model']
        feature_cols = config['features']
        margin = config['conformal_margin']
        
        # Prepare live feature matrix (simulating incoming weather and past lags for demo)
        rows = []
        for i, dt in enumerate(future_dates):
            dt_ts = pd.Timestamp(dt)
            age = ((dt_ts - EPOCH).total_seconds() / 86400.0) % SYNODIC
            
            # Simulated telemetry lags for predictions (in production read from DB/Redis)
            lag_14 = 25000 if i >= 14 else 22000
            lag_15 = 24500
            rm_7 = 23000
            
            rows.append({
                'Temperature': 28.5 + np.random.normal(0, 1),
                'Rainfall': 0.0,
                'Is_Weekend': 1 if dt.weekday() >= 5 else 0,
                'Is_Holiday': 0,
                'moon_sin': np.sin(2 * np.pi * age / SYNODIC),
                'moon_cos': np.cos(2 * np.pi * age / SYNODIC),
                'Is_Holiday_next': 10,
                'Is_Holiday_prev': 10,
                'lag_14': lag_14,
                'lag_15': lag_15,
                'rm_7': rm_7
            })
            
        X = pd.DataFrame(rows)[feature_cols]
        
        # Predict (exponentiate from log space)
        preds_log = model.predict(X)
        point_preds = np.expm1(preds_log)
        
        # Write 14-day forecasts to Redis
        for idx, dt in enumerate(future_dates):
            date_str = dt.strftime('%Y-%m-%d')
            point = int(point_preds[idx])
            lower = max(0, int(point - margin))
            upper = int(point + margin)
            
            # Set Redis Hash
            redis_key = f"site:{site_id}:forecast:{date_str}"
            r.hset(redis_key, mapping={
                "point": point,
                "lower": lower,
                "upper": upper
            })
            r.expire(redis_key, 86400 * 2) # 2-day TTL
            
        print(f"📡 Redis updated with 14-day forecast for site: {site_id}")

if __name__ == "__main__":
    predict_future_forecasts()