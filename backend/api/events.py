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

def verify_jwt_token(request):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def create_event(request):
    try:
        payload = verify_jwt_token(request)
        if not payload or payload.get('user_type') != 'admin':
            return Response({'error': 'Unauthorized. Admin access required.'}, status=status.HTTP_401_UNAUTHORIZED)

        data = json.loads(request.body)
        event_title = data.get('eventTitle', '').strip()
        event_venue = data.get('eventVenue', '').strip()
        start_time = data.get('startTime', '')
        end_time = data.get('endTime', '')
        start_date = data.get('startDate', '')
        end_date = data.get('endDate', '')
        event_cost = data.get('eventCost', None)
        event_description = data.get('eventDescription', '').strip()
        event_image = data.get('eventImage', '')  # Base64 encoded image
        event_type = data.get('type', 'FREE').upper()

        # Validation
        if not event_title:
            return Response({'error': 'Event title is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not event_venue:
            return Response({'error': 'Event venue is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not start_time:
            return Response({'error': 'Start time is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not end_time:
            return Response({'error': 'End time is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not start_date:
            return Response({'error': 'Start date is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not end_date:
            return Response({'error': 'End date is required'}, status=status.HTTP_400_BAD_REQUEST)
        if event_type == 'PAID':
            if event_cost is None:
                return Response({'error': 'Event cost is required for paid events'}, status=status.HTTP_400_BAD_REQUEST)
        if not event_description:
            return Response({'error': 'Event description is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not event_image:
            return Response({'error': 'Event image is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not event_image.startswith('data:image'):
            return Response({'error': 'Invalid image format. Must be base64 encoded.'}, status=status.HTTP_400_BAD_REQUEST)
        if event_type not in ['FREE', 'PAID']:
            return Response({'error': 'Event type must be FREE or PAID.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate dates
        try:
            start_datetime = datetime.strptime(f"{start_date} {start_time}", "%Y-%m-%d %H:%M")
            end_datetime = datetime.strptime(f"{end_date} {end_time}", "%Y-%m-%d %H:%M")
            if end_datetime <= start_datetime:
                return Response({'error': 'End date and time must be after start date and time'}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({'error': 'Invalid date or time format'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate cost
        if event_type == 'PAID':
            try:
                cost_float = float(event_cost)
                if cost_float < 0:
                    return Response({'error': 'Event cost cannot be negative'}, status=status.HTTP_400_BAD_REQUEST)
            except (ValueError, TypeError):
                return Response({'error': 'Invalid cost format'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            cost_float = 0

        try:
            client, events = get_events_collection()
            event_data = {
                'title': event_title,
                'venue': event_venue,
                'start_time': start_time,
                'end_time': end_time,
                'start_date': start_date,
                'end_date': end_date,
                'cost': cost_float,
                'description': event_description,
                'image': event_image,  # Store base64 image
                'type': event_type,
                'admin_id': payload['admin_id'],
                'admin_name': payload.get('name', ''),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'status': 'active'
            }

            result = events.insert_one(event_data)
            event_data['_id'] = result.inserted_id

            return Response({
                'message': 'Event created successfully',
                'event': {
                    'id': str(event_data['_id']),
                    'title': event_data['title'],
                    'venue': event_data['venue'],
                    'start_date': event_data['start_date'],
                    'start_time': event_data['start_time'],
                    'cost': event_data['cost'],
                    'type': event_data['type'],
                    'image': event_data['image'],
                }
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
@api_view(['GET'])
@permission_classes([AllowAny])
def get_events(request):
    try:
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 9))
        skip = (page - 1) * limit

        try:
            client, events = get_events_collection()
            events_cursor = events.find({'status': 'active'}).sort('created_at', -1).skip(skip).limit(limit)
            events_list = []

            now = datetime.utcnow()
            for event in events_cursor:
                # Combine end_date and end_time to get event deadline
                try:
                    event_deadline = datetime.strptime(f"{event['end_date']} {event['end_time']}", "%Y-%m-%d %H:%M")
                except Exception:
                    event_deadline = None
                # If deadline passed, set status to inactive
                if event_deadline and event_deadline < now:
                    events.update_one({'_id': event['_id']}, {'$set': {'status': 'inactive'}})
                    continue
                formatted_date = datetime.strptime(event['start_date'], '%Y-%m-%d').strftime('%A, %B %d')
                formatted_time = datetime.strptime(event['start_time'], '%H:%M').strftime('%I:%M%p')
                events_list.append({
                    'id': str(event['_id']),
                    'image': event.get('image', event.get('image_url', '')),
                    'type': event['type'],
                    'title': event['title'],
                    'date': f"{formatted_date}, {formatted_time}",
                    'location': event['venue'],
                    'cost': event['cost'],
                    'description': event['description']
                })

            total_events = events.count_documents({'status': 'active'})
            has_more = (page * limit) < total_events

            return Response({
                'events': events_list,
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': total_events,
                    'has_more': has_more
                }
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
def get_admin_events(request):
    try:
        payload = verify_jwt_token(request)
        if not payload or payload.get('user_type') != 'admin':
            return Response({'error': 'Unauthorized. Admin access required.'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            client, events = get_events_collection()
            events_cursor = events.find({
                'admin_id': payload['admin_id'],
                'status': 'active'
            }).sort('created_at', -1)
            events_list = []

            now = datetime.utcnow()
            for event in events_cursor:
                try:
                    event_deadline = datetime.strptime(f"{event['end_date']} {event['end_time']}", "%Y-%m-%d %H:%M")
                except Exception:
                    event_deadline = None
                if event_deadline and event_deadline < now:
                    events.update_one({'_id': event['_id']}, {'$set': {'status': 'inactive'}})
                    continue
                formatted_date = datetime.strptime(event['start_date'], '%Y-%m-%d').strftime('%A, %B %d')
                formatted_time = datetime.strptime(event['start_time'], '%H:%M').strftime('%I:%M%p')
                events_list.append({
                    'id': str(event['_id']),
                    'image': event.get('image', event.get('image_url', '')),
                    'type': event['type'],
                    'title': event['title'],
                    'date': f"{formatted_date}, {formatted_time}",
                    'location': event['venue'],
                    'cost': event['cost'],
                    'description': event['description']
                })

            return Response({
                'events': events_list,
                'count': len(events_list)
            }, status=status.HTTP_200_OK)

        except PyMongoError as e:
            return Response({'error': f'Database error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            if 'client' in locals():
                client.close()

    except Exception as e:
        return Response({'error': f'Internal server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)