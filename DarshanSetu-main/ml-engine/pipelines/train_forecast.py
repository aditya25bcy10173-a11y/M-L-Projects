import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

def calculate_synodic_moon(df):
    SYNODIC, EPOCH = 29.530588853, pd.Timestamp("2000-01-06 18:14")
    dates = pd.to_datetime(df['Date'])
    age = ((dates - EPOCH).dt.total_seconds() / 86400.0) % SYNODIC
    df["moon_sin"] = np.sin(2 * np.pi * age / SYNODIC)
    df["moon_cos"] = np.cos(2 * np.pi * age / SYNODIC)
    return df

def add_proximity_features(df):
    # Calculates days until and since holidays/festivals
    for col in ['Is_Holiday', 'Is_Weekend']:
        pos = np.arange(len(df))
        event_indices = pos[df[col].values == 1]
        if len(event_indices) > 0:
            nxt = np.array([event_indices[event_indices >= i][0] - i if any(event_indices >= i) else 99 for i in pos])
            prv = np.array([i - event_indices[event_indices <= i][-1] if any(event_indices <= i) else 99 for i in pos])
        else:
            nxt = np.ones(len(df)) * 99
            prv = np.ones(len(df)) * 99
        df[f"{col}_next"] = np.clip(nxt, 0, 30)
        df[f"{col}_prev"] = np.clip(prv, 0, 30)
    return df

def train_model():
    os.makedirs("models", exist_ok=True)
    df = pd.read_csv("data/historical_crowd_data.csv")
    df = calculate_synodic_moon(df)
    
    # Sort and split by site
    site_models = {}
    for site in df['Temple'].unique():
        site_df = df[df['Temple'] == site].copy().sort_values('Date').reset_index(drop=True)
        site_df = add_proximity_features(site_df)
        
        # Build horizon-safe lags (min shift = 14 days)
        H = 14
        site_df['lag_14'] = site_df['Footfall'].shift(H)
        site_df['lag_15'] = site_df['Footfall'].shift(H + 1)
        site_df['rm_7'] = site_df['Footfall'].shift(H).rolling(7, min_periods=3).mean()
        
        site_df = site_df.dropna().reset_index(drop=True)
        
        # Encode features
        feature_cols = ['Temperature', 'Rainfall', 'Is_Weekend', 'Is_Holiday', 'moon_sin', 'moon_cos', 
                        'Is_Holiday_next', 'Is_Holiday_prev', 'lag_14', 'lag_15', 'rm_7']
        
        # Log-space transformation
        y = np.log1p(site_df['Footfall'])
        X = site_df[feature_cols]
        
        # Temporal Train/Test split (no random split)
        split_idx = int(len(site_df) * 0.8)
        X_train, y_train = X.iloc[:split_idx], y.iloc[:split_idx]
        X_test, y_test = X.iloc[split_idx:], y.iloc[split_idx:]
        
        # Fit Point Regressor
        model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
        model.fit(X_train, y_train)
        
        # Simple conformal bound calibration (CQR-lite)
        preds = model.predict(X_test)
        errors = np.abs(np.expm1(y_test) - np.expm1(preds))
        q_error = np.percentile(errors, 90) # 90% confidence margin
        
        site_models[site.lower()] = {
            'model': model,
            'features': feature_cols,
            'conformal_margin': q_error
        }
        
        print(f"📊 {site} Forecast Model Trained. MAE: {mean_absolute_error(np.expm1(y_test), np.expm1(preds)):.2f} | Conformal Margin: ±{q_error:.0f} visitors")

    joblib.dump(site_models, "models/crowd_forecast_model.joblib")
    print("✅ Calibrated hybrid models saved to models/crowd_forecast_model.joblib")

if __name__ == "__main__":
    train_model()