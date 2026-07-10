import pandas as pd
import random
import os
from PIL import Image, ImageDraw, ImageFont

# -----------------------------
# CONFIG
# -----------------------------
OUTPUT_DIR = "generated_docs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Try to load a nicer font, fallback to default
try:
    FONT_NORMAL = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 18)
    FONT_BOLD   = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 18)
    FONT_TITLE  = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 20)
except:
    FONT_NORMAL = ImageFont.load_default()
    FONT_BOLD   = FONT_NORMAL
    FONT_TITLE  = FONT_NORMAL

# -----------------------------
# LOAD CSVs
# -----------------------------
df       = pd.read_csv("vehicle_insurance_claims.csv")
users_df = pd.read_csv("users_master.csv")

# Build user lookup: User_ID -> Name
user_lookup = dict(zip(users_df["User_ID"], users_df["Name"]))

# -----------------------------
# DATA BANKS
# -----------------------------
OFFICER_NAMES    = ["Rajeev Singh", "Priya Sharma", "Amit Kumar", "Sunita Rao", "Vikram Nair", "Deepak Verma"]
POLICE_STATIONS  = ["Delhi Traffic Police", "Mumbai Traffic Control", "Bengaluru Traffic Wing",
                    "Chennai Road Safety Unit", "Hyderabad City Police", "Pune Traffic HQ"]
LOCATIONS        = ["Ring Road, Delhi", "MG Road, Bengaluru", "Marine Drive, Mumbai",
                    "Anna Salai, Chennai", "Banjara Hills, Hyderabad", "Sector 45 Intersection",
                    "Highway 101", "Downtown Parking Zone", "Main Street Junction"]
PLATE_PREFIXES   = ["DL-9C", "MH-02", "KA-05", "TN-09", "TS-08", "GJ-01", "RJ-14"]

DAMAGE_NARRATIVES = {
    "Minor":    [
        "The {vehicle} sustained minor cosmetic damage to the rear bumper after a low-speed collision with another vehicle. No airbags were deployed. Driver was unharmed.",
        "A {vehicle} was involved in a minor fender-bender in a parking lot. Scratches noted on the front bumper. No structural damage observed."
    ],
    "Moderate": [
        "The {vehicle} suffered moderate damage to the left side panel and door after a sideswipe collision. Both vehicles were mobile after the incident.",
        "A {vehicle} collided at moderate speed with a parked truck. Damage includes a cracked windshield and dented hood. No airbag deployment."
    ],
    "Severe":   [
        "At approximately {time} hrs, a severe collision occurred on {loc}. The {vehicle} suffered extensive front-end damage after hitting a concrete barrier. Driver sustained minor injuries.",
        "The {vehicle} was involved in a high-speed collision on {loc}. Severe structural damage reported to the chassis and engine compartment. Airbags deployed."
    ],
    "Totaled":  [
        "The {vehicle} was declared a total loss following a head-on collision on {loc}. Entire front section destroyed. Driver was transported to hospital.",
        "A {vehicle} sustained catastrophic damage after rolling over on {loc}. Vehicle deemed beyond repair. Emergency services attended the scene."
    ]
}

DAMAGE_PARTS = {
    "Minor":    ["Rear bumper paint scratch", "Side mirror cracked", "Trunk alignment off"],
    "Moderate": ["Left door panel dented", "Windshield cracked", "Hood partially dented", "Front bumper bent"],
    "Severe":   ["Front bumper completely destroyed", "Both headlights shattered", "Hood crumpled, airbags deployed", "Radiator damaged"],
    "Totaled":  ["Chassis severely bent", "Engine block damaged", "All airbags deployed", "Roof caved in", "Complete front-end collapse"]
}

REPAIR_ITEMS = {
    "Minor":    [("Bumper repaint & polish", 0.45), ("Scratch removal", 0.30), ("Labor charges", 0.25)],
    "Moderate": [("Panel replacement", 0.40), ("Windshield replacement", 0.25), ("Paint refinishing", 0.20), ("Labor charges", 0.15)],
    "Severe":   [("Engine component repair", 0.35), ("Bodywork & frame repair", 0.30), ("Parts replacement", 0.25), ("Labor charges", 0.10)],
    "Totaled":  [("Total vehicle write-off assessment", 0.50), ("Salvage processing", 0.25), ("Documentation & towing", 0.25)]
}

GARAGE_NAMES = ["Sri Ram Auto Works", "National Motors Pvt. Ltd.", "Prime Auto Collision Center",
                "Speedway Auto Repair", "City Auto Service Center", "Elite Motors & Body Shop"]


# -----------------------------
# DRAW HELPERS
# -----------------------------
def draw_line(draw, y, x=50, width=700, color="black"):
    draw.line([(x, y), (x + width, y)], fill=color, width=1)
    return y + 6

def draw_text(draw, text, x, y, font=None, fill="black"):
    font = font or FONT_NORMAL
    draw.text((x, y), text, fill=fill, font=font)
    try:
        bbox = font.getbbox(text)
        h = bbox[3] - bbox[1]
    except:
        h = 20
    return y + h + 6

def wrap_text(text, max_chars=75):
    """Simple word-wrap."""
    words = text.split()
    lines, current = [], ""
    for w in words:
        if len(current) + len(w) + 1 <= max_chars:
            current += (" " + w) if current else w
        else:
            lines.append(current)
            current = w
    if current:
        lines.append(current)
    return lines


# -----------------------------
# GENERATE FIR IMAGE
# -----------------------------
def generate_fir(row):
    claim_id  = row["Claim_ID"]
    user_id   = row["User_ID"]
    vehicle   = row["Vehicle_Model"]
    severity  = row["Damage_Severity"]
    police    = row["Police_Report"]
    inc_date  = row["Incident_Date"]

    driver_name = user_lookup.get(user_id, user_id)
    officer     = random.choice(OFFICER_NAMES)
    station     = random.choice(POLICE_STATIONS)
    location    = random.choice(LOCATIONS)
    plate       = f"{random.choice(PLATE_PREFIXES)}-{random.randint(1000,9999)}"
    fir_num     = f"FIR-{inc_date[:7]}-{random.randint(10,999):03d}"
    time_str    = f"{random.randint(8,22):02d}:{random.choice(['00','15','30','45'])}"
    citation    = random.choice(["Yes", "No"])

    # Narrative
    narr_template = random.choice(DAMAGE_NARRATIVES.get(severity, DAMAGE_NARRATIVES["Minor"]))
    narrative = narr_template.format(vehicle=vehicle, time=time_str, loc=location)

    # Damage parts
    parts = DAMAGE_PARTS.get(severity, [])

    # Canvas
    img  = Image.new("RGB", (800, 1050), color="white")
    draw = ImageDraw.Draw(img)
    y    = 45
    L    = 50   # left margin

    # Header
    sep = "=" * 40
    y = draw_text(draw, sep, L, y, font=FONT_BOLD)
    y = draw_text(draw, "   OFFICIAL POLICE REPORT (FIR)", L, y, font=FONT_BOLD)
    y = draw_text(draw, f"   {station.upper()}", L, y, font=FONT_BOLD)
    y = draw_text(draw, sep, L, y, font=FONT_BOLD)
    y += 12

    y = draw_text(draw, f"FIR NUMBER: {fir_num}", L, y, font=FONT_NORMAL)
    y = draw_text(draw, f"DATE REPORTED: {inc_date}", L, y, font=FONT_NORMAL)
    y += 10

    y = draw_text(draw, f"CLAIM ID: {claim_id}", L, y, font=FONT_NORMAL)
    y = draw_text(draw, f"REPORTING OFFICER: Inspector {officer}", L, y, font=FONT_NORMAL)
    y += 10

    y = draw_text(draw, f"DRIVER INVOLVED: {driver_name} ({user_id})", L, y, font=FONT_NORMAL)
    y = draw_text(draw, f"VEHICLE INVOLVED: {vehicle} ({plate})", L, y, font=FONT_NORMAL)
    y += 10

    y = draw_text(draw, "INCIDENT NARRATIVE:", L, y, font=FONT_BOLD)
    for line in wrap_text(narrative):
        y = draw_text(draw, line, L, y, font=FONT_NORMAL)
    y += 10

    y = draw_text(draw, f"DAMAGE ASSESSMENT: {severity.upper()}", L, y, font=FONT_BOLD)
    for part in parts:
        y = draw_text(draw, f"- {part}", L, y, font=FONT_NORMAL)
    y += 10

    y = draw_text(draw, f"CITATION ISSUED: {citation}", L, y, font=FONT_NORMAL)
    y += 10

    y = draw_text(draw, "OFFICER SIGNATURE:", L, y, font=FONT_BOLD)
    last = officer.split()[-1]
    y = draw_text(draw, f"Insp. {officer[0]}. {last}", L, y, font=FONT_NORMAL)

    path = f"{OUTPUT_DIR}/fir_{claim_id}.png"
    img.save(path)


# -----------------------------
# GENERATE INVOICE IMAGE
# -----------------------------
def generate_invoice(row):
    claim_id  = row["Claim_ID"]
    user_id   = row["User_ID"]
    vehicle   = row["Vehicle_Model"]
    severity  = row["Damage_Severity"]
    amount    = int(row["Claim_Amount"])
    inc_date  = row["Incident_Date"]

    driver_name = user_lookup.get(user_id, user_id)
    garage      = random.choice(GARAGE_NAMES)
    inv_num     = f"INV-{claim_id[-6:]}"
    plate       = f"{random.choice(PLATE_PREFIXES)}-{random.randint(1000,9999)}"

    items   = REPAIR_ITEMS.get(severity, REPAIR_ITEMS["Minor"])
    amounts = [int(amount * pct) for _, pct in items]
    # Fix rounding so total matches
    diff = amount - sum(amounts)
    amounts[-1] += diff

    # Canvas
    img  = Image.new("RGB", (800, 1050), color="white")
    draw = ImageDraw.Draw(img)
    y    = 45
    L    = 50

    sep = "=" * 40
    y = draw_text(draw, sep, L, y, font=FONT_BOLD)
    y = draw_text(draw, f"   {garage.upper()}", L, y, font=FONT_BOLD)
    y = draw_text(draw, "   VEHICLE REPAIR INVOICE", L, y, font=FONT_BOLD)
    y = draw_text(draw, sep, L, y, font=FONT_BOLD)
    y += 12

    y = draw_text(draw, f"INVOICE NUMBER : {inv_num}", L, y, font=FONT_NORMAL)
    y = draw_text(draw, f"INVOICE DATE   : {inc_date}", L, y, font=FONT_NORMAL)
    y += 10

    y = draw_text(draw, f"CLAIM ID       : {claim_id}", L, y, font=FONT_NORMAL)
    y = draw_text(draw, f"CUSTOMER       : {driver_name} ({user_id})", L, y, font=FONT_NORMAL)
    y = draw_text(draw, f"VEHICLE        : {vehicle} ({plate})", L, y, font=FONT_NORMAL)
    y += 10

    y = draw_text(draw, "REPAIR BREAKDOWN:", L, y, font=FONT_BOLD)
    y = draw_text(draw, "-" * 55, L, y, font=FONT_NORMAL)
    for (desc, _), amt in zip(items, amounts):
        line = f"{desc:<42} INR {amt:>8,}"
        y = draw_text(draw, line, L, y, font=FONT_NORMAL)
    y = draw_text(draw, "-" * 55, L, y, font=FONT_NORMAL)
    y = draw_text(draw, f"{'TOTAL CLAIM AMOUNT':<42} INR {amount:>8,}", L, y, font=FONT_BOLD)
    y = draw_text(draw, "=" * 55, L, y, font=FONT_NORMAL)
    y += 10

    y = draw_text(draw, f"DAMAGE SEVERITY  : {severity.upper()}", L, y, font=FONT_NORMAL)
    parts = DAMAGE_PARTS.get(severity, [])
    y = draw_text(draw, "PARTS REPLACED / REPAIRED:", L, y, font=FONT_BOLD)
    for part in parts:
        y = draw_text(draw, f"  - {part}", L, y, font=FONT_NORMAL)
    y += 10

    y = draw_text(draw, "GARAGE CERTIFICATION:", L, y, font=FONT_BOLD)
    y = draw_text(draw, "This invoice is certified by the garage manager.", L, y, font=FONT_NORMAL)
    y = draw_text(draw, f"Authorised Signatory: {garage}", L, y, font=FONT_NORMAL)

    path = f"{OUTPUT_DIR}/invoice_{claim_id}.png"
    img.save(path)


# -----------------------------
# MAIN LOOP
# -----------------------------
count_inv = 0
count_fir = 0

for _, row in df.iterrows():
    generate_invoice(row)
    count_inv += 1
    if str(row["Police_Report"]).strip() == "Yes":
        generate_fir(row)
        count_fir += 1

print(f"Done! Generated {count_inv} invoices and {count_fir} FIR reports in '{OUTPUT_DIR}/'")