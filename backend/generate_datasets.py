import csv
import random
import uuid
from datetime import datetime, timedelta

# Utility to generate random dates
def random_date(start, end):
    return start + timedelta(
        seconds=random.randint(0, int((end - start).total_seconds())),
    )

start_date = datetime.strptime('1/1/2024', '%m/%d/%Y')
end_date = datetime.now()

# ---------------------------------------------------------
# HEALTH INSURANCE DATASET GENERATOR
# ---------------------------------------------------------
health_diagnoses = [
    ("J01", "Acute sinusitis", 1500, 3000),
    ("I20", "Angina pectoris", 25000, 50000),
    ("E11", "Type 2 diabetes", 5000, 15000),
    ("K35", "Acute appendicitis", 30000, 60000),
    ("S06", "Concussion", 10000, 25000)
]

hospitals = ["Wellness Prime", "City General", "Apex Healthcare", "Metro Medical Center", "Sunrise Clinic"]

def generate_health_data(num_rows=100):
    data = []
    headers = ["Claim_ID", "Policy_Holder", "Age", "Diagnosis_Code", "Diagnosis_Desc", "Hospital_Name", "Admission_Date", "Discharge_Date", "Claim_Amount", "Expected_Cost_Avg", "Status", "Fraud_Flags"]
    
    for _ in range(num_rows):
        diag = random.choice(health_diagnoses)
        admission = random_date(start_date, end_date)
        discharge = admission + timedelta(days=random.randint(1, 14))
        
        # Simulate some fraud/overbilling
        is_fraud = random.random() < 0.15 # 15% fraud rate
        if is_fraud:
            claim_amount = random.randint(diag[3] + 10000, diag[3] + 50000) # Way over max expected
            status = "Flagged"
            flags = "Overbilling / Upcoding Detected"
        else:
            claim_amount = random.randint(diag[2], diag[3])
            status = random.choice(["Approved", "Approved", "Pending Review"])
            flags = "None"

        data.append([
            f"HLT-{uuid.uuid4().hex[:8].upper()}",
            f"User_{random.randint(1000, 9999)}",
            random.randint(18, 85),
            diag[0],
            diag[1],
            random.choice(hospitals),
            admission.strftime('%Y-%m-%d'),
            discharge.strftime('%Y-%m-%d'),
            claim_amount,
            (diag[2] + diag[3]) // 2,
            status,
            flags
        ])
    return headers, data

# ---------------------------------------------------------
# VEHICLE INSURANCE DATASET GENERATOR
# ---------------------------------------------------------
vehicles = ["Toyota Corolla", "Honda Civic", "Ford F-150", "Tesla Model 3", "BMW 3 Series", "Hyundai Tucson"]
weather = ["Clear", "Rain", "Snow", "Fog", "Overcast"]
locations = ["Sector 45 Intersection", "Highway 101", "Downtown Parking", "Residential Suburb", "Main Street"]

def generate_vehicle_data(num_rows=100):
    data = []
    headers = ["Claim_ID", "Policy_Holder", "Vehicle_Model", "Incident_Date", "Location", "Weather_Conditions", "Damage_Severity", "Claim_Amount", "Past_Claims_Count", "Police_Report", "Status", "Fraud_Flags"]
    
    for _ in range(num_rows):
        incident_date = random_date(start_date, end_date)
        severity = random.choice(["Minor", "Moderate", "Severe", "Totaled"])
        
        if severity == "Minor": base_cost = 1500
        elif severity == "Moderate": base_cost = 5000
        elif severity == "Severe": base_cost = 15000
        else: base_cost = 30000
        
        past_claims = random.choices([0, 1, 2, 3, 4], weights=[60, 25, 10, 4, 1])[0]
        
        # Simulate fraud (e.g. high past claims, minor damage but massive claim amount)
        is_fraud = random.random() < 0.15
        if is_fraud or past_claims >= 3:
            claim_amount = base_cost + random.randint(10000, 25000)
            status = "Flagged"
            if past_claims >= 3:
                flags = "Frequent Claimant"
            else:
                flags = "Exaggerated Damage"
        else:
            claim_amount = base_cost + random.randint(-500, 2000)
            status = random.choice(["Approved", "Approved", "Pending Review"])
            flags = "None"
            
        has_police_report = "Yes" if severity in ["Severe", "Totaled"] else random.choice(["Yes", "No"])

        data.append([
            f"VHC-{uuid.uuid4().hex[:8].upper()}",
            f"User_{random.randint(1000, 9999)}",
            random.choice(vehicles),
            incident_date.strftime('%Y-%m-%d'),
            random.choice(locations),
            random.choice(weather),
            severity,
            claim_amount,
            past_claims,
            has_police_report,
            status,
            flags
        ])
    return headers, data

# Write to CSV
h_headers, h_data = generate_health_data(150)
with open('health_insurance_claims.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(h_headers)
    writer.writerows(h_data)

v_headers, v_data = generate_vehicle_data(150)
with open('vehicle_insurance_claims.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(v_headers)
    writer.writerows(v_data)

print("✅ Successfully generated health_insurance_claims.csv and vehicle_insurance_claims.csv")
