import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  // State for search filters (placeholder)
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');

  // State for event filters (placeholder)
  const [weekdays, setWeekdays] = useState('');
  const [eventFilterType, setEventFilterType] = useState('');
  const [category, setCategory] = useState('');

  // Dummy event data to populate the cards
  const events = [
    {
      id: 1,
      image: 'https://placehold.co/400x250/8A2BE2/FFFFFF?text=Event+1',
      type: 'FREE',
      title: 'BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow',
      date: 'Saturday, March 19, 9:30PM',
      location: 'ONLINE EVENT - Attend anywhere',
      price: 'FREE',
    },
    {
      id: 2,
      image: 'https://placehold.co/400x250/2C2B6A/FFFFFF?text=Event+2',
      type: 'PAID',
      title: 'BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow',
      date: 'Saturday, March 19, 9:30PM',
      location: 'ONLINE EVENT - Attend anywhere',
      price: '359 INR',
    },
    {
      id: 3,
      image: 'https://placehold.co/400x250/8A2BE2/FFFFFF?text=Event+3',
      type: 'FREE',
      title: 'BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow',
      date: 'Saturday, March 19, 9:30PM',
      location: 'ONLINE EVENT - Attend anywhere',
      price: 'FREE',
    },
    {
      id: 4,
      image: 'https://placehold.co/400x250/2C2B6A/FFFFFF?text=Event+4',
      type: 'PAID',
      title: 'BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow',
      date: 'Saturday, March 19, 9:30PM',
      location: 'ONLINE EVENT - Attend anywhere',
      price: '359 INR',
    },
    {
      id: 5,
      image: 'https://placehold.co/400x250/8A2BE2/FFFFFF?text=Event+5',
      type: 'FREE',
      title: 'BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow',
      date: 'Saturday, March 19, 9:30PM',
      location: 'ONLINE EVENT - Attend anywhere',
      price: 'FREE',
    },
    {
      id: 6,
      image: 'https://placehold.co/400x250/2C2B6A/FFFFFF?text=Event+6',
      type: 'PAID',
      title: 'BestSeller Book Bootcamp -write, Market & Publish Your Book -Lucknow',
      date: 'Saturday, March 19, 9:30PM',
      location: 'ONLINE EVENT - Attend anywhere',
      price: '359 INR',
    },
  ];

  const handleSearch = () => {
    // Placeholder for search logic
    console.log('Searching with:', { eventType, location, dateTime });
  };

  return (
    <div className="min-h-screen bg-gray-100 font-inter text-[#2C2C2C]">
      {/* Header Section */}
      <header className="bg-white shadow-sm py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="text-2xl font-bold text-[#1F1D4F]">Event Hive</div>
        <nav className="flex items-center space-x-4">
          <span className="text-gray-700">Welcome, {user?.name}</span>
          <button 
            onClick={logout}
            className="bg-red-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-red-700 transition-all duration-300"
          >
            Logout
          </button>
        </nav>
      </header>

      {/* Hero Section with Search Bar */}
      <section className="relative bg-black h-[500px] flex items-center justify-center text-white overflow-hidden">
        {/* Background Image/Overlay */}
        <img
          src="https://placehold.co/1600x900/1F1D4F/FFFFFF?text=Event+Audience"
          alt="Event Audience"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div> {/* Gradient overlay */}

        {/* Hero Content */}
        <div className="relative z-10 text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-8 drop-shadow-lg">
            MADE FOR THOSE WHO DO
          </h2>
        </div>

        {/* Search Bar Container */}
        <div className="absolute bottom-[-60px] md:bottom-[-80px] z-20 bg-[#2C2B6A] p-6 md:p-8 rounded-2xl shadow-xl w-11/12 max-w-4xl flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="flex-1 w-full">
            <label htmlFor="event-type" className="block text-gray-300 text-sm mb-1">Looking for</label>
            <select
              id="event-type"
              className="w-full p-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              <option value="" className="text-gray-800 bg-white">Choose event type</option>
              <option value="conference" className="text-gray-800 bg-white">Conference</option>
              <option value="workshop" className="text-gray-800 bg-white">Workshop</option>
              <option value="webinar" className="text-gray-800 bg-white">Webinar</option>
            </select>
          </div>
          <div className="flex-1 w-full">
            <label htmlFor="location" className="block text-gray-300 text-sm mb-1">Location</label>
            <select
              id="location"
              className="w-full p-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="" className="text-gray-800 bg-white">Choose location</option>
              <option value="online" className="text-gray-800 bg-white">Online</option>
              <option value="london" className="text-gray-800 bg-white">London</option>
              <option value="new-york" className="text-gray-800 bg-white">New York</option>
            </select>
          </div>
          <div className="flex-1 w-full">
            <label htmlFor="date-time" className="block text-gray-300 text-sm mb-1">When</label>
            <input
              type="date"
              id="date-time"
              className="w-full p-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 UserDashboardearance-none"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-[#8A2BE2] text-white p-3 rounded-lg hover:bg-[#7a1bd1] transition-all duration-300 flex items-center justify-center w-full md:w-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="pt-32 pb-12 px-6 md:px-12 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h3 className="text-4xl font-extrabold text-[#2C2C2C] mb-4 md:mb-0">Upcoming <span className="text-[#8A2BE2]">Events</span></h3>
            <div className="flex flex-wrap gap-4">
              <select
                className="p-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2]"
                value={weekdays}
                onChange={(e) => setWeekdays(e.target.value)}
              >
                <option value="">Weekdays</option>
                <option value="mon">Monday</option>
                <option value="tue">Tuesday</option>
              </select>
              <select
                className="p-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2]"
                value={eventFilterType}
                onChange={(e) => setEventFilterType(e.target.value)}
              >
                <option value="">Event type</option>
                <option value="online">Online</option>
                <option value="in-person">In-person</option>
              </select>
              <select
                className="p-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2]"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Any category</option>
                <option value="tech">Tech</option>
                <option value="art">Art</option>
              </select>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                <div className="relative">
                  <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${event.type === 'FREE' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
                    {event.type}
                  </span>
                </div>
                <div className="p-5">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">{event.title}</h4>
                  <p className="text-sm text-gray-600 mb-1">{event.date}</p>
                  <p className="text-sm text-gray-600 mb-4">{event.location}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-[#8A2BE2]">{event.price}</span>
                    <button className="bg-[#8A2BE2] text-white py-2 px-5 rounded-lg shadow-md hover:bg-[#7a1bd1] transition-all duration-300 text-sm">
                      {event.type === 'FREE' ? 'Register Now' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer (Optional, can be added if needed) */}
      {/* <footer className="bg-gray-800 text-white py-8 text-center">
        <p>&copy; 2025 Event Hive. All rights reserved.</p>
      </footer> */}
    </div>
  );
};

export default UserDashboard;
