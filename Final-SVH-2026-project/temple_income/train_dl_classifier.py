import os
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

# Set random seed
np.random.seed(42)
torch.manual_seed(42)

class TempleDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.long)
        
    def __len__(self):
        return len(self.X)
        
    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

class TempleMLPClassifier(nn.Module):
    def __init__(self, input_dim, num_classes):
        super(TempleMLPClassifier, self).__init__()
        self.mlp = nn.Sequential(
            nn.Linear(input_dim, 512),
            nn.LeakyReLU(0.1),
            nn.BatchNorm1d(512),
            nn.Dropout(0.3),
            
            nn.Linear(512, 256),
            nn.LeakyReLU(0.1),
            nn.BatchNorm1d(256),
            nn.Dropout(0.3),
            
            nn.Linear(256, 128),
            nn.LeakyReLU(0.1),
            nn.BatchNorm1d(128),
            nn.Dropout(0.2),
            
            nn.Linear(128, 64),
            nn.LeakyReLU(0.1),
            nn.BatchNorm1d(64),
            nn.Dropout(0.1),
            
            nn.Linear(64, num_classes)
        )
        
    def forward(self, x):
        return self.mlp(x)

def main():
    repo_dir = r"C:\Users\adity\.gemini\antigravity\scratch\temple_crowd_analytics"
    data_path = os.path.join(repo_dir, "data", "tn_temples_consolidated.xlsx")
    
    print(f"Loading dataset from {data_path}...")
    df = pd.read_excel(data_path)
    df = df.dropna(subset=['temple_12a_category'])
    
    # Preprocessing
    df['district'] = df['district'].fillna('Unknown')
    df['district'] = df['district'].apply(lambda x: 'Unknown' if str(x).isdigit() else x)
    df['temple_type'] = df['temple_type'].fillna('Unknown')
    df['temple_listing_type'] = df['temple_listing_type'].fillna('Unknown')
    df['temple_name'] = df['temple_name'].fillna('')
    
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
    num_classes = len(le.classes_)
    
    print("Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    # Pipeline
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
    
    if hasattr(X_train_transformed, 'toarray'):
        X_train_transformed = X_train_transformed.toarray()
    if hasattr(X_test_transformed, 'toarray'):
        X_test_transformed = X_test_transformed.toarray()
        
    # Dataset and Dataloader
    train_dataset = TempleDataset(X_train_transformed, y_train)
    train_loader = DataLoader(train_dataset, batch_size=256, shuffle=True)
    
    input_dim = X_train_transformed.shape[1]
    model = TempleMLPClassifier(input_dim, num_classes)
    
    # Compute class weights for weighted cross entropy loss
    class_counts = np.bincount(y_train)
    class_weights = 1.0 / (class_counts + 1)
    class_weights = class_weights / class_weights.sum() * num_classes
    weights_tensor = torch.tensor(class_weights, dtype=torch.float32)
    print(f"Class counts: {class_counts}")
    print(f"Calculated loss weights: {class_weights}")
    
    criterion = nn.CrossEntropyLoss(weight=weights_tensor)
    optimizer = optim.AdamW(model.parameters(), lr=0.005, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', patience=4, factor=0.5)
    
    epochs = 60
    print(f"\nTraining PyTorch MLP Classifier for {epochs} epochs...")
    model.train()
    
    for epoch in range(1, epochs + 1):
        running_loss = 0.0
        for batch_x, batch_y in train_loader:
            optimizer.zero_grad()
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * len(batch_x)
            
        epoch_loss = running_loss / len(X_train)
        scheduler.step(epoch_loss)
        if epoch % 10 == 0 or epoch == 1:
            print(f"Epoch {epoch}/{epochs} - Loss: {epoch_loss:.4f} (LR: {optimizer.param_groups[0]['lr']:.5f})")
            
    # Evaluation
    print("\nEvaluating PyTorch MLP Classifier...")
    model.eval()
    with torch.no_grad():
        test_x = torch.tensor(X_test_transformed, dtype=torch.float32)
        outputs = model(test_x)
        y_pred = torch.argmax(outputs, dim=1).numpy()
        
    accuracy = accuracy_score(y_test, y_pred)
    print(f"PyTorch Test Accuracy: {accuracy:.4f}")
    
    report = classification_report(y_test, y_pred, target_names=le.classes_)
    print("\nClassification Report:")
    print(report)
    
    # Save metrics
    metrics_path = os.path.join(repo_dir, "metrics", "temple_dl_metrics.txt")
    with open(metrics_path, "w") as f:
        f.write("PyTorch MLP Classifier Evaluation\n")
        f.write("=================================\n\n")
        f.write(f"Test Accuracy: {accuracy:.4f}\n\n")
        f.write("Classification Report:\n")
        f.write(report)
    print(f"Saved evaluation metrics to {metrics_path}")
    
    # Save confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=le.classes_, yticklabels=le.classes_)
    plt.title('Confusion Matrix - PyTorch MLP')
    plt.ylabel('Actual Category')
    plt.xlabel('Predicted Category')
    plt.tight_layout()
    cm_path = os.path.join(repo_dir, "metrics", "confusion_matrix_dl.png")
    plt.savefig(cm_path)
    plt.close()
    print(f"Saved confusion matrix plot to {cm_path}")
    
    # Save the pipeline and model weights
    preprocessor_path = os.path.join(repo_dir, "models", "temple_dl_preprocessor.joblib")
    joblib.dump({
        'preprocessor': preprocessor,
        'label_encoder': le,
        'category_mapping': category_mapping,
        'input_dim': input_dim,
        'num_classes': num_classes
    }, preprocessor_path)
    
    model_save_path = os.path.join(repo_dir, "models", "temple_dl_model.pth")
    torch.save(model.state_dict(), model_save_path)
    print("Model and preprocessors saved successfully!")

if __name__ == "__main__":
    main()
