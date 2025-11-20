# Loan Default Prediction App

A web application that predicts the likelihood of loan default using a pre-trained LightGBM model. The application features a modern, responsive UI with form validation and real-time predictions.

## Features

- User-friendly interface for entering loan application details
- Real-time prediction of loan default probability
- Responsive design that works on desktop and mobile devices
- Input validation and helpful tooltips
- Clean and modern UI with loading states

## Prerequisites

- Python 3.7+
- pip (Python package manager)

## Installation

1. Clone the repository:
   ```bash
   git clone [your-repository-url]
   cd Hack_with_Stack
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

1. Start the Flask development server:
   ```bash
   python app.py
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:10000
   ```

## Project Structure

```
Hack_with_Stack/
├── app.py                # Main application file
├── requirements.txt      # Python dependencies
├── model/
│   ├── lightgbm_model.txt  # Pre-trained LightGBM model
│   └── lightgbm_sklearn.pkl  # Alternative model format
├── static/
│   ├── style.css        # CSS styles
│   └── predict.js       # Frontend JavaScript
└── templates/
    └── index.html       # Main HTML template
```

## API Endpoints

- `GET /`: Main application interface
- `POST /predict`: API endpoint for making predictions
- `GET /health`: Health check endpoint

## Deployment

For production deployment, consider using:
- Gunicorn or uWSGI as the application server
- Nginx as a reverse proxy
- A process manager like systemd or Supervisor

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [LightGBM](https://lightgbm.readthedocs.io/)
- [Flask](https://flask.palletsprojects.com/)
- [Font Awesome](https://fontawesome.com/)
- [Google Fonts](https://fonts.google.com/)
