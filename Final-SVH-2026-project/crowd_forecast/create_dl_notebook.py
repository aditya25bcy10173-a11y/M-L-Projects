import json
import os

def create_notebook():
    notebook = {
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "# PyTorch Multi-Task Deep Learning Pipeline for Crowd & Weather Forecasting\n",
                    "This notebook demonstrates how to load, clean, pre-process, and train an optimized Multi-Layer Perceptron (MLP) in **PyTorch** to predict crowd density (`Footfall`), `Temperature`, and `Rainfall` simultaneously from temporal features and temple locations using a custom weighted Huber Loss."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "import os\n",
                    "import pandas as pd\n",
                    "import numpy as np\n",
                    "import torch\n",
                    "import torch.nn as nn\n",
                    "import torch.optim as optim\n",
                    "from torch.utils.data import Dataset, DataLoader\n",
                    "from sklearn.model_selection import train_test_split\n",
                    "from sklearn.compose import ColumnTransformer\n",
                    "from sklearn.preprocessing import OneHotEncoder, StandardScaler\n",
                    "from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error\n",
                    "import joblib\n",
                    "import matplotlib.pyplot as plt\n",
                    "import seaborn as sns\n",
                    "\n",
                    "# Set random seed for reproducibility\n",
                    "np.random.seed(42)\n",
                    "torch.manual_seed(42)"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 1. Load the Dataset"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "data_path = r\"C:\\Users\\adity\\OneDrive\\Desktop\\historical_crowd_data.csv\"\n",
                    "print(f\"Loading dataset from {data_path}...\")\n",
                    "df = pd.read_csv(data_path)\n",
                    "df['Festival'] = df['Festival'].fillna('None')\n",
                    "print(f\"Shape: {df.shape}\")\n",
                    "df.head()"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 2. Preprocessing & Dataset Construction\n",
                    "- Encode categorical attributes (`Temple`, `Festival`, `Day_Of_Week`, `Month`) with `OneHotEncoder`.\n",
                    "- Scale numerical features (`Year`, `Is_Weekend`, `Is_Holiday`) and target variables (`Footfall`, `Temperature`, `Rainfall`) using `StandardScaler`.\n",
                    "- Construct a PyTorch `Dataset` wrapper."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "class CrowdDataset(Dataset):\n",
                    "    def __init__(self, X, y_footfall, y_temp, y_rain):\n",
                    "        self.X = torch.tensor(X, dtype=torch.float32)\n",
                    "        self.y_footfall = torch.tensor(y_footfall, dtype=torch.float32).unsqueeze(1)\n",
                    "        self.y_temp = torch.tensor(y_temp, dtype=torch.float32).unsqueeze(1)\n",
                    "        self.y_rain = torch.tensor(y_rain, dtype=torch.float32).unsqueeze(1)\n",
                    "        \n",
                    "    def __len__(self):\n",
                    "        return len(self.X)\n",
                    "        \n",
                    "    def __getitem__(self, idx):\n",
                    "        return self.X[idx], self.y_footfall[idx], self.y_temp[idx], self.y_rain[idx]\n",
                    "\n",
                    "# Define columns\n",
                    "feature_cols = ['Temple', 'Day_Of_Week', 'Month', 'Year', 'Is_Weekend', 'Is_Holiday', 'Festival']\n",
                    "X = df[feature_cols]\n",
                    "y_footfall = df['Footfall'].values\n",
                    "y_temp = df['Temperature'].values\n",
                    "y_rain = df['Rainfall'].values\n",
                    "\n",
                    "# Pipelines\n",
                    "preprocessor = ColumnTransformer(\n",
                    "    transformers=[\n",
                    "        ('cat', OneHotEncoder(handle_unknown='ignore'), ['Temple', 'Festival', 'Day_Of_Week', 'Month']),\n",
                    "        ('num', StandardScaler(), ['Year', 'Is_Weekend', 'Is_Holiday'])\n",
                    "    ]\n",
                    ")\n",
                    "\n",
                    "X_processed = preprocessor.fit_transform(X)\n",
                    "if hasattr(X_processed, 'toarray'):\n",
                    "    X_processed = X_processed.toarray()\n",
                    "\n",
                    "scaler_footfall = StandardScaler()\n",
                    "scaler_temp = StandardScaler()\n",
                    "scaler_rain = StandardScaler()\n",
                    "\n",
                    "y_footfall_scaled = scaler_footfall.fit_transform(y_footfall.reshape(-1, 1)).flatten()\n",
                    "y_temp_scaled = scaler_temp.fit_transform(y_temp.reshape(-1, 1)).flatten()\n",
                    "y_rain_scaled = scaler_rain.fit_transform(y_rain.reshape(-1, 1)).flatten()"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 3. Train-Test Split"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "indices = np.arange(len(df))\n",
                    "train_idx, test_idx = train_test_split(indices, test_size=0.2, random_state=42)\n",
                    "\n",
                    "X_train, X_test = X_processed[train_idx], X_processed[test_idx]\n",
                    "y_footfall_train, y_footfall_test = y_footfall_scaled[train_idx], y_footfall_scaled[test_idx]\n",
                    "y_temp_train, y_temp_test = y_temp_scaled[train_idx], y_temp_scaled[test_idx]\n",
                    "y_rain_train, y_rain_test = y_rain_scaled[train_idx], y_rain_scaled[test_idx]\n",
                    "\n",
                    "train_dataset = CrowdDataset(X_train, y_footfall_train, y_temp_train, y_rain_train)\n",
                    "train_loader = DataLoader(train_dataset, batch_size=256, shuffle=True)\n",
                    "print(f\"Train size: {X_train.shape[0]}, Test size: {X_test.shape[0]}\")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 4. PyTorch Multi-Task Perceptron (MLP) Definition"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "class MultiTaskNN(nn.Module):\n",
                    "    def __init__(self, input_dim):\n",
                    "        super(MultiTaskNN, self).__init__()\n",
                    "        # Shared layers with LeakyReLU, BatchNorm, and Dropout\n",
                    "        self.shared = nn.Sequential(\n",
                    "            nn.Linear(input_dim, 256),\n",
                    "            nn.LeakyReLU(0.1),\n",
                    "            nn.BatchNorm1d(256),\n",
                    "            nn.Dropout(0.2),\n",
                    "            nn.Linear(256, 128),\n",
                    "            nn.LeakyReLU(0.1),\n",
                    "            nn.BatchNorm1d(128),\n",
                    "            nn.Dropout(0.2),\n",
                    "            nn.Linear(128, 64),\n",
                    "            nn.LeakyReLU(0.1),\n",
                    "            nn.BatchNorm1d(64),\n",
                    "            nn.Dropout(0.1)\n",
                    "        )\n",
                    "        # Separate regression output heads\n",
                    "        self.footfall_head = nn.Linear(64, 1)\n",
                    "        self.temp_head = nn.Linear(64, 1)\n",
                    "        self.rain_head = nn.Linear(64, 1)\n",
                    "        \n",
                    "    def forward(self, x):\n",
                    "        shared_out = self.shared(x)\n",
                    "        footfall = self.footfall_head(shared_out)\n",
                    "        temp = self.temp_head(shared_out)\n",
                    "        rain = self.rain_head(shared_out)\n",
                    "        return footfall, temp, rain"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 5. Train Model using Weighted Huber Loss & AdamW"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "input_dim = X_processed.shape[1]\n",
                    "model = MultiTaskNN(input_dim)\n",
                    "\n",
                    "# Losses: Huber (Robust to outliers) for Footfall/Rain, MSE for normal Temperature\n",
                    "huber_criterion = nn.SmoothL1Loss(beta=1.0)\n",
                    "mse_criterion = nn.MSELoss()\n",
                    "\n",
                    "# Loss weight distribution\n",
                    "w_footfall, w_temp, w_rain = 1.5, 1.0, 0.5\n",
                    "\n",
                    "optimizer = optim.AdamW(model.parameters(), lr=0.005, weight_decay=1e-4)\n",
                    "scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', patience=5, factor=0.5)\n",
                    "\n",
                    "epochs = 100\n",
                    "print(f\"Training PyTorch MLP model for {epochs} epochs...\")\n",
                    "model.train()\n",
                    "\n",
                    "for epoch in range(1, epochs + 1):\n",
                    "    running_loss = 0.0\n",
                    "    for batch_x, batch_yf, batch_yt, batch_yr in train_loader:\n",
                    "        optimizer.zero_grad()\n",
                    "        \n",
                    "        pred_f, pred_t, pred_r = model(batch_x)\n",
                    "        \n",
                    "        loss_f = huber_criterion(pred_f, batch_yf)\n",
                    "        loss_t = mse_criterion(pred_t, batch_yt)\n",
                    "        loss_r = huber_criterion(pred_r, batch_yr)\n",
                    "        \n",
                    "        loss = w_footfall * loss_f + w_temp * loss_t + w_rain * loss_r\n",
                    "        \n",
                    "        loss.backward()\n",
                    "        optimizer.step()\n",
                    "        running_loss += loss.item() * len(batch_x)\n",
                    "        \n",
                    "    epoch_loss = running_loss / len(train_idx)\n",
                    "    scheduler.step(epoch_loss)\n",
                    "    \n",
                    "    if epoch % 10 == 0 or epoch == 1:\n",
                    "        print(f\"Epoch {epoch}/{epochs} - Train Loss: {epoch_loss:.4f} (LR: {optimizer.param_groups[0]['lr']:.5f})\")\n",
                    "print(\"Training completed!\")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 6. Model Evaluation & Inversing Scales"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "model.eval()\n",
                    "with torch.no_grad():\n",
                    "    test_x = torch.tensor(X_test, dtype=torch.float32)\n",
                    "    pred_f_scaled, pred_t_scaled, pred_r_scaled = model(test_x)\n",
                    "    \n",
                    "    # Inverse transformations to original units\n",
                    "    pred_footfall = scaler_footfall.inverse_transform(pred_f_scaled.numpy()).flatten()\n",
                    "    pred_temp = scaler_temp.inverse_transform(pred_t_scaled.numpy()).flatten()\n",
                    "    pred_rain = scaler_rain.inverse_transform(pred_r_scaled.numpy()).flatten()\n",
                    "    \n",
                    "    # Unscaled targets\n",
                    "    true_footfall = df['Footfall'].values[test_idx]\n",
                    "    true_temp = df['Temperature'].values[test_idx]\n",
                    "    true_rain = df['Rainfall'].values[test_idx]\n",
                    "    \n",
                    "    # Compute R2, MAE, RMSE\n",
                    "    r2_f, mae_f, rmse_f = r2_score(true_footfall, pred_footfall), mean_absolute_error(true_footfall, pred_footfall), np.sqrt(mean_squared_error(true_footfall, pred_footfall))\n",
                    "    r2_t, mae_t, rmse_t = r2_score(true_temp, pred_temp), mean_absolute_error(true_temp, pred_temp), np.sqrt(mean_squared_error(true_temp, pred_temp))\n",
                    "    r2_r, mae_r, rmse_r = r2_score(true_rain, pred_rain), mean_absolute_error(true_rain, pred_rain), np.sqrt(mean_squared_error(true_rain, pred_rain))\n",
                    "    \n",
                    "    print('--- Test Evaluation Metrics ---')\n",
                    "    print(f'Footfall Prediction:    R2 = {r2_f:.4f} | MAE = {mae_f:.2f} | RMSE = {rmse_f:.2f}')\n",
                    "    print(f'Temperature Prediction: R2 = {r2_t:.4f} | MAE = {mae_t:.2f} | RMSE = {rmse_t:.2f}')\n",
                    "    print(f'Rainfall Prediction:    R2 = {r2_r:.4f} | MAE = {mae_r:.2f} | RMSE = {rmse_r:.2f}')"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 7. Diagnostics Plotting"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "fig, axes = plt.subplots(1, 3, figsize=(18, 5))\n",
                    "\n",
                    "# Footfall\n",
                    "sns.scatterplot(x=true_footfall[:300], y=pred_footfall[:300], ax=axes[0], alpha=0.6, color='blue')\n",
                    "axes[0].plot([true_footfall.min(), true_footfall.max()], [true_footfall.min(), true_footfall.max()], 'r--')\n",
                    "axes[0].set_title(f'Footfall Prediction (R2 = {r2_f:.2f})')\n",
                    "axes[0].set_xlabel('Actual Footfall')\n",
                    "axes[0].set_ylabel('Predicted Footfall')\n",
                    "\n",
                    "# Temp\n",
                    "sns.scatterplot(x=true_temp[:300], y=pred_temp[:300], ax=axes[1], alpha=0.6, color='orange')\n",
                    "axes[1].plot([true_temp.min(), true_temp.max()], [true_temp.min(), true_temp.max()], 'r--')\n",
                    "axes[1].set_title(f'Temperature Prediction (R2 = {r2_t:.2f})')\n",
                    "axes[1].set_xlabel('Actual Temp (C)')\n",
                    "axes[1].set_ylabel('Predicted Temp (C)')\n",
                    "\n",
                    "# Rain\n",
                    "sns.scatterplot(x=true_rain[:300], y=pred_rain[:300], ax=axes[2], alpha=0.6, color='teal')\n",
                    "axes[2].plot([true_rain.min(), true_rain.max()], [true_rain.min(), true_rain.max()], 'r--')\n",
                    "axes[2].set_title(f'Rainfall Prediction (R2 = {r2_r:.2f})')\n",
                    "axes[2].set_xlabel('Actual Rainfall (mm)')\n",
                    "axes[2].set_ylabel('Predicted Rainfall (mm)')\n",
                    "\n",
                    "plt.tight_layout()\n",
                    "plt.show()"
                ]
            }
        ],
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "name": "python"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 2
    }
    
    desktop_path = r"C:\Users\adity\OneDrive\Desktop\crowd_prediction_pipeline.ipynb"
    print(f"Writing notebook to {desktop_path}...")
    with open(desktop_path, "w", encoding="utf-8") as f:
        json.dump(notebook, f, indent=2)
    print("Notebook written successfully!")

if __name__ == "__main__":
    create_notebook()
