import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../../components/Footer';

const RegisteredEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Custom logout to clear localStorage and redirect
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      setLoading(true);
      setError('');
      
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('userToken');
        if (!token) {
          setError('Please login to view registered events');
          navigate('/user/login');
          return;
        }

        const response = await fetch('http://127.0.0.1:8000/api/user/registered-events/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setRegisteredEvents(data.events || []);
        } else {
          setError(data.error || 'Failed to fetch registered events');
        }
      } catch (err) {
        console.error('Error fetching registered events:', err);
        setError('Could not connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchRegisteredEvents();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 font-inter text-[#2C2C2C]">
      {/* Header Section */}
      <header className="bg-white shadow-sm py-4 px-6 md:px-12 flex justify-between items-center z-20 relative">
        <div className="text-2xl font-bold text-[#1F1D4F]">
          Event <span className="text-[#8A2BE2]">Hive</span>
        </div>
        <nav className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/user/dashboard')}
            className="text-[#2C2C2C] font-semibold hover:text-[#8A2BE2] transition-all duration-200"
          >
            Back to Dashboard
          </button>
          <span className="text-gray-700 font-medium">Welcome, {user?.name}</span>
          <button 
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-red-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Logout
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <section className="py-12 px-6 md:px-12">
        <div className="max-w-[1380px] mx-auto">
          <h1 className="text-4xl font-extrabold text-[#2C2C2C] mb-8 text-center">
            My Registered Events
          </h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#8A2BE2]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 text-lg font-semibold mb-4">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="bg-[#8A2BE2] text-white py-2 px-6 rounded-lg hover:bg-[#7a1bd1] transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          ) : registeredEvents.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <h3 className="text-2xl font-bold text-gray-400 mb-4">No Registered Events</h3>
              <p className="text-gray-500 mb-6">You haven't registered for any events yet.</p>
              <button
                onClick={() => navigate('/user/dashboard')}
                className="bg-[#8A2BE2] text-white py-3 px-8 rounded-lg hover:bg-[#7a1bd1] transition-all duration-300 font-semibold"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {registeredEvents.map((event) => {
                const imgSrc = event.image && typeof event.image === 'string' && event.image.startsWith('data:image')
                  ? event.image
                  : event.image || 'https://placehold.co/400x250/2C2B6A/FFFFFF?text=Event';
                const title = event.title || 'Untitled Event';
                const cost = event.type && event.type.toUpperCase() === 'FREE' ? 'FREE' : `₹${event.cost || 0}`;
                const typeTagBgClass = event.type && event.type.toUpperCase() === 'FREE' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
                const paymentStatusColor = event.payment_status === 'completed' ? 'text-green-600' : event.payment_status === 'pending' ? 'text-yellow-600' : 'text-gray-600';
                
                return (
                  <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#e0d7f7] hover:shadow-xl transition-shadow duration-300">
                    <div className="relative p-4">
                      <img src={imgSrc} alt={title} className="w-full h-48 object-cover rounded-[8px] border border-[#8A2BE2]/20" />
                      <span className={`absolute top-6 left-6 px-3 py-1 rounded-full text-xs font-semibold ${typeTagBgClass}`}>
                        {event.type ? event.type.toUpperCase() : 'N/A'}
                      </span>
                    </div>
                    <div className="p-5">
                      <h4 className="text-xl font-semibold text-gray-800 mb-2 truncate">{title}</h4>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-[#8A2BE2] font-medium">
                          📅 {event.start_date} at {event.start_time}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          📍 {event.venue}
                        </p>
                        <p className="text-sm text-gray-600">
                          🏷️ {event.category}
                        </p>
                        <p className="text-sm text-gray-500">
                          Registered: {new Date(event.registration_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-[#8A2BE2]">{cost}</span>
                        <span className={`text-sm font-semibold ${paymentStatusColor}`}>
                          {event.payment_status === 'completed' ? '✅ Confirmed' : 
                           event.payment_status === 'pending' ? '⏳ Payment Pending' : 
                           '❓ Status Unknown'}
                        </span>
                      </div>
                      {event.payment_status === 'pending' && event.type === 'PAID' && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-800 text-xs">
                            Complete payment to confirm your registration
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default RegisteredEvents;
