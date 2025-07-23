import React, { useState, useEffect } from 'react';
import eventBg from '../../assets/eventbg.svg'; // Ensure this path is correct
import { useAuth } from '../../contexts/AuthContext';
import Footer from '../../components/Footer';

const UserDashboard = () => {
  const { user } = useAuth();
  // Custom logout to clear localStorage and redirect
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };
  // State for search filters
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  // State for event filters (placeholder) - These are for the secondary filters below the hero
  const [weekdays, setWeekdays] = useState('');
  const [eventFilterType, setEventFilterType] = useState('');
  const [category, setCategory] = useState('');

  // Real event data from backend
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Registration modal states
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/events/?page=1&limit=9`);
        const data = await response.json();
        if (response.ok && Array.isArray(data.events)) {
          setEvents(data.events);
          setFilteredEvents(data.events);
          setHasMore(data.pagination ? data.pagination.has_more : false);
        } else {
          setEvents([]);
          setFilteredEvents([]);
          setHasMore(false);
          setError(data.error || 'Failed to fetch events.');
        }
      } catch {
        setEvents([]);
        setFilteredEvents([]);
        setHasMore(false);
        setError('Could not connect to server.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Load more events
  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/events/?page=${nextPage}&limit=9`);
      const data = await response.json();
      if (response.ok && Array.isArray(data.events)) {
        setEvents(prev => [...prev, ...data.events]);
        setFilteredEvents(prev => [...prev, ...data.events]);
        setPage(nextPage);
        setHasMore(data.pagination ? data.pagination.has_more : false);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // Filter logic for both filter bars
  const handleFilter = () => {
    let filtered = [...events];
    // Top filter bar
    if (eventType) {
      filtered = filtered.filter(ev => ev.type && ev.type.toLowerCase() === eventType.toLowerCase());
    }
    if (location) {
      filtered = filtered.filter(ev => ev.location && ev.location.toLowerCase().includes(location.toLowerCase()));
    }
    if (dateTime) {
      filtered = filtered.filter(ev => {
        if (!ev.date) return false;
        if (ev.start_date) {
          return ev.start_date === dateTime;
        }
        try {
          const eventDate = new Date(ev.date).toISOString().split('T')[0];
          return eventDate === dateTime;
        } catch  {
          return false;
        }
      });
    }
    // Upcoming Events filter bar
    if (weekdays) {
      filtered = filtered.filter(ev => {
        // Try to match the weekday from start_date
        if (ev.start_date) {
          const d = new Date(ev.start_date);
          const weekday = d.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
          return weekday.startsWith(weekdays);
        }
        if (ev.date) {
          // Try to extract weekday from event.date string
          return ev.date.toLowerCase().includes(weekdays);
        }
        return false;
      });
    }
    if (eventFilterType) {
      filtered = filtered.filter(ev => {
        if (!ev.location) return false;
        if (eventFilterType === 'online') {
          return ev.location.toLowerCase().includes('online');
        }
        if (eventFilterType === 'in-person') {
          return !ev.location.toLowerCase().includes('online');
        }
        return true;
      });
    }
    if (category) {
      filtered = filtered.filter(ev => {
        if (!ev.title && !ev.description) return false;
        const cat = category.toLowerCase();
        return (ev.title && ev.title.toLowerCase().includes(cat)) || (ev.description && ev.description.toLowerCase().includes(cat));
      });
    }
    setFilteredEvents(filtered);
  };

  // Registration functions
  const handleEventRegistration = (event) => {
    setSelectedEventForRegistration(event);
    setShowRegistrationModal(true);
    setRegistrationMessage('');
    setPhoneNumber('');
  };

  const handleRegistrationSubmit = async () => {
    if (!phoneNumber.trim()) {
      setRegistrationMessage('Phone number is required');
      return;
    }

    setRegistering(true);
    try {
      // Try different token keys that might be stored
      const token = localStorage.getItem('token') || localStorage.getItem('userToken');
      if (!token) {
        setRegistrationMessage('Please login to register for events');
        return;
      }

      const registrationData = {
        phone_number: phoneNumber,
        payment_status: selectedEventForRegistration.type === 'FREE' ? 'completed' : 'pending',
        payment_method: selectedEventForRegistration.type === 'FREE' ? 'none' : 'gpay'
      };

      const response = await fetch(`http://127.0.0.1:8000/api/events/${selectedEventForRegistration.id}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();
      if (response.ok) {
        setRegistrationMessage('Successfully registered for the event!');
        setTimeout(() => {
          setShowRegistrationModal(false);
        }, 2000);
      } else {
        setRegistrationMessage(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationMessage('Failed to register. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const closeRegistrationModal = () => {
    setShowRegistrationModal(false);
    setSelectedEventForRegistration(null);
    setPhoneNumber('');
    setRegistrationMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-100 font-inter text-[#2C2C2C]">
      {/* Header Section */}
      <header className="bg-white shadow-sm py-4 px-6 md:px-12 flex justify-between items-center z-20 relative">
        <div className="text-2xl font-bold text-[#1F1D4F]">
          Event <span className="text-[#8A2BE2]">Hive</span>
        </div>
        <nav className="flex items-center space-x-4">
          <button 
            onClick={() => window.location.href = '/user/registered-events'}
            className="text-[#2C2C2C] font-semibold hover:text-[#8A2BE2] transition-all duration-200"
          >
            Registered Events
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

      {/* Hero Section with Integrated Filter Bar */}
      <section className="relative bg-black h-[600px] flex items-center justify-center text-white overflow-hidden">
        {/* Background Image/Overlay */}
        <img
          src={eventBg}
          alt="Event Audience"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        {/* Gradient Overlay for better contrast and design */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C2B6A] via-[#8A2BE2]/60 to-transparent mix-blend-multiply opacity-80"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center flex flex-col items-center justify-end h-full w-full pb-20">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-12 drop-shadow-lg text-white leading-tight"> {/* Added leading-tight for better line spacing */}
            MADE FOR THOSE <br /> WHO DO
          </h2>

          {/* Filter Bar integrated directly here */}
          <div className="bg-white p-4 rounded-2xl shadow-xl w-12/12 max-w-4xl flex flex-col md:flex-row items-end md:items-center md:space-y-0 md:space-x-4 mt-20"> {/* Adjusted items-end for label alignment */}
            <div className="flex-1 w-full">
              <label htmlFor="event-type" className="block text-gray-700 text-sm mb-1 font-semibold text-left">Looking for</label> {/* Label visible */}
              <select
                id="event-type"
                className="w-full p-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] font-semibold transition duration-200 ease-in-out appearance-none bg-no-repeat bg-right-center pr-10"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`, backgroundSize: '1.5rem', backgroundPosition: 'right 0.75rem center' }}
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="" className="text-gray-500">Choose event type</option>
                <option value="free" className="text-gray-800">Free</option>
                <option value="paid" className="text-gray-800">Paid</option>
              </select>
            </div>
            <div className="flex-1 w-full">
              <label htmlFor="location" className="block text-gray-700 text-sm mb-1 font-semibold text-left">Location</label> {/* Label visible */}
              <select
                id="location"
                className="w-full p-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] font-semibold transition duration-200 ease-in-out appearance-none bg-no-repeat bg-right-center pr-10"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E")`, backgroundSize: '1.5rem', backgroundPosition: 'right 0.75rem center' }}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="" className="text-gray-500">Choose location</option>
                <option value="online">Online</option>
                <option value="new york">New York</option>
                <option value="london">London</option>
                <option value="delhi">Delhi</option>
              </select>
            </div>
            <div className="flex-1 w-full">
              <label htmlFor="date-time" className="block text-gray-700 text-sm mb-1 font-semibold text-left">When</label> {/* Label visible */}
              <input
                type="date"
                id="date-time"
                className="w-full p-3 rounded-lg bg-gray-100 border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] font-semibold transition duration-200 ease-in-out"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                placeholder="Choose date and time"
              />
            </div>
            <button
              onClick={handleFilter}
              className="bg-[#8A2BE2] text-white p-3 rounded-[8px] mt-5 h-12 w-12 flex items-center justify-center shadow-md hover:bg-[#7a1bd1] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:ring-opacity-75 flex-shrink-0"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section (Padding adjusted) */}
      <section className="pt-16 pb-12 px-6 md:px-12 bg-gray-100">
        <div className="max-w-[1300px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h3 className="text-4xl font-extrabold text-[#2C2C2C] mb-4 md:mb-0">Upcoming <span className="text-[#8A2BE2]">Events</span></h3>
            <div className="flex flex-wrap gap-4">
              <select
                className="p-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] transition duration-200 ease-in-out"
                value={weekdays}
                onChange={(e) => { setWeekdays(e.target.value); setTimeout(handleFilter, 0); }}
              >
                <option value="">Weekdays</option>
                <option value="mon">Monday</option>
                <option value="tue">Tuesday</option>
                <option value="wed">Wednesday</option>
                <option value="thu">Thursday</option>
                <option value="fri">Friday</option>
                <option value="sat">Saturday</option>
                <option value="sun">Sunday</option>
              </select>
              <select
                className="p-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] transition duration-200 ease-in-out"
                value={eventFilterType}
                onChange={(e) => { setEventFilterType(e.target.value); setTimeout(handleFilter, 0); }}
              >
                <option value="">Event type</option>
                <option value="online">Online</option>
                <option value="in-person">In-person</option>
              </select>
              <select
                className="p-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] transition duration-200 ease-in-out"
                value={category}
                onChange={(e) => { setCategory(e.target.value); setTimeout(handleFilter, 0); }}
              >
                <option value="">Any category</option>
                <option value="tech">Tech</option>
                <option value="art">Art</option>
                <option value="music">Music</option>
                <option value="sport">Sport</option>
                <option value="food">Food</option>
              </select>
            </div>
          </div>

          {/* Events Grid or Loader/Error/No Events */}
          {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6B47DC]"></div>
                </div>
                ) : error ? (
                <div className="text-center text-red-600 font-bold text-xl py-12">{error}</div>
                ) : filteredEvents.length === 0 ? (
                <div className="text-center text-gray-500 font-bold text-xl py-12">No events found matching your criteria.</div>
                ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredEvents.map((event) => {
                      const imgSrc = event.image && typeof event.image === 'string' && event.image.startsWith('data:image')
                        ? event.image
                        : event.image || 'https://placehold.co/400x250/2C2B6A/FFFFFF?text=Event';
                      const title = event.title || 'Untitled Event';
                      const date = event.date || '';
                      const location = event.location || '';
                      const cost = event.type && event.type.toUpperCase() === 'FREE' ? 'FREE' : `${event.cost || 0} INR`;
                      const typeTagBgClass = event.type && event.type.toUpperCase() === 'FREE' ? 'bg-white text-[#8A2BE2] rounded-[8px]' : 'bg-white';
                      return (
                        <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer border border-[#e0d7f7]">
                          <div className="relative p-4">
                            <img src={imgSrc} alt={title} className="w-full h-48 object-cover p-2 rounded-[8px] border border-[#8A2BE2]/20" />
                            <span className={`absolute top-8 left-8 px-3 py-1 rounded-[8px] border border-[#8A2BE2] text-xs font-semibold text-[#8A2BE2] ${typeTagBgClass}`}>
                              {event.type ? event.type.toUpperCase() : 'N/A'}
                            </span>
                          </div>
                          <div className="p-5">
                            <h4 className="text-xl font-semibold text-gray-800 mb-2 truncate">{title}</h4>
                            <p className="text-sm text-[#8A2BE2] mb-1 font-medium">{date}</p>
                            <p className="text-sm text-gray-600 mb-4 truncate">{location}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-[#8A2BE2]">{cost}</span>
                              <button 
                                onClick={() => handleEventRegistration(event)}
                                className="rounded-[8px] border border-[#8A2BE2] bg-[#8A2BE2] text-white py-2 px-5 shadow-md hover:bg-[#7a1bd1] transition-all duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:ring-opacity-75"
                              >
                                {event.type && event.type.toUpperCase() === 'FREE' ? 'Register Now' : 'Book Now'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {hasMore && (
                    <div className="flex justify-center mt-12">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="bg-[#8A2BE2] text-white font-bold py-3 px-10 rounded-lg shadow-md hover:bg-[#7a1bd1] transition-all duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingMore ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Loading...
                          </span>
                        ) : (
                          'Load more...'
                        )}
                      </button>
                    </div>
                  )}
                </>
                )}
        </div>
      </section>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-[#8A2BE2] to-[#6B47DC] text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Register for Event</h2>
                  <p className="text-purple-100 text-sm mt-1">{selectedEventForRegistration?.title}</p>
                </div>
                <button
                  onClick={closeRegistrationModal}
                  className="text-white hover:text-gray-200 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  <strong>Event:</strong> {selectedEventForRegistration?.title}
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Type:</strong> {selectedEventForRegistration?.type}
                </p>
                <p className="text-gray-700 mb-4">
                  <strong>Cost:</strong> {selectedEventForRegistration?.type === 'FREE' ? 'FREE' : `₹${selectedEventForRegistration?.cost}`}
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:border-transparent"
                  required
                />
              </div>

              {selectedEventForRegistration?.type === 'PAID' && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 font-semibold mb-2">Payment Information</p>
                  <p className="text-blue-700 text-sm">
                    After registration, you will receive payment instructions via GPay to complete your booking.
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    <strong>Amount:</strong> ₹{selectedEventForRegistration?.cost}
                  </p>
                </div>
              )}

              {registrationMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  registrationMessage.includes('Successfully') 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {registrationMessage}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={closeRegistrationModal}
                  className="flex-1 py-3 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegistrationSubmit}
                  disabled={registering || !phoneNumber.trim()}
                  className="flex-1 py-3 px-4 bg-[#8A2BE2] text-white rounded-lg hover:bg-[#7a1bd1] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {registering ? 'Registering...' : 'Register'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default UserDashboard;