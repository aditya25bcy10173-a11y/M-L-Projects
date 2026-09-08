import pandas as pd
import sys

def main():
    file_path = r"C:\Users\adity\OneDrive\Desktop\historical_crowd_data.csv"
    print(f"Loading {file_path}...")
    try:
        df = pd.read_csv(file_path)
        print("Data loaded successfully!")
        print(f"Shape: {df.shape}")
        print("\nColumns:")
        print(df.columns.tolist())
        print("\nFirst 5 rows:")
        print(df.head())
        print("\nData Info:")
        print(df.info())
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
