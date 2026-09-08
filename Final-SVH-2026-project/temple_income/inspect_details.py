import pandas as pd

def main():
    file_path = r"C:\Users\adity\OneDrive\Desktop\tn_temples_consolidated.xlsx"
    df = pd.read_excel(file_path)
    
    categorical_cols = ['temple_type', 'temple_listing_type', 'temple_12a_category', 'temple_12a_category_description']
    for col in categorical_cols:
        print(f"\n--- Unique values in {col} ---")
        counts = df[col].value_counts()
        print(f"Total unique: {len(counts)}")
        print("Top 10 values:")
        print(counts.head(10))

if __name__ == "__main__":
    main()
