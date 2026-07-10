import sys
from db_helper import get_db

def test_db_connection():
    try:
        print("Connecting to MongoDB...")
        db = get_db()
        print(f"Connected to database: {db.name}")
        print("Collections:")
        print(db.list_collection_names())
        print("MongoDB connection successful!")
        sys.exit(0)
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_db_connection()
