from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
import os
from dotenv import load_dotenv
import jwt
from datetime import datetime, timedelta
import numpy as np
import joblib
import shap
import json
import google.generativeai as genai

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# ----------------------------
# ML MODEL SETUP
# ----------------------------
# Configure Gemini API (optional - for explanations)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
llm_model = None
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        llm_model = genai.GenerativeModel("gemini-2.5-flash")
        print("✅ Gemini API configured successfully!")
    except Exception as e:
        print(f"⚠️  Gemini API configuration failed: {e}")
        llm_model = None
else:
    print("⚠️  No Gemini API key found. Risk score explanations will be disabled.")

# Load ML model
ML_MODEL_PATH = os.path.join(os.path.dirname(__file__), "ml_model", "risk_model (1).pkl")
try:
    pipeline = joblib.load(ML_MODEL_PATH)
    imputer = pipeline.named_steps["imputer"]
    scaler = pipeline.named_steps["scaler"]
    ml_model = pipeline.named_steps["model"]
    
    # SHAP setup
    FEATURE_COLS = ["Age", "Income", "Emp_length", "Amount", "Rate", "Percent_income", "Cred_length"]
    SAFE_RANGES = {
        "Age": (18, 80), "Income": (10000, 300000), "Emp_length": (0, 40),
        "Amount": (500, 60000), "Rate": (3, 30), "Percent_income": (1, 40), "Cred_length": (1, 40)
    }
    
    baseline = np.array([[(SAFE_RANGES[col][0] + SAFE_RANGES[col][1]) / 2 for col in FEATURE_COLS]])
    baseline_imp = imputer.transform(baseline)
    baseline_scaled = scaler.transform(baseline_imp)
    explainer = shap.LinearExplainer(ml_model, baseline_scaled, feature_names=FEATURE_COLS)
    
    ML_MODEL_LOADED = True
    print("✅ ML Model loaded successfully!")
except Exception as e:
    ML_MODEL_LOADED = False
    print(f"⚠️  ML Model not loaded: {e}")
    print("⚠️  Risk score endpoint will use fallback calculation")

def apply_safe_range(name, value):
    if not ML_MODEL_LOADED:
        return value
    lo, hi = SAFE_RANGES[name]
    return max(lo, min(value, hi))

# MongoDB connection
uri = os.getenv('MONGODB_URI')
if not uri:
    raise ValueError("MONGODB_URI not found in environment variables")

client = MongoClient(uri, server_api=ServerApi('1'))
db = client['auth']
users_collection = db['users']

# JWT secret key (in production, use a secure random key)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')

# Test MongoDB connection with better error handling
try:
    client.admin.command('ping')
    print("✅ Successfully connected to MongoDB!")
except Exception as e:
    print(f"⚠️  MongoDB connection error: {e}")
    print("⚠️  Server will run but database operations will fail. Please check MONGODB_URI in .env")

def generate_token(user_id):
    """Generate JWT token for user"""
    payload = {
        'user_id': str(user_id),
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Server is running'}), 200

def calculate_risk_score_auto(user_data):
    """Calculate risk score automatically using ML model or fallback"""
    if not ML_MODEL_LOADED:
        # Fallback calculation based on basic factors
        age = user_data.get('age', 30)
        income = user_data.get('income', 30000)
        emp_length = user_data.get('employmentLength', 2)
        
        base_score = 50
        if age >= 25 and age <= 55:
            base_score += 10
        if income >= 50000:
            base_score += 15
        elif income >= 30000:
            base_score += 10
        if emp_length >= 3:
            base_score += 15
        elif emp_length >= 1:
            base_score += 10
        
        return min(max(base_score, 0), 100)
    
    # Use ML model
    try:
        age = user_data.get('age', 30)
        income = user_data.get('income', 30000)
        emp_length = user_data.get('employmentLength', 2)
        
        # Use default values for loan-specific features
        amount = 5000
        rate = 10.0
        percent_income = (amount / income) * 100 if income > 0 else 50
        cred_length = max(age - 18, 1)
        
        features = np.array([[age, income, emp_length, amount, rate, percent_income, cred_length]])
        
        # Get prediction
        default_prob = ml_model.predict_proba(features)[0][1]
        risk_score = int(default_prob * 100)
        
        return min(max(risk_score, 0), 100)
    except Exception as e:
        print(f"Error calculating risk score: {e}")
        return 50  # Default middle score

@app.route('/api/signup', methods=['POST'])
def signup():
    """User registration endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'password', 'phone', 'age', 'income', 'employmentLength']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if user already exists
        if users_collection.find_one({'email': data['email']}):
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Hash password
        hashed_password = generate_password_hash(data['password'])
        
        # Calculate initial risk score
        risk_score = calculate_risk_score_auto({
            'age': int(data['age']),
            'income': float(data['income']),
            'employmentLength': int(data['employmentLength'])
        })
        
        # Create user document
        user = {
            'name': data['name'],
            'email': data['email'],
            'password': hashed_password,
            'phone': data['phone'],
            'userType': data.get('userType', 'borrower'),
            'age': int(data['age']),
            'income': float(data['income']),
            'employmentLength': int(data['employmentLength']),
            'riskScore': risk_score,
            'createdAt': datetime.utcnow()
        }
        
        # Insert user into database
        result = users_collection.insert_one(user)
        user_id = result.inserted_id
        
        # Generate token
        token = generate_token(user_id)
        
        # Return user data (without password)
        user_data = {
            'id': str(user_id),
            'name': user['name'],
            'email': user['email'],
            'phone': user['phone'],
            'userType': user['userType'],
            'age': user['age'],
            'income': user['income'],
            'employmentLength': user['employmentLength'],
            'riskScore': user['riskScore'],
            'token': token
        }
        
        return jsonify({'message': 'User created successfully', 'user': user_data}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user by email
        user = users_collection.find_one({'email': data['email']})
        
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check password
        if not check_password_hash(user['password'], data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate token
        token = generate_token(user['_id'])
        
        # Return user data (without password)
        user_data = {
            'id': str(user['_id']),
            'name': user['name'],
            'email': user['email'],
            'phone': user.get('phone', ''),
            'userType': user.get('userType', 'borrower'),
            'age': user.get('age', 30),
            'income': user.get('income', 0),
            'employmentLength': user.get('employmentLength', 0),
            'riskScore': user.get('riskScore', 50),
            'token': token
        }
        
        return jsonify({'message': 'Login successful', 'user': user_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user', methods=['GET'])
def get_user():
    """Get user information by token"""
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is required'}), 401
        
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
        
        # Decode token
        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Find user
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Return user data (without password)
        user_data = {
            'id': str(user['_id']),
            'name': user['name'],
            'email': user['email'],
            'phone': user.get('phone', ''),
            'userType': user.get('userType', 'borrower'),
            'age': user.get('age', 30),
            'income': user.get('income', 0),
            'employmentLength': user.get('employmentLength', 0),
            'riskScore': user.get('riskScore', 50)
        }
        
        return jsonify({'user': user_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user', methods=['PUT'])
def update_user():
    """Update user profile including financial information"""
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is required'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        
        # Build update document
        update_fields = {}
        if 'name' in data:
            update_fields['name'] = data['name']
        if 'phone' in data:
            update_fields['phone'] = data['phone']
        if 'age' in data:
            update_fields['age'] = int(data['age'])
        if 'income' in data:
            update_fields['income'] = float(data['income'])
        if 'employmentLength' in data:
            update_fields['employmentLength'] = int(data['employmentLength'])
        
        # Recalculate risk score if financial data changed
        if any(key in data for key in ['age', 'income', 'employmentLength']):
            user = users_collection.find_one({'_id': ObjectId(user_id)})
            risk_data = {
                'age': update_fields.get('age', user.get('age', 30)),
                'income': update_fields.get('income', user.get('income', 30000)),
                'employmentLength': update_fields.get('employmentLength', user.get('employmentLength', 2))
            }
            update_fields['riskScore'] = calculate_risk_score_auto(risk_data)
        
        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400
        
        # Update user
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_fields}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'User not found or no changes made'}), 404
        
        # Return updated user
        updated_user = users_collection.find_one({'_id': ObjectId(user_id)})
        user_data = {
            'id': str(updated_user['_id']),
            'name': updated_user['name'],
            'email': updated_user['email'],
            'phone': updated_user.get('phone', ''),
            'userType': updated_user.get('userType', 'borrower'),
            'age': updated_user.get('age', 30),
            'income': updated_user.get('income', 0),
            'employmentLength': updated_user.get('employmentLength', 0),
            'riskScore': updated_user.get('riskScore', 50)
        }
        
        return jsonify({'user': user_data, 'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/risk-score', methods=['POST'])
def calculate_risk_score():
    """Calculate risk score using integrated ML model"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['age', 'income', 'emp_length', 'amount', 'rate', 'percent_income', 'cred_length']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        if ML_MODEL_LOADED:
            # Use integrated ML model
            user_input = {}
            for key in FEATURE_COLS:
                value = float(data[key.lower()])
                value = apply_safe_range(key, value)
                user_input[key] = value

            X = np.array([[user_input[col] for col in FEATURE_COLS]])

            # Preprocess
            X_imp = imputer.transform(X)
            X_scaled = scaler.transform(X_imp)

            # Prediction probability of default
            prob = float(ml_model.predict_proba(X_scaled)[0][1])
            prob_round = round(prob, 3)

            # Convert to risk score (inverse of default probability)
            risk_score = int((1 - prob) * 100)

            # Risk bucket
            if prob < 0.3:
                risk_level = "Low"
            elif prob < 0.6:
                risk_level = "Medium"
            else:
                risk_level = "High"

            # Generate SHAP explanations
            shap_values = None
            feature_importance = None
            ai_explanation = None
            
            try:
                shap_values_raw = explainer.shap_values(X_scaled)
                shap_values = shap_values_raw[0].tolist() if len(shap_values_raw.shape) > 1 else shap_values_raw.tolist()
                
                # Create feature importance dictionary
                feature_importance = []
                for i, col in enumerate(FEATURE_COLS):
                    feature_importance.append({
                        'feature': col,
                        'value': user_input[col],
                        'impact': round(float(shap_values[i]), 4),
                        'direction': 'increases' if shap_values[i] > 0 else 'decreases'
                    })
                
                # Sort by absolute impact
                feature_importance.sort(key=lambda x: abs(x['impact']), reverse=True)
                
                # Generate AI explanation using Gemini if available
                if llm_model:
                    top_factors = feature_importance[:3]
                    prompt = f"""Explain this loan risk assessment in simple terms for a lender:

Risk Score: {risk_score}/100 (Higher is better)
Default Probability: {prob_round*100:.1f}%
Risk Level: {risk_level}

Top Risk Factors:
1. {top_factors[0]['feature']}: {top_factors[0]['value']} ({top_factors[0]['direction']} risk by {abs(top_factors[0]['impact']):.2f})
2. {top_factors[1]['feature']}: {top_factors[1]['value']} ({top_factors[1]['direction']} risk by {abs(top_factors[1]['impact']):.2f})
3. {top_factors[2]['feature']}: {top_factors[2]['value']} ({top_factors[2]['direction']} risk by {abs(top_factors[2]['impact']):.2f})

Provide a 2-3 sentence explanation that helps a lender understand this borrower's creditworthiness."""
                    
                    response = llm_model.generate_content(prompt)
                    ai_explanation = response.text
                    
            except Exception as e:
                print(f"SHAP explanation generation failed: {e}")

            return jsonify({
                'risk_score': risk_score,
                'default_probability': prob_round,
                'risk_level': risk_level,
                'input_used': user_input,
                'feature_importance': feature_importance,
                'ai_explanation': ai_explanation,
                'method': 'ML Model with SHAP Explanations'
            }), 200
        else:
            # Fallback calculation
            age_score = min(100, max(0, (data['age'] - 18) * 2))
            income_score = min(100, (data['income'] / 1000))
            emp_score = min(100, data['emp_length'] * 5)
            
            # Simple weighted average
            basic_score = int((age_score * 0.2 + income_score * 0.4 + emp_score * 0.4))
            
            return jsonify({
                'risk_score': basic_score,
                'default_probability': (100 - basic_score) / 100,
                'risk_level': 'Medium' if basic_score >= 40 else 'High',
                'input_used': data,
                'method': 'Basic Calculation',
                'note': 'ML model unavailable'
            }), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/borrower-risk-explanation', methods=['POST'])
def get_borrower_risk_explanation():
    """Get explainable AI risk assessment for a borrower"""
    try:
        data = request.get_json()
        
        # Get borrower address
        borrower_address = data.get('borrowerAddress')
        if not borrower_address:
            return jsonify({'error': 'borrowerAddress is required'}), 400
        
        # Get loan details
        age = data.get('age', 30)
        income = data.get('income', 50000)
        emp_length = data.get('employmentLength', 5)
        amount = data.get('amount', 5000)
        rate = data.get('rate', 10)
        
        if not ML_MODEL_LOADED:
            return jsonify({
                'error': 'ML model not available',
                'explanation': 'Risk analysis requires the ML model to be loaded'
            }), 503
        
        # Calculate features
        percent_income = (amount / income) * 100 if income > 0 else 50
        cred_length = max(age - 18, 1)
        
        # Prepare input
        user_input = {
            'Age': apply_safe_range('Age', age),
            'Income': apply_safe_range('Income', income),
            'Emp_length': apply_safe_range('Emp_length', emp_length),
            'Amount': apply_safe_range('Amount', amount),
            'Rate': apply_safe_range('Rate', rate),
            'Percent_income': apply_safe_range('Percent_income', percent_income),
            'Cred_length': apply_safe_range('Cred_length', cred_length)
        }
        
        X = np.array([[user_input[col] for col in FEATURE_COLS]])
        X_imp = imputer.transform(X)
        X_scaled = scaler.transform(X_imp)
        
        # Prediction
        prob = float(ml_model.predict_proba(X_scaled)[0][1])
        risk_score = int((1 - prob) * 100)
        
        if prob < 0.3:
            risk_level = "Low"
        elif prob < 0.6:
            risk_level = "Medium"
        else:
            risk_level = "High"
        
        # Generate SHAP explanations
        try:
            shap_values_raw = explainer.shap_values(X_scaled)
            shap_values = shap_values_raw[0].tolist() if len(shap_values_raw.shape) > 1 else shap_values_raw.tolist()
            
            feature_importance = []
            for i, col in enumerate(FEATURE_COLS):
                feature_importance.append({
                    'feature': col.replace('_', ' '),
                    'value': user_input[col],
                    'impact': round(float(shap_values[i]), 4),
                    'impact_percent': round(abs(float(shap_values[i])) / sum(abs(float(sv)) for sv in shap_values) * 100, 1) if sum(abs(float(sv)) for sv in shap_values) > 0 else 0,
                    'direction': 'positive' if shap_values[i] < 0 else 'negative'  # Lower SHAP = better borrower
                })
            
            feature_importance.sort(key=lambda x: abs(x['impact']), reverse=True)
            
            # Generate AI explanation
            ai_explanation = None
            if llm_model:
                try:
                    top_3 = feature_importance[:3]
                    prompt = f"""As a financial advisor, explain this borrower's creditworthiness to a lender in 2-3 clear sentences:

Borrower Profile:
- Age: {age} years
- Annual Income: ${income:,}
- Employment Length: {emp_length} years
- Loan Request: ${amount:,} at {rate}% interest

Risk Assessment:
- Credit Score: {risk_score}/100
- Default Risk: {prob*100:.1f}%
- Risk Level: {risk_level}

Key Factors:
1. {top_3[0]['feature']}: {top_3[0]['value']} (Impact: {top_3[0]['impact_percent']}%, {top_3[0]['direction']} influence)
2. {top_3[1]['feature']}: {top_3[1]['value']} (Impact: {top_3[1]['impact_percent']}%, {top_3[1]['direction']} influence)
3. {top_3[2]['feature']}: {top_3[2]['value']} (Impact: {top_3[2]['impact_percent']}%, {top_3[2]['direction']} influence)

Provide a professional, concise explanation focusing on why this is a {risk_level.lower()} risk investment."""
                    
                    response = llm_model.generate_content(prompt)
                    ai_explanation = response.text
                except Exception as e:
                    print(f"Gemini explanation failed: {e}")
                    ai_explanation = f"This borrower has a {risk_score}/100 credit score with a {risk_level.lower()} risk level. The {feature_importance[0]['feature'].lower()} is the primary factor influencing this assessment."
            
            return jsonify({
                'borrowerAddress': borrower_address,
                'risk_score': risk_score,
                'default_probability': round(prob, 3),
                'risk_level': risk_level,
                'feature_importance': feature_importance,
                'ai_explanation': ai_explanation,
                'recommendation': 'Recommended' if risk_score >= 60 else 'Caution Advised' if risk_score >= 40 else 'High Risk',
                'borrower_profile': {
                    'age': age,
                    'income': income,
                    'employment_length': emp_length,
                    'loan_amount': amount,
                    'interest_rate': rate
                }
            }), 200
            
        except Exception as e:
            return jsonify({'error': f'SHAP calculation failed: {str(e)}'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)