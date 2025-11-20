import joblib
import json
import pandas as pd

# Load model
print("Loading model...")
model = joblib.load("credit_risk_ensemble.pkl")

# Extract preprocessor
preprocess = model.named_steps["preprocess"]

column_transformer = preprocess

columns = []

for name, transformer, cols in column_transformer.transformers_:
    if name == "remainder":
        continue

    if isinstance(cols, list):
        columns.extend(cols)

# Safety check
print("Extracted", len(columns), "columns.")

# Save to JSON
with open("model_columns.json", "w") as f:
    json.dump(columns, f)

print("Saved model_columns.json!")
