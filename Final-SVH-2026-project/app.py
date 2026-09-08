import os
import streamlit as st
import pandas as pd
import numpy as np
import joblib
import torch
import torch.nn as nn
import plotly.express as px

# Set page config
st.set_page_config(
    page_title="Tamil Nadu Temple Income & Crowd Forecaster",
    page_icon="🕌",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for modern glassmorphic look, badges, cards, and transitions
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Inter:wght@300;400;500;600&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }
    
    .main-header {
        font-family: 'Outfit', sans-serif;
        background: linear-gradient(135deg, #1E3C72 0%, #2A5298 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 700;
        font-size: 2.8rem;
        margin-bottom: 5px;
    }
    
    .sub-header {
        font-family: 'Inter', sans-serif;
        color: #5C6BC0;
        font-size: 1.15rem;
        font-weight: 400;
        margin-bottom: 2rem;
    }
    
    /* Card design */
    .fancy-card {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 24px;
        border: 1px solid rgba(224, 224, 224, 0.5);
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
        transition: all 0.3s ease;
        margin-bottom: 20px;
    }
    .fancy-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.08);
    }
    
    /* Metrics panels */
    .metric-panel {
        background: linear-gradient(135deg, #FF9966 0%, #FF5E62 100%);
        color: white;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 8px 32px 0 rgba(255, 94, 98, 0.15);
    }
    
    .dl-metric-panel {
        background: linear-gradient(135deg, #4776E6 0%, #8E54E9 100%);
        color: white;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 8px 32px 0 rgba(142, 84, 233, 0.15);
    }
    
    /* Badges */
    .badge {
        display: inline-block;
        padding: 6px 14px;
        font-family: 'Outfit', sans-serif;
        font-weight: 600;
        font-size: 0.95rem;
        border-radius: 30px;
        text-align: center;
        margin-top: 10px;
    }
    .badge-high {
        background-color: #ECE0FD;
        color: #6200EA;
        border: 1px solid #D1C4E9;
    }
    .badge-med-high {
        background-color: #E8F5E9;
        color: #2E7D32;
        border: 1px solid #C8E6C9;
    }
    .badge-med-low {
        background-color: #E3F2FD;
        color: #1565C0;
        border: 1px solid #BBDEFB;
    }
    .badge-low {
        background-color: #ECEFF1;
        color: #37474F;
        border: 1px solid #CFD8DC;
    }
    
    /* Forecast Cards */
    .forecast-card {
        padding: 20px;
        border-radius: 12px;
        text-align: center;
        border: 1px solid rgba(0, 0, 0, 0.05);
        background: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    
    /* Predicted Box container */
    .result-container {
        padding: 24px;
        border-radius: 16px;
        text-align: center;
        border: 1px solid rgba(30, 136, 229, 0.2);
        background: radial-gradient(circle at 10% 20%, rgba(216, 241, 250, 0.3) 0%, rgba(248, 251, 252, 0.3) 90.7%);
    }
</style>
""", unsafe_allow_html=True)

# ----------------- MODEL STRUCTURES -----------------

# PyTorch MLP Classification Model (for Temple Income)
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

# PyTorch Multi-Task Regressor Model (for Crowd Surge Prediction)
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

# Define paths
TEMPLE_DIR = os.path.dirname(os.path.abspath(__file__))

TEMPLE_DATA_PATH = os.path.join(TEMPLE_DIR, "data", "tn_temples_consolidated.xlsx")
DL_DATA_PATH = os.path.join(TEMPLE_DIR, "data", "historical_crowd_data.csv")

TEMPLE_MODEL_PATH = os.path.join(TEMPLE_DIR, "models", "temple_boosted_model.joblib")
TEMPLE_DL_MODEL_PATH = os.path.join(TEMPLE_DIR, "models", "temple_dl_model.pth")
TEMPLE_DL_PREP_PATH = os.path.join(TEMPLE_DIR, "models", "temple_dl_preprocessor.joblib")

DL_MODEL_PATH = os.path.join(TEMPLE_DIR, "models", "crowd_dl_model.pth")
DL_PREPROCESSOR_PATH = os.path.join(TEMPLE_DIR, "models", "dl_preprocessor.joblib")

# Caching Data & Model loaders
@st.cache_resource
def load_temple_model():
    if os.path.exists(TEMPLE_MODEL_PATH):
        return joblib.load(TEMPLE_MODEL_PATH)
    return None

@st.cache_data
def load_temple_dataset():
    if os.path.exists(TEMPLE_DATA_PATH):
        df = pd.read_excel(TEMPLE_DATA_PATH)
        df['district'] = df['district'].fillna('Unknown')
        df['district'] = df['district'].apply(lambda x: 'Unknown' if str(x).isdigit() else x)
        return df
    return None

@st.cache_resource
def load_temple_dl_model():
    if os.path.exists(TEMPLE_DL_MODEL_PATH) and os.path.exists(TEMPLE_DL_PREP_PATH):
        prep_data = joblib.load(TEMPLE_DL_PREP_PATH)
        model = TempleMLPClassifier(prep_data['input_dim'], prep_data['num_classes'])
        model.load_state_dict(torch.load(TEMPLE_DL_MODEL_PATH, map_location=torch.device('cpu')))
        model.eval()
        return model, prep_data
    return None, None

@st.cache_resource
def load_dl_model():
    if os.path.exists(DL_MODEL_PATH) and os.path.exists(DL_PREPROCESSOR_PATH):
        prep_data = joblib.load(DL_PREPROCESSOR_PATH)
        model = MultiTaskNN(prep_data['input_dim'])
        model.load_state_dict(torch.load(DL_MODEL_PATH, map_location=torch.device('cpu')))
        model.eval()
        return model, prep_data
    return None, None

@st.cache_data
def load_dl_dataset():
    if os.path.exists(DL_DATA_PATH):
        df = pd.read_csv(DL_DATA_PATH)
        df['Festival'] = df['Festival'].fillna('None')
        return df
    return None

# Load Resources
temple_model_data = load_temple_model()
df_temple = load_temple_dataset()
temple_dl_model, temple_dl_prep = load_temple_dl_model()

dl_model, dl_prep = load_dl_model()
df_dl = load_dl_dataset()

# Sidebar Navigation
st.sidebar.title("🕌 Temple Analytics")
st.sidebar.markdown("---")
page = st.sidebar.radio(
    "Navigation", 
    [
        "🔮 Predict Income Category", 
        "⛈️ Crowd & Weather Forecast (DL)", 
        "📊 Temple Model Performance", 
        "📈 Deep Learning Performance",
        "🗂️ Dataset Explorer"
    ]
)

# ----------------- PAGE 1: PREDICT INCOME CATEGORY -----------------
if page == "🔮 Predict Income Category":
    st.markdown("<h1 class='main-header'>🕌 Predict Temple 12A Income Category</h1>", unsafe_allow_html=True)
    st.markdown("<p class='sub-header'>Estimate the 12A annual income tier of any temple in Tamil Nadu using optimized ML/DL models.</p>", unsafe_allow_html=True)
    
    if temple_model_data is None or df_temple is None:
        st.error("Temple Classification Model or Dataset not found.")
    else:
        # Extract categories
        temple_types = sorted(df_temple['temple_type'].dropna().unique().tolist())
        temple_listings = sorted(df_temple['temple_listing_type'].dropna().unique().tolist())
        districts = sorted([d for d in df_temple['district'].dropna().unique().tolist() if not str(d).isdigit() and d != 'Unknown'])
        districts.append('Unknown')
        
        st.sidebar.subheader("Model Selection")
        model_choice = st.sidebar.radio(
            "Choose Model", 
            ["LightGBM Classifier (88.91% Accuracy)", "PyTorch MLP Classifier (84.96% Accuracy)"]
        )
        
        preprocessor = temple_model_data['preprocessor']
        model = temple_model_data['model']
        le = temple_model_data['label_encoder']
        category_mapping = temple_model_data['category_mapping']
        
        # Search autocomplete mapping
        temp_df = df_temple.copy()
        temp_df['search_name'] = temp_df['temple_name'].fillna('') + " (" + temp_df['district'].astype(str) + ")"
        search_options = ["Custom Input (Enter Manually)"] + sorted(temp_df['search_name'].unique().tolist())
        
        selected_search = st.selectbox(
            "🔍 Search & Select an Existing Temple (autofills fields below)",
            options=search_options,
            index=0
        )
        
        if selected_search != "Custom Input (Enter Manually)":
            row = temp_df[temp_df['search_name'] == selected_search].iloc[0]
            val_name = str(row['temple_name'])
            val_type = str(row['temple_type'])
            val_listing = str(row['temple_listing_type'])
            val_district = str(row['district'])
            if val_district not in districts:
                val_district = 'Unknown'
            val_pincode = str(row['pincode']).replace('.0', '').strip()
            if not val_pincode.isdigit() or len(val_pincode) != 6:
                val_pincode = '600001'
        else:
            val_name = ""
            val_type = temple_types[0]
            val_listing = temple_listings[0]
            val_district = districts[0]
            val_pincode = ""

        col1, col2 = st.columns([1.1, 0.9])
        
        with col1:
            st.markdown("<div class='fancy-card'>", unsafe_allow_html=True)
            st.subheader("Temple Details")
            
            input_name = st.text_input("Temple Name", value=val_name, placeholder="e.g., Arulmigu Kapaleeswarar Temple")
            
            sub_col1, sub_col2 = st.columns(2)
            with sub_col1:
                input_type = st.selectbox("Temple Type", temple_types, index=temple_types.index(val_type) if val_type in temple_types else 0)
                input_listing = st.selectbox("Listing Status", temple_listings, index=temple_listings.index(val_listing) if val_listing in temple_listings else 0)
            
            with sub_col2:
                input_district = st.selectbox("District", districts, index=districts.index(val_district) if val_district in districts else 0)
                input_pincode = st.text_input("Pincode", value=val_pincode, placeholder="e.g., 600004", max_chars=6)
            
            predict_clicked = st.button("Predict Income Category", use_container_width=True, type="primary")
            st.markdown("</div>", unsafe_allow_html=True)
            
        with col2:
            st.markdown("<div class='fancy-card' style='height: 100%;'>", unsafe_allow_html=True)
            st.subheader("Analysis & Predictions")
            st.caption(f"Currently using: **{model_choice}**")
            
            should_predict = predict_clicked or (selected_search != "Custom Input (Enter Manually)")
            
            if should_predict:
                if not input_name:
                    st.warning("⚠️ Please enter or select a temple name.")
                elif not input_pincode or len(input_pincode) != 6 or not input_pincode.isdigit():
                    st.warning("⚠️ Please enter a valid 6-digit pincode.")
                else:
                    pincode_prefix = input_pincode[:3]
                    input_df = pd.DataFrame([{
                        'temple_type': input_type,
                        'temple_listing_type': input_listing,
                        'district': input_district,
                        'pincode_prefix': pincode_prefix,
                        'temple_name': input_name
                    }])
                    
                    if "LightGBM" in model_choice:
                        # LightGBM Classifier Prediction
                        input_transformed = preprocessor.transform(input_df)
                        pred_class_encoded = model.predict(input_transformed)[0]
                        pred_probs = model.predict_proba(input_transformed)[0]
                        
                        pred_class = le.inverse_transform([pred_class_encoded])[0]
                        pred_desc = category_mapping.get(pred_class, "Unknown description")
                    else:
                        # PyTorch MLP Perceptron Prediction
                        dl_prep_pipeline = temple_dl_prep['preprocessor']
                        dl_model = temple_dl_model
                        dl_le = temple_dl_prep['label_encoder']
                        dl_mapping = temple_dl_prep['category_mapping']
                        
                        input_transformed = dl_prep_pipeline.transform(input_df)
                        if hasattr(input_transformed, 'toarray'):
                            input_transformed = input_transformed.toarray()
                            
                        input_tensor = torch.tensor(input_transformed, dtype=torch.float32)
                        with torch.no_grad():
                            outputs = dl_model(input_tensor)
                            pred_probs = torch.softmax(outputs, dim=1).numpy()[0]
                            pred_class_encoded = np.argmax(pred_probs)
                            
                        pred_class = dl_le.inverse_transform([pred_class_encoded])[0]
                        pred_desc = dl_mapping.get(pred_class, "Unknown description")
                        
                    badge_style = "badge-low"
                    badge_label = "🌱 Less than Rs. 10,000"
                    
                    if pred_class == '46_iii':
                        badge_style = "badge-high"
                        badge_label = "👑 Rs. 10 Lakh & Above"
                    elif pred_class == '46_ii':
                        badge_style = "badge-med-high"
                        badge_label = "💰 Rs. 2 Lakh - Rs. 10 Lakh"
                    elif pred_class == '46_i':
                        badge_style = "badge-med-low"
                        badge_label = "📈 Rs. 10,000 - Rs. 2 Lakh"
                    
                    st.markdown(f"""
                    <div class='result-container'>
                        <span style='color: #4A5568; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;'>Model Output Category</span>
                        <h2 style='color: #1A202C; font-family: "Outfit", sans-serif; font-weight: 700; margin: 10px 0;'>Class {pred_class}</h2>
                        <span class='badge {badge_style}'>{badge_label}</span>
                        <p style='color: #718096; font-size: 0.95rem; margin-top: 15px; font-style: italic;'>Description: {pred_desc}</p>
                    </div>
                    """, unsafe_allow_html=True)
                    
                    # Confidence chart
                    prob_df = pd.DataFrame({
                        'Class': le.classes_ if "LightGBM" in model_choice else dl_le.classes_,
                        'Label': [
                            "Rs. 10k - 2L (46_i)" if c=='46_i' else 
                            "Rs. 2L - 10L (46_ii)" if c=='46_ii' else 
                            "Rs. 10L+ (46_iii)" if c=='46_iii' else 
                            "< Rs. 10k (49_i)" for c in (le.classes_ if "LightGBM" in model_choice else dl_le.classes_)
                        ],
                        'Confidence': pred_probs
                    })
                    
                    fig = px.bar(
                        prob_df, 
                        x='Confidence', 
                        y='Label', 
                        orientation='h',
                        color='Class',
                        color_discrete_map={
                            '46_i': '#1E88E5',
                            '46_ii': '#2E7D32',
                            '46_iii': '#6200EA',
                            '49_i': '#546E7A'
                        },
                        title="Confidence Levels per Category",
                        text='Confidence'
                    )
                    fig.update_layout(
                        showlegend=False,
                        height=240,
                        margin=dict(l=20, r=20, t=40, b=20),
                        paper_bgcolor='rgba(0,0,0,0)',
                        plot_bgcolor='rgba(0,0,0,0)',
                        xaxis=dict(range=[0, 1.05], gridcolor='rgba(200,200,200,0.2)'),
                        yaxis=dict(autorange="reversed")
                    )
                    fig.update_traces(
                        texttemplate='%{text:.2%}', 
                        textposition='outside',
                        hovertemplate='Category: %{y}<br>Confidence: %{x:.2%}<extra></extra>'
                    )
                    st.plotly_chart(fig, use_container_width=True)
            else:
                st.info("💡 Select a temple from the dropdown search bar above or enter a new temple's details and click 'Predict Income Category'.")
            st.markdown("</div>", unsafe_allow_html=True)

# ----------------- PAGE 2: CROWD & WEATHER FORECAST (DL) -----------------
elif page == "⛈️ Crowd & Weather Forecast (DL)":
    st.markdown("<h1 class='main-header'>⛈️ Deep Learning Crowd & Weather Forecaster</h1>", unsafe_allow_html=True)
    st.markdown("<p class='sub-header'>Predict the crowd footfall, temperature, and rainfall of major temples in real-time using a PyTorch multi-task neural network.</p>", unsafe_allow_html=True)
    
    if dl_model is None or df_dl is None:
        st.error("PyTorch Deep Learning Model or Dataset not found. Ensure train_dl_optimized.py has been run.")
    else:
        # Unique parameters
        temples = sorted(df_dl['Temple'].unique().tolist())
        festivals = sorted(df_dl['Festival'].unique().tolist())
        
        col1, col2 = st.columns([1.1, 0.9])
        
        with col1:
            st.markdown("<div class='fancy-card'>", unsafe_allow_html=True)
            st.subheader("Forecast Inputs")
            
            sel_temple = st.selectbox("Select Temple", temples)
            
            sub1, sub2 = st.columns(2)
            with sub1:
                sel_date = st.date_input("Target Date")
                sel_holiday = st.selectbox("Is Holiday?", ["No", "Yes"])
            with sub2:
                sel_festival = st.selectbox("Select Festival Type", festivals, index=festivals.index('None') if 'None' in festivals else 0)
            
            # Map inputs to format
            day_of_week = sel_date.weekday()
            month = sel_date.month
            year = sel_date.year
            is_weekend = 1 if day_of_week >= 5 else 0
            is_holiday = 1 if sel_holiday == "Yes" else 0
            
            forecast_clicked = st.button("Generate Forecast", use_container_width=True, type="primary")
            st.markdown("</div>", unsafe_allow_html=True)
            
        with col2:
            st.markdown("<div class='fancy-card' style='height: 100%;'>", unsafe_allow_html=True)
            st.subheader("Forecast Outputs")
            
            if forecast_clicked:
                input_df = pd.DataFrame([{
                    'Temple': sel_temple,
                    'Day_Of_Week': day_of_week,
                    'Month': month,
                    'Year': year,
                    'Is_Weekend': is_weekend,
                    'Is_Holiday': is_holiday,
                    'Festival': sel_festival
                }])
                
                try:
                    feat_prep = dl_prep['feature_preprocessor']
                    scaler_f = dl_prep['scaler_footfall']
                    scaler_t = dl_prep['scaler_temp']
                    scaler_r = dl_prep['scaler_rain']
                    
                    input_transformed = feat_prep.transform(input_df)
                    if hasattr(input_transformed, 'toarray'):
                        input_transformed = input_transformed.toarray()
                    
                    input_tensor = torch.tensor(input_transformed, dtype=torch.float32)
                    with torch.no_grad():
                        pred_f_scaled, pred_t_scaled, pred_r_scaled = dl_model(input_tensor)
                        
                    pred_footfall = int(max(0, scaler_f.inverse_transform(pred_f_scaled.numpy()).flatten()[0]))
                    pred_temp = float(scaler_t.inverse_transform(pred_t_scaled.numpy()).flatten()[0])
                    pred_rain = float(max(0.0, scaler_r.inverse_transform(pred_r_scaled.numpy()).flatten()[0]))
                    
                    card1, card2, card3 = st.columns(3)
                    
                    crowd_label = "Low"
                    crowd_color = "gray"
                    if pred_footfall > 35000:
                        crowd_label = "Extremely High"
                        crowd_color = "red"
                    elif pred_footfall > 25000:
                        crowd_label = "High"
                        crowd_color = "orange"
                    elif pred_footfall > 15000:
                        crowd_label = "Medium"
                        crowd_color = "blue"
                        
                    with card1:
                        st.markdown(f"""
                        <div class='forecast-card'>
                            <span style='font-size: 1.5rem;'>👥</span>
                            <h4 style='margin: 5px 0 0 0; color: #555;'>Footfall</h4>
                            <h2 style='margin: 5px 0; color: #1E3C72;'>{pred_footfall:,}</h2>
                            <span style='color: {crowd_color}; font-weight: bold;'>{crowd_label} Crowd</span>
                        </div>
                        """, unsafe_allow_html=True)
                        
                    with card2:
                        st.markdown(f"""
                        <div class='forecast-card'>
                            <span style='font-size: 1.5rem;'>🌡️</span>
                            <h4 style='margin: 5px 0 0 0; color: #555;'>Temperature</h4>
                            <h2 style='margin: 5px 0; color: #E65100;'>{pred_temp:.1f}°C</h2>
                            <span style='color: #795548;'>Feels like {pred_temp + (1.2 if pred_temp > 30 else -0.5):.1f}°C</span>
                        </div>
                        """, unsafe_allow_html=True)
                        
                    with card3:
                        rain_label = "Sunny / Clear"
                        if pred_rain > 10.0:
                            rain_label = "Heavy Rain"
                        elif pred_rain > 2.0:
                            rain_label = "Rain Showers"
                        elif pred_rain > 0.1:
                            rain_label = "Light Drizzle"
                            
                        st.markdown(f"""
                        <div class='forecast-card'>
                            <span style='font-size: 1.5rem;'>🌧️</span>
                            <h4 style='margin: 5px 0 0 0; color: #555;'>Rainfall</h4>
                            <h2 style='margin: 5px 0; color: #0288D1;'>{pred_rain:.1f} mm</h2>
                            <span style='color: #546E7A;'>{rain_label}</span>
                        </div>
                        """, unsafe_allow_html=True)
                        
                    st.markdown("<br>", unsafe_allow_html=True)
                    
                    if pred_footfall > 35000:
                        st.warning("⚠️ **Extremely High Crowd Expected!** We recommend initiating crowd management blueprints, deploying additional queue barriers, and mobilizing security staff.")
                    if pred_temp > 38.0:
                        st.error("🔥 **Extreme Heat warning!** Predictions show temperature exceeds 38°C. Active buttermilk/water counters and shade shelters.")
                    if pred_rain > 8.0:
                        st.info("🌧️ **Heavy Rainfall expected!** Ensure indoor queue pathways are clear and drainage covers are free.")
                        
                except Exception as e:
                    st.error(f"Error executing deep learning prediction: {e}")
            else:
                st.info("💡 Fill out the target date and parameters on the left, then click 'Generate Forecast' to run the PyTorch Multi-Task Neural Network.")
            st.markdown("</div>", unsafe_allow_html=True)

# ----------------- PAGE 3: TEMPLE MODEL PERFORMANCE -----------------
elif page == "📊 Temple Model Performance":
    st.markdown("<h1 class='main-header'>📊 Model Performance Dashboard</h1>", unsafe_allow_html=True)
    st.markdown("<p class='sub-header'>Insights, metrics, and diagnostics of the classification models trained on temple income categories.</p>", unsafe_allow_html=True)
    
    tab1, tab2 = st.tabs(["🏆 Tuned LightGBM Classifier", "🧠 PyTorch MLP Classifier"])
    
    with tab1:
        st.markdown(
            f"""
            <div class="metric-panel">
                <h3 style="margin: 0; font-family: 'Outfit', sans-serif;">🏆 LightGBM Gradient Boosting Model</h3>
                <h1 style="margin: 5px 0 0 0; font-size: 3.5rem; font-family: 'Outfit', sans-serif; font-weight: 700;">88.91% Accuracy</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.95rem;">Tuned with engineered regional pincode prefixes and text TF-IDF n-grams.</p>
            </div>
            """, 
            unsafe_allow_html=True
        )
        st.markdown("<br>", unsafe_allow_html=True)
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("<div class='fancy-card'>", unsafe_allow_html=True)
            st.subheader("Confusion Matrix")
            cm_img_path = os.path.join(TEMPLE_DIR, "metrics", "confusion_matrix_boosted.png")
            if os.path.exists(cm_img_path):
                st.image(cm_img_path, use_container_width=True)
            else:
                st.write("Confusion matrix plot not found.")
            st.markdown("</div>", unsafe_allow_html=True)
        with col2:
            st.markdown("<div class='fancy-card'>", unsafe_allow_html=True)
            st.subheader("Feature Importances")
            fi_img_path = os.path.join(TEMPLE_DIR, "metrics", "feature_importance_boosted.png")
            if os.path.exists(fi_img_path):
                st.image(fi_img_path, use_container_width=True)
            else:
                st.write("Feature importance plot not found.")
            st.markdown("</div>", unsafe_allow_html=True)
            
    with tab2:
        st.markdown(
            f"""
            <div class="dl-metric-panel">
                <h3 style="margin: 0; font-family: 'Outfit', sans-serif;">🧠 Deep Learning Multi-Layer Perceptron (MLP)</h3>
                <h1 style="margin: 5px 0 0 0; font-size: 3.5rem; font-family: 'Outfit', sans-serif; font-weight: 700;">84.96% Accuracy</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.95rem;">Tuned with LeakyReLU, Dropout layers, and weighted cross-entropy loss function for minority classes.</p>
            </div>
            """, 
            unsafe_allow_html=True
        )
        st.markdown("<br>", unsafe_allow_html=True)
        col1, col2 = st.columns([1, 1])
        with col1:
            st.markdown("<div class='fancy-card'>", unsafe_allow_html=True)
            st.subheader("Confusion Matrix")
            cm_dl_path = os.path.join(TEMPLE_DIR, "metrics", "confusion_matrix_dl.png")
            if os.path.exists(cm_dl_path):
                st.image(cm_dl_path, use_container_width=True)
            else:
                st.write("Confusion matrix plot not found.")
            st.markdown("</div>", unsafe_allow_html=True)
        with col2:
            st.markdown("<div class='fancy-card'>", unsafe_allow_html=True)
            st.subheader("Classification Metrics")
            metrics_dl_path = os.path.join(TEMPLE_DIR, "metrics", "temple_dl_metrics.txt")
            if os.path.exists(metrics_dl_path):
                with open(metrics_dl_path, "r") as f:
                    metrics_txt = f.read()
                st.code(metrics_txt, language="text")
            else:
                st.write("Classification metrics not found.")
            st.markdown("</div>", unsafe_allow_html=True)

# ----------------- PAGE 4: DEEP LEARNING PERFORMANCE -----------------
elif page == "📈 Deep Learning Performance":
    st.markdown("<h1 class='main-header'>📈 Deep Learning Model Diagnostics</h1>", unsafe_allow_html=True)
    st.markdown("<p class='sub-header'>Evaluating the PyTorch Multi-Task Feedforward Neural Network on the crowd and weather historical data.</p>", unsafe_allow_html=True)
    
    st.markdown(
        f"""
        <div class="dl-metric-panel">
            <h3 style="margin: 0; font-family: 'Outfit', sans-serif;">🤖 Architecture: Optimized PyTorch MLP</h3>
            <h1 style="margin: 5px 0 0 0; font-size: 3.2rem; font-family: 'Outfit', sans-serif; font-weight: 700;">Footfall R² = 94.55%</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.95rem;">Model optimized using task-weighted Huber Loss and deeper Multi-Layer Perceptron (MLP) layers.</p>
        </div>
        """, 
        unsafe_allow_html=True
    )
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    st.markdown("<div class='fancy-card'>", unsafe_allow_html=True)
    st.subheader("Model Predictions vs. Actual values (Test Set Scatter)")
    dl_plot_path = os.path.join(TEMPLE_DIR, "metrics", "dl_predictions_comparison_optimized.png")
    if os.path.exists(dl_plot_path):
        st.image(dl_plot_path, use_container_width=True)
    else:
        st.write("Diagnostic scatter plot not found.")
    st.markdown("</div>", unsafe_allow_html=True)

# ----------------- PAGE 5: DATASET EXPLORER -----------------
elif page == "🗂️ Dataset Explorer":
    st.markdown("<h1 class='main-header'>🗂️ Dataset Explorer</h1>", unsafe_allow_html=True)
    
    tab1, tab2 = st.tabs(["🕌 Temple Income Dataset", "⛈️ Crowd & Weather Historical Dataset"])
    
    with tab1:
        st.markdown("<p class='sub-header'>Browse and inspect the Tamil Nadu Temples consolidated dataset.</p>", unsafe_allow_html=True)
        st.markdown("<div class='fancy-card'>", unsafe_allow_html=True)
        if df_temple is not None:
            st.dataframe(df_temple.head(200), use_container_width=True)
            st.subheader("Quick Dataset Summary")
            col1, col2, col3 = st.columns(3)
            col1.metric("Total Records", f"{df_temple.shape[0]:,}")
            col2.metric("Total Districts", f"{df_temple['district'].nunique() - (1 if 'Unknown' in df_temple['district'].values else 0)}")
            col3.metric("Income Categories", f"{df_temple['temple_12a_category'].nunique()}")
        else:
            st.write("Temple dataset not loaded.")
        st.markdown("</div>", unsafe_allow_html=True)
        
    with tab2:
        st.markdown("<p class='sub-header'>Browse and inspect the historical crowd, temperature, and rainfall dataset.</p>", unsafe_allow_html=True)
        st.markdown("<div class='fancy-card'>", unsafe_allow_html=True)
        if df_dl is not None:
            st.dataframe(df_dl.head(200), use_container_width=True)
            st.subheader("Quick Dataset Summary")
            col1, col2, col3 = st.columns(3)
            col1.metric("Total Records", f"{df_dl.shape[0]:,}")
            col2.metric("Distinct Temples tracked", f"{df_dl['Temple'].nunique()}")
            col3.metric("Active Festivals tracked", f"{df_dl['Festival'].nunique() - (1 if 'None' in df_dl['Festival'].values else 0)}")
        else:
            st.write("Crowd dataset not loaded.")
        st.markdown("</div>", unsafe_allow_html=True)
