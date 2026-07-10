import csv
import random
import uuid
from datetime import datetime

NUM_USERS = 50
NUM_CLAIMS = 100

# -----------------------------
# REALISTIC NAME GENERATION
# -----------------------------
first_names = [
    "Aarav", "Vivaan", "Aditya", "Arjun", "Reyansh",
    "Ananya", "Diya", "Ishita", "Meera", "Sanya",
    "Rohan", "Rahul", "Karthik", "Vikram", "Siddharth",
    "Priya", "Sneha", "Kavya", "Pooja", "Anjali"
]

last_names = [
    "Reddy", "Sharma", "Verma", "Nair", "Iyer",
    "Patel", "Gupta", "Singh", "Mehta", "Bhat",
    "Kulkarni", "Shetty", "Naidu", "Chatterjee", "Das"
]

def generate_name():
    return random.choice(first_names) + " " + random.choice(last_names)

# -----------------------------
# GENERATE USERS
# -----------------------------
users = []
for i in range(NUM_USERS):
    user_id = f"USR-{10000+i}"
    name = generate_name()

    users.append({
        "User_ID": user_id,
        "Name": name,
        "Email": name.replace(" ", "").lower() + "@gmail.com",
        "Age": random.randint(18, 70),
        "Gender": random.choice(["Male", "Female"]),
        "Policy_Tier": random.choice(["Basic", "Standard", "Premium"])
    })

with open("users_master.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=users[0].keys())
    writer.writeheader()
    writer.writerows(users)

# -----------------------------
# HEALTH + VEHICLE CONFIG
# -----------------------------
diseases = [
    ("Diabetes", "Chronic"),
    ("Appendicitis", "Acute"),
    ("Fracture", "Injury"),
    ("Heart Disease", "Chronic"),
    ("Migraine", "Moderate")
]

hospitals = ["Apollo", "City Care", "Fortis", "Metro Hospital"]

vehicles = ["Tesla Model 3", "Honda Civic", "Toyota Corolla", "Ford F-150"]
damage_levels = ["Minor", "Moderate", "Severe"]

# -----------------------------
# GENERATE CLAIMS
# -----------------------------
claims = []
health_claims = []
vehicle_claims = []

for i in range(NUM_CLAIMS):
    user = random.choice(users)

    claim_id = f"CLM-{uuid.uuid4().hex[:8].upper()}"
    claim_type = random.choice(["Health", "Vehicle"])

    fraud_flag = random.choice(["None", "Suspicious Amount", "Frequent Claimant"])
    status = "Flagged" if fraud_flag != "None" else "Approved"

    claim_amount = random.randint(5000, 80000)

    # -----------------------------
    # CLAIM HISTORY
    # -----------------------------
    claims.append({
        "Claim_ID": claim_id,
        "User_ID": user["User_ID"],
        "Insurance_Type": claim_type,
        "Claim_Amount": claim_amount,
        "Status": status,
        "Fraud_Flags": fraud_flag
    })

    # -----------------------------
    # HEALTH CLAIMS
    # -----------------------------
    if claim_type == "Health":
        disease = random.choice(diseases)

        health_claims.append({
            "Claim_ID": claim_id,
            "User_ID": user["User_ID"],
            "Hospital": random.choice(hospitals),
            "Disease": disease[0],
            "Disease_Type": disease[1],
            "Treatment_Duration_Days": random.randint(1, 15),
            "Expected_Cost": random.randint(5000, 30000),
            "Claim_Amount": claim_amount,
            "Fraud_Flags": fraud_flag
        })

    # -----------------------------
    # VEHICLE CLAIMS
    # -----------------------------
    else:
        purchase_year = random.randint(2015, 2024)

        vehicle_claims.append({
            "Claim_ID": claim_id,
            "User_ID": user["User_ID"],
            "Vehicle_Model": random.choice(vehicles),
            "Car_Purchase_Year": purchase_year,
            "Vehicle_Age": 2025 - purchase_year,
            "Damage_Severity": random.choice(damage_levels),
            "Previous_Claims_Count": random.randint(0, 5),
            "Driver_Risk_Score": round(random.uniform(0, 1), 2),
            "Claim_Amount": claim_amount,
            "Fraud_Flags": fraud_flag
        })

# -----------------------------
# SAVE FILES
# -----------------------------
with open("claims_history.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=claims[0].keys())
    writer.writeheader()
    writer.writerows(claims)

if health_claims:
    with open("health_insurance_claims.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=health_claims[0].keys())
        writer.writeheader()
        writer.writerows(health_claims)

if vehicle_claims:
    with open("vehicle_insurance_claims.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=vehicle_claims[0].keys())
        writer.writeheader()
        writer.writerows(vehicle_claims)

print("✅ All datasets generated successfully with proper linkage and realistic data!")