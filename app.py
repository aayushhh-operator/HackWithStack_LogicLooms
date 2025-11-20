from flask import Flask, render_template, request, jsonify
import numpy as np
import joblib
import shap
import os
import json
import google.generativeai as genai

app = Flask(__name__)

# ----------------------------
# CONFIG: Gemini API
# ----------------------------
# Set GEMINI_API_KEY in your environment:
# export GEMINI_API_KEY="your_key_here"
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

llm_model = genai.GenerativeModel("gemini-2.5-flash")

# ----------------------------
# LOAD MODEL + PREPROCESSORS
# ----------------------------
MODEL_PATH = "/Users/kabirmathur/Documents/Hack_with_Stack/model/risk_model (1).pkl"
pipeline = joblib.load(MODEL_PATH)

# Extract steps from pipeline
imputer = pipeline.named_steps["imputer"]
scaler = pipeline.named_steps["scaler"]
model = pipeline.named_steps["model"]

# ----------------------------
# FEATURES USED DURING TRAINING
# ----------------------------
FEATURE_COLS = [
    "Age", "Income", "Emp_length",
    "Amount", "Rate", "Percent_income", "Cred_length"
]

# TRAINING SAFE RANGES
SAFE_RANGES = {
    "Age": (18, 80),
    "Income": (10000, 300000),
    "Emp_length": (0, 40),
    "Amount": (500, 60000),
    "Rate": (3, 30),
    "Percent_income": (1, 40),
    "Cred_length": (1, 40)
}

def apply_safe_range(name, value):
    lo, hi = SAFE_RANGES[name]
    return max(lo, min(value, hi))


# ----------------------------
# SHAP INITIALIZATION
# ----------------------------
# Baseline = midpoint of each feature safe range → manually impute + scale
baseline = np.array([[
    (SAFE_RANGES[col][0] + SAFE_RANGES[col][1]) / 2
    for col in FEATURE_COLS
]])
baseline_imp = imputer.transform(baseline)
baseline_scaled = scaler.transform(baseline_imp)

explainer = shap.LinearExplainer(
    model,
    baseline_scaled,
    feature_names=FEATURE_COLS
)


# ----------------------------
# HELPER: LLM Explanation
# ----------------------------
def generate_llm_explanation(input_used, shap_values, bias_term, total_effect):
    """
    Ask Gemini to explain the SHAP output feature-by-feature.
    """
    shap_json = json.dumps(shap_values, indent=2)
    input_json = json.dumps(input_used, indent=2)

    prompt = f"""
You are explaining the prediction of a credit default risk model.

The model outputs a probability that the borrower will DEFAULT on a loan.

You are given:
1. The borrower input features:
{input_json}

2. The SHAP values for each feature (contribution to log-odds of default):
{shap_json}

3. The model's base bias term (expected log-odds without any features): {bias_term:.4f}
4. The total SHAP effect (sum of feature contributions): {total_effect:.4f}

Instructions:
- Explain in simple language why the model predicted this risk.
- For each feature, say whether it INCREASES or DECREASES risk and why, based on the SHAP value sign.
- Use short bullet points.
- Avoid equations; keep it intuitive.
- End with a one-line summary of the most important drivers.
"""

    try:
        resp = llm_model.generate_content(prompt)
        return resp.text.strip()
    except Exception as e:
        # If Gemini call fails, fall back to a simple message
        return f"LLM explanation unavailable (error: {e}). Raw SHAP values: {shap_json}"


# ----------------------------
# ROUTES
# ----------------------------

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Parse incoming features
        user_input = {}
        for key in FEATURE_COLS:
            value = float(request.form[key.lower()])
            value = apply_safe_range(key, value)
            user_input[key] = value

        X = np.array([[user_input[col] for col in FEATURE_COLS]])

        # Preprocess
        X_imp = imputer.transform(X)
        X_scaled = scaler.transform(X_imp)

        # Prediction probability of default
        prob = float(model.predict_proba(X_scaled)[0][1])
        prob_round = round(prob, 3)

        # Risk bucket
        if prob < 0.3:
            risk = "Low"
        elif prob < 0.6:
            risk = "Medium"
        else:
            risk = "High"

        return jsonify({
            "probability": prob_round,
            "risk": risk,
            "input_used": user_input
        })

    except Exception as e:
        return jsonify({"error": str(e)})


@app.route("/explain", methods=["POST"])
def explain():
    try:
        # Parse user input (must match /predict)
        user_input = {}
        for key in FEATURE_COLS:
            value = float(request.form[key.lower()])
            value = apply_safe_range(key, value)
            user_input[key] = value

        X = np.array([[user_input[col] for col in FEATURE_COLS]])

        # Preprocess
        X_imp = imputer.transform(X)
        X_scaled = scaler.transform(X_imp)

        # SHAP values for this sample
        shap_vals = explainer.shap_values(X_scaled)[0]  # 1D array, len = n_features

        shap_dict = {
            FEATURE_COLS[i]: float(shap_vals[i])
            for i in range(len(FEATURE_COLS))
        }

        bias_term = float(explainer.expected_value)
        total_effect = float(sum(shap_vals))

        # ---- Call LLM to explain this ----
        llm_text = generate_llm_explanation(user_input, shap_dict, bias_term, total_effect)

        final_output = {
            "input_used": user_input,
            "shap_values": shap_dict,
            "bias_term": bias_term,
            "total_effect": total_effect,
            "llm_explanation": llm_text
        }

        return jsonify(final_output)

    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
