# import json
# import boto3
# import uuid
# import datetime
# import csv
# import io
# import re
# import os

# # ──────────────────────────────────────────────────────────────────
# #  AWS service clients
# # ──────────────────────────────────────────────────────────────────
# bedrock  = boto3.client('bedrock-runtime', region_name='us-east-1')
# dynamodb = boto3.resource('dynamodb',       region_name='us-east-1')
# s3       = boto3.client('s3')

# # ──────────────────────────────────────────────────────────────────
# #  Config — reads Lambda env vars, sensible defaults as fallback
# # ──────────────────────────────────────────────────────────────────
# BUCKET_NAME = os.environ.get('BUCKET_NAME', 'ai-insurance-data-suhas')
# TABLE_NAME  = os.environ.get('TABLE_NAME',  'Chatbot_history')
# MODEL_ID    = os.environ.get('MODEL_ID',    'us.amazon.nova-pro-v1:0')

# table = dynamodb.Table(TABLE_NAME)

# # ──────────────────────────────────────────────────────────────────
# #  S3 file names (exactly as stored in your bucket)
# # ──────────────────────────────────────────────────────────────────
# FILE_USERS   = 'users_master.csv'
# FILE_HISTORY = 'claims_history.csv'
# FILE_VEHICLE = 'vehicle_insurance_claims.csv'
# FILE_HEALTH  = 'health_insurance_claims.csv'

# # ──────────────────────────────────────────────────────────────────
# #  Regex — detects IDs anywhere inside the user's message
# #  USR-10000  /  usr-10000  (case-insensitive)
# #  CLM-B106D8CF  /  clm-b106d8cf
# # ──────────────────────────────────────────────────────────────────
# RE_USER  = re.compile(r'\bUSR-[A-Z0-9]+\b', re.IGNORECASE)
# RE_CLAIM = re.compile(r'\bCLM-[A-Z0-9]+\b', re.IGNORECASE)

# # ──────────────────────────────────────────────────────────────────
# #  Nova Pro system prompt — its personality + strict rules
# # ──────────────────────────────────────────────────────────────────
# SYSTEM_PROMPT = """
# You are a professional AI Insurance Assistant for an Indian insurance portal.
# You help users with Health Insurance and Vehicle Insurance queries.

# STRICT RULES:
# 1. When a [DATABASE RESULT] block is present in the user message, answer ONLY
#    using that data. Do NOT invent figures, dates, or claim statuses.
# 2. FORMAT YOUR RESPONSES EXACTLY LIKE THIS:
#    - Start with a clear 3-4 line introductory paragraph summarizing the situation or answer.
#    - Follow up with 5-10 concise bullet points detailing specific data fields, history, or steps.
#    - Always make the final answer look highly structured, clean, and easy to read.
#    - Show all money as INR X,XX,XXX format.
#    - Translate raw column names to plain English:
#        Claim_Amount        → Claim Amount
#        Fraud_Flags         → Fraud Alert
#        Driver_Risk_Score   → Driver Risk Score (higher = riskier)
#        Disease_Type        → Condition Type
#        Treatment_Duration_Days → Treatment Duration
# 4. CONTEXT & MEMORY: You have access to the history of the current conversation session. If the user refers to something they said earlier, use the provided history to answer. Never claim you don't store history for the current session, as you are designed to be a contextual assistant.
# 5. If the [DATABASE RESULT] says NOT FOUND, politely tell the user the ID
#    doesn't exist and ask them to check it or contact customer support.
# 6. When no ID is given, answer general insurance questions from your knowledge following the same paragraph-then-bullets format.
# 7. Always be warm, concise, and professional. Never dump raw JSON at the user.
# """


# # ══════════════════════════════════════════════════════════════════
# #  LAMBDA HANDLER  —  this is what AWS calls on every API request
# # ══════════════════════════════════════════════════════════════════
# def lambda_handler(event, context):
#     try:
#         # ── 1. Parse the incoming API request ─────────────────────────────────
#         body         = json.loads(event.get('body', '{}'))
#         user_message = body.get('message', '').strip()
#         session_id   = body.get('session_id') or str(uuid.uuid4())

#         if not user_message:
#             return _resp(400, {'error': 'Please send a message in the "message" field.'})

#         # ── 2. Load this session's past conversation from DynamoDB ─────────────
#         history = _load_history(session_id)

#         # ── 3. Scan the message for a User_ID or Claim_ID ─────────────────────
#         user_match  = RE_USER.search(user_message)
#         claim_match = RE_CLAIM.search(user_message)

#         # ── 4. Choose path and build the message that goes to Nova Pro ────────

#         if user_match:
#             user_id        = user_match.group().upper()
#             db_data        = _get_full_user_data(user_id)
#             prompt_message = _make_prompt(user_message, db_data, 'User ID', user_id)

#         elif claim_match:
#             claim_id       = claim_match.group().upper()
#             db_data        = _get_claim_data(claim_id)
#             prompt_message = _make_prompt(user_message, db_data, 'Claim ID', claim_id)

#         else:
#             prompt_message = user_message

#         # ── 5. Append the user turn and call Nova Pro ─────────────────────────
#         history.append({
#             'role':    'user',
#             'content': [{'text': prompt_message}]
#         })

#         response = bedrock.converse(
#             modelId=MODEL_ID,
#             messages=history,
#             system=[{'text': SYSTEM_PROMPT}]
#         )

#         ai_reply = response['output']['message']['content'][0]['text']

#         # ── 6. Append Nova Pro's reply to history ─────────────────────────────
#         history.append({
#             'role':    'assistant',
#             'content': [{'text': ai_reply}]
#         })

#         # ── 7. Save the updated conversation back to DynamoDB ─────────────────
#         _save_history(session_id, history)

#         # ── 8. Return the reply to the frontend ───────────────────────────────
#         return _resp(200, {
#             'reply':      ai_reply,
#             'session_id': session_id
#         })

#     except Exception as e:
#         print(f'[FATAL] lambda_handler: {e}')
#         return _resp(500, {'error': f'Server error: {str(e)}'})


# # ══════════════════════════════════════════════════════════════════
# #  PATH A  —  Full user data from all 4 CSV files
# # ══════════════════════════════════════════════════════════════════
# def _get_full_user_data(user_id: str) -> dict:
#     result = {}
    
#     # ── users_master.csv ──────────────────────────────────────────────────────
#     try:
#         users    = _read_csv(FILE_USERS)
#         user_row = next((u for u in users if _norm(u.get('User_ID')) == user_id), None)

#         if not user_row:
#             return {'not_found': True, 'searched_id': user_id}

#         profile = {
#             'Name':        user_row.get('Name', 'N/A').strip(),
#             'Email':       user_row.get('Email', 'N/A').strip(),
#             'Age':         user_row.get('Age', 'N/A').strip(),
#             'Gender':      user_row.get('Gender', 'N/A').strip(),
#             'Policy Tier': user_row.get('Policy_Tier', 'N/A').strip(),
#             'User ID':     user_id
#         }
#         result['User Profile'] = profile
#     except Exception as e:
#         return {'error': f'Could not read user profile: {e}', 'searched_id': user_id}

#     # ── claims_history.csv ────────────────────────────────────────────────────
#     try:
#         all_claims  = _read_csv(FILE_HISTORY)
#         user_claims = [c for c in all_claims if _norm(c.get('User_ID')) == user_id]

#         if user_claims:
#             approved  = [c for c in user_claims if c.get('Status', '').strip() == 'Approved']
#             flagged_s = [c for c in user_claims if c.get('Status', '').strip() == 'Flagged']
#             rejected  = [c for c in user_claims if c.get('Status', '').strip() == 'Rejected']
#             pending   = [c for c in user_claims if c.get('Status', '').strip() == 'Pending']

#             total_refund = sum(_to_int(c.get('Claim_Amount', 0)) for c in approved)

#             result['Claims Summary'] = {
#                 'Total Claims':            len(user_claims),
#                 'Approved':                len(approved),
#                 'Flagged (Under Review)':  len(flagged_s),
#                 'Rejected':                len(rejected),
#                 'Pending':                 len(pending),
#                 'Total Approved Refund':   f'INR {total_refund:,}',
#             }

#             result['All Claims'] = [
#                 {
#                     'Claim ID':       c.get('Claim_ID', '').strip(),
#                     'Insurance Type': c.get('Insurance_Type', '').strip(),
#                     'Claim Amount':   f"INR {_to_int(c.get('Claim_Amount', 0)):,}",
#                     'Status':         c.get('Status', '').strip(),
#                     'Fraud Alert':    c.get('Fraud_Flags', 'None').strip()
#                 }
#                 for c in user_claims
#             ]
#         else:
#             result['Claims Summary'] = 'No claims found for this user.'

#     except Exception as e:
#         result['Claims Error'] = f'Could not read claims history: {e}'

#     # ── vehicle_insurance_claims.csv ──────────────────────────────────────────
#     try:
#         vehicle_rows  = _read_csv(FILE_VEHICLE)
#         user_vehicles = [v for v in vehicle_rows if _norm(v.get('User_ID')) == user_id]

#         if user_vehicles:
#             result['Vehicle Claims'] = [
#                 {
#                     'Claim ID':              v.get('Claim_ID', '').strip(),
#                     'Vehicle Model':         v.get('Vehicle_Model', '').strip(),
#                     'Car Purchase Year':     v.get('Car_Purchase_Year', '').strip(),
#                     'Vehicle Age (years)':   v.get('Vehicle_Age', '').strip(),
#                     'Policy Start Date':     v.get('Policy_Start_Date', '').strip(),
#                     'Incident Date':         v.get('Incident_Date', '').strip(),
#                     'Police Report Filed':   v.get('Police_Report', '').strip(),
#                     'Damage Severity':       v.get('Damage_Severity', '').strip(),
#                     'Previous Claims Count': v.get('Previous_Claims_Count', '').strip(),
#                     'Driver Risk Score':     v.get('Driver_Risk_Score', '').strip(),
#                     'Claim Amount':          f"INR {_to_int(v.get('Claim_Amount', 0)):,}",
#                     'Fraud Alert':           v.get('Fraud_Flags', 'None').strip()
#                 }
#                 for v in user_vehicles
#             ]
#         else:
#             result['Vehicle Claims'] = 'No vehicle insurance claims found for this user.'

#     except FileNotFoundError:
#         result['Vehicle Claims'] = f'{FILE_VEHICLE} not found in S3 bucket.'
#     except Exception as e:
#         result['Vehicle Claims Error'] = str(e)

#     # ── health_insurance_claims.csv ───────────────────────────────────────────
#     try:
#         health_rows  = _read_csv(FILE_HEALTH)
#         user_health  = [h for h in health_rows if _norm(h.get('User_ID')) == user_id]

#         if user_health:
#             result['Health Claims'] = [
#                 {
#                     'Claim ID':           h.get('Claim_ID', '').strip(),
#                     'Hospital':           h.get('Hospital', '').strip(),
#                     'Disease':            h.get('Disease', '').strip(),
#                     'Condition Type':     h.get('Disease_Type', '').strip(),
#                     'Treatment Duration': f"{h.get('Treatment_Duration_Days', '').strip()} days",
#                     'Expected Cost':      f"INR {_to_int(h.get('Expected_Cost', 0)):,}",
#                     'Claim Amount':       f"INR {_to_int(h.get('Claim_Amount', 0)):,}",
#                     'Fraud Alert':        h.get('Fraud_Flags', 'None').strip()
#                 }
#                 for h in user_health
#             ]
#         else:
#             result['Health Claims'] = 'No health insurance claims found for this user.'

#     except FileNotFoundError:
#         result['Health Claims'] = f'{FILE_HEALTH} not found in S3 bucket.'
#     except Exception as e:
#         result['Health Claims Error'] = str(e)

#     return result


# # ══════════════════════════════════════════════════════════════════
# #  PATH B  —  Specific claim lookup by CLM-XXXXXXXX
# # ══════════════════════════════════════════════════════════════════
# def _get_claim_data(claim_id: str) -> dict:
#     result = {}

#     # ── claims_history.csv ────────────────────────────────────────────────────
#     try:
#         all_claims = _read_csv(FILE_HISTORY)
#         match = next((c for c in all_claims if _norm(c.get('Claim_ID')) == claim_id), None)
#         if match:
#             result['Claim Overview'] = {
#                 'Claim ID':       match.get('Claim_ID', '').strip(),
#                 'User ID':        match.get('User_ID', '').strip(),
#                 'Insurance Type': match.get('Insurance_Type', '').strip(),
#                 'Claim Amount':   f"INR {_to_int(match.get('Claim_Amount', 0)):,}",
#                 'Status':         match.get('Status', '').strip(),
#                 'Fraud Alert':    match.get('Fraud_Flags', 'None').strip()
#             }
#     except Exception as e:
#         result['Overview Error'] = str(e)

#     # ── vehicle_insurance_claims.csv ──────────────────────────────────────────
#     try:
#         vehicle_rows = _read_csv(FILE_VEHICLE)
#         match = next((v for v in vehicle_rows if _norm(v.get('Claim_ID')) == claim_id), None)
#         if match:
#             result['Vehicle Details'] = {
#                 'Vehicle Model':         match.get('Vehicle_Model', '').strip(),
#                 'Car Purchase Year':     match.get('Car_Purchase_Year', '').strip(),
#                 'Vehicle Age (years)':   match.get('Vehicle_Age', '').strip(),
#                 'Policy Start Date':     match.get('Policy_Start_Date', '').strip(),
#                 'Incident Date':         match.get('Incident_Date', '').strip(),
#                 'Police Report Filed':   match.get('Police_Report', '').strip(),
#                 'Damage Severity':       match.get('Damage_Severity', '').strip(),
#                 'Previous Claims Count': match.get('Previous_Claims_Count', '').strip(),
#                 'Driver Risk Score':     match.get('Driver_Risk_Score', '').strip(),
#                 'Claim Amount':          f"INR {_to_int(match.get('Claim_Amount', 0)):,}",
#                 'Fraud Alert':           match.get('Fraud_Flags', 'None').strip()
#             }
#     except FileNotFoundError:
#         pass   
#     except Exception as e:
#         result['Vehicle Error'] = str(e)

#     # ── health_insurance_claims.csv ───────────────────────────────────────────
#     try:
#         health_rows = _read_csv(FILE_HEALTH)
#         match = next((h for h in health_rows if _norm(h.get('Claim_ID')) == claim_id), None)
#         if match:
#             result['Health Details'] = {
#                 'Hospital':           match.get('Hospital', '').strip(),
#                 'Disease':            match.get('Disease', '').strip(),
#                 'Condition Type':     match.get('Disease_Type', '').strip(),
#                 'Treatment Duration': f"{match.get('Treatment_Duration_Days', '').strip()} days",
#                 'Expected Cost':      f"INR {_to_int(match.get('Expected_Cost', 0)):,}",
#                 'Claim Amount':       f"INR {_to_int(match.get('Claim_Amount', 0)):,}",
#                 'Fraud Alert':        match.get('Fraud_Flags', 'None').strip()
#             }
#     except FileNotFoundError:
#         pass   
#     except Exception as e:
#         result['Health Error'] = str(e)

#     if not result:
#         return {'not_found': True, 'searched_id': claim_id}

#     return result


# # ══════════════════════════════════════════════════════════════════
# #  PROMPT BUILDER  
# # ══════════════════════════════════════════════════════════════════
# def _make_prompt(original_message: str, db_data: dict, id_type: str, id_value: str) -> str:
#     if db_data.get('not_found'):
#         data_block = (
#             f"[DATABASE RESULT]\n"
#             f"The {id_type} '{id_value}' was NOT FOUND in any CSV file in the system.\n"
#             f"Tell the user politely: their ID does not exist in our database. "
#             f"Ask them to verify it or contact customer support."
#         )
#     else:
#         data_block = (
#             f"[DATABASE RESULT — {id_type}: {id_value}]\n"
#             f"{json.dumps(db_data, indent=2, default=str)}\n\n"
#             f"Using only the above real data, answer the user's question clearly."
#         )

#     return f"User question: {original_message}\n\n{data_block}"


# from boto3.dynamodb.conditions import Key

# # ══════════════════════════════════════════════════════════════════
# #  DYNAMODB  (Choice B: Multiple Rows with Sort Key)
# # ══════════════════════════════════════════════════════════════════
# def _load_history(session_id: str) -> list:
#     """
#     Fetches history by querying all rows for this session_id,
#     sorted by the 'timestamp' Sort Key.
#     """
#     try:
#         resp = table.query(
#             KeyConditionExpression=Key('session_id').eq(session_id),
#             ScanIndexForward=True  # Ensures chronological order (oldest first)
#         )
        
#         history = []
#         for item in resp.get('Items', []):
#             user_msg = item.get('latest_user_query')
#             ai_msg   = item.get('latest_ai_response')
            
#             if user_msg and user_msg != "N/A":
#                 history.append({'role': 'user', 'content': [{'text': user_msg}]})
#             if ai_msg and ai_msg != "N/A":
#                 history.append({'role': 'assistant', 'content': [{'text': ai_msg}]})
        
#         return history
#     except Exception as e:
#         print(f'[WARN] DynamoDB load failed ({session_id}): {e}')
#     return []

# def _save_history(session_id: str, history: list):
#     """
#     Saves the LATEST exchange as a brand new row.
#     Requires table to have Partition Key: session_id, Sort Key: timestamp.
#     Timestamps are converted to IST (UTC + 5:30).
#     """
#     try:
#         # IST is UTC + 5:30
#         now_utc = datetime.datetime.utcnow()
#         now_ist = now_utc + datetime.timedelta(hours=5, minutes=30)
        
#         timestamp = now_ist.strftime('%Y-%m-%d %H:%M:%S')
#         ttl = int((now_utc + datetime.timedelta(days=30)).timestamp())
        
#         # We only save the newest turn in this new row
#         latest_user = "N/A"
#         latest_ai   = "N/A"
#         if len(history) >= 2:
#             latest_user = history[-2]['content'][0]['text']
#             latest_ai   = history[-1]['content'][0]['text']

#         table.put_item(Item={
#             'session_id':           session_id,    # Partition Key
#             'timestamp':            timestamp,     # Sort Key (IST)
#             'latest_user_query':    latest_user[:2000],
#             'latest_ai_response':   latest_ai[:2000],
#             'last_updated':         timestamp,     # (IST)
#             'ttl':                  ttl
#         })
#     except Exception as e:
#         print(f'[WARN] DynamoDB save failed ({session_id}): {e}')


# # ══════════════════════════════════════════════════════════════════
# #  UTILITY HELPERS
# # ══════════════════════════════════════════════════════════════════
# def _read_csv(filename: str) -> list:
#     try:
#         obj     = s3.get_object(Bucket=BUCKET_NAME, Key=filename)
#         content = obj['Body'].read().decode('utf-8-sig')
#         return list(csv.DictReader(io.StringIO(content)))
#     except s3.exceptions.NoSuchKey:
#         raise FileNotFoundError(f'"{filename}" not found in bucket "{BUCKET_NAME}"')
#     except Exception as e:
#         raise RuntimeError(f'S3 read failed for "{filename}": {e}')

# def _norm(value) -> str:
#     return str(value).strip().upper() if value else ''

# def _to_int(value) -> int:
#     try:
#         return int(str(value).replace(',', '').strip())
#     except (ValueError, TypeError):
#         return 0

# def _resp(status_code: int, body: dict) -> dict:
#     return {
#         'statusCode': status_code,
#         'headers': {
#             'Access-Control-Allow-Origin':  '*',
#             'Access-Control-Allow-Headers': 'Content-Type',
#             'Access-Control-Allow-Methods': 'POST, OPTIONS',
#             'Content-Type':                 'application/json'
#         },
#         'body': json.dumps(body, default=str)
#     }


import json
import boto3
import uuid
import datetime
import csv
import io
import re
import os

# ──────────────────────────────────────────────────────────────────
#  AWS service clients
# ──────────────────────────────────────────────────────────────────
bedrock  = boto3.client('bedrock-runtime', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb',       region_name='us-east-1')
s3       = boto3.client('s3')

# ──────────────────────────────────────────────────────────────────
#  Config
# ──────────────────────────────────────────────────────────────────
BUCKET_NAME      = os.environ.get('BUCKET_NAME',      'ai-insurance-data-suhas')
TABLE_NAME       = os.environ.get('TABLE_NAME',        'Chatbot_history')
MODEL_ID         = os.environ.get('MODEL_ID',          'us.amazon.nova-pro-v1:0')
MERGED_FILE_NAME = os.environ.get('MERGED_FILE_NAME',  'merged.csv')

from db_helper import get_db

# ──────────────────────────────────────────────────────────────────
#  S3 file names
# ──────────────────────────────────────────────────────────────────
FILE_USERS   = 'users_master.csv'
FILE_HISTORY = 'claims_history.csv'
FILE_VEHICLE = 'vehicle_insurance_claims.csv'
FILE_HEALTH  = 'health_insurance_claims.csv'

RE_USER  = re.compile(r'\bUSR-[A-Z0-9]+\b', re.IGNORECASE)
RE_CLAIM = re.compile(r'\bCLM-[A-Z0-9]+\b', re.IGNORECASE)

SYSTEM_PROMPT = """
You are a professional AI Insurance Assistant for an Indian insurance portal.
You help users with Health Insurance and Vehicle Insurance queries.

STRICT RULES:
1. When a [DATABASE RESULT] block is present in the user message, answer ONLY
   using that data. Do NOT invent figures, dates, or claim statuses.
2. FORMAT YOUR RESPONSES EXACTLY LIKE THIS:
   - Start with a clear 3-4 line introductory paragraph summarizing the situation or answer.
   - Follow up with 5-10 concise bullet points detailing specific data fields, history, or steps.
   - Always make the final answer look highly structured, clean, and easy to read.
   - Show all money as INR X,XX,XXX format.
   - Translate raw column names to plain English:
       Claim_Amount        → Claim Amount
       Fraud_Flags         → Fraud Alert
       Driver_Risk_Score   → Driver Risk Score (higher = riskier)
       Disease_Type        → Condition Type
       Treatment_Duration_Days → Treatment Duration
4. CONTEXT & MEMORY: You have access to the history of the current conversation session. If the user refers to something they said earlier, use the provided history to answer. Never claim you don't store history for the current session.
5. If the [DATABASE RESULT] says NOT FOUND, politely tell the user the ID doesn't exist and ask them to check it or contact customer support.
6. When no ID is given, answer general insurance questions from your knowledge following the same paragraph-then-bullets format.
7. Always be warm, concise, and professional. Never dump raw JSON at the user.
"""


# ══════════════════════════════════════════════════════════════════
#  LAMBDA HANDLER
# ══════════════════════════════════════════════════════════════════
def lambda_handler(event, context):
    try:
        body         = json.loads(event.get('body', '{}'))
        user_message = body.get('message', '').strip()
        session_id   = body.get('session_id') or str(uuid.uuid4())

        if not user_message:
            return _resp(400, {'error': 'Please send a message in the "message" field.'})

        history = _load_history(session_id)

        user_match  = RE_USER.search(user_message)
        claim_match = RE_CLAIM.search(user_message)

        if user_match:
            user_id        = user_match.group().upper()
            db_data        = _get_full_user_data(user_id)
            prompt_message = _make_prompt(user_message, db_data, 'User ID', user_id)

        elif claim_match:
            claim_id       = claim_match.group().upper()
            db_data        = _get_claim_data(claim_id)
            prompt_message = _make_prompt(user_message, db_data, 'Claim ID', claim_id)

        else:
            prompt_message = user_message

        history.append({'role': 'user', 'content': [{'text': prompt_message}]})

        response = bedrock.converse(
            modelId=MODEL_ID,
            messages=history,
            system=[{'text': SYSTEM_PROMPT}]
        )

        ai_reply = response['output']['message']['content'][0]['text']
        history.append({'role': 'assistant', 'content': [{'text': ai_reply}]})

        _save_history(session_id, history)

        return _resp(200, {'reply': ai_reply, 'session_id': session_id})

    except Exception as e:
        print(f'[FATAL] lambda_handler: {e}')
        return _resp(500, {'error': f'Server error: {str(e)}'})


# ══════════════════════════════════════════════════════════════════
#  MERGED CSV  —  Check if it exists in S3
# ══════════════════════════════════════════════════════════════════
def _merged_csv_exists() -> bool:
    """Returns True if merged.csv already exists in S3."""
    try:
        s3.head_object(Bucket=BUCKET_NAME, Key=MERGED_FILE_NAME)
        return True
    except s3.exceptions.ClientError:
        return False


# ══════════════════════════════════════════════════════════════════
#  MERGED CSV  —  Build from all 4 source CSVs and upload once
# ══════════════════════════════════════════════════════════════════
def _build_and_upload_merged_csv():
    """
    Reads all rows from all 4 source CSVs, tags each row with _source,
    unions all column headers, writes one merged CSV, and uploads it to S3.
    Called only once — when merged.csv does not yet exist.
    """
    print('[INFO] merged.csv not found — building from source CSVs...')

    all_rows = []

    sources = [
        (FILE_USERS,   'users_master'),
        (FILE_HISTORY, 'claims_history'),
        (FILE_VEHICLE, 'vehicle_insurance_claims'),
        (FILE_HEALTH,  'health_insurance_claims'),
    ]

    for filename, source_label in sources:
        try:
            rows = _read_csv(filename)
            for row in rows:
                all_rows.append({**row, '_source': source_label})
            print(f'[INFO]   {filename}: {len(rows)} rows loaded.')
        except FileNotFoundError:
            print(f'[WARN]   {filename} not found in S3 — skipping.')
        except Exception as e:
            print(f'[WARN]   {filename} read error: {e} — skipping.')

    if not all_rows:
        print('[WARN] No rows collected — aborting merged.csv upload.')
        return

    # ── Union all column headers, priority cols first, _source last ──────────
    priority_cols = ['User_ID', 'Claim_ID', 'Insurance_Type']
    seen_cols     = []
    for row in all_rows:
        for k in row:
            if k not in seen_cols:
                seen_cols.append(k)

    ordered_cols = (
        [c for c in priority_cols if c in seen_cols]
        + [c for c in seen_cols if c not in priority_cols and c != '_source']
        + ['_source']
    )

    # ── Write to in-memory buffer and upload ─────────────────────────────────
    buffer = io.StringIO()
    writer = csv.DictWriter(
        buffer,
        fieldnames=ordered_cols,
        extrasaction='ignore',
        lineterminator='\n'
    )
    writer.writeheader()
    writer.writerows(all_rows)

    csv_bytes = buffer.getvalue().encode('utf-8')

    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=MERGED_FILE_NAME,
        Body=csv_bytes,
        ContentType='text/csv'
    )
    print(f'[INFO] merged.csv uploaded successfully — '
          f'{len(all_rows)} total rows, {len(csv_bytes)} bytes.')


# ══════════════════════════════════════════════════════════════════
#  PATH A  —  Full user data (reads merged.csv when available)
# ══════════════════════════════════════════════════════════════════
def _get_full_user_data(user_id: str) -> dict:
    """
    1st call ever  → builds merged.csv from all 4 source CSVs, uploads to S3,
                     then queries it for this user.
    All later calls → reads directly from merged.csv — source CSVs not touched.
    """

    # ── Step 1: Ensure merged.csv exists ─────────────────────────
    if not _merged_csv_exists():
        try:
            _build_and_upload_merged_csv()
        except Exception as e:
            print(f'[WARN] Could not build merged.csv: {e} — falling back to source CSVs.')
            return _get_full_user_data_from_sources(user_id)

    # ── Step 2: Read merged.csv and filter for this user ─────────
    try:
        all_rows  = _read_csv(MERGED_FILE_NAME)
        user_rows = [r for r in all_rows if _norm(r.get('User_ID')) == user_id]

        if not user_rows:
            return {'not_found': True, 'searched_id': user_id}

        return _build_result_from_rows(user_id, user_rows)

    except Exception as e:
        print(f'[WARN] Could not read merged.csv ({e}) — falling back to source CSVs.')
        return _get_full_user_data_from_sources(user_id)


def _build_result_from_rows(user_id: str, user_rows: list) -> dict:
    """
    Builds the same structured result dict from rows already filtered
    for this user_id (works whether rows come from merged.csv or sources).
    """
    result = {}

    # ── User profile (from users_master rows) ────────────────────
    profile_row = next(
        (r for r in user_rows if r.get('_source') == 'users_master'), None
    )
    # Fallback: any row that has a Name field (in case _source col is absent)
    if not profile_row:
        profile_row = next((r for r in user_rows if r.get('Name')), None)

    if profile_row:
        result['User Profile'] = {
            'Name':        profile_row.get('Name', 'N/A').strip(),
            'Email':       profile_row.get('Email', 'N/A').strip(),
            'Age':         profile_row.get('Age', 'N/A').strip(),
            'Gender':      profile_row.get('Gender', 'N/A').strip(),
            'Policy Tier': profile_row.get('Policy_Tier', 'N/A').strip(),
            'User ID':     user_id
        }

    # ── Claims history rows ───────────────────────────────────────
    claim_rows = [r for r in user_rows if r.get('_source') == 'claims_history'
                  or (r.get('Claim_ID') and r.get('Status') and not r.get('Vehicle_Model') and not r.get('Hospital'))]

    if claim_rows:
        approved = [c for c in claim_rows if c.get('Status', '').strip() == 'Approved']
        flagged  = [c for c in claim_rows if c.get('Status', '').strip() == 'Flagged']
        rejected = [c for c in claim_rows if c.get('Status', '').strip() == 'Rejected']
        pending  = [c for c in claim_rows if c.get('Status', '').strip() == 'Pending']

        total_refund = sum(_to_int(c.get('Claim_Amount', 0)) for c in approved)

        result['Claims Summary'] = {
            'Total Claims':           len(claim_rows),
            'Approved':               len(approved),
            'Flagged (Under Review)': len(flagged),
            'Rejected':               len(rejected),
            'Pending':                len(pending),
            'Total Approved Refund':  f'INR {total_refund:,}',
        }
        result['All Claims'] = [
            {
                'Claim ID':       c.get('Claim_ID', '').strip(),
                'Insurance Type': c.get('Insurance_Type', '').strip(),
                'Claim Amount':   f"INR {_to_int(c.get('Claim_Amount', 0)):,}",
                'Status':         c.get('Status', '').strip(),
                'Fraud Alert':    c.get('Fraud_Flags', 'None').strip()
            }
            for c in claim_rows
        ]
    else:
        result['Claims Summary'] = 'No claims found for this user.'

    # ── Vehicle rows ──────────────────────────────────────────────
    vehicle_rows = [r for r in user_rows if r.get('_source') == 'vehicle_insurance_claims'
                    or r.get('Vehicle_Model')]

    if vehicle_rows:
        result['Vehicle Claims'] = [
            {
                'Claim ID':              v.get('Claim_ID', '').strip(),
                'Vehicle Model':         v.get('Vehicle_Model', '').strip(),
                'Car Purchase Year':     v.get('Car_Purchase_Year', '').strip(),
                'Vehicle Age (years)':   v.get('Vehicle_Age', '').strip(),
                'Policy Start Date':     v.get('Policy_Start_Date', '').strip(),
                'Incident Date':         v.get('Incident_Date', '').strip(),
                'Police Report Filed':   v.get('Police_Report', '').strip(),
                'Damage Severity':       v.get('Damage_Severity', '').strip(),
                'Previous Claims Count': v.get('Previous_Claims_Count', '').strip(),
                'Driver Risk Score':     v.get('Driver_Risk_Score', '').strip(),
                'Claim Amount':          f"INR {_to_int(v.get('Claim_Amount', 0)):,}",
                'Fraud Alert':           v.get('Fraud_Flags', 'None').strip()
            }
            for v in vehicle_rows
        ]
    else:
        result['Vehicle Claims'] = 'No vehicle insurance claims found for this user.'

    # ── Health rows ───────────────────────────────────────────────
    health_rows = [r for r in user_rows if r.get('_source') == 'health_insurance_claims'
                   or r.get('Hospital')]

    if health_rows:
        result['Health Claims'] = [
            {
                'Claim ID':           h.get('Claim_ID', '').strip(),
                'Hospital':           h.get('Hospital', '').strip(),
                'Disease':            h.get('Disease', '').strip(),
                'Condition Type':     h.get('Disease_Type', '').strip(),
                'Treatment Duration': f"{h.get('Treatment_Duration_Days', '').strip()} days",
                'Expected Cost':      f"INR {_to_int(h.get('Expected_Cost', 0)):,}",
                'Claim Amount':       f"INR {_to_int(h.get('Claim_Amount', 0)):,}",
                'Fraud Alert':        h.get('Fraud_Flags', 'None').strip()
            }
            for h in health_rows
        ]
    else:
        result['Health Claims'] = 'No health insurance claims found for this user.'

    return result


# ══════════════════════════════════════════════════════════════════
#  FALLBACK  —  Original 4-file read (used if merged.csv fails)
# ══════════════════════════════════════════════════════════════════
def _get_full_user_data_from_sources(user_id: str) -> dict:
    """
    Original logic reading directly from the 4 source CSVs.
    Only used as a fallback if merged.csv cannot be built or read.
    """
    result = {}

    try:
        users    = _read_csv(FILE_USERS)
        user_row = next((u for u in users if _norm(u.get('User_ID')) == user_id), None)
        if not user_row:
            return {'not_found': True, 'searched_id': user_id}
        result['User Profile'] = {
            'Name':        user_row.get('Name', 'N/A').strip(),
            'Email':       user_row.get('Email', 'N/A').strip(),
            'Age':         user_row.get('Age', 'N/A').strip(),
            'Gender':      user_row.get('Gender', 'N/A').strip(),
            'Policy Tier': user_row.get('Policy_Tier', 'N/A').strip(),
            'User ID':     user_id
        }
    except Exception as e:
        return {'error': f'Could not read user profile: {e}', 'searched_id': user_id}

    try:
        all_claims  = _read_csv(FILE_HISTORY)
        user_claims = [c for c in all_claims if _norm(c.get('User_ID')) == user_id]
        if user_claims:
            approved = [c for c in user_claims if c.get('Status', '').strip() == 'Approved']
            flagged  = [c for c in user_claims if c.get('Status', '').strip() == 'Flagged']
            rejected = [c for c in user_claims if c.get('Status', '').strip() == 'Rejected']
            pending  = [c for c in user_claims if c.get('Status', '').strip() == 'Pending']
            total_refund = sum(_to_int(c.get('Claim_Amount', 0)) for c in approved)
            result['Claims Summary'] = {
                'Total Claims': len(user_claims), 'Approved': len(approved),
                'Flagged (Under Review)': len(flagged), 'Rejected': len(rejected),
                'Pending': len(pending), 'Total Approved Refund': f'INR {total_refund:,}'
            }
            result['All Claims'] = [
                {'Claim ID': c.get('Claim_ID','').strip(), 'Insurance Type': c.get('Insurance_Type','').strip(),
                 'Claim Amount': f"INR {_to_int(c.get('Claim_Amount',0)):,}", 'Status': c.get('Status','').strip(),
                 'Fraud Alert': c.get('Fraud_Flags','None').strip()} for c in user_claims
            ]
        else:
            result['Claims Summary'] = 'No claims found for this user.'
    except Exception as e:
        result['Claims Error'] = str(e)

    try:
        vehicle_rows  = _read_csv(FILE_VEHICLE)
        user_vehicles = [v for v in vehicle_rows if _norm(v.get('User_ID')) == user_id]
        if user_vehicles:
            result['Vehicle Claims'] = [
                {'Claim ID': v.get('Claim_ID','').strip(), 'Vehicle Model': v.get('Vehicle_Model','').strip(),
                 'Car Purchase Year': v.get('Car_Purchase_Year','').strip(), 'Vehicle Age (years)': v.get('Vehicle_Age','').strip(),
                 'Policy Start Date': v.get('Policy_Start_Date','').strip(), 'Incident Date': v.get('Incident_Date','').strip(),
                 'Police Report Filed': v.get('Police_Report','').strip(), 'Damage Severity': v.get('Damage_Severity','').strip(),
                 'Previous Claims Count': v.get('Previous_Claims_Count','').strip(), 'Driver Risk Score': v.get('Driver_Risk_Score','').strip(),
                 'Claim Amount': f"INR {_to_int(v.get('Claim_Amount',0)):,}", 'Fraud Alert': v.get('Fraud_Flags','None').strip()}
                for v in user_vehicles
            ]
        else:
            result['Vehicle Claims'] = 'No vehicle insurance claims found for this user.'
    except Exception as e:
        result['Vehicle Claims Error'] = str(e)

    try:
        health_rows = _read_csv(FILE_HEALTH)
        user_health = [h for h in health_rows if _norm(h.get('User_ID')) == user_id]
        if user_health:
            result['Health Claims'] = [
                {'Claim ID': h.get('Claim_ID','').strip(), 'Hospital': h.get('Hospital','').strip(),
                 'Disease': h.get('Disease','').strip(), 'Condition Type': h.get('Disease_Type','').strip(),
                 'Treatment Duration': f"{h.get('Treatment_Duration_Days','').strip()} days",
                 'Expected Cost': f"INR {_to_int(h.get('Expected_Cost',0)):,}",
                 'Claim Amount': f"INR {_to_int(h.get('Claim_Amount',0)):,}",
                 'Fraud Alert': h.get('Fraud_Flags','None').strip()} for h in user_health
            ]
        else:
            result['Health Claims'] = 'No health insurance claims found for this user.'
    except Exception as e:
        result['Health Claims Error'] = str(e)

    return result


# ══════════════════════════════════════════════════════════════════
#  PATH B  —  Claim lookup (unchanged)
# ══════════════════════════════════════════════════════════════════
def _get_claim_data(claim_id: str) -> dict:
    result = {}

    # ── Try merged.csv first ──────────────────────────────────────
    try:
        if _merged_csv_exists():
            all_rows = _read_csv(MERGED_FILE_NAME)
            match_rows = [r for r in all_rows if _norm(r.get('Claim_ID')) == claim_id]

            if match_rows:
                overview_row = next((r for r in match_rows if r.get('Status')), None)
                if overview_row:
                    result['Claim Overview'] = {
                        'Claim ID':       overview_row.get('Claim_ID', '').strip(),
                        'User ID':        overview_row.get('User_ID', '').strip(),
                        'Insurance Type': overview_row.get('Insurance_Type', '').strip(),
                        'Claim Amount':   f"INR {_to_int(overview_row.get('Claim_Amount', 0)):,}",
                        'Status':         overview_row.get('Status', '').strip(),
                        'Fraud Alert':    overview_row.get('Fraud_Flags', 'None').strip()
                    }

                vehicle_row = next((r for r in match_rows if r.get('Vehicle_Model')), None)
                if vehicle_row:
                    result['Vehicle Details'] = {
                        'Vehicle Model':         vehicle_row.get('Vehicle_Model', '').strip(),
                        'Car Purchase Year':     vehicle_row.get('Car_Purchase_Year', '').strip(),
                        'Vehicle Age (years)':   vehicle_row.get('Vehicle_Age', '').strip(),
                        'Policy Start Date':     vehicle_row.get('Policy_Start_Date', '').strip(),
                        'Incident Date':         vehicle_row.get('Incident_Date', '').strip(),
                        'Police Report Filed':   vehicle_row.get('Police_Report', '').strip(),
                        'Damage Severity':       vehicle_row.get('Damage_Severity', '').strip(),
                        'Previous Claims Count': vehicle_row.get('Previous_Claims_Count', '').strip(),
                        'Driver Risk Score':     vehicle_row.get('Driver_Risk_Score', '').strip(),
                        'Claim Amount':          f"INR {_to_int(vehicle_row.get('Claim_Amount', 0)):,}",
                        'Fraud Alert':           vehicle_row.get('Fraud_Flags', 'None').strip()
                    }

                health_row = next((r for r in match_rows if r.get('Hospital')), None)
                if health_row:
                    result['Health Details'] = {
                        'Hospital':           health_row.get('Hospital', '').strip(),
                        'Disease':            health_row.get('Disease', '').strip(),
                        'Condition Type':     health_row.get('Disease_Type', '').strip(),
                        'Treatment Duration': f"{health_row.get('Treatment_Duration_Days', '').strip()} days",
                        'Expected Cost':      f"INR {_to_int(health_row.get('Expected_Cost', 0)):,}",
                        'Claim Amount':       f"INR {_to_int(health_row.get('Claim_Amount', 0)):,}",
                        'Fraud Alert':        health_row.get('Fraud_Flags', 'None').strip()
                    }

                return result if result else {'not_found': True, 'searched_id': claim_id}

    except Exception as e:
        print(f'[WARN] merged.csv claim lookup failed: {e} — falling back to source CSVs.')

    # ── Fallback: read from source CSVs ───────────────────────────
    try:
        all_claims = _read_csv(FILE_HISTORY)
        match = next((c for c in all_claims if _norm(c.get('Claim_ID')) == claim_id), None)
        if match:
            result['Claim Overview'] = {
                'Claim ID': match.get('Claim_ID','').strip(), 'User ID': match.get('User_ID','').strip(),
                'Insurance Type': match.get('Insurance_Type','').strip(),
                'Claim Amount': f"INR {_to_int(match.get('Claim_Amount',0)):,}",
                'Status': match.get('Status','').strip(), 'Fraud Alert': match.get('Fraud_Flags','None').strip()
            }
    except Exception as e:
        result['Overview Error'] = str(e)

    try:
        vehicle_rows = _read_csv(FILE_VEHICLE)
        match = next((v for v in vehicle_rows if _norm(v.get('Claim_ID')) == claim_id), None)
        if match:
            result['Vehicle Details'] = {
                'Vehicle Model': match.get('Vehicle_Model','').strip(), 'Car Purchase Year': match.get('Car_Purchase_Year','').strip(),
                'Vehicle Age (years)': match.get('Vehicle_Age','').strip(), 'Policy Start Date': match.get('Policy_Start_Date','').strip(),
                'Incident Date': match.get('Incident_Date','').strip(), 'Police Report Filed': match.get('Police_Report','').strip(),
                'Damage Severity': match.get('Damage_Severity','').strip(), 'Previous Claims Count': match.get('Previous_Claims_Count','').strip(),
                'Driver Risk Score': match.get('Driver_Risk_Score','').strip(),
                'Claim Amount': f"INR {_to_int(match.get('Claim_Amount',0)):,}", 'Fraud Alert': match.get('Fraud_Flags','None').strip()
            }
    except (FileNotFoundError, Exception):
        pass

    try:
        health_rows = _read_csv(FILE_HEALTH)
        match = next((h for h in health_rows if _norm(h.get('Claim_ID')) == claim_id), None)
        if match:
            result['Health Details'] = {
                'Hospital': match.get('Hospital','').strip(), 'Disease': match.get('Disease','').strip(),
                'Condition Type': match.get('Disease_Type','').strip(),
                'Treatment Duration': f"{match.get('Treatment_Duration_Days','').strip()} days",
                'Expected Cost': f"INR {_to_int(match.get('Expected_Cost',0)):,}",
                'Claim Amount': f"INR {_to_int(match.get('Claim_Amount',0)):,}",
                'Fraud Alert': match.get('Fraud_Flags','None').strip()
            }
    except (FileNotFoundError, Exception):
        pass

    return result if result else {'not_found': True, 'searched_id': claim_id}


# ══════════════════════════════════════════════════════════════════
#  PROMPT BUILDER
# ══════════════════════════════════════════════════════════════════
def _make_prompt(original_message: str, db_data: dict, id_type: str, id_value: str) -> str:
    if db_data.get('not_found'):
        data_block = (
            f"[DATABASE RESULT]\n"
            f"The {id_type} '{id_value}' was NOT FOUND in any CSV file in the system.\n"
            f"Tell the user politely: their ID does not exist in our database. "
            f"Ask them to verify it or contact customer support."
        )
    else:
        data_block = (
            f"[DATABASE RESULT — {id_type}: {id_value}]\n"
            f"{json.dumps(db_data, indent=2, default=str)}\n\n"
            f"Using only the above real data, answer the user's question clearly."
        )
    return f"User question: {original_message}\n\n{data_block}"


# ══════════════════════════════════════════════════════════════════
#  MONGODB
# ══════════════════════════════════════════════════════════════════
def _load_history(session_id: str) -> list:
    try:
        db = get_db()
        collection = db.get_collection(TABLE_NAME)
        cursor = collection.find({'session_id': session_id}).sort('timestamp', 1)
        history = []
        for item in cursor:
            user_msg = item.get('latest_user_query')
            ai_msg   = item.get('latest_ai_response')
            if user_msg and user_msg != "N/A":
                history.append({'role': 'user', 'content': [{'text': user_msg}]})
            if ai_msg and ai_msg != "N/A":
                history.append({'role': 'assistant', 'content': [{'text': ai_msg}]})
        return history
    except Exception as e:
        print(f'[WARN] MongoDB load failed ({session_id}): {e}')
    return []


def _save_history(session_id: str, history: list):
    try:
        db = get_db()
        collection = db.get_collection(TABLE_NAME)
        now_utc   = datetime.datetime.utcnow()
        now_ist   = now_utc + datetime.timedelta(hours=5, minutes=30)
        timestamp = now_ist.strftime('%Y-%m-%d %H:%M:%S')

        latest_user = "N/A"
        latest_ai   = "N/A"
        if len(history) >= 2:
            latest_user = history[-2]['content'][0]['text']
            latest_ai   = history[-1]['content'][0]['text']

        collection.insert_one({
            'session_id':         session_id,
            'timestamp':          timestamp,
            'latest_user_query':  latest_user[:2000],
            'latest_ai_response': latest_ai[:2000],
            'last_updated':       timestamp
        })
    except Exception as e:
        print(f'[WARN] MongoDB save failed ({session_id}): {e}')



# ══════════════════════════════════════════════════════════════════
#  UTILITY HELPERS
# ══════════════════════════════════════════════════════════════════
def _read_csv(filename: str) -> list:
    try:
        obj     = s3.get_object(Bucket=BUCKET_NAME, Key=filename)
        content = obj['Body'].read().decode('utf-8-sig')
        return list(csv.DictReader(io.StringIO(content)))
    except s3.exceptions.NoSuchKey:
        raise FileNotFoundError(f'"{filename}" not found in bucket "{BUCKET_NAME}"')
    except Exception as e:
        raise RuntimeError(f'S3 read failed for "{filename}": {e}')

def _norm(value) -> str:
    return str(value).strip().upper() if value else ''

def _to_int(value) -> int:
    try:
        return int(str(value).replace(',', '').strip())
    except (ValueError, TypeError):
        return 0

def _resp(status_code: int, body: dict) -> dict:
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin':  '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Content-Type':                 'application/json'
        },
        'body': json.dumps(body, default=str)
    }