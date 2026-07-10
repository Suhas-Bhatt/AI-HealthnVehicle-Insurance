import json
import hashlib
from datetime import datetime
import re
from db_helper import get_db


def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])

        email = body['email'].strip()
        password = body['password'].strip()
        name = body.get('name', '').strip()

        gmail_regex = r'^[a-zA-Z0-9._%+-]+@gmail\.com$'

        if not re.match(gmail_regex, email):
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Only Gmail addresses (@gmail.com) are allowed'})
            }

             # 🔐 PASSWORD VALIDATION (optional but good)
        if len(password) < 6:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Password too short'})
            }

        # Hash password
        hashed_password = hashlib.sha256(password.encode()).hexdigest()

        # Check if user already exists
        db = get_db()
        existing = db.users.find_one({'email': email})
        if existing:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'User already exists'})
            }

        # Store user
        db.users.insert_one({
            'user_id': email,
            'email': email,
            'password': hashed_password,
            'name': name,
            'createdAt': datetime.utcnow().isoformat()
        })

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Signup successful'})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
