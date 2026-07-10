import csv
import random
import uuid
from datetime import datetime, timedelta

# Utility to generate random dates
def random_date(start, end):
    return start + timedelta(
        seconds=random.randint(0, int((end - start).total_seconds())),
    )

start_date = datetime.strptime('1/1/2023', '%m/%d/%Y')
end_date = datetime.now()

# ---------------------------------------------------------
# 1. GENERATE USERS DATASET (The "Main" Dataset)
# ---------------------------------------------------------
first_names_m = ["Rahul", "Suhas", "Vikram", "Amit", "Karan", "Arjun", "Rohan", "Aditya"]
first_names_f = ["Aditi", "Pavitra", "Neha", "Priya", "Sneha", "Anjali", "Pooja", "Kavya"]
last_names = ["Sharma", "Verma", "Patel", "Singh", "Reddy", "Rao", "Gupta", "Desai"]

users_data = []
user_ids = []

def generate_users(num_users=100):
    headers = ["User_ID", "Name", "Gender", "Age", "Policy_Tier"]
    
    for _ in range(num_users):
        user_id = f"USR-{random.randint(10000, 99999)}"
        user_ids.append(user_id)
        
        gender = random.choice(["Male", "Female"])
        if gender == "Male":
            name = f"{random.choice(first_names_m)} {random.choice(last_names)}"
        else:
            name = f"{random.choice(first_names_f)} {random.choice(last_names)}"
            
        age = random.randint(22, 65)
        policy_tier = random.choice(["Basic", "Standard", "Premium"])
        
        users_data.append([user_id, name, gender, age, policy_tier])
        
    return headers, users_data

# ---------------------------------------------------------
# 2. GENERATE CLAIMS HISTORY (The "Details" Dataset)
# ---------------------------------------------------------
def generate_claims(user_ids_list, num_claims=150):
    headers = ["Claim_ID", "User_ID", "Insurance_Type", "Incident_Date", "Claim_Amount", "Status", "Fraud_Flags"]
    claims_data = []
    
    insurance_types = ["Health", "Vehicle"]
    statuses = ["Approved", "Approved", "Rejected", "Pending Investigation"]
    
    for _ in range(num_claims):
        claim_id = f"CLM-{uuid.uuid4().hex[:8].upper()}"
        user_id = random.choice(user_ids_list) # Map claim to a generated user
        ins_type = random.choice(insurance_types)
        date = random_date(start_date, end_date).strftime('%Y-%m-%d')
        
        if ins_type == "Health":
            amount = random.randint(5000, 75000)
        else:
            amount = random.randint(2000, 40000)
            
        # Simulate some fraud
        is_fraud = random.random() < 0.1
        if is_fraud:
            amount += 50000 # Unusually high
            status = "Pending Investigation"
            flags = "Suspicious Amount"
        else:
            status = random.choice(statuses)
            flags = "None"
            
        claims_data.append([claim_id, user_id, ins_type, date, amount, status, flags])
        
    return headers, claims_data


# ---------------------------------------------------------
# EXECUTE AND SAVE
# ---------------------------------------------------------
u_headers, u_data = generate_users(100)
c_headers, c_data = generate_claims(user_ids, 150)

# Write Users CSV
with open('users_master.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(u_headers)
    writer.writerows(u_data)

# Write Claims CSV
with open('claims_history.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(c_headers)
    writer.writerows(c_data)

# Print without emojis to avoid encoding errors on windows cmd
print("Successfully generated users_master.csv and claims_history.csv")
