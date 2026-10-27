# CSV datasets

Synthetic insurance datasets (no real personal data) produced by `generate.py`. The Truth Score and chatbot Lambdas use these as the "reality" data to cross-check claims against; in deployment the files are uploaded to the S3 bucket they read from.

| File | Rows | Description | Columns |
| --- | --- | --- | --- |
| `users_master.csv` | 50 | Policyholders | `User_ID`, `Name`, `Email`, `Age`, `Gender`, `Policy_Tier` |
| `claims_history.csv` | 100 | All claims across insurance types | `Claim_ID`, `User_ID`, `Insurance_Type`, `Claim_Amount`, `Status`, `Fraud_Flags` |
| `vehicle_insurance_claims.csv` | 55 | Vehicle claim details | `Claim_ID`, `User_ID`, `Vehicle_Model`, `Car_Purchase_Year`, `Vehicle_Age`, `Damage_Severity`, `Previous_Claims_Count`, `Driver_Risk_Score`, `Claim_Amount`, `Fraud_Flags` |
| `health_insurance_claims.csv` | 45 | Health claim details | `Claim_ID`, `User_ID`, `Hospital`, `Disease`, `Disease_Type`, `Treatment_Duration_Days`, `Expected_Cost`, `Claim_Amount`, `Fraud_Flags` |
| `generate.py` | – | Regenerates the four files above | – |

`User_ID` (`USR-xxxxx`) and `Claim_ID` (`CLM-xxxxxxxx`) link the files together.

## Which copy is current?

This folder is an **earlier snapshot**. The files in [`../backend/`](../backend/) are the ones the Lambdas and image generators use: the vehicle file there adds `Policy_Start_Date`, `Incident_Date` and `Police_Report`, which the vehicle Truth Score and chatbot rely on. `users_master.csv` is identical in both places. The project root also holds `merged.csv` (all sources unioned with a `_source` column, as built by the chatbot Lambda) and `vehicle_in.csv`.

## Regenerate

```bash
python generate.py
```

The script writes the CSVs into the current directory.
