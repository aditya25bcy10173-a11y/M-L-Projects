"""
URL Phishing & Spam Detector - Training Script
Trains a Random Forest classifier on PhiUSIIL_Phishing_URL_Dataset.csv
and saves the trained model to model.joblib.
"""

import os
import time
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib

DATASET_FILE = "PhiUSIIL_Phishing_URL_Dataset.csv"
MODEL_FILE = "model.joblib"

def main():
    # 1. Load dataset
    print(f"Loading {DATASET_FILE}...")
    if not os.path.exists(DATASET_FILE):
        alt_path = os.path.join(r"C:\Users\adity\OneDrive\Desktop", DATASET_FILE)
        if os.path.exists(alt_path):
            dataset_path = alt_path
        else:
            print(f"Error: {DATASET_FILE} not found!")
            return
    else:
        dataset_path = DATASET_FILE

    t0 = time.time()
    df = pd.read_csv(dataset_path)
    print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns ({time.time()-t0:.2f}s)")
    print("Class counts:\n", df['label'].value_counts())

    # 2. Preprocessing & Feature selection
    # Drop string columns and target label
    cols_to_drop = ['URL', 'Domain', 'TLD', 'Title', 'label']
    drop_existing = [c for c in cols_to_drop if c in df.columns]
    
    X = df.drop(columns=drop_existing)
    y = df['label']
    feature_names = list(X.columns)

    # 3. Train / Test split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\nTraining on {len(X_train)} samples, testing on {len(X_test)} samples...")

    # 4. Train Random Forest model
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=25,
        random_state=42,
        n_jobs=-1
    )
    t1 = time.time()
    rf.fit(X_train, y_train)
    print(f"Model trained in {time.time()-t1:.2f}s")

    # 5. Evaluate
    y_pred = rf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nAccuracy: {acc * 100:.2f}%")
    print("\nClassification Report:\n")
    print(classification_report(y_test, y_pred, target_names=['Phishing (0)', 'Legitimate (1)'], digits=4))

    # 6. Save model and feature list with joblib
    save_bundle = {
        'model': rf,
        'features': feature_names
    }
    joblib.dump(save_bundle, MODEL_FILE)
    print(f"Saved trained model to {MODEL_FILE} successfully!")

if __name__ == "__main__":
    main()
