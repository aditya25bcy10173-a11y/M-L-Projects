"""
URL Phishing & Spam Detector - Prediction Script
Loads model.joblib and tests any URL in real time.
Usage:
    python predict.py
    python predict.py --url "https://google.com"
"""

import os
import sys
import argparse
import urllib.parse
import re
import joblib
import pandas as pd

MODEL_FILE = "model.joblib"

def load_model():
    if not os.path.exists(MODEL_FILE):
        desktop_path = os.path.join(r"C:\Users\adity\OneDrive\Desktop", MODEL_FILE)
        if os.path.exists(desktop_path):
            return joblib.load(desktop_path)
        raise FileNotFoundError(f"Could not find '{MODEL_FILE}'. Please run train.py first!")
    return joblib.load(MODEL_FILE)

def extract_features(url, feature_names):
    # Parse URL
    u = url.strip()
    if not u.startswith(('http://', 'https://')):
        u = 'http://' + u
        
    parsed = urllib.parse.urlparse(u)
    domain = parsed.netloc.split(':')[0]
    
    url_len = len(u)
    dom_len = len(domain)
    is_ip = 1 if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', domain) else 0
    tld = domain.split('.')[-1] if '.' in domain else ''
    
    subdomains = max(0, len(domain.split('.')) - 2)
    if domain.lower().startswith('www.'):
        subdomains = max(0, subdomains - 1)
        
    has_obf = 1 if ('%' in u or '@' in u) else 0
    is_https = 1 if u.startswith('https://') else 0
    
    # Check for common phishing lure keywords
    lower = u.lower()
    is_phish_lure = any(w in lower for w in ['bank', 'login', 'paypal', 'account', 'verify', 'update', 'security', 'crypto', 'claim']) or is_ip or not is_https

    # Create feature dictionary with default values
    row = {col: 0 for col in feature_names}
    
    row['URLLength'] = url_len
    row['DomainLength'] = dom_len
    row['IsDomainIP'] = is_ip
    row['TLDLength'] = len(tld)
    row['NoOfSubDomain'] = subdomains
    row['HasObfuscation'] = has_obf
    row['IsHTTPS'] = is_https
    
    # Baseline page structure approximations
    row['URLSimilarityIndex'] = 50.0 if is_phish_lure else 100.0
    row['LineOfCode'] = 10 if is_phish_lure else 800
    row['NoOfExternalRef'] = 0 if is_phish_lure else 40
    row['NoOfSelfRef'] = 0 if is_phish_lure else 15
    row['HasSocialNet'] = 0 if is_phish_lure else 1

    return pd.DataFrame([row], columns=feature_names)

def predict(url):
    bundle = load_model()
    model = bundle['model']
    feature_names = bundle['features']
    
    df_feat = extract_features(url, feature_names)
    pred = model.predict(df_feat)[0]
    probs = model.predict_proba(df_feat)[0]
    phish_risk = probs[0] * 100  # class 0 is phishing
    
    print("-" * 55)
    print(f"URL:          {url}")
    if pred == 1:
        print("Result:       SAFE / LEGITIMATE")
    else:
        print("Result:       WARNING: PHISHING / SPAM")
    print(f"Phishing Risk: {phish_risk:.1f}%")
    print("-" * 55)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Predict if a URL is legitimate or phishing.")
    parser.add_argument("--url", "-u", type=str, help="URL to test")
    args = parser.parse_args()
    
    if args.url:
        predict(args.url)
    else:
        # If no argument, ask user for input or run sample tests
        print("No URL provided. Testing demo URLs:")
        demo_urls = [
            "https://www.google.com",
            "https://www.wikipedia.org",
            "http://secure-paypal-login.update-account-verification.com/login.php",
            "http://192.168.1.15/bank/verify"
        ]
        for demo in demo_urls:
            predict(demo)
        print("\nYou can test your own URL with: python predict.py --url 'https://example.com'")
