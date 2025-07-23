import json
import jwt
import hashlib
import os
from datetime import datetime, timedelta
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import re


# Constants
MIN_PASSWORD_LENGTH = 8
PASSWORD_REGEX = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;<>,.?~\\/-]).{8,}$"
MONGODB_URI = "mongodb+srv://1QoSRtE75wSEibZJ:1QoSRtE75wSEibZJ@cluster0.mregq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
MONGODB_DATABASE = "EventManagement"
JWT_EXPIRATION_DELTA = timedelta(days=7)
SECRET_KEY = settings.JWT_SECRET_KEY
PASSWORD_SALT = os.getenv('PASSWORD_SALT', 'default-salt-value')

# Helper for events collection
def get_events_collection():
    try:
        client = MongoClient(MONGODB_URI)
        db = client[MONGODB_DATABASE]
        return client, db.events
    except PyMongoError as e:
        raise Exception(f"Database connection error: {str(e)}")
# ...existing code...

# Event creation endpoint (base64 image support)
@csrf_exempt
@api_view(['POST'])
def create_event(request):
    try:
        data = json.loads(request.body)
        eventTitle = data.get('eventTitle', '').strip()
        eventVenue = data.get('eventVenue', '').strip()
        startTime = data.get('startTime', '')
        endTime = data.get('endTime', '')
        startDate = data.get('startDate', '')
        endDate = data.get('endDate', '')
        eventCost = data.get('eventCost', 0)
        eventDescription = data.get('eventDescription', '').strip()
        eventImage = data.get('eventImage', None)  # base64 string

        # Basic validation
        if not eventTitle or not eventVenue or not startTime or not endTime or not startDate or not endDate or not eventDescription or eventImage is None:
            return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Insert event
        try:
            client, events = get_events_collection()
            event_doc = {
                'title': eventTitle,
                'venue': eventVenue,
                'start_time': startTime,
                'end_time': endTime,
                'start_date': startDate,
                'end_date': endDate,
                'cost': eventCost,
                'description': eventDescription,
                'image': eventImage,  # base64 string
                'type': 'PAID' if float(eventCost) > 0 else 'FREE',
                'created_at': datetime.utcnow(),
            }
            result = events.insert_one(event_doc)
            event_doc['id'] = str(result.inserted_id)
            return Response({'message': 'Event created successfully', 'event': event_doc}, status=status.HTTP_201_CREATED)
        except PyMongoError as e:
            return Response({'error': f'Database error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            if 'client' in locals():
                client.close()
    except Exception as e:
        return Response({'error': f'Internal server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Event list endpoint (returns base64 image)
@csrf_exempt
@api_view(['GET'])
def list_events(request):
    try:
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 9))
        skip = (page - 1) * limit
        try:
            client, events = get_events_collection()
            total = events.count_documents({})
            cursor = events.find({}).sort('created_at', -1).skip(skip).limit(limit)
            event_list = []
            for event in cursor:
                event_list.append({
                    'id': str(event.get('_id')),
                    'title': event.get('title', ''),
                    'venue': event.get('venue', ''),
                    'start_time': event.get('start_time', ''),
                    'end_time': event.get('end_time', ''),
                    'start_date': event.get('start_date', ''),
                    'end_date': event.get('end_date', ''),
                    'cost': event.get('cost', 0),
                    'description': event.get('description', ''),
                    'image': event.get('image', None),  # base64 string
                    'type': event.get('type', 'FREE'),
                    'date': event.get('start_date', ''),
                    'location': event.get('venue', ''),
                })
            has_more = (skip + limit) < total
            return Response({'events': event_list, 'pagination': {'has_more': has_more, 'total': total}}, status=status.HTTP_200_OK)
        except PyMongoError as e:
            return Response({'error': f'Database error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            if 'client' in locals():
                client.close()
    except Exception as e:
        return Response({'error': f'Internal server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_admins_collection():
    try:
        client = MongoClient(MONGODB_URI)
        db = client[MONGODB_DATABASE]
        return client, db.admins
    except PyMongoError as e:
        raise Exception(f"Database connection error: {str(e)}")

def hash_password(password):
    return hashlib.sha256((password + PASSWORD_SALT).encode()).hexdigest()

def verify_password(password, hashed_password):
    return hash_password(password) == hashed_password

def generate_jwt_token(admin_data):
    payload = {
        'admin_id': str(admin_data['_id']),
        'name': admin_data.get('name', ''),
        'email': admin_data['email'],
        'user_type': 'admin',
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
def admin_signup(request):
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip()
        password = data.get('password', '')
        confirm_password = data.get('confirmPassword', '')
        name = data.get('name', '').strip()

        # Validation
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not confirm_password:
            return Response({'error': 'Please confirm your password'}, status=status.HTTP_400_BAD_REQUEST)
        if password != confirm_password:
            return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        is_valid, message = validate_password(password)
        if not is_valid:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

        try:
            client, admins = get_admins_collection()
            existing = admins.find_one({'email': email})
            if existing:
                return Response({'error': 'Admin with this email already exists'}, status=status.HTTP_409_CONFLICT)

            admin_data = {
                'email': email,
                'name': name if name else email.split('@')[0],
                'password': hash_password(password),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
            }

            result = admins.insert_one(admin_data)
            admin_data['_id'] = result.inserted_id

            token = generate_jwt_token(admin_data)
            return Response({
                'token': token,
                'user': {
                    'id': str(admin_data['_id']),
                    'email': admin_data['email'],
                    'name': admin_data['name'],
                    'user_type': 'admin'
                },
                'message': 'Admin registered successfully'
            }, status=status.HTTP_201_CREATED)

        except PyMongoError as e:
            return Response({'error': f'Database error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            if 'client' in locals():
                client.close()

    except json.JSONDecodeError:
        return Response({'error': 'Invalid JSON data'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': f'Internal server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip()
        password = data.get('password', '')

        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            client, admins = get_admins_collection()
            admin = admins.find_one({'email': email})

            if not admin or not verify_password(password, admin['password']):
                return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

            token = generate_jwt_token(admin)
            return Response({
                'token': token,
                'user': {
                    'id': str(admin['_id']),
                    'email': admin['email'],
                    'name': admin.get('name', ''),
                    'user_type': 'admin'
                },
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)

        except PyMongoError as e:
            return Response({'error': f'Database error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            if 'client' in locals():
                client.close()

    except json.JSONDecodeError:
        return Response({'error': 'Invalid JSON data'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': f'Internal server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
