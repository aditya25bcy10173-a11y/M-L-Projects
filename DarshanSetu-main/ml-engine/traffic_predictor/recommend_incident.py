import sys
import os
import json
import datetime
import pickle
import numpy as np
import pandas as pd
import torch
from catboost import CatBoostRegressor
from model import TabularResNet
from recommender import get_recommendations

def load_models():
    # Load preprocessor mapping
    with open("preprocessor.pkl", "rb") as f:
        preprocessor = pickle.load(f)
        
    # Load PyTorch model
    model_pt = TabularResNet(
        cat_dims=preprocessor['cat_dims'],
        num_features=len(preprocessor['num_cols_pt'])
    )
    model_pt.load_state_dict(torch.load('model.pth', map_location=torch.device('cpu')))
    model_pt.eval()
    
    # Load CatBoost
    model_cb = CatBoostRegressor()
    model_cb.load_model('catboost_model.cbm')
    
    return model_pt, model_cb, preprocessor

def get_input_mapping(incident_type, severity):
    # Map KshemYatra incident types to traffic predictor categories
    inc_type = str(incident_type).upper()
    sev = str(severity).upper()

    event_type = 'unplanned'
    event_cause = 'others'
    priority = 'low'
    requires_road_closure = 'false'

    if inc_type == 'STAMPEDE_PRECURSOR':
        event_cause = 'congestion'
        priority = 'high'
        requires_road_closure = 'true'
    elif inc_type == 'MEDICAL_FALL':
        event_cause = 'road_conditions'
    elif inc_type == 'SOS_MANUAL':
        priority = 'high'

    if sev == 'CRITICAL':
        priority = 'high'

    return event_type, event_cause, priority, requires_road_closure

def main():
    # Read input payload from Node.js stdin
    input_data = json.loads(sys.stdin.read())
    
    lat = float(input_data.get('lat', 12.9716))
    lng = float(input_data.get('lng', 77.5946))
    incident_type = input_data.get('type', 'SOS_MANUAL')
    severity = input_data.get('severity', 'WARNING')
    
    # Map variables
    event_type, event_cause, priority, requires_road_closure = get_input_mapping(incident_type, severity)
    
    model_pt, model_cb, prep = load_models()
    
    # Get current time variables
    now = datetime.datetime.now()
    hour = now.hour
    day_of_week = now.weekday()
    
    # Format Raw DF for CatBoost
    raw_row = {
        'event_type': event_type, 'event_cause': event_cause, 'requires_road_closure': requires_road_closure,
        'priority': priority, 'police_station': 'unknown', 'corridor': 'unknown', 'zone': 'unknown', 'junction': 'unknown',
        'latitude': lat, 'longitude': lng, 'hour': hour, 'day_of_week': day_of_week
    }
    input_df = pd.DataFrame([raw_row])
    
    # Preprocess Categoricals for PyTorch
    X_cat = np.zeros((1, len(prep['cat_cols'])), dtype=np.int64)
    for idx, col in enumerate(prep['cat_cols']):
        val = raw_row[col]
        le = prep['encoders'][col]
        if val not in le.classes_:
            val = 'unknown'
        X_cat[0, idx] = le.transform([val])[0]
        
    # Preprocess Numericals for PyTorch
    sin_hour = np.sin(2 * np.pi * hour / 24.0)
    cos_hour = np.cos(2 * np.pi * hour / 24.0)
    sin_day = np.sin(2 * np.pi * day_of_week / 7.0)
    cos_day = np.cos(2 * np.pi * day_of_week / 7.0)
    
    num_row = [lat, lng, sin_hour, cos_hour, sin_day, cos_day]
    X_num = prep['scaler'].transform([num_row])
    
    # Run PyTorch
    t_cat = torch.tensor(X_cat, dtype=torch.long)
    t_num = torch.tensor(X_num, dtype=torch.float32)
    with torch.no_grad():
        pred_log_pt = model_pt(t_cat, t_num).item()
        
    # Run CatBoost
    pred_log_cb = model_cb.predict(input_df)[0]
    
    # Weighted Average Ensemble
    w_pt = prep['pytorch_weight']
    pred_log = w_pt * pred_log_pt + (1 - w_pt) * pred_log_cb
    predicted_duration = float(np.expm1(pred_log))
    
    # Fetch rule-based recommendations
    recs = get_recommendations(event_type, event_cause, priority, requires_road_closure == 'true', predicted_duration)
    
    # Return payload
    output = {
        'predicted_duration': round(predicted_duration, 1),
        'recommended_marshals': recs['marshals'],
        'recommended_barricading': recs['barricading'],
        'recommended_diversion': recs['diversion']
    }
    
    print(json.dumps(output))

if __name__ == "__main__":
    main()