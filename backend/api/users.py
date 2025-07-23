# User registration and login for users collection
import json
import jwt
import hashlib
import os
from datetime import datetime, timedelta
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
import re

MIN_PASSWORD_LENGTH = 8
# Regex for password validation: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
PASSWORD_REGEX = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;<>,.?~\\/-]).{8,}$"

JWT_EXPIRATION_DELTA = timedelta(days=7)
SECRET_KEY = settings.JWT_SECRET_KEY

def get_users_collection():
    client = MongoClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DATABASE]
    return client, db['users']

def hash_password(password):
    salt = os.getenv('PASSWORD_SALT', 'default-salt-value')
    return hashlib.sha256((password + salt).encode()).hexdigest()

def verify_password(password, hashed_password):
    return hash_password(password) == hashed_password

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def generate_jwt_token(user_data):
    payload = {
        'user_id': str(user_data['_id']),
        'name': user_data['name'],
        'email': user_data['email'],
        'user_type': 'user',
        'exp': datetime.utcnow() + JWT_EXPIRATION_DELTA,
        'iat': datetime.utcnow(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def validate_password(password):
    if len(password) < MIN_PASSWORD_LENGTH:
        return False, f"Password must be at least {MIN_PASSWORD_LENGTH} characters long."
    if not re.fullmatch(PASSWORD_REGEX, password):
        return False, 'Password must include uppercase, lowercase, number, and special character.'
    return True, ""

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def user_signup(request):
    try:
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        confirm_password = data.get('confirmPassword', '')

        if not name:
            return Response({'error': 'Name is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not validate_email(email):
            return Response({'error': 'Please provide a valid email address'}, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
        if password != confirm_password:
            return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        # Apply the full password validation using the regex
        is_valid, message = validate_password(password)
        if not is_valid:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

        client, users = get_users_collection()
        try:
            existing = users.find_one({'email': email})
            if existing:
                return Response({'error': 'User with this email already exists'}, status=status.HTTP_409_CONFLICT)
            
            user_data = {
                'name': name,
                'email': email,
                'password': hash_password(password),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
            }
            result = users.insert_one(user_data)
            user_data['_id'] = result.inserted_id
            token = generate_jwt_token(user_data)
            
            return Response({
                'token': token,
                'user': {
                    'id': str(user_data['_id']), 
                    'name': user_data['name'],
                    'email': user_data['email'],
                    'user_type': 'user'
                },
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        finally:
            client.close()
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not validate_email(email):
            return Response({'error': 'Please provide a valid email address'}, status=status.HTTP_400_BAD_REQUEST)
            
        client, users = get_users_collection()
        try:
            user = users.find_one({'email': email})
            if not user or not verify_password(password, user['password']):
                return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
            
            token = generate_jwt_token(user)
            return Response({
                'token': token,
                'user': {
                    'id': str(user['_id']), 
                    'name': user['name'],
                    'email': user['email'],
                    'user_type': 'user'
                },
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
        finally:
            client.close()
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
