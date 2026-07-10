import os
from pymongo import MongoClient

# Safe defaults if environment variables aren't set yet
MONGODB_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/')
DB_NAME = os.environ.get('MONGODB_DB', 'ai_insurance_fraud_detection')

_client = None

def get_db():
    global _client
    if _client is None:
        _client = MongoClient(MONGODB_URI)
    return _client[DB_NAME]
