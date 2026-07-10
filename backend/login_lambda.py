import json
import hashlib
import re
from db_helper import get_db


def lambda_handler(event, context):
    try:
        # 📥 Parse request body
        body = json.loads(event['body'])

        email = body.get('email', '').strip()
        password = body.get('password', '').strip()

        # 🔍 VALIDATION SECTION ------------------------

        # Check empty fields
        if not email or not password:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Email and password are required'})
            }

        # Email format validation
        gmail_regex = r'^[a-zA-Z0-9._%+-]+@gmail\.com$'

        if not re.match(gmail_regex, email):
            return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Only Gmail addresses (@gmail.com) are allowed'})
        }

        # Password length check
        if len(password) < 6:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Password must be at least 6 characters'})
            }

        # 🔐 HASH PASSWORD ------------------------
        hashed_password = hashlib.sha256(password.encode()).hexdigest()

        # 🧠 FETCH USER FROM DB ------------------------
        db = get_db()
        user = db.users.find_one({'email': email})

        if not user:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'User not found'})
            }

        # 🔑 PASSWORD CHECK ------------------------
        if user['password'] == hashed_password:
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'message': 'Login successful',
                    'email': email,
                    'name': user.get('name', '')
                })
            }
        else:
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Invalid password'})
            }

    except Exception as e:
        # ❌ INTERNAL ERROR HANDLING
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
