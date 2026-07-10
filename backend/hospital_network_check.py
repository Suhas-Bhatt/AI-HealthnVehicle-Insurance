# import json
# import boto3
# import difflib

# # AWS
# dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

# OCR_TABLE = 'claim-ocr-data-health'
# HOSPITAL_TABLE = 'hospital-network'

# ocr_table = dynamodb.Table(OCR_TABLE)
# hospital_table = dynamodb.Table(HOSPITAL_TABLE)


# def lambda_handler(event, context):
#     try:
#         # ── Parse input ─────────────────────────────
#         body = event.get("body", {})
#         if isinstance(body, str):
#             body = json.loads(body)

#         claim_id = body.get("claim_id")

#         if not claim_id:
#             return _resp(400, {"message": "claim_id required"})

#         # ── Fetch OCR data ──────────────────────────
#         res = ocr_table.get_item(Key={"claim_id": claim_id})

#         if "Item" not in res:
#             return _resp(404, {"message": "Claim not found"})

#         ocr_text = res["Item"].get("ocr_text", "")
#         lines = ocr_text.split("\n")

#         # ── Extract hospital name ───────────────────
#         hospital_name = "unknown"

#         for line in lines[:5]:
#             if any(x in line.lower() for x in ["hospital", "clinic", "medical"]):
#                 hospital_name = line.strip()
#                 break

#         hospital_name_lower = hospital_name.lower()

#         # ── Get network hospitals ───────────────────
#         response = hospital_table.scan()
#         network_hospitals = [item["hospital_name"] for item in response.get("Items", [])]

#         # ── Fuzzy matching ──────────────────────────
#         claim_mode = "reimbursement"
#         matched_hospital = None

#         for h in network_hospitals:
#             similarity = difflib.SequenceMatcher(None, hospital_name_lower, h).ratio()

#             if similarity > 0.7:
#                 claim_mode = "cashless"
#                 matched_hospital = h
#                 break

#         # ── Update DynamoDB ─────────────────────────
#         ocr_table.update_item(
#             Key={"claim_id": claim_id},
#             UpdateExpression="SET hospital_name = :h, claim_mode = :c",
#             ExpressionAttributeValues={
#                 ":h": hospital_name,
#                 ":c": claim_mode
#             }
#         )

#         # ── Response ────────────────────────────────
#         return _resp(200, {
#             "claim_id": claim_id,
#             "hospital_detected": hospital_name,
#             "matched_network_hospital": matched_hospital,
#             "claim_mode": claim_mode
#         })

#     except Exception as e:
#         return _resp(500, {"error": str(e)})


# def _resp(code, body):
#     return {
#         "statusCode": code,
#         "headers": {
#             "Access-Control-Allow-Origin": "*",
#             "Content-Type": "application/json"
#         },
#         "body": json.dumps(body)
#     }

import json
import boto3
import difflib
 
# ── AWS ─────────────────────────────────────────────
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
 
OCR_TABLE = 'claim-ocr-data-health'
HOSPITAL_TABLE = 'hospital-network'
 
ocr_table = dynamodb.Table(OCR_TABLE)
hospital_table = dynamodb.Table(HOSPITAL_TABLE)
 
 
# ============================================================
# 🧠 HELPER: Extract Hospital Name from OCR
# ============================================================
def extract_hospital_name(ocr_text):
 
    lines = ocr_text.split("\n")
 
    for line in lines[:8]:  # scan first few lines
        l = line.lower()
 
        if any(x in l for x in ["hospital", "clinic", "medical", "healthcare"]):
            return line.strip()
 
    return "unknown"
 
 
# ============================================================
# 🧠 HELPER: Match with Network Hospitals
# ============================================================
def match_hospital(hospital_name, network_hospitals):
 
    hospital_name_lower = hospital_name.lower()
 
    best_match = None
    best_score = 0
 
    for h in network_hospitals:
        score = difflib.SequenceMatcher(None, hospital_name_lower, h.lower()).ratio()
 
        if score > best_score:
            best_score = score
            best_match = h
 
    if best_score > 0.7:
        return best_match, "cashless"
 
    return None, "reimbursement"
 
 
# ============================================================
# 🚀 MAIN HANDLER
# ============================================================
def lambda_handler(event, context):
 
    try:
        # ── Parse input ─────────────────────────────
        body = event.get("body", {})
        if isinstance(body, str):
            body = json.loads(body)
 
        claim_id = body.get("claim_id")
 
        if not claim_id:
            return _resp(400, {"message": "claim_id required"})
 
        # ── Fetch OCR data ──────────────────────────
        res = ocr_table.get_item(Key={"claim_id": claim_id})
 
        if "Item" not in res:
            return _resp(404, {"message": "Claim not found"})
 
        item = res["Item"]
        ocr_text = item.get("ocr_text", "")
 
        # ── Extract hospital name ───────────────────
        hospital_name = extract_hospital_name(ocr_text)
 
        # ── Fetch network hospitals ────────────────
        response = hospital_table.scan()
        network_hospitals = [i["hospital_name"] for i in response.get("Items", [])]
 
        # ── Match hospital ─────────────────────────
        matched_hospital, claim_mode = match_hospital(hospital_name, network_hospitals)
 
        # ── Update DynamoDB ────────────────────────
        ocr_table.update_item(
            Key={"claim_id": claim_id},
            UpdateExpression="SET hospital_name = :h, claim_mode = :c",
            ExpressionAttributeValues={
                ":h": hospital_name,
                ":c": claim_mode
            }
        )
 
        # ── Response ───────────────────────────────
        return _resp(200, {
            "claim_id": claim_id,
            "hospital_detected": hospital_name,
            "matched_network_hospital": matched_hospital,
            "claim_mode": claim_mode
        })
 
    except Exception as e:
        return _resp(500, {"error": str(e)})
 
 
# ============================================================
# RESPONSE HELPER
# ============================================================
def _resp(code, body):
    return {
        "statusCode": code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        },
        "body": json.dumps(body)
    }