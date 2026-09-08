import os
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

# Set random seed for reproducibility
np.random.seed(42)
torch.manual_seed(42)

# Define PyTorch dataset
class CrowdDataset(Dataset):
    def __init__(self, X, y_footfall, y_temp, y_rain):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y_footfall = torch.tensor(y_footfall, dtype=torch.float32).unsqueeze(1)
        self.y_temp = torch.tensor(y_temp, dtype=torch.float32).unsqueeze(1)
        self.y_rain = torch.tensor(y_rain, dtype=torch.float32).unsqueeze(1)
        
    def __len__(self):
        return len(self.X)
        
    def __getitem__(self, idx):
        return self.X[idx], self.y_footfall[idx], self.y_temp[idx], self.y_rain[idx]

# Optimized Multi-Layer Perceptron (deeper & wider, uses LeakyReLU)
class MultiTaskNN(nn.Module):
    def __init__(self, input_dim):
        super(MultiTaskNN, self).__init__()
        self.shared = nn.Sequential(
            nn.Linear(input_dim, 256),
            nn.LeakyReLU(0.1),
            nn.BatchNorm1d(256),
            nn.Dropout(0.2),
            nn.Linear(256, 128),
            nn.LeakyReLU(0.1),
            nn.BatchNorm1d(128),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.LeakyReLU(0.1),
            nn.BatchNorm1d(64),
            nn.Dropout(0.1)
        )
        self.footfall_head = nn.Linear(64, 1)
        self.temp_head = nn.Linear(64, 1)
        self.rain_head = nn.Linear(64, 1)
        
    def forward(self, x):
        shared_out = self.shared(x)
        footfall = self.footfall_head(shared_out)
        temp = self.temp_head(shared_out)
        rain = self.rain_head(shared_out)
        return footfall, temp, rain

def main():
    data_path = r"C:\Users\adity\OneDrive\Desktop\historical_crowd_data.csv"
    output_dir = r"C:\Users\adity\.gemini\antigravity\scratch\crowd_prediction"
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Loading data from {data_path}...")
    df = pd.read_csv(data_path)
    df['Festival'] = df['Festival'].fillna('None')
    
    # Feature columns
    feature_cols = ['Temple', 'Day_Of_Week', 'Month', 'Year', 'Is_Weekend', 'Is_Holiday', 'Festival']
    X = df[feature_cols]
    
    y_footfall = df['Footfall'].values
    y_temp = df['Temperature'].values
    y_rain = df['Rainfall'].values
    
    # Preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['Temple', 'Festival', 'Day_Of_Week', 'Month']),
            ('num', StandardScaler(), ['Year', 'Is_Weekend', 'Is_Holiday'])
        ],
        remainder='drop'
    )
    
    X_processed = preprocessor.fit_transform(X)
    if hasattr(X_processed, 'toarray'):
        X_processed = X_processed.toarray()
        
    scaler_footfall = StandardScaler()
    scaler_temp = StandardScaler()
    scaler_rain = StandardScaler()
    
    y_footfall_scaled = scaler_footfall.fit_transform(y_footfall.reshape(-1, 1)).flatten()
    y_temp_scaled = scaler_temp.fit_transform(y_temp.reshape(-1, 1)).flatten()
    y_rain_scaled = scaler_rain.fit_transform(y_rain.reshape(-1, 1)).flatten()
    
    indices = np.arange(len(df))
    train_idx, test_idx = train_test_split(indices, test_size=0.2, random_state=42)
    
    X_train, X_test = X_processed[train_idx], X_processed[test_idx]
    y_footfall_train, y_footfall_test = y_footfall_scaled[train_idx], y_footfall_scaled[test_idx]
    y_temp_train, y_temp_test = y_temp_scaled[train_idx], y_temp_scaled[test_idx]
    y_rain_train, y_rain_test = y_rain_scaled[train_idx], y_rain_scaled[test_idx]
    
    train_dataset = CrowdDataset(X_train, y_footfall_train, y_temp_train, y_rain_train)
    train_loader = DataLoader(train_dataset, batch_size=256, shuffle=True)
    
    input_dim = X_processed.shape[1]
    model = MultiTaskNN(input_dim)
    
    # Define Loss Functions
    # Use Huber Loss (SmoothL1Loss) for skewed target features with outliers (Footfall & Rainfall)
    # Use MSE Loss for normally-distributed temperature
    huber_criterion = nn.SmoothL1Loss(beta=1.0)
    mse_criterion = nn.MSELoss()
    
    # Custom Loss Weights
    w_footfall = 1.5
    w_temp = 1.0
    w_rain = 0.5
    
    optimizer = optim.AdamW(model.parameters(), lr=0.005, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', patience=5, factor=0.5)
    
    epochs = 100
    print(f"\nTraining Optimized PyTorch MLP for {epochs} epochs...")
    model.train()
    
    for epoch in range(1, epochs + 1):
        running_loss = 0.0
        for batch_x, batch_yf, batch_yt, batch_yr in train_loader:
            optimizer.zero_grad()
            
            pred_f, pred_t, pred_r = model(batch_x)
            
            loss_f = huber_criterion(pred_f, batch_yf)
            loss_t = mse_criterion(pred_t, batch_yt)
            loss_r = huber_criterion(pred_r, batch_yr)
            
            # Weighted loss formulation
            loss = w_footfall * loss_f + w_temp * loss_t + w_rain * loss_r
            
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * len(batch_x)
            
        epoch_loss = running_loss / len(train_idx)
        scheduler.step(epoch_loss)
        
        if epoch % 10 == 0 or epoch == 1:
            print(f"Epoch {epoch}/{epochs} - Train Loss: {epoch_loss:.4f} (LR: {optimizer.param_groups[0]['lr']:.5f})")
            
    # Evaluation
    print("\nEvaluating optimized model...")
    model.eval()
    with torch.no_grad():
        test_x = torch.tensor(X_test, dtype=torch.float32)
        pred_f_scaled, pred_t_scaled, pred_r_scaled = model(test_x)
        
        pred_footfall = scaler_footfall.inverse_transform(pred_f_scaled.numpy()).flatten()
        pred_temp = scaler_temp.inverse_transform(pred_t_scaled.numpy()).flatten()
        pred_rain = scaler_rain.inverse_transform(pred_r_scaled.numpy()).flatten()
        
        true_footfall = df['Footfall'].values[test_idx]
        true_temp = df['Temperature'].values[test_idx]
        true_rain = df['Rainfall'].values[test_idx]
        
        r2_f = r2_score(true_footfall, pred_footfall)
        mae_f = mean_absolute_error(true_footfall, pred_footfall)
        rmse_f = np.sqrt(mean_squared_error(true_footfall, pred_footfall))
        
        r2_t = r2_score(true_temp, pred_temp)
        mae_t = mean_absolute_error(true_temp, pred_temp)
        rmse_t = np.sqrt(mean_squared_error(true_temp, pred_temp))
        
        r2_r = r2_score(true_rain, pred_rain)
        mae_r = mean_absolute_error(true_rain, pred_rain)
        rmse_r = np.sqrt(mean_squared_error(true_rain, pred_rain))
        
        print("\n--- Optimized Test Evaluation Metrics ---")
        print(f"Footfall Prediction:    R² = {r2_f:.4f} | MAE = {mae_f:.2f} | RMSE = {rmse_f:.2f}")
        print(f"Temperature Prediction: R² = {r2_t:.4f} | MAE = {mae_t:.2f} | RMSE = {rmse_t:.2f}")
        print(f"Rainfall Prediction:    R² = {r2_r:.4f} | MAE = {mae_r:.2f} | RMSE = {rmse_r:.2f}")
        
        # Save evaluation metrics
        metrics_path = os.path.join(output_dir, "dl_metrics_optimized.txt")
        with open(metrics_path, "w") as f:
            f.write("Optimized PyTorch MLP Model Evaluation\n")
            f.write("=====================================\n\n")
            f.write(f"Footfall Target:\n  R2 Score: {r2_f:.4f}\n  MAE: {mae_f:.2f}\n  RMSE: {rmse_f:.2f}\n\n")
            f.write(f"Temperature Target:\n  R2 Score: {r2_t:.4f}\n  MAE: {mae_t:.2f}\n  RMSE: {rmse_t:.2f}\n\n")
            f.write(f"Rainfall Target:\n  R2 Score: {r2_r:.4f}\n  MAE: {mae_r:.2f}\n  RMSE: {rmse_r:.2f}\n")
        print(f"Saved evaluation metrics to {metrics_path}")
        
        # Save preprocessors
        preprocessors = {
            'feature_preprocessor': preprocessor,
            'scaler_footfall': scaler_footfall,
            'scaler_temp': scaler_temp,
            'scaler_rain': scaler_rain,
            'input_dim': input_dim
        }
        preprocessor_path = os.path.join(output_dir, "dl_preprocessor.joblib")
        joblib.dump(preprocessors, preprocessor_path)
        print(f"Saved preprocessors to {preprocessor_path}")
        
        # Save Model weights
        model_weights_path = os.path.join(output_dir, "crowd_dl_model.pth")
        torch.save(model.state_dict(), model_weights_path)
        print(f"Saved PyTorch model weights to {model_weights_path}")
        
        # Create comparison plots
        fig, axes = plt.subplots(1, 3, figsize=(18, 5))
        
        sns.scatterplot(x=true_footfall[:300], y=pred_footfall[:300], ax=axes[0], alpha=0.6, color='blue')
        axes[0].plot([true_footfall.min(), true_footfall.max()], [true_footfall.min(), true_footfall.max()], 'r--')
        axes[0].set_title(f"Footfall Prediction (R² = {r2_f:.2f})")
        axes[0].set_xlabel("Actual Footfall")
        axes[0].set_ylabel("Predicted Footfall")
        
        sns.scatterplot(x=true_temp[:300], y=pred_temp[:300], ax=axes[1], alpha=0.6, color='orange')
        axes[1].plot([true_temp.min(), true_temp.max()], [true_temp.min(), true_temp.max()], 'r--')
        axes[1].set_title(f"Temperature Prediction (R² = {r2_t:.2f})")
        axes[1].set_xlabel("Actual Temp (°C)")
        axes[1].set_ylabel("Predicted Temp (°C)")
        
        sns.scatterplot(x=true_rain[:300], y=pred_rain[:300], ax=axes[2], alpha=0.6, color='teal')
        axes[2].plot([true_rain.min(), true_rain.max()], [true_rain.min(), true_rain.max()], 'r--')
        axes[2].set_title(f"Rainfall Prediction (R² = {r2_r:.2f})")
        axes[2].set_xlabel("Actual Rainfall (mm)")
        axes[2].set_ylabel("Predicted Rainfall (mm)")
        
        plt.tight_layout()
        plot_path = os.path.join(output_dir, "dl_predictions_comparison_optimized.png")
        plt.savefig(plot_path)
        plt.close()
        print(f"Saved predictions comparison plot to {plot_path}")

if __name__ == "__main__":
    main()
