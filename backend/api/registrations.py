import json
import jwt
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from bson import ObjectId

# Constants
MONGODB_URI = "mongodb+srv://1QoSRtE75wSEibZJ:1QoSRtE75wSEibZJ@cluster0.mregq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
MONGODB_DATABASE = "EventManagement"
SECRET_KEY = settings.JWT_SECRET_KEY

def get_events_collection():
    try:
        client = MongoClient(MONGODB_URI)
        db = client[MONGODB_DATABASE]
        return client, db.events
    except PyMongoError as e:
        raise Exception(f"Database connection error: {str(e)}")

def get_registrations_collection():
    try:
        client = MongoClient(MONGODB_URI)
        db = client[MONGODB_DATABASE]
        return client, db.registrations
    except PyMongoError as e:
        raise Exception(f"Database connection error: {str(e)}")

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_for_event(request, event_id):
    try:
        # Verify user token (for user authentication)
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            if payload.get('user_type') != 'user':
                return Response({'error': 'Only users can register for events'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

        data = json.loads(request.body)
        payment_status = data.get('payment_status', 'pending')
        payment_method = data.get('payment_method', 'none')
        phone_number = data.get('phone_number', '')

        try:
            # Check if event exists and get event details
            client, events = get_events_collection()
            event = events.find_one({'_id': ObjectId(event_id)})
            if not event:
                return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)

            # Check if user already registered
            registrations_client, registrations = get_registrations_collection()
            existing_registration = registrations.find_one({
                'event_id': event_id,
                'user_id': payload['user_id']
            })
            
            if existing_registration:
                return Response({'error': 'Already registered for this event'}, status=status.HTTP_400_BAD_REQUEST)

            # Create registration record
            registration_data = {
                'event_id': event_id,
                'event_title': event['title'],
                'user_id': payload['user_id'],
                'user_name': payload['name'],
                'user_email': payload['email'],
                'phone_number': phone_number,
                'payment_status': payment_status,
                'payment_method': payment_method,
                'registration_date': datetime.utcnow(),
                'event_type': event['type'],
                'event_cost': event['cost']
            }

            result = registrations.insert_one(registration_data)
            registration_data['_id'] = result.inserted_id

            return Response({
                'message': 'Successfully registered for event',
                'registration_id': str(result.inserted_id),
                'event_title': event['title'],
                'payment_required': event['type'] == 'PAID'
            }, status=status.HTTP_201_CREATED)

        except PyMongoError as e:
            return Response({'error': f'Database error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            if 'client' in locals():
                client.close()
            if 'registrations_client' in locals():
                registrations_client.close()

    except json.JSONDecodeError:
        return Response({'error': 'Invalid JSON data'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': f'Internal server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def get_event_participants(request, event_id):
    try:
        # Verify admin token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            if payload.get('user_type') != 'admin':
                return Response({'error': 'Unauthorized. Admin access required.'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            client, registrations = get_registrations_collection()
            participants = list(registrations.find({
                'event_id': event_id
            }).sort('registration_date', -1))

            participants_list = []
            for participant in participants:
                participants_list.append({
                    'id': str(participant['_id']),
                    'user_name': participant['user_name'],
                    'user_email': participant['user_email'],
                    'phone_number': participant.get('phone_number', ''),
                    'registration_date': participant['registration_date'].strftime('%Y-%m-%d %H:%M:%S'),
                    'payment_status': participant['payment_status'],
                    'payment_method': participant.get('payment_method', 'none')
                })

            return Response({
                'participants': participants_list,
                'total_count': len(participants_list)
            }, status=status.HTTP_200_OK)

        except PyMongoError as e:
            return Response({'error': f'Database error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            if 'client' in locals():
                client.close()

    except Exception as e:
        return Response({'error': f'Internal server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_registered_events(request):
    try:
        # Verify user token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            if payload.get('user_type') != 'user':
                return Response({'error': 'Only users can access this endpoint'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            client, registrations = get_registrations_collection()
            user_registrations = list(registrations.find({
                'user_id': payload['user_id']
            }).sort('registration_date', -1))

            events_list = []
            for registration in user_registrations:
                # Get event details
                events_client, events = get_events_collection()
                event = events.find_one({'_id': ObjectId(registration['event_id'])})
                events_client.close()
                
                if event:
                    events_list.append({
                        'id': str(event['_id']),
                        'title': event['title'],
                        'venue': event['venue'],
                        'start_date': event['start_date'],
                        'start_time': event['start_time'],
                        'end_date': event['end_date'],
                        'end_time': event['end_time'],
                        'cost': event['cost'],
                        'type': event['type'],
                        'category': event.get('category', 'other'),
                        'image': event.get('image', ''),
                        'description': event['description'],
                        'registration_date': registration['registration_date'].strftime('%Y-%m-%d %H:%M:%S'),
                        'payment_status': registration['payment_status']
                    })

            return Response({
                'events': events_list,
                'total_count': len(events_list)
            }, status=status.HTTP_200_OK)

        except PyMongoError as e:
            return Response({'error': f'Database error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            if 'client' in locals():
                client.close()

    except Exception as e:
        return Response({'error': f'Internal server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
