import json
import boto3
import base64
import datetime
from db_helper import get_db

# AWS clients
s3 = boto3.client('s3')
textract = boto3.client('textract')

# CONFIG
BUCKET_NAME = 'ai-insurance-data-suhas'



def lambda_handler(event, context):
    try:
        # ── STEP 1: Parse input ─────────────────────────────
        body = json.loads(event.get('body', '{}'))

        file_b64   = body.get('file_base64')
        file_name  = body.get('file_name', 'upload.png')
        claim_type = body.get('claim_type', 'health')

        if not file_b64:
            return _resp(400, {'message': 'No file provided'})

        # ── STEP 2: Fix base64 (important) ──────────────────
        if "," in file_b64:
            file_b64 = file_b64.split(",")[1]

        file_bytes = base64.b64decode(file_b64)

        # ── STEP 3: Generate claim_id (no UUID) ─────────────
        claim_id = f"CLM-{int(datetime.datetime.utcnow().timestamp())}"

        # ── STEP 4: Safe S3 key (unique storage) ────────────
        timestamp = int(datetime.datetime.utcnow().timestamp())

        if "." in file_name:
            name, ext = file_name.rsplit('.', 1)
            s3_key = f'uploads/{claim_type}/{name}_{timestamp}.{ext}'
        else:
            s3_key = f'uploads/{claim_type}/{file_name}_{timestamp}'

        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body=file_bytes
        )

        # ── STEP 5: Textract OCR ────────────────────────────
        textract_response = textract.detect_document_text(
            Document={
                'S3Object': {
                    'Bucket': BUCKET_NAME,
                    'Name': s3_key
                }
            }
        )

        # ── STEP 6: Extract text ────────────────────────────
        raw_lines = [
            block['Text']
            for block in textract_response.get('Blocks', [])
            if block['BlockType'] == 'LINE'
        ]

        raw_text = '\n'.join(raw_lines)

        # ── STEP 7: Confidence (Float) ────────────────
        confidence = float(_avg_confidence(textract_response))

        # ── STEP 8: Store in MongoDB ────────────────────────
        db = get_db()
        db.claim_ocr_data_health.insert_one({
            'claim_id': claim_id,
            's3_key': s3_key,
            'file_name': file_name,  # ✅ clean name stored
            'ocr_text': raw_text,
            'line_count': len(raw_lines),
            'confidence_pct': confidence,
            'claim_type': claim_type,
            'timestamp': str(datetime.datetime.utcnow())
        })

        # ── STEP 9: Return clean response ───────────────────
        return _resp(200, {
            'message': 'OCR extraction successful',
            'claim_id': claim_id,
            'file_name': file_name,  # ✅ clean name to frontend
            's3_key': s3_key,
            'confidence_pct': float(confidence),
            'raw_text': raw_text,
            'line_count': len(raw_lines)
        })

    except Exception as e:
        print("ERROR:", str(e))
        return _resp(500, {'error': str(e)})


# ── Helper: Confidence ────────────────────────────────────
def _avg_confidence(textract_resp):
    confidences = [
        b['Confidence']
        for b in textract_resp.get('Blocks', [])
        if 'Confidence' in b
    ]
    return round(sum(confidences) / len(confidences), 2) if confidences else 0.0


# ── Helper: Response (CORS) ───────────────────────────────
def _resp(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST'
        },
        'body': json.dumps(body)
    }