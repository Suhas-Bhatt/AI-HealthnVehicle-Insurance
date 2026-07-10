# import json
# import boto3
# import re
# import csv
# import io
# import datetime

# # ── AWS Clients ───────────────────────────────────────────────────────────────
# dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
# bedrock  = boto3.client('bedrock-runtime', region_name='us-east-1')
# s3       = boto3.client('s3')

# # ✅ UPDATED TABLES
# OCR_TABLE_NAME = 'claim-ocr-data-health'
# RESULTS_TABLE  = 'fraud-results-health'
# BUCKET_NAME    = 'ai-insurance-data-suhas'
# MODEL_ID       = 'us.amazon.nova-pro-v1:0'

# ocr_table = dynamodb.Table(OCR_TABLE_NAME)
# results_table = dynamodb.Table(RESULTS_TABLE)

# # ==============================================================================
# # AGENTCORE TOOLS
# # ==============================================================================

# def fetch_user_history(user_id: str) -> dict:
#     try:
#         obj = s3.get_object(Bucket=BUCKET_NAME, Key='health_insurance_claims.csv')
#         content = obj['Body'].read().decode('utf-8')
#         claims = list(csv.DictReader(io.StringIO(content)))

#         user_claims = [c for c in claims if c.get('User_ID', '').strip() == user_id]
#         frauds = [c for c in user_claims if str(c.get('Fraud_Flags')) == "1"]

#         return {
#             "total_past_claims": len(user_claims),
#             "past_fraud_count": len(frauds)
#         }
#     except Exception as e:
#         return {"error": str(e)}


# def fetch_system_averages() -> dict:
#     try:
#         obj = s3.get_object(Bucket=BUCKET_NAME, Key='health_insurance_claims.csv')
#         content = obj['Body'].read().decode('utf-8')
#         claims = list(csv.DictReader(io.StringIO(content)))

#         amounts = [int(c['Claim_Amount']) for c in claims if c.get('Claim_Amount', '').isdigit()]
#         avg = sum(amounts) / len(amounts) if amounts else 30000

#         return {"average_claim": round(avg, 2)}
#     except:
#         return {"average_claim": 30000}


# # ==============================================================================
# # AGENTCORE CONFIG
# # ==============================================================================

# AGENTCORE_CONFIG = {
#     "agent_name": "HealthClaimAgent",
#     "model_id": MODEL_ID,
#     "system_prompt": """You are a Health Insurance Fraud Detection Agent.

# Analyze medical claim data and calculate a Truth Score (0-100).

# Evaluate:
# 1. Claim amount vs medical norms
# 2. Diagnosis vs cost mismatch
# 3. Claim frequency
# 4. Fraud history
# 5. Bill breakdown consistency
# 6. Outlier detection
# 7. Duplicate claims
# 8. User behavior patterns
# 9. Combined risk

# Use tools if needed.

# Return ONLY JSON:
# {
#   "truth_score": 85,
#   "reasoning": "short explanation",
#   "signals": {
#     "AmountCheck": "...",
#     "DiagnosisCheck": "...",
#     "HistoryCheck": "..."
#   }
# }
# """,
#     "tools": [
#         {
#             "name": "fetch_user_history",
#             "description": "Get past claims and fraud count",
#             "input_schema": {
#                 "type": "object",
#                 "properties": {"user_id": {"type": "string"}},
#                 "required": ["user_id"]
#             }
#         },
#         {
#             "name": "fetch_system_averages",
#             "description": "Get average claim amount",
#             "input_schema": {"type": "object", "properties": {}}
#         }
#     ]
# }

# # ==============================================================================
# # LAMBDA HANDLER
# # ==============================================================================

# def lambda_handler(event, context):
#     try:
#         body = event.get("body", {})
#         if isinstance(body, str):
#             body = json.loads(body)

#         claim_id = body.get("claim_id")
#         if not claim_id:
#             return _resp(400, {'message': 'claim_id is required'})

#         # 1. OCR fetch
#         ocr_response = ocr_table.get_item(Key={'claim_id': claim_id})
#         if 'Item' not in ocr_response:
#             return _resp(404, {'message': 'Claim OCR data not found'})

#         ocr_text = ocr_response['Item'].get('ocr_text', '')
#         extracted_data = _extract_initial_data(ocr_text)

#         # 2. AI Agent
#         agent_result = _execute_agentcore_runtime(extracted_data)

#         # 3. Rule Score
#         formula_score, formula_reasoning = calculate_formula_score(extracted_data)
#         ai_score = agent_result.get('truth_score', 50)

#         final_score = int((0.6 * formula_score) + (0.4 * ai_score))

#         verdict = "APPROVE" if final_score >= 75 else "REVIEW" if final_score >= 45 else "FRAUD"

#         result = {
#             'claim_id': claim_id,
#             'user_id': extracted_data['user_id'],
#             'truth_score': final_score,
#             'formula_score': formula_score,
#             'formula_reasoning': formula_reasoning,
#             'ai_score': ai_score,
#             'verdict': verdict,
#             'reasoning': agent_result.get('reasoning', ''),
#             'signals': agent_result.get('signals', {}),
#             'timestamp': str(datetime.datetime.utcnow())
#         }

#         results_table.put_item(Item=result)

#         return _resp(200, result)

#     except Exception as e:
#         print("ERROR:", str(e))
#         return _resp(500, {'error': str(e)})


# # ==============================================================================
# # AGENT EXECUTION
# # ==============================================================================

# def _execute_agentcore_runtime(claim_data):

#     messages = [{"role": "user", "content": [{"text": f"Analyze claim: {json.dumps(claim_data)}"}]}]

#     tool_config = {"tools": [{"toolSpec": {
#         "name": t["name"],
#         "description": t["description"],
#         "inputSchema": {"json": t["input_schema"]}
#     }} for t in AGENTCORE_CONFIG["tools"]]}

#     for _ in range(5):
#         try:
#             response = bedrock.converse(
#                 modelId=MODEL_ID,
#                 system=[{"text": AGENTCORE_CONFIG["system_prompt"]}],
#                 messages=messages,
#                 toolConfig=tool_config
#             )

#             output = response['output']['message']
#             messages.append(output)

#             if response['stopReason'] == 'tool_use':
#                 tool_results = []

#                 for block in output['content']:
#                     if 'toolUse' in block:
#                         tool = block['toolUse']

#                         if tool['name'] == "fetch_user_history":
#                             res = fetch_user_history(tool['input']['user_id'])
#                         else:
#                             res = fetch_system_averages()

#                         tool_results.append({
#                             "toolResult": {
#                                 "toolUseId": tool['toolUseId'],
#                                 "content": [{"json": res}]
#                             }
#                         })

#                 messages.append({"role": "user", "content": tool_results})
#                 continue

#             if response['stopReason'] in ['end_turn', 'stop_sequence']:
#                 text = "".join(b['text'] for b in output['content'] if 'text' in b)
#                 clean_json = text[text.find('{'):text.rfind('}')+1]
#                 return json.loads(clean_json)

#         except Exception as e:
#             return {"truth_score": 50, "reasoning": str(e), "signals": {}}

#     return {"truth_score": 50, "reasoning": "Agent failed", "signals": {}}


# # ==============================================================================
# # OCR EXTRACTION (HEALTH)
# # ==============================================================================

# def _extract_initial_data(text):

#     amount = _extract_amount(text, "INR")

#     user_match = re.search(r'(USR-\d+)', text)
#     user_id = user_match.group(1) if user_match else "UNKNOWN"

#     diagnosis = "General"
#     if "fever" in text.lower(): diagnosis = "Fever"
#     elif "fracture" in text.lower(): diagnosis = "Fracture"
#     elif "diabetes" in text.lower(): diagnosis = "Diabetes"
#     elif "surgery" in text.lower(): diagnosis = "Surgery"

#     return {
#         "claim_amount": amount,
#         "user_id": user_id,
#         "diagnosis": diagnosis,
#         "consultation": _extract_amount(text, "Consultation"),
#         "medicine": _extract_amount(text, "Medicine"),
#         "room": _extract_amount(text, "Room"),
#         "tests": _extract_amount(text, "Lab")
#     }


# def _extract_amount(text, keyword):
#     match = re.search(rf"{keyword}.*?([\d,]+)", text, re.IGNORECASE)
#     return int(match.group(1).replace(',', '')) if match else 0


# # ==============================================================================
# # RULE SCORING (HEALTH)
# # ==============================================================================

# def calculate_formula_score(data):

#     score = 100
#     reasons = []

#     amount = data.get('claim_amount', 0)

#     if amount > 80000:
#         score -= 25
#         reasons.append("Unusually high claim amount")

#     if data.get('diagnosis') == "Fever" and amount > 30000:
#         score -= 30
#         reasons.append("High cost for mild illness")

#     if data.get('medicine', 0) > amount * 0.5:
#         score -= 15
#         reasons.append("Medicine cost too high")

#     known = data.get('consultation', 0) + data.get('medicine', 0) + data.get('room', 0) + data.get('tests', 0)

#     if amount > 0 and (amount - known) > amount * 0.3:
#         score -= 15
#         reasons.append("High unknown charges")

#     if not reasons:
#         reasons.append("All checks normal")

#     return max(0, score), " ".join(reasons)


# # ==============================================================================
# # RESPONSE
# # ==============================================================================

# def _resp(status, body):
#     return {
#         'statusCode': status,
#         'headers': {
#             'Access-Control-Allow-Origin': '*',
#             'Content-Type': 'application/json'
#         },
#         'body': json.dumps(body)
#     }


import json
import boto3
import re
from db_helper import get_db

# ── AWS Clients ─────────────────────────────────────────────
bedrock_agent = boto3.client('bedrock-agent-runtime', region_name='us-east-1')

OCR_TABLE_NAME = 'claim_ocr_data_health'
RESULTS_TABLE  = 'fraud_results_health'

# ✅ YOUR AGENT DETAILS
AGENT_ID = "8VNJH93SCM"
ALIAS_ID = "5Y1EZQX3BU"   # ⚠️ REPLACE WITH YOUR REAL ONE

 
# ==============================================================================

# 🧠 DISEASE RANGE

# ==============================================================================

DISEASE_RANGES = {

    "fever": (2000, 15000),

    "fracture": (20000, 80000),

    "diabetes": (5000, 25000),

    "hypertension": (3000, 20000),

    "surgery": (30000, 120000),

    "infection": (5000, 30000)

}
 
# ==============================================================================

# 🧠 RANGE CHECK

# ==============================================================================

def check_disease_range(diagnosis, amount):

    d = diagnosis.lower()

    for key in DISEASE_RANGES:

        if key in d:

            min_amt, max_amt = DISEASE_RANGES[key]

            if amount < min_amt:

                return "LOW"

            elif amount > max_amt:

                return "HIGH"

            else:

                return "NORMAL"

    return "UNKNOWN"
 
# ==============================================================================

# 🧠 EXTRACTION

# ==============================================================================

def _extract_initial_data(text):
 
    amount = _extract_amount(text, "INR")
 
    user_match = re.search(r'(USR-\d+)', text)

    user_id = user_match.group(1) if user_match else "UNKNOWN"
 
    t = text.lower()
 
    diagnosis = "general"

    if "fever" in t: diagnosis = "fever"

    elif "fracture" in t: diagnosis = "fracture"

    elif "diabetes" in t: diagnosis = "diabetes"

    elif "hypertension" in t: diagnosis = "hypertension"

    elif "surgery" in t: diagnosis = "surgery"

    elif "infection" in t: diagnosis = "infection"
 
    return {

        "claim_amount": amount,

        "user_id": user_id,

        "diagnosis": diagnosis,

        "consultation": _extract_amount(text, "Consultation"),

        "medicine": _extract_amount(text, "Medicine"),

        "room": _extract_amount(text, "Room"),

        "tests": _extract_amount(text, "Lab")

    }
 
def _extract_amount(text, keyword):

    match = re.search(rf"{keyword}.*?([\d,]+)", text, re.IGNORECASE)

    return int(match.group(1).replace(',', '')) if match else 0
 
# ==============================================================================

# 🧠 RULE ENGINE

# ==============================================================================

def calculate_formula_score(data):
 
    score = 100

    reasons = []
 
    amount = data.get('claim_amount', 0)
 
    if amount > 80000:

        score -= 25

        reasons.append("High claim amount")
 
    if data.get('diagnosis') == "fever" and amount > 30000:

        score -= 30

        reasons.append("High cost for fever")
 
    if data.get('medicine', 0) > amount * 0.5:

        score -= 15

        reasons.append("Medicine too high")
 
    known = data.get('consultation', 0) + data.get('medicine', 0) + data.get('room', 0) + data.get('tests', 0)
 
    if amount > 0 and (amount - known) > amount * 0.3:

        score -= 15

        reasons.append("Unknown charges")
 
    if not reasons:

        reasons.append("All normal")
 
    return max(0, score), " ".join(reasons)
 
# ==============================================================================

# 🧠 AGENT CALL (FINAL FIX)

# ==============================================================================

def invoke_agentcore(data):
 
    response = bedrock_agent.invoke_agent(

        agentId=AGENT_ID,

        agentAliasId=ALIAS_ID,

        sessionId="session-1",

        inputText=json.dumps(data)

    )
 
    output = ""
 
    for event in response.get("completion", []):

        if "chunk" in event:

            output += event["chunk"]["bytes"].decode()
 
    print("RAW AGENT OUTPUT:", output)
 
    try:

        clean = output[output.find("{"):output.rfind("}")+1]

        return json.loads(clean)

    except:

        return {

            "truth_score": 60,

            "reasoning": output,

            "signals": {}

        }
 
# ==============================================================================

# 🚀 MAIN HANDLER

# ==============================================================================

def lambda_handler(event, context):
 
    body = event.get("body", {})

    if isinstance(body, str):

        body = json.loads(body)
 
    claim_id = body.get("claim_id")
 
    if not claim_id:

        return _resp(400, {"message": "claim_id required"})
 
    db = get_db()
    item = db.claim_ocr_data_health.find_one({"claim_id": claim_id})
 
    if not item:

        return _resp(404, {"message": "Claim not found"})

    text = item.get("ocr_text", "")
 
    claim_mode = item.get("claim_mode", "reimbursement")

    hospital_name = item.get("hospital_name", "unknown")
 
    data = _extract_initial_data(text)

    data["claim_mode"] = claim_mode
 
    # ── RANGE CHECK

    range_status = check_disease_range(data["diagnosis"], data["claim_amount"])
 
    # ── FRAUD METER

    fraud_meter = 0

    if claim_mode == "reimbursement":

        fraud_meter = 40

        if range_status == "HIGH":

            fraud_meter += 30

        if data["claim_amount"] > 60000:

            fraud_meter += 20

        fraud_meter = min(100, fraud_meter)
 
    # 🔥 AGENT CALL

    agent_result = invoke_agentcore(data)
 
    # ── RULE ENGINE

    formula_score, formula_reasoning = calculate_formula_score(data)

    ai_score = agent_result.get("truth_score", 50)
 
    final_score = int((0.6 * formula_score) + (0.4 * ai_score))
 
    if range_status == "HIGH":

        final_score -= 20

    elif range_status == "LOW":

        final_score -= 10
 
    if claim_mode == "reimbursement":

        final_score -= 10
 
    final_score = max(0, min(100, final_score))
 
    verdict = "APPROVE" if final_score >= 75 else "REVIEW" if final_score >= 45 else "FRAUD"
 
    signals = agent_result.get("signals", {})
 
    # Fix bad signal format

    for k in list(signals.keys()):

        if isinstance(signals[k], str):

            signals[k] = {"score": 50, "title": k, "reason": signals[k]}
 
    signals["MODE"] = {

        "score": 90 if claim_mode == "cashless" else 70,

        "title": "Claim Mode",

        "reason": claim_mode

    }
 
    signals["RANGE_CHECK"] = {

        "score": 95 if range_status == "NORMAL" else 60,

        "title": "Hospital Range Check",

        "reason": f"{range_status} for {data['diagnosis']}"

    }
 
    result = {

        "claim_id": claim_id,

        "truth_score": final_score,

        "formula_score": formula_score,

        "ai_score": ai_score,

        "verdict": verdict,

        "claim_mode": claim_mode,

        "hospital_name": hospital_name,

        "range_status": range_status,

        "fraud_meter": fraud_meter,

        "signals": signals,

        "reasoning": agent_result.get("reasoning", "")

    }
 
    db.fraud_results_health.insert_one(result)
    result.pop('_id', None)
 
    return _resp(200, result)
 
# ==============================================================================

# RESPONSE

# ==============================================================================

def _resp(code, body):

    return {

        "statusCode": code,

        "headers": {

            "Access-Control-Allow-Origin": "*",

            "Content-Type": "application/json"

        },

        "body": json.dumps(body)

    }
 