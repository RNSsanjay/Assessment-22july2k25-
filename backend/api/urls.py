from django.urls import path

from . import views
from . import admins
from . import users
from . import events
from . import registrations

urlpatterns = [
    # Authentication endpoints
   
    # Admin endpoints
    path('admin/signup/', admins.admin_signup, name='admin_signup'),
    path('admin/login/', admins.admin_login, name='admin_login'),
    
    # User endpoints
    path('user/signup/', users.user_signup, name='user_signup'),
    path('user/login/', users.user_login, name='user_login'),
    
    # Event endpoints
    path('events/create/', events.create_event, name='create_event'),
    path('events/', events.get_events, name='get_events'),
    path('admin/events/', events.get_admin_events, name='get_admin_events'),
    path('events/<str:event_id>/register/', registrations.register_for_event, name='register_for_event'),
    path('events/<str:event_id>/participants/', registrations.get_event_participants, name='get_event_participants'),
    path('user/registered-events/', registrations.get_user_registered_events, name='get_user_registered_events'),
]