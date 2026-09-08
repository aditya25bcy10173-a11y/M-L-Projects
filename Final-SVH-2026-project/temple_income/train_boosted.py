import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import lightgbm as lgb
import xgboost as xgb
from catboost import CatBoostClassifier
import joblib

def main():
    data_path = r"C:\Users\adity\OneDrive\Desktop\tn_temples_consolidated.xlsx"
    output_dir = r"C:\Users\adity\.gemini\antigravity\scratch\temple_model_training"
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Loading data from {data_path}...")
    df = pd.read_excel(data_path)
    print(f"Data loaded. Shape: {df.shape}")
    
    # Preprocessing & Feature Engineering
    df = df.dropna(subset=['temple_12a_category'])
    df['district'] = df['district'].fillna('Unknown')
    df['temple_type'] = df['temple_type'].fillna('Unknown')
    df['temple_listing_type'] = df['temple_listing_type'].fillna('Unknown')
    df['temple_name'] = df['temple_name'].fillna('')
    
    # Feature Engineering: Pincode 3-digit prefix
    df['pincode_str'] = df['pincode'].fillna('000000').astype(str).str.replace(r'\.0$', '', regex=True)
    df['pincode_prefix'] = df['pincode_str'].str[:3]
    df['pincode_prefix'] = df['pincode_prefix'].apply(lambda x: x if x.isdigit() and len(x) == 3 else '000')
    
    # Target and Features
    target_col = 'temple_12a_category'
    target_desc_col = 'temple_12a_category_description'
    category_mapping = df[[target_col, target_desc_col]].drop_duplicates().set_index(target_col)[target_desc_col].to_dict()
    
    X = df[['temple_type', 'temple_listing_type', 'district', 'pincode_prefix', 'temple_name']]
    y = df[target_col]
    
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    print("\nSplitting data (80-20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    # Preprocessing Pipeline
    # Increased text features to 500 for better semantic representation of temple names
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['temple_type', 'temple_listing_type', 'district', 'pincode_prefix']),
            ('text', TfidfVectorizer(max_features=500, stop_words='english', ngram_range=(1, 2)), 'temple_name')
        ],
        remainder='drop'
    )
    
    print("Transforming features...")
    X_train_transformed = preprocessor.fit_transform(X_train)
    X_test_transformed = preprocessor.transform(X_test)
    print(f"Features shape: {X_train_transformed.shape}")
    
    # We will test multiple models to see which one performs best in terms of raw accuracy
    models = {
        'LightGBM': lgb.LGBMClassifier(
            n_estimators=200,
            learning_rate=0.1,
            random_state=42,
            n_jobs=-1,
            verbose=-1
        ),
        'XGBoost': xgb.XGBClassifier(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=6,
            random_state=42,
            n_jobs=-1,
            verbosity=0
        ),
        'CatBoost': CatBoostClassifier(
            iterations=200,
            learning_rate=0.1,
            random_seed=42,
            thread_count=-1,
            verbose=0
        )
    }
    
    best_accuracy = 0
    best_model_name = ""
    best_model = None
    results = {}
    
    for name, model in models.items():
        print(f"\nTraining {name}...")
        model.fit(X_train_transformed, y_train)
        y_pred = model.predict(X_test_transformed)
        acc = accuracy_score(y_test, y_pred)
        results[name] = acc
        print(f"{name} Test Accuracy: {acc:.4f}")
        
        if acc > best_accuracy:
            best_accuracy = acc
            best_model_name = name
            best_model = model
            
    print(f"\nBest Model: {best_model_name} with Accuracy: {best_accuracy:.4f}")
    
    # Evaluate best model in detail
    y_pred_best = best_model.predict(X_test_transformed)
    report = classification_report(
        y_test, y_pred_best, target_names=le.classes_, output_dict=False
    )
    print(f"\nClassification Report for {best_model_name}:")
    print(report)
    
    # Save metrics to file
    metrics_path = os.path.join(output_dir, "metrics_boosted.txt")
    with open(metrics_path, "w") as f:
        f.write(f"Best Model: {best_model_name}\n")
        f.write("======================================\n")
        f.write(f"Test Accuracy: {best_accuracy:.4f}\n\n")
        for name, acc in results.items():
            f.write(f"{name} Accuracy: {acc:.4f}\n")
        f.write("\nClassification Report:\n")
        f.write(report)
    print(f"Saved evaluation metrics to {metrics_path}")
    
    # Confusion Matrix for best model
    cm = confusion_matrix(y_test, y_pred_best)
    plt.figure(figsize=(8, 6))
    sns.heatmap(
        cm, annot=True, fmt='d', cmap='Blues',
        xticklabels=le.classes_, yticklabels=le.classes_
    )
    plt.title(f'Confusion Matrix - {best_model_name}')
    plt.ylabel('Actual Category')
    plt.xlabel('Predicted Category')
    plt.tight_layout()
    cm_path = os.path.join(output_dir, "confusion_matrix_boosted.png")
    plt.savefig(cm_path)
    plt.close()
    print(f"Saved confusion matrix plot to {cm_path}")
    
    # Save the pipeline and best model
    model_data = {
        'preprocessor': preprocessor,
        'model': best_model,
        'model_name': best_model_name,
        'label_encoder': le,
        'category_mapping': category_mapping
    }
    model_save_path = os.path.join(output_dir, "temple_boosted_model.joblib")
    joblib.dump(model_data, model_save_path)
    print(f"Saved trained model and pipeline to {model_save_path}")
    print("\nAll tasks completed successfully!")

if __name__ == "__main__":
    main()
