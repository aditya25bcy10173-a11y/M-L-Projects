# 🕌 Temple Income & Vedic Crowd Surge Forecasting System

An end-to-end, AI-powered system designed to analyze temple finances and forecast devotee crowd surges. This repository contains the complete preprocessing pipelines, model architectures (LightGBM and PyTorch Multi-Layer Perceptrons), evaluation metrics, and a unified interactive **Streamlit** dashboard.

---

## 🌟 Key Features

### 1. 🔮 Temple Income Classifier
* **Objective**: Classify temples in Tamil Nadu into their official 12A annual income brackets based on temple properties.
* **Dual-Model Support**:
  * **Tuned LightGBM Classifier**: Incorporates regional pincode prefix feature engineering and TF-IDF text features (500 features) from temple names to achieve **88.91% Accuracy**.
  * **PyTorch MLP Classifier**: A deep Multi-Layer Perceptron (Input $\rightarrow$ 512 $\rightarrow$ 256 $\rightarrow$ 128 $\rightarrow$ 64 $\rightarrow$ Outputs) utilizing **weighted cross-entropy loss** (inversing class frequency) to boost minority class detection (recall for high-income class `46_iii` is boosted to **34.0%**).

### 2. ⛈️ Deep Learning Crowd & Weather Forecaster
* **Objective**: Predict daily devotee crowd footfall, temperature, and rainfall simultaneously.
* **Architecture**: A PyTorch **Multi-Task Neural Network** mapping shared latent spaces (size 64) through dense blocks to separate prediction heads.
* **Custom Loss formulation**: Uses **Huber Loss (Smooth L1)** for robust handling of extreme crowd outliers during festivals, optimized using task weights:
  $$\mathcal{L}_{\text{total}} = 1.5 \cdot \mathcal{L}_{\text{footfall}} + 1.0 \cdot \mathcal{L}_{\text{temp}} + 0.5 \cdot \mathcal{L}_{\text{rain}}$$
* **Accuracy**: Achieves an exceptional **Footfall $R^2$ score of 94.55%** (MAE: 2,855 devotees).

### 3. 🎨 Glassmorphic Streamlit Dashboard (UI/UX)
* Features 5 interactive tabs:
  1. **🔮 Predict Income Category**: Interactive interface to run predictions using either LightGBM or PyTorch MLP models, with autocomplete search indexing.
  2. **⛈️ Crowd & Weather Forecast (DL)**: Forecaster using the PyTorch Multi-Task model to generate real-time crowd metrics and active safety advisories.
  3. **📊 Temple Model Performance**: Diagnostic confusion matrix and feature importances for the classifiers.
  4. **📈 Deep Learning Performance**: Diagnostics showing scatter plots of actual vs. predicted values for footfalls.
  5. **🗂️ Dataset Explorer**: Raw dataset search tabs.

---

## 🗂️ Repository Structure

```directory
├── data/
│   ├── tn_temples_consolidated.xlsx     # Tamil Nadu temples dataset
│   └── historical_crowd_data.csv       # Historical crowd & weather dataset
│
├── notebooks/
│   ├── temple_training_pipeline.ipynb   # Income classification Jupyter Notebook
│   └── crowd_prediction_pipeline.ipynb # PyTorch deep learning crowd prediction Notebook
│
├── temple_income/
│   ├── train_dl_classifier.py          # PyTorch MLP classification training script
│   ├── train_boosted.py                # Preprocessing and LightGBM/XGBoost training script
│   ├── train_rf.py                     # Baseline Random Forest classifier script
│   ├── generate_boosted_fi.py          # Script exporting classification feature importances
│   ├── inspect_data.py                 # Basic structural data inspector
│   └── inspect_details.py              # Detailed column value counts script
│
├── crowd_forecast/
│   ├── train_dl_optimized.py           # Optimized PyTorch MLP training script
│   ├── train_dl.py                     # Baseline PyTorch NN training script
│   ├── inspect_crowd_data.py           # Structural inspector for crowd CSV
│   └── check_dl.py                     # Script verifying PyTorch CPU version
│
├── models/
│   ├── temple_boosted_model.joblib      # Serialized LightGBM pipeline weights
│   ├── temple_dl_model.pth             # Saved PyTorch MLP weights state dict
│   ├── temple_dl_preprocessor.joblib   # Pickled PyTorch label encoders & preprocessors
│   ├── crowd_dl_model.pth              # Saved PyTorch Multi-Task regressor weights
│   └── dl_preprocessor.joblib          # Pickled target/feature transformers for crowd
│
├── metrics/
│   ├── confusion_matrix_boosted.png    # LightGBM classification confusion matrix
│   ├── confusion_matrix_dl.png         # PyTorch classification confusion matrix
│   ├── feature_importance_boosted.png  # LightGBM feature weight bar chart
│   ├── dl_predictions_comparison_optimized.png # PyTorch crowd predictions scatter plot
│   ├── temple_dl_metrics.txt           # PyTorch classification metrics
│   ├── dl_metrics_optimized.txt        # PyTorch crowd regression metrics
│   └── metrics_boosted.txt             # LightGBM classification metrics
│
├── app.py                              # Streamlit frontend app
└── .gitignore                          # Standard git ignore definitions
```

---

## 🚀 Installation & Running

### 1. Install Dependencies
Run the command below to install all necessary machine learning and visualization packages:
```bash
pip install streamlit pandas numpy scikit-learn lightgbm xgboost catboost torch openpyxl joblib plotly matplotlib seaborn
```

### 2. Run the Dashboard
Start the local Streamlit web server:
```bash
python -m streamlit run app.py
```
Open **[http://localhost:8501](http://localhost:8501)** in your browser to interact with the dashboard.

### 3. Training the Models Manually
To retrain or tune the models, run:
```bash
# Train Classifier Models
python temple_income/train_boosted.py
python temple_income/train_dl_classifier.py

# Train Crowd Forecaster Model
python crowd_forecast/train_dl_optimized.py
```
