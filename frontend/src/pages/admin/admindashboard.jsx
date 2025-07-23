import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch events from backend
  const fetchEvents = async (pageNum = 1, append = false) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/events/?page=${pageNum}&limit=9`);
      const data = await response.json();
      
      if (response.ok) {
        if (append) {
          setEvents(prevEvents => [...prevEvents, ...data.events]);
        } else {
          setEvents(data.events);
        }
        setHasMore(data.pagination.has_more);
      } else {
        console.error('Failed to fetch events:', data.error);
        // Fallback to dummy data if API fails
        if (!append) {
          setEvents([
            {
              id: 1,
              image: 'https://placehold.co/400x250/2C2B6A/FFFFFF?text=Event+1',
              type: 'PAID',
              title: 'BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow',
              date: 'Saturday, March 18, 9.30PM',
              location: 'ONLINE EVENT - Attend anywhere',
            },
            {
              id: 2,
              image: 'https://placehold.co/400x250/8A2BE2/FFFFFF?text=Event+2',
              type: 'FREE',
              title: 'BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow',
              date: 'Saturday, March 18, 9.30PM',
              location: 'ONLINE EVENT - Attend anywhere',
            },
            {
              id: 3,
              image: 'https://placehold.co/400x250/2C2B6A/FFFFFF?text=Event+3',
              type: 'PAID',
              title: 'BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow',
              date: 'Saturday, March 18, 9.30PM',
              location: 'ONLINE EVENT - Attend anywhere',
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      // Fallback to dummy data on network error
      if (!append) {
        setEvents([
          {
            id: 1,
            image: 'https://placehold.co/400x250/2C2B6A/FFFFFF?text=Event+1',
            type: 'PAID',
            title: 'BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow',
            date: 'Saturday, March 18, 9.30PM',
            location: 'ONLINE EVENT - Attend anywhere',
          }
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

  return (
    <div className="min-h-screen bg-gray-100 font-inter text-[#2C2C2C]">
      {/* Header Section */}
      <header className="bg-white shadow-sm py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="text-2xl font-bold text-[#1F1D4F]">Event <span className="text-[#8A2BE2]">Hive</span></div>
        <button
          className="bg-[#8A2BE2] text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-[#7a1bd1] transition-all duration-300 text-lg focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] focus:ring-offset-2"
          onClick={() => navigate('/admin/create-event')}
        >
          + Create Event
        </button>
      </header>

      {/* Hero Section */}
      <section
        className="relative text-white py-16 px-6 md:px-12 overflow-hidden ml-35 mr-25 mt-10 rounded-[10px]"
      >
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
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-extrabold text-[#2C2C2C] mb-8">Listed Events</h3>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6B47DC]"></div>
            </div>
          ) : (
            <>
              {/* Events Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                  <div key={event.id} className="bg-[#F7F7F7] rounded-xl shadow-sm overflow-hidden transform hover:scale-105 transition-transform duration-300">
                    <div className="relative">
                      <img
                        src={event.image && event.image.startsWith('data:image') ? event.image : (event.image || 'https://placehold.co/400x250/2C2B6A/FFFFFF?text=Event')}
                        alt={event.title}
                        className="w-full h-48 object-cover rounded-t-xl"
                      />
                      <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-[#8A2BE2] text-white`}>
                        {event.type}
                      </span>
                    </div>
                    <div className="p-5">
                      <h4 className="text-xl font-bold text-[#2C2C2C] mb-2 leading-tight">{event.title}</h4>
                      <p className="text-sm text-[#8A2BE2] mb-1">{event.date}</p>
                      <p className="text-sm text-gray-600 mb-4">{event.location}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
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
    </div>
  );
};

export default AdminDashboard;
