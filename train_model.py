import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

# 1. Prepare Dummy Historical Data
# In production, this data comes from your database (tracks users listened to without skipping)
# weather_code: 0=Clear, 1=Clouds, 2=Rain
data = {
    'hour_of_day': [8, 14, 22, 2, 9, 15, 23, 10, 18],
    'weather_code': [0, 0, 1, 2, 2, 0, 0, 1, 2],
    'target_bpm': [120, 140, 90, 70, 110, 135, 85, 115, 125],
    'target_energy': [0.8, 0.9, 0.4, 0.2, 0.7, 0.85, 0.3, 0.75, 0.8]
}

df = pd.DataFrame(data)

# 2. Define Features (X) and Targets (y)
X = df[['hour_of_day', 'weather_code']]
y = df[['target_bpm', 'target_energy']]

# 3. Train the Model
print("Training Smart Mix Model...")
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X.values, y.values)

# 4. Save the Model
# This creates a file that your Flask app will load to make real-time predictions
joblib.dump(model, 'pookify_smart_model.pkl')
print("Model saved as 'pookify_smart_model.pkl'")