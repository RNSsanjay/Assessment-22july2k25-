import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Logout handler
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const fetchEvents = async (pageNum = 1, append = false) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No admin token found');
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/admin/events/?page=${pageNum}&limit=9`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        if (append) {
          setEvents(prevEvents => [...prevEvents, ...data.events]);
        } else {
          setEvents(data.events);
        }
        setHasMore(data.pagination ? data.pagination.has_more : false);
      } else {
        console.error('Failed to fetch events:', data.error);
        if (!append) {
          setEvents([
            {
              id: '1',
              image: 'https://placehold.co/400x250/2C2B6A/FFFFFF?text=Event+1',
              type: 'PAID',
              title: 'BestSeller Book Bootcamp - Write, Market & Publish Your Book - Lucknow',
              date: 'Saturday, March 18, 9:30PM',
              location: 'ONLINE EVENT - Attend anywhere',
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      if (!append) {
        setEvents([
          {
            id: '1',
            image: 'https://placehold.co/400x250/2C2B6A/FFFFFF?text=Event+1',
            type: 'PAID',
            title: 'BestSeller Book Bootcamp - Write, Market & Publish Your Book - Lucknow',
            date: 'Saturday, March 18, 9:30PM',
            location: 'ONLINE EVENT - Attend anywhere',
          },
        ]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchEvents(nextPage, true);
  };

  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    setShowParticipantsModal(true);
    setLoadingParticipants(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://127.0.0.1:8000/api/events/${event.id}/participants/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      if (response.ok) {
        setParticipants(data.participants || []);
      } else {
        console.error('Failed to fetch participants:', data.error);
        setParticipants([]);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      setParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const closeModal = () => {
    setShowParticipantsModal(false);
    setSelectedEvent(null);
    setParticipants([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-inter text-[#2C2C2C]">
      {/* Navbar */}
      <header className="bg-white shadow-sm py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="text-2xl font-bold text-[#1F1D4F]">
          Event <span className="text-[#8A2BE2]">Hive</span>
        </div>
        <nav className="flex gap-6">
          <button
            className="text-[#2C2C2C] font-semibold hover:text-[#8A2BE2] transition-all duration-200"
            onClick={() => navigate('/admin/dashboard')}
          >
            Dashboard
          </button>
          <button
            className="text-[#2C2C2C] font-semibold hover:text-[#8A2BE2] transition-all duration-200"
            onClick={() => navigate('/admin/create-event')}
          >
            Create Event
          </button>
          <button
            className="text-[#2C2C2C] font-semibold hover:text-red-600 transition-all duration-200 border-l pl-6 ml-6"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative text-white py-16 px-6 md:px-12 overflow-hidden mx-4 md:mx-25 mt-10 rounded-[10px]">
        <img
          src="/src/assets/discoverbg.svg"
          alt="Discover Background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-black opacity-40 z-10"></div>
        <div className="relative z-20 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-white drop-shadow-lg">
              Discover and experience <br /> extraordinary Events
            </h2>
            <p className="text-lg opacity-95 mb-6 drop-shadow">
              Enter in the world of events. Discover now the latest Events or start creating your own!
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              <button
                className="bg-white text-[#8A2BE2] font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-gray-100 transition-all duration-300 text-lg focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:ring-offset-2"
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              >
                Discover now
              </button>
              <button
                className="border border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-[#8A2BE2] transition-all duration-300 text-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                onClick={() => window.open('https://www.youtube.com/results?search_query=event+management', '_blank')}
              >
                Watch Video
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Listed Events Section */}
      <section className="py-12 px-6 md:px-12 bg-gray-100">
        <div className="max-w-[1380px] mx-auto">
          <h3 className="text-3xl font-extrabold text-[#2C2C2C] mb-8">Listed Events</h3>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6B47DC]"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => {
                  const imgSrc = event.image && typeof event.image === 'string' && event.image.startsWith('data:image')
                    ? event.image
                    : event.image_url || 'https://placehold.co/400x250/2C2B6A/FFFFFF?text=Event';
                  const title = event.title || 'Untitled Event';
                  const date = event.date || '';
                  const location = event.location || '';
                  const cost = event.type && event.type.toUpperCase() === 'FREE' ? 'FREE' : `${event.cost || 0} INR`;
                  const typeTagBgClass = event.type && event.type.toUpperCase() === 'FREE' ? 'bg-white text-[#8A2BE2] rounded-[8px]' : 'bg-white';
                  return (
                    <div 
                      key={event.id} 
                      className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer border border-[#8A2BE2]/20"
                      onClick={() => handleEventClick(event)}
                    >
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
                        
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div className="text-center mt-12">
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

      {/* Participants Modal */}
      {showParticipantsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-[#8A2BE2] to-[#6B47DC] text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Event Participants</h2>
                  <p className="text-purple-100 mt-1">{selectedEvent?.title}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingParticipants ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8A2BE2]"></div>
                </div>
              ) : participants.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                  <p className="text-gray-500 text-lg">No participants registered yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Total Participants: {participants.length}
                    </h3>
                  </div>
                  
                  <div className="grid gap-4">
                    {participants.map((participant) => (
                      <div key={participant.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{participant.user_name}</h4>
                            <p className="text-gray-600 text-sm">{participant.user_email}</p>
                            {participant.phone_number && (
                              <p className="text-gray-600 text-sm">📞 {participant.phone_number}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-2">
                              Registered: {new Date(participant.registration_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              participant.payment_status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : participant.payment_status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {participant.payment_status}
                            </span>
                            {participant.payment_method && participant.payment_method !== 'none' && (
                              <p className="text-gray-500 text-xs mt-1">
                                via {participant.payment_method}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

       <Footer />
    </div>
  );
};

export default AdminDashboard;