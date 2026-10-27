# AI Insurance Fraud Detection — Health & Vehicle

An AI-powered claims platform that scores the credibility of **health** and **vehicle** insurance claims. A user uploads a claim document (invoice, police report, medical bill); the system extracts its text with OCR, cross-checks it against historical claim data, and returns a **Truth Score (0–100)**, a verdict, and an explanation of every fraud signal that fired.

## How it works

1. **Sign up / log in** – React front end calls Lambda functions behind API Gateway (Gmail-only sign-up, SHA-256 hashed passwords, users stored in MongoDB).
2. **Pick a portal** – Vehicle or Health dashboard, then complete the document checklist to unlock upload.
3. **OCR** – the file is sent as base64 to a Lambda, stored in S3 and read with **Amazon Textract**; the extracted text is saved to MongoDB.
4. **Truth analysis** – a second Lambda blends two scores 50/50:
   - a **rule-based formula score** (deductions per fraud signal, thresholds derived from the dataset), and
   - an **AI agent score** from **Amazon Nova Pro** on **Amazon Bedrock**, which calls tools to fetch the user's claim history and system-wide averages from the CSVs in S3.
5. **Verdict** – `>= 75` **APPROVE** · `45–74` **REVIEW** · `< 45` **FRAUD**. The result is stored and rendered with a radar chart and reasoning.
6. **Assistant chatbot** – answers questions about a `USR-…` or `CLM-…` ID using the CSV data plus per-session chat history (stored in MongoDB, timestamps in IST).

```
React (Vite) ─► API Gateway ─► Lambda ─┬─► S3 (documents + CSV "reality" data)
                                       ├─► Amazon Textract (OCR)
                                       ├─► Amazon Bedrock – Nova Pro (reasoning / chatbot)
                                       └─► MongoDB (users, OCR text, results, chat history)
```

See [arrows_workflow 1.txt](arrows_workflow%201.txt) for step-by-step flows and [backend/final_diagram.txt](backend/final_diagram.txt) for the architecture sketch. The original proposals are in [backend/mpha.txt](backend/mpha.txt) and the project PDF.

## Fraud signals

| Vehicle – rule-based formula (8 signals) | Health – rule-based formula |
| --- | --- |
| Claim amount vs. damage severity | Unusually high claim amount (> ₹80,000) |
| Missing police report | Diagnosis vs. cost (e.g. fever claim > ₹30,000) |
| Driver risk score | Medicine charges > 50% of the claim |
| Claim frequency | Unexplained charges (> 30% not itemised) |
| Early-policy ("honeymoon") claim | |
| Old vehicle + high claim | |
| Policy-tier limit breach | |
| Past fraud flags | |

On top of the formula, an AI agent reasons over the claim:

- **Vehicle** – Nova Pro via the Bedrock Converse API with tool use (`fetch_user_history`, `fetch_system_averages`), evaluating 9 dimensions: amount vs. damage, police report, frequency, policy misuse, damage consistency, user patterns, outliers, duplicates, combined risk.
- **Health** – an Amazon Bedrock Agent invoked through `bedrock-agent-runtime`.

## Repository layout

| Path | Contents |
| --- | --- |
| [frontend/](frontend/) | React 18 + Vite + Tailwind single-page app |
| [backend/](backend/) | AWS Lambda handlers (Python), dataset/image generators, sample claim documents |
| [CSV/](CSV/) | Synthetic datasets and the script that generates them |
| `merged.csv`, `vehicle_in.csv` | Merged / intermediate datasets used by the chatbot and analysis |
| `arrows_workflow 1.txt`, `vehicle_fraud_signals.txt` | Workflow and signal documentation |

## Tech stack

- **Frontend:** React 18, React Router 6, Vite 5, Tailwind CSS 3, Framer Motion, lucide-react
- **Backend:** Python 3 on AWS Lambda, boto3, pymongo
- **AWS:** API Gateway, Lambda, S3, Textract, Bedrock (Amazon Nova Pro)
- **Data:** MongoDB, CSV datasets in S3

## Getting started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ (only needed for the data/image generators and local DB test)
- An AWS account with Lambda, API Gateway, S3, Textract and Bedrock (Nova Pro) access, and a MongoDB instance — only for running the full pipeline

### Run the front end
```bash
cd frontend
npm install
echo "VITE_AWS_API_URL=https://<your-api-id>.execute-api.<region>.amazonaws.com/prod" > .env
npm run dev
```
The app opens at http://localhost:5173. In dev, requests to `/api/*` are proxied to API Gateway (see [frontend/vite.config.js](frontend/vite.config.js)).

### Deploy the back end
Each `*_lambda.py` / `ocr_textract_*.py` file is a standalone Lambda handler. Package it together with `db_helper.py` and `pymongo`, and configure the environment variables listed in [backend/README.md](backend/README.md). Upload the CSVs to the S3 bucket and expose the Lambdas through API Gateway routes (`/login`, `/signup`, `/upload`, `/healthupload`, `/analyse`, `/healthanalyse`, `/chat`).

## Configuration & secrets

Never commit credentials. Configuration comes from environment variables:

- Front end: `VITE_AWS_API_URL`, `VITE_AGENTCORE_URL` (see [frontend/README.md](frontend/README.md))
- Lambdas: `MONGODB_URI`, `MONGODB_DB`, `BUCKET_NAME`, `TABLE_NAME`, `MODEL_ID`, `MERGED_FILE_NAME`

`.env` files are git-ignored.

## Data & sample documents

All data in this repository is **synthetic**. `backend/generated_docs/`, `backend/health images/` and the `fake_*.png` files are generated sample invoices and police reports used to demo the OCR and fraud-detection flow.

## Team

Built as the Mphasis Project 2 POC. Concept contributions credited in [backend/mpha.txt](backend/mpha.txt) (Balaji, Pavitra).

## License

MIT License.
