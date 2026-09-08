import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib

def main():
    # Paths
    data_path = r"C:\Users\adity\OneDrive\Desktop\tn_temples_consolidated.xlsx"
    output_dir = r"C:\Users\adity\.gemini\antigravity\scratch\temple_model_training"
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Loading data from {data_path}...")
    df = pd.read_excel(data_path)
    print(f"Data loaded. Shape: {df.shape}")
    
    # Check unique districts
    num_districts = df['district'].nunique()
    print(f"Number of unique districts: {num_districts}")
    
    # Check unique pincodes
    num_pincodes = df['pincode'].nunique()
    print(f"Number of unique pincodes: {num_pincodes}")
    
    # Drop rows where target is missing (should not be any based on earlier info)
    df = df.dropna(subset=['temple_12a_category'])
    print(f"Data shape after dropping missing targets: {df.shape}")
    
    # Preprocessing missing values
    df['district'] = df['district'].fillna('Unknown')
    df['pincode'] = df['pincode'].fillna('Unknown').astype(str)
    df['temple_name'] = df['temple_name'].fillna('')
    
    # Define features and target
    target_col = 'temple_12a_category'
    target_desc_col = 'temple_12a_category_description'
    
    # Create a mapping for category description to print/use later
    category_mapping = df[[target_col, target_desc_col]].drop_duplicates().set_index(target_col)[target_desc_col].to_dict()
    print("\nTarget category mapping:")
    for k, v in category_mapping.items():
        print(f"  {k}: {v}")
        
    X = df[['temple_type', 'temple_listing_type', 'district', 'temple_name']]
    y = df[target_col]
    
    # Encode target labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    print("\nEncoded classes:", le.classes_)
    
    # Split data
    print("\nSplitting data into train and test sets (80-20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    print(f"Train size: {X_train.shape[0]}, Test size: {X_test.shape[0]}")
    
    # Pipeline components
    # Categorical features -> One Hot Encoding
    # Text feature (temple_name) -> TF-IDF Vectorizer
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['temple_type', 'temple_listing_type', 'district']),
            ('text', TfidfVectorizer(max_features=250, stop_words='english'), 'temple_name')
        ],
        remainder='drop'
    )
    
    # Transform training data to see feature dimensions
    print("\nApplying preprocessing pipeline...")
    X_train_transformed = preprocessor.fit_transform(X_train)
    print(f"Transformed training features shape: {X_train_transformed.shape}")
    
    # Train Random Forest
    print("\nTraining Random Forest Classifier...")
    # Using sensible hyperparameters for speed and accuracy
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        random_state=42,
        n_jobs=-1,
        class_weight='balanced'  # Handle potential class imbalance
    )
    
    rf_model.fit(X_train_transformed, y_train)
    print("Model training completed!")
    
    # Transform test data and predict
    X_test_transformed = preprocessor.transform(X_test)
    y_pred = rf_model.predict(X_test_transformed)
    
    # Evaluation
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nTest Accuracy: {accuracy:.4f}")
    
    report = classification_report(
        y_test, y_pred, target_names=le.classes_, output_dict=False
    )
    print("\nClassification Report:")
    print(report)
    
    # Save metrics to file
    metrics_path = os.path.join(output_dir, "metrics.txt")
    with open(metrics_path, "w") as f:
        f.write("Random Forest Model Evaluation Metrics\n")
        f.write("======================================\n")
        f.write(f"Test Accuracy: {accuracy:.4f}\n\n")
        f.write("Classification Report:\n")
        f.write(report)
    print(f"Saved evaluation metrics to {metrics_path}")
    
    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(
        cm, annot=True, fmt='d', cmap='Blues',
        xticklabels=le.classes_, yticklabels=le.classes_
    )
    plt.title('Confusion Matrix')
    plt.ylabel('Actual Category')
    plt.xlabel('Predicted Category')
    plt.tight_layout()
    cm_path = os.path.join(output_dir, "confusion_matrix.png")
    plt.savefig(cm_path)
    plt.close()
    print(f"Saved confusion matrix plot to {cm_path}")
    
    # Feature Importance (Top 20)
    # Get feature names from preprocessor
    cat_feature_names = preprocessor.named_transformers_['cat'].get_feature_names_out(['temple_type', 'temple_listing_type', 'district'])
    text_feature_names = preprocessor.named_transformers_['text'].get_feature_names_out()
    all_feature_names = np.concatenate([cat_feature_names, text_feature_names])
    
    importances = rf_model.feature_importances_
    indices = np.argsort(importances)[::-1]
    
    # Plot top 20 features
    plt.figure(figsize=(10, 8))
    sns.barplot(
        x=importances[indices[:20]],
        y=all_feature_names[indices[:20]],
        hue=all_feature_names[indices[:20]],
        palette='viridis',
        legend=False
    )
    plt.title('Top 20 Most Important Features')
    plt.xlabel('Relative Importance')
    plt.tight_layout()
    fi_path = os.path.join(output_dir, "feature_importance.png")
    plt.savefig(fi_path)
    plt.close()
    print(f"Saved feature importance plot to {fi_path}")
    
    # Save the pipeline and model
    model_data = {
        'preprocessor': preprocessor,
        'model': rf_model,
        'label_encoder': le,
        'category_mapping': category_mapping
    }
    model_save_path = os.path.join(output_dir, "temple_rf_model.joblib")
    joblib.dump(model_data, model_save_path)
    print(f"Saved trained model and pipeline to {model_save_path}")
    print("\nAll tasks completed successfully!")

if __name__ == "__main__":
    main()
