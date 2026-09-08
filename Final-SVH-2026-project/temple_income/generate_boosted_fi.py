import os
import joblib
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

def main():
    model_path = r"C:\Users\adity\.gemini\antigravity\scratch\temple_model_training\temple_boosted_model.joblib"
    output_dir = r"C:\Users\adity\.gemini\antigravity\scratch\temple_model_training"
    
    print(f"Loading best model data from {model_path}...")
    model_data = joblib.load(model_path)
    
    preprocessor = model_data['preprocessor']
    model = model_data['model']
    model_name = model_data['model_name']
    
    print(f"Model Name: {model_name}")
    
    # Get feature names
    cat_feature_names = preprocessor.named_transformers_['cat'].get_feature_names_out(['temple_type', 'temple_listing_type', 'district', 'pincode_prefix'])
    text_feature_names = preprocessor.named_transformers_['text'].get_feature_names_out()
    all_feature_names = np.concatenate([cat_feature_names, text_feature_names])
    
    # Get importances
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
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
        plt.title(f'Top 20 Most Important Features ({model_name})')
        plt.xlabel('Relative Importance')
        plt.tight_layout()
        fi_path = os.path.join(output_dir, "feature_importance_boosted.png")
        plt.savefig(fi_path)
        plt.close()
        print(f"Saved feature importance plot to {fi_path}")
    else:
        print("Model does not have feature_importances_ attribute.")

if __name__ == "__main__":
    main()
