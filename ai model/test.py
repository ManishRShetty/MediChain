# import random
# import pandas as pd

# def generate_record():
#     age = random.randint(18, 90)
#     bp_sys = random.randint(90, 180)
#     bp_dia = random.randint(60, 110)
#     glucose = random.randint(70, 200)
#     hr = random.randint(50, 120)
#     spo2 = random.randint(85, 100)

#     # Diagnosis rules
#     if bp_sys > 140 or bp_dia > 90:
#         diagnosis = 'Hypertension'
#     elif glucose > 140:
#         diagnosis = 'Diabetes'
#     elif spo2 < 92:
#         diagnosis = 'COPD'
#     elif hr > 100:
#         diagnosis = 'Tachycardia'
#     else:
#         diagnosis = 'None'

#     # Label rules
#     label = 'Unhealthy' if diagnosis != 'None' else 'Healthy'

#     return {
#         "Age": age,
#         "BP_Systolic": bp_sys,
#         "BP_Diastolic": bp_dia,
#         "Glucose": glucose,
#         "HR": hr,
#         "SpO2": spo2,
#         "Diagnosis": diagnosis,
#         "Label": label
#     }

# # Generate 10,000 records
# data = [generate_record() for _ in range(10000)]

# # Create DataFrame
# df = pd.DataFrame(data)

# # Save to CSV (optional)
# df.to_csv('synthetic_health_data.csv', index=False)

# # Preview
# print(df.head())


import pandas as pd
import numpy as np


num_new_entries = 10000

user_ids = [f'NTC{str(i).zfill(4)}' for i in range(4, 4 + num_new_entries)]

new_data = {
    'User ID': user_ids,
    'Age': np.random.randint(18, 80, size=num_new_entries),
    'Previous Trials': np.random.randint(0, 6, size=num_new_entries),
    'Last Trial Outcome': np.random.choice([0, 1], size=num_new_entries),
    'Product Experience': np.random.choice([0, 1], size=num_new_entries),
}

# Combine with original DataFrame
df_large = pd.concat([pd.DataFrame(new_data)], ignore_index=True)


print(df_large.head())
print(f"Total rows: {df_large.shape[0]}")

df_large.to_csv('synthetic_health_data_large.csv', index=False)
