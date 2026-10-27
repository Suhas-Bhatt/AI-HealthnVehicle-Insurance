# Backend

AWS Lambda handlers (Python) plus the scripts used to generate the synthetic datasets and sample claim documents. Every handler returns an API Gateway proxy response with CORS headers.

## Lambda handlers

| File | Route (see [frontend/src/pages/api.js](../frontend/src/pages/api.js)) | Purpose |
| --- | --- | --- |
| [signup_lambda.py](signup_lambda.py) | `/signup` | Gmail-only registration; SHA-256 hashed password; writes to the `users` collection |
| [login_lambda.py](login_lambda.py) | `/login` | Validates credentials against `users` |
| [ocr_textract_vehicle.py](ocr_textract_vehicle.py) | `/upload` | Decodes a base64 upload, stores it in S3, runs Textract, saves text to `claim_ocr_data_vehicle` |
| [ocr_textract_health.py](ocr_textract_health.py) | `/healthupload` | Same flow for health documents (`claim_ocr_data_health`) |
| [truth_score_vehicle_lambda.py](truth_score_vehicle_lambda.py) | `/analyse` | Vehicle Truth Score: 8-signal formula blended 50/50 with a Nova Pro agent (tool use) |
| [truth_score_health_lambda.py](truth_score_health_lambda.py) | `/healthanalyse` | Health Truth Score: disease-range rules + Bedrock Agent |
| [chatbot_lambda.py](chatbot_lambda.py) | `/chat` | Insurance assistant; detects `USR-…` / `CLM-…` IDs, answers from the CSVs in S3, keeps per-session history |
| [hospital_network_check.py](hospital_network_check.py) | – | Fuzzy-matches the hospital on a bill against the network list → `cashless` vs. `reimbursement` |
| [dummy_lambda.py](dummy_lambda.py) | – | Bedrock Agent action-group template (placeholder) |
| [processor.js](processor.js) | – | Early Node.js prototype (Textract + Claude 3 Sonnet); superseded by the Python handlers |
| [db_helper.py](db_helper.py) | – | Shared lazy `pymongo` client; imported by most handlers |
| [db_test.py](db_test.py) | – | Local script to verify the MongoDB connection |

Verdict thresholds (vehicle and health): `>= 75` APPROVE · `45–74` REVIEW · `< 45` FRAUD.

> Parts of `chatbot_lambda.py`, `truth_score_health_lambda.py` and `hospital_network_check.py` contain older DynamoDB versions kept as commented-out code above the active implementation.

## Environment variables

| Variable | Used by | Default |
| --- | --- | --- |
| `MONGODB_URI` | `db_helper.py` | `mongodb://localhost:27017/` |
| `MONGODB_DB` | `db_helper.py` | `ai_insurance_fraud_detection` |
| `BUCKET_NAME` | `chatbot_lambda.py` | `ai-insurance-data-suhas` |
| `TABLE_NAME` | `chatbot_lambda.py` (chat-history collection) | `Chatbot_history` |
| `MODEL_ID` | `chatbot_lambda.py` | `us.amazon.nova-pro-v1:0` |
| `MERGED_FILE_NAME` | `chatbot_lambda.py` | `merged.csv` |

The OCR and truth-score handlers currently hard-code the bucket name, model ID and (for health) the Bedrock Agent ID/alias. Change these constants at the top of each file for your own AWS account.

## AWS requirements

- **IAM:** `s3:GetObject/PutObject` on the bucket, `textract:DetectDocumentText`, `bedrock:InvokeModel`/`Converse`, `bedrock:InvokeAgent`
- **Region:** `us-east-1` (Nova Pro is invoked via the `us.amazon.nova-pro-v1:0` inference profile)
- **Packaging:** zip the handler with `db_helper.py` and its dependency `pymongo` (boto3 is provided by the Lambda runtime)
- **S3 bucket contents:** `users_master.csv`, `claims_history.csv`, `vehicle_insurance_claims.csv`, `health_insurance_claims.csv` (the chatbot builds and caches `merged.csv` on first use)

## MongoDB collections

`users`, `claim_ocr_data_vehicle`, `claim_ocr_data_health`, `fraud_results_vehicle`, `fraud_results_health`, and the chat-history collection (`TABLE_NAME`).

## Data & image generators

Requires `pip install pandas pillow`. Run from this directory.

| Script | Output |
| --- | --- |
| [generate_datasets.py](generate_datasets.py) | Basic synthetic claim datasets |
| [generate_relational_datasets.py](generate_relational_datasets.py) | Linked `users_master`, `claims_history`, vehicle and health CSVs sharing `User_ID` / `Claim_ID` |
| [generate_images.py](generate_images.py) | Fake invoices / police reports (PNG) per claim in `generated_docs/`; uses Windows Arial with a default-font fallback |

Other files: `*.csv` (generated datasets), `fake_*.png` and `generated_docs/`, `health images/` (sample documents for testing OCR), `harness.png` (agent harness diagram), `final_diagram.txt` (architecture), `vehicle_fraud_signals.txt`, `mpha.txt` (proposal text).

## Security notes

- Passwords are hashed with unsalted SHA-256 — fine for a POC, but use bcrypt/argon2 and token-based auth before production.
- CORS is `*` on every handler; restrict it to your front-end origin when deploying.
- Never commit `MONGODB_URI` or AWS credentials; use Lambda environment variables or Secrets Manager.
