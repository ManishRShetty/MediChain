import pandas as pd
import random
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

# 1. Generate synthetic data
def generate_data(n=10000):
    diagnoses = ['Hypertension', 'Diabetes', 'Healthy']
    labels = {'Healthy': 0, 'Hypertension': 1, 'Diabetes': 1}

    data = []
    for _ in range(n):
        diagnosis = random.choice(diagnoses)
        label = labels[diagnosis]
        entry = {
            "Age": random.randint(20, 90),
            "BP_Systolic": random.randint(90, 180),
            "BP_Diastolic": random.randint(60, 110),
            "Glucose": random.randint(70, 180),
            "HR": random.randint(40, 120),
            "SpO2": random.randint(85, 100),
            "Diagnosis": diagnosis,
            "Label": label
        }
        data.append(entry)
    return pd.DataFrame(data)

# 2. Prepare the dataset
df = generate_data()

# Encode Diagnosis
df['Diagnosis'] = df['Diagnosis'].fillna('None')
df = pd.get_dummies(df, columns=['Diagnosis'], drop_first=True)

# 3. Split dataset
X = df.drop('Label', axis=1)
y = df['Label']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Train the model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# 5. Evaluate
y_pred = model.predict(X_test)
print("Classification Report:\n", classification_report(y_test, y_pred))

# 6. Save the model
joblib.dump(model, 'health_model.pkl')
print("Model saved as 'health_model.pkl'")

# 7. Load and test a prediction
model = joblib.load('health_model.pkl')
sample_input = [[78, 124, 94, 103, 56, 100, 1, 0]]  # Adjust if dummies differ
prediction = model.predict(sample_input)
print("Prediction:", "Unhealthy" if prediction[0] == 1 else "Healthy")
