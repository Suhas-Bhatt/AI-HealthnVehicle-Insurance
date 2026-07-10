import json
import boto3
import re
import csv
import io
import datetime
import uuid

# ── AWS Clients ───────────────────────────────────────────────────────────────
bedrock  = boto3.client('bedrock-runtime', region_name='us-east-1')
s3       = boto3.client('s3')
from db_helper import get_db

OCR_TABLE_NAME = 'claim_ocr_data_vehicle'
RESULTS_TABLE  = 'fraud_results_vehicle'
BUCKET_NAME    = 'ai-insurance-data-suhas'
MODEL_ID       = 'us.amazon.nova-pro-v1:0'


# ==============================================================================
# AGENTCORE TOOLS (Action Groups)
# ==============================================================================
def fetch_user_history(user_id: str) -> dict:
    try:
        obj     = s3.get_object(Bucket=BUCKET_NAME, Key='vehicle_insurance_claims.csv')
        content = obj['Body'].read().decode('utf-8')
        claims  = list(csv.DictReader(io.StringIO(content)))

        user_claims = [c for c in claims if c.get('User_ID', '').strip() == user_id]
        flags       = [c.get('Fraud_Flags') for c in user_claims if c.get('Fraud_Flags') != 'None']

        return {
            "total_past_claims":      len(user_claims),
            "past_fraud_flags_count": len(flags),
            "flags_details":          flags
        }
    except Exception as e:
        return {"error": str(e)}


def fetch_system_averages() -> dict:
    try:
        obj     = s3.get_object(Bucket=BUCKET_NAME, Key='vehicle_insurance_claims.csv')
        content = obj['Body'].read().decode('utf-8')
        claims  = list(csv.DictReader(io.StringIO(content)))

        amounts = [int(c['Claim_Amount']) for c in claims if c.get('Claim_Amount', '').isdigit()]
        avg     = sum(amounts) / len(amounts) if amounts else 25000
        return {"average_claim_inr": round(avg, 2)}
    except Exception:
        return {"average_claim_inr": 25000}


# ==============================================================================
# AGENTCORE CONFIGURATION HARNESS
# ==============================================================================
AGENTCORE_CONFIG = {
    "agent_name":  "ProcessClaimCoreEngine",
    "description": "Autonomous Fraud Reasoning Agent for Truth Score generation across 9 dimensions.",
    "model_id":    MODEL_ID,
    "system_prompt": """You are the autonomous Fraud Reasoning Agent for an Insurance Portal.
Your job is to analyze claim data and calculate a Truth Score (0-100).
You MUST evaluate the 9 fraud signals exactly as defined in the system architecture:
1. Claim Amount vs Damage
2. Police Report Check
3. Claim Frequency
4. Policy Misuse
5. Damage Consistency
6. User Patterns
7. Outlier Detection
8. Duplicate Claims
9. Combined Risk

Use your Action Group tools to fetch the user's history and system averages from S3.
Return a final JSON output formatted exactly like this:
{
    "truth_score": 85,
    "reasoning": "1 paragraph explanation...",
    "signals": { "AmountVsDamage": "...", "PoliceReport": "...", ... }
}""",
    "tools": [
        {
            "name":        "fetch_user_history",
            "description": "Fetch a user's past claims and past fraud flags from S3 datasets.",
            "input_schema": {
                "type":       "object",
                "properties": {"user_id": {"type": "string"}},
                "required":   ["user_id"]
            }
        },
        {
            "name":        "fetch_system_averages",
            "description": "Get the global average claim amount across all users to detect outliers.",
            "input_schema": {
                "type":       "object",
                "properties": {}
            }
        }
    ]
}


# ==============================================================================
# LAMBDA HANDLER
# ==============================================================================
def lambda_handler(event, context):
    try:
        body = event.get("body", {})
        if isinstance(body, str):
            body = json.loads(body)

        claim_id = body.get("claim_id")
        if not claim_id:
            return _resp(400, {'message': 'claim_id is required'})

        # ── 1. Fetch OCR item from MongoDB ────────────────────────────────────
        db = get_db()
        ocr_item = db.claim_ocr_data_vehicle.find_one({'claim_id': claim_id})
        if not ocr_item:
            return _resp(404, {'message': 'Claim OCR data not found'})

        ocr_text = ocr_item.get('ocr_text', '')

        # ── 2. Pull structured fields stored alongside the OCR text ───────────
        #       These are saved to DynamoDB at upload time from the CSV columns.
        #       Defaults are used safely if a field was never stored.
        structured = {
            'driver_risk_score':       float(ocr_item.get('driver_risk_score',       0.5)),
            'previous_claims_count':   int(ocr_item.get('previous_claims_count',     0)),
            'vehicle_age':             int(ocr_item.get('vehicle_age',               0)),
            'days_since_policy_start': int(ocr_item.get('days_since_policy_start',   999)),
            'policy_tier':             ocr_item.get('policy_tier',                   'Standard'),
            'past_fraud_flags_count':  int(ocr_item.get('past_fraud_flags_count',    0)),
        }

        # ── 3. Extract all claim fields (OCR text + structured fields) ─────────
        extracted_data = _extract_initial_data(ocr_text, structured_fields=structured)

        # ── 4. Run the AI agent branch ─────────────────────────────────────────
        agent_result = _execute_agentcore_runtime(extracted_data)

        # ── 5. Run the physical formula branch ────────────────────────────────
        formula_score, formula_reasoning = calculate_formula_score(extracted_data)

        # ── 6. Blend scores 50 / 50 ───────────────────────────────────────────
        ai_score    = agent_result.get('truth_score', 50)
        final_score = int((0.5 * formula_score) + (0.5 * ai_score))

        verdict = (
            "APPROVE" if final_score >= 75
            else "REVIEW" if final_score >= 45
            else "FRAUD"
        )

        # ── 7. Persist result to MongoDB ──────────────────────────────────────
        results_item = {
            'claim_id':          claim_id,
            'user_id':           extracted_data['user_id'],
            'truth_score':       final_score,
            'formula_score':     formula_score,
            'formula_reasoning': formula_reasoning,
            'ai_score':          ai_score,
            'verdict':           verdict,
            'reasoning':         agent_result.get('reasoning', ''),
            'signals':           agent_result.get('signals', {}),
            'timestamp':         str(datetime.datetime.utcnow())
        }
        db.fraud_results_vehicle.insert_one(results_item)
        results_item.pop('_id', None)

        return _resp(200, results_item)

    except Exception as e:
        print("ERROR:", str(e))
        return _resp(500, {'error': str(e)})


# ==============================================================================
# AGENTCORE RUNTIME SIMULATOR
# ==============================================================================
def _execute_agentcore_runtime(claim_data):
    messages = [{
        "role":    "user",
        "content": [{"text": f"Analyze this claim using tools and generate Truth Score JSON. Data: {json.dumps(claim_data)}"}]
    }]

    tool_config = {
        "tools": [
            {
                "toolSpec": {
                    "name":        t["name"],
                    "description": t["description"],
                    "inputSchema": {"json": t["input_schema"]}
                }
            }
            for t in AGENTCORE_CONFIG["tools"]
        ]
    }

    for i in range(5):
        try:
            response = bedrock.converse(
                modelId=AGENTCORE_CONFIG["model_id"],
                system=[{"text": AGENTCORE_CONFIG["system_prompt"]}],
                messages=messages,
                toolConfig=tool_config
            )

            output_message = response['output']['message']
            messages.append(output_message)

            if response['stopReason'] == 'tool_use':
                tool_results = []
                for block in output_message['content']:
                    if 'toolUse' in block:
                        tool_use = block['toolUse']

                        if tool_use['name'] == "fetch_user_history":
                            res = fetch_user_history(tool_use['input']['user_id'])
                        elif tool_use['name'] == "fetch_system_averages":
                            res = fetch_system_averages()
                        else:
                            res = {"error": "Tool not found"}

                        tool_results.append({
                            "toolResult": {
                                "toolUseId": tool_use['toolUseId'],
                                "content":   [{"json": res}]
                            }
                        })

                messages.append({"role": "user", "content": tool_results})
                continue

            if response['stopReason'] in ['end_turn', 'stop_sequence']:
                final_text = "".join(
                    b['text'] for b in output_message['content'] if 'text' in b
                )
                clean_json = final_text[final_text.find('{'):final_text.rfind('}') + 1]
                return json.loads(clean_json)

        except Exception as e:
            print("AgentCore Runtime Error:", str(e))
            return {"truth_score": 50, "reasoning": f"AI Simulator Error: {str(e)}", "signals": {}}

    return {"truth_score": 50, "reasoning": "Agent evaluation failed.", "signals": {}}


# ==============================================================================
# EXTRACT INITIAL DATA  (OCR text + structured DynamoDB fields)
# ==============================================================================
def _extract_initial_data(text, structured_fields=None):
    """
    Extracts claim fields from raw OCR text, then overlays any
    structured fields stored in DynamoDB alongside the OCR text.

    structured_fields keys expected:
        driver_risk_score, previous_claims_count, vehicle_age,
        days_since_policy_start, policy_tier, past_fraud_flags_count
    """
    # ── Amount: supports INR, Rs., ₹ prefixes ─────────────────────────────────
    amount_match = re.search(r'(?:INR|Rs\.?|₹)\s*([\d,]+)', text, re.IGNORECASE)
    claim_amount = int(amount_match.group(1).replace(',', '')) if amount_match else 0

    # ── User ID ───────────────────────────────────────────────────────────────
    user_match = re.search(r'(USR-\d{5})', text)
    user_id    = user_match.group(1) if user_match else "UNKNOWN"

    # ── Damage severity — check highest severity first to avoid false Minor ───
    damage = "Minor"
    for sev in ["Totaled", "Severe", "Moderate"]:
        if sev.lower() in text.lower():
            damage = sev
            break

    # ── Police report — catches FIR format too ────────────────────────────────
    police = "Yes" if any(kw in text for kw in [
        "Police Report Provided: Yes",
        "OFFICIAL POLICE REPORT",
        "FIR No."
    ]) else "No"

    # ── Vehicle ───────────────────────────────────────────────────────────────
    vehicle_match = re.search(r'VEHICLE\s*:\s*(.*?)\s*\n', text)
    vehicle       = vehicle_match.group(1).strip() if vehicle_match else "Unknown"

    data = {
        "claim_amount":            claim_amount,
        "damage_severity":         damage,
        "police_report":           police,
        "user_id":                 user_id,
        "vehicle":                 vehicle,
        # Structured field defaults (overridden below if real values exist)
        "driver_risk_score":       0.5,
        "previous_claims_count":   0,
        "vehicle_age":             0,
        "days_since_policy_start": 999,
        "policy_tier":             "Standard",
        "past_fraud_flags_count":  0,
    }

    # ── Overlay real structured values from DynamoDB ──────────────────────────
    if structured_fields:
        data.update(structured_fields)

    return data


# ==============================================================================
# PHYSICAL FORMULA SCORE  —  8 signals, data-backed thresholds
# ==============================================================================
def calculate_formula_score(data):
    """
    Starts at 100. Deducts points per fraud signal.
    All thresholds are derived from vehicle_insurance_claims.csv statistics:
      - Global avg claim: ~₹46,237  |  Std dev: ~₹20,640
      - Minor avg: ~₹46,020  (so >₹25k is already suspicious for Minor)
      - Moderate avg: ~₹48,000
      - Fraud flagged rows have higher Driver_Risk_Score and Previous_Claims_Count
    """
    score   = 100
    reasons = []

    amount   = data.get('claim_amount', 0)
    severity = data.get('damage_severity', '')
    police   = data.get('police_report', 'No')
    risk     = data.get('driver_risk_score', 0.5)
    prev     = data.get('previous_claims_count', 0)
    days     = data.get('days_since_policy_start', 999)
    age      = data.get('vehicle_age', 0)
    tier     = data.get('policy_tier', 'Standard')
    flags    = data.get('past_fraud_flags_count', 0)

    # ── SIGNAL 1: Claim Amount vs Damage Severity ─────────────────────────────
    # Minor realistic max: ₹25k (scratches, dents)
    # Moderate realistic max: ₹55k (panel, airbags)
    if severity == 'Minor':
        if amount > 40000:
            score -= 35
            reasons.append(f"SEVERE mismatch: Minor damage with ₹{amount:,} claim (-35)")
        elif amount > 25000:
            score -= 20
            reasons.append(f"Mismatch: Minor damage with ₹{amount:,} exceeds ₹25k threshold (-20)")
    elif severity == 'Moderate':
        if amount > 55000:
            score -= 15
            reasons.append(f"Mismatch: Moderate damage with ₹{amount:,} exceeds ₹55k threshold (-15)")

    # ── SIGNAL 2: Missing Police Report ──────────────────────────────────────
    if police == 'No':
        if severity == 'Severe':
            score -= 25
            reasons.append("No police report for Severe damage (-25)")
        elif amount > 20000:
            score -= 15
            reasons.append(f"No police report for ₹{amount:,} claim (-15)")

    # ── SIGNAL 3: Driver Risk Score ───────────────────────────────────────────
    # CSV: 15 users >0.75, mean=0.50
    if risk > 0.85:
        score -= 20
        reasons.append(f"Very high driver risk score: {risk} (-20)")
    elif risk > 0.70:
        score -= 10
        reasons.append(f"High driver risk score: {risk} (-10)")
    elif risk < 0.20:
        score += 5   # clean driver bonus
        reasons.append(f"Low driver risk score: {risk} (+5 bonus)")

    # ── SIGNAL 4: Claim Frequency ─────────────────────────────────────────────
    # CSV: 21 users have >=4 claims, 8 users at max of 5
    if prev >= 5:
        score -= 25
        reasons.append(f"Maximum claim frequency: {prev} past claims (-25)")
    elif prev >= 4:
        score -= 15
        reasons.append(f"High claim frequency: {prev} past claims (-15)")

    # ── SIGNAL 5: Early Policy Claim (Honeymoon Fraud) ────────────────────────
    # CSV: 7 of 55 claims filed within 90 days of policy start
    if 0 < days < 90:
        score -= 20
        reasons.append(f"Claim filed {days} days after policy start — honeymoon fraud signal (-20)")

    # ── SIGNAL 6: Old Vehicle + High Claim (Total Loss Inflation) ────────────
    # CSV: 4 cases with vehicle_age > 8 AND claim > ₹50k
    if age > 8 and amount > 50000:
        score -= 15
        reasons.append(f"Old vehicle ({age} yrs) with high claim ₹{amount:,} (-15)")

    # ── SIGNAL 7: Policy Tier Breach ─────────────────────────────────────────
    # Basic ≤ ₹40k · Standard ≤ ₹60k · Premium ≤ ₹80k
    tier_limits = {'Basic': 40000, 'Standard': 60000, 'Premium': 80000}
    limit = tier_limits.get(tier, 60000)
    if amount > limit:
        score -= 10
        reasons.append(f"Claim ₹{amount:,} exceeds {tier} tier limit ₹{limit:,} (-10)")

    # ── SIGNAL 8: Past Fraud History ─────────────────────────────────────────
    # Sourced from fetch_user_history tool result stored at upload time
    if flags >= 2:
        score -= 20
        reasons.append(f"{flags} past fraud flags on record (-20)")
    elif flags == 1:
        score -= 10
        reasons.append(f"1 past fraud flag on record (-10)")

    if not reasons:
        reasons.append("All 8 fraud signals passed. No penalties triggered.")

    return max(0, min(100, score)), " | ".join(reasons)


# ==============================================================================
# UTILS
# ==============================================================================
def _resp(status, body):
    return {
        'statusCode': status,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type':                'application/json'
        },
        'body': json.dumps(body)
    }