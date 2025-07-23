import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [eventTitle, setEventTitle] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [eventCost, setEventCost] = useState('');
  const [eventType, setEventType] = useState('FREE');
  const [eventCategory, setEventCategory] = useState('');
  const [eventImage, setEventImage] = useState(null);
  const [eventDescription, setEventDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [eventTitleError, setEventTitleError] = useState('');
  const [eventVenueError, setEventVenueError] = useState('');
  const [startTimeError, setStartTimeError] = useState('');
  const [endTimeError, setEndTimeError] = useState('');
  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');
  const [eventCostError, setEventCostError] = useState('');
  const [eventCategoryError, setEventCategoryError] = useState('');
  const [eventDescriptionError, setEventDescriptionError] = useState('');
  const [eventImageError, setEventImageError] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Convert image file to base64
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventImage(reader.result);
        setEventImageError('');
      };
      reader.readAsDataURL(file);
    } else {
      setEventImage(null);
    }
  };

  // Generate description using Gemini API
  const generateDescription = async () => {
    if (!eventTitle.trim() || !eventVenue.trim()) {
      setFormMessage('Please provide event title and venue to generate description.');
      return;
    }
    setIsGenerating(true);
    setFormMessage('');

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDrXQHPIsXtE-hu4xdHQPXOoc_ypKVvAhA', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate a concise and engaging event description (100-150 words) for an event titled "${eventTitle}" held at "${eventVenue}". The event is ${eventType.toLowerCase()}. Include details that make the event appealing and highlight its unique aspects.`
                }
              ]
            }
          ]
        }),
      });

      const data = await response.json();
      if (response.ok && data.candidates && data.candidates[0].content) {
        const generatedText = data.candidates[0].content.parts[0].text;
        setEventDescription(generatedText);
        setEventDescriptionError('');
      } else {
        setFormMessage('Failed to generate description. Please try again.');
      }
    } catch (error) {
      console.error('Error generating description:', error);
      setFormMessage('Failed to connect to AI service. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const validateForm = () => {
    let isValid = true;

    setEventTitleError('');
    setEventVenueError('');
    setStartTimeError('');
    setEndTimeError('');
    setStartDateError('');
    setEndDateError('');
    setEventCostError('');
    setEventCategoryError('');
    setEventDescriptionError('');
    setEventImageError('');
    setFormMessage('');

    if (!eventTitle.trim()) {
      setEventTitleError('Event title is required.');
      isValid = false;
    }
    if (!eventVenue.trim()) {
      setEventVenueError('Event venue is required.');
      isValid = false;
    }
    if (!startTime) {
      setStartTimeError('Start time is required.');
      isValid = false;
    }
    if (!endTime) {
      setEndTimeError('End time is required.');
      isValid = false;
    }
    if (!startDate) {
      setStartDateError('Start date is required.');
      isValid = false;
    }
    if (!endDate) {
      setEndDateError('End date is required.');
      isValid = false;
    }
    if (eventType === 'PAID') {
      if (!eventCost.toString().trim()) {
        setEventCostError('Event cost is required for paid events.');
        isValid = false;
      } else if (isNaN(parseFloat(eventCost)) || parseFloat(eventCost) <= 0) {
        setEventCostError('Event cost must be a positive number for paid events.');
        isValid = false;
      }
    } else {
      // FREE event, cost is not required and not sent
      setEventCost('');
      setEventCostError('');
    }
    if (!eventCategory.trim()) {
      setEventCategoryError('Event category is required.');
      isValid = false;
    }
    if (!eventDescription.trim()) {
      setEventDescriptionError('Event description is required.');
      isValid = false;
    }
    if (!eventImage) {
      setEventImageError('Event image is required.');
      isValid = false;
    }

    // Validate date and time
    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);
      if (endDateTime <= startDateTime) {
        setEndDateError('End date and time must be after start date and time.');
        isValid = false;
      }
    } catch {
      setFormMessage('Invalid date or time format.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormMessage('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setFormMessage('Please login to create events.');
        setIsLoading(false);
        return;
      }

      const eventData = {
        eventTitle: eventTitle.trim(),
        eventVenue: eventVenue.trim(),
        startTime,
        endTime,
        startDate,
        endDate,
        eventDescription: eventDescription.trim(),
        eventImage,
        type: eventType,
        category: eventCategory,
      };
      if (eventType === 'PAID') {
        eventData.eventCost = parseFloat(eventCost);
      }

      const response = await fetch('http://127.0.0.1:8000/api/events/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (response.ok) {
        setFormMessage('Event created successfully!');
        setEventTitle('');
        setEventVenue('');
        setStartTime('');
        setEndTime('');
        setStartDate('');
        setEndDate('');
        setEventCost('');
        setEventImage(null);
        setEventDescription('');
        setEventType('FREE');
        setEventCategory('');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1200);
      } else {
        setFormMessage(data.error || 'Failed to create event. Please try again.');
      }
    } catch (error) {
      setFormMessage('Failed to create event. Could not connect to the server.');
      console.error('Create event error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f5f7] to-[#e0d7f7] font-inter">
      {/* Navbar (copied from AdminDashboard) */}
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
        </nav>
      </header>
      {/* End Navbar */}
      <div className="flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-16 w-full max-w-3xl relative">
        <button
          type="button"
          className="absolute top-6 left-6 flex items-center gap-2 text-[#8A2BE2] font-bold text-lg hover:underline hover:text-[#6a1bb1] transition-all duration-200"
          onClick={() => navigate(-1)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h2 className="text-4xl font-extrabold text-[#2C2C2C] text-center mb-12 tracking-tight">Create Event</h2>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="event-title" className="block text-gray-700 text-base font-bold mb-2">Event Title</label>
            <input
              type="text"
              id="event-title"
              className={`w-full p-4 border ${eventTitleError ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] text-gray-800 placeholder-gray-400 font-semibold text-lg`}
              placeholder="Enter event title"
              value={eventTitle}
              onChange={(e) => { setEventTitle(e.target.value); setEventTitleError(''); }}
              required
            />
            {eventTitleError && <p className="text-red-500 text-sm mt-1 font-semibold">{eventTitleError}</p>}
          </div>

          <div>
            <label htmlFor="event-venue" className="block text-gray-700 text-base font-bold mb-2">Event Venue</label>
            <input
              type="text"
              id="event-venue"
              className={`w-full p-4 border ${eventVenueError ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] text-gray-800 placeholder-gray-400 font-semibold text-lg`}
              placeholder="Enter venue address"
              value={eventVenue}
              onChange={(e) => { setEventVenue(e.target.value); setEventVenueError(''); }}
              required
            />
            {eventVenueError && <p className="text-red-500 text-sm mt-1 font-semibold">{eventVenueError}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="start-time" className="block text-gray-700 text-base font-bold mb-2">Start Time</label>
              <input
                type="time"
                id="start-time"
                className={`w-full p-4 border ${startTimeError ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] text-gray-800 placeholder-gray-400 font-semibold text-lg`}
                value={startTime}
                onChange={(e) => { setStartTime(e.target.value); setStartTimeError(''); }}
                required
              />
              {startTimeError && <p className="text-red-500 text-sm mt-1 font-semibold">{startTimeError}</p>}
            </div>
            <div>
              <label htmlFor="end-time" className="block text-gray-700 text-base font-bold mb-2">End Time</label>
              <input
                type="time"
                id="end-time"
                className={`w-full p-4 border ${endTimeError ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] text-gray-800 placeholder-gray-400 font-semibold text-lg`}
                value={endTime}
                onChange={(e) => { setEndTime(e.target.value); setEndTimeError(''); }}
                required
              />
              {endTimeError && <p className="text-red-500 text-sm mt-1 font-semibold">{endTimeError}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="start-date" className="block text-gray-700 text-base font-bold mb-2">Start Date</label>
              <input
                type="date"
                id="start-date"
                className={`w-full p-4 border ${startDateError ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] text-gray-800 placeholder-gray-400 font-semibold text-lg`}
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setStartDateError(''); setEndDateError(''); }}
                required
              />
              {startDateError && <p className="text-red-500 text-sm mt-1 font-semibold">{startDateError}</p>}
            </div>
            <div>
              <label htmlFor="end-date" className="block text-gray-700 text-base font-bold mb-2">End Date</label>
              <input
                type="date"
                id="end-date"
                className={`w-full p-4 border ${endDateError ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] text-gray-800 placeholder-gray-400 font-semibold text-lg`}
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setEndDateError(''); }}
                required
              />
              {endDateError && <p className="text-red-500 text-sm mt-1 font-semibold">{endDateError}</p>}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-base font-bold mb-2">Event Type</label>
            <div className="flex gap-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="event-type"
                  value="FREE"
                  checked={eventType === 'FREE'}
                  onChange={(e) => {
                    setEventType(e.target.value);
                    setEventCost('0');
                    setEventCostError('');
                  }}
                  className="mr-2"
                />
                Free
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="event-type"
                  value="PAID"
                  checked={eventType === 'PAID'}
                  onChange={(e) => {
                    setEventType(e.target.value);
                    setEventCost('');
                  }}
                  className="mr-2"
                />
                Paid
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="event-cost" className="block text-gray-700 text-base font-bold mb-2">Event Cost</label>
            <input
              type="number"
              id="event-cost"
              className={`w-full p-4 border ${eventCostError ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] text-gray-800 placeholder-gray-400 font-semibold text-lg`}
              placeholder="Enter the cost of the event in INR"
              value={eventCost}
              onChange={(e) => { setEventCost(e.target.value); setEventCostError(''); }}
              disabled={eventType === 'FREE'}
              required
            />
            {eventCostError && <p className="text-red-500 text-sm mt-1 font-semibold">{eventCostError}</p>}
          </div>

          <div>
            <label htmlFor="event-category" className="block text-gray-700 text-base font-bold mb-2">Event Category</label>
            <select
              id="event-category"
              className={`w-full p-4 border ${eventCategoryError ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] text-gray-800 font-semibold text-lg`}
              value={eventCategory}
              onChange={(e) => { setEventCategory(e.target.value); setEventCategoryError(''); }}
              required
            >
              <option value="">Select a category</option>
              <option value="business">Business & Professional</option>
              <option value="technology">Technology</option>
              <option value="education">Education & Learning</option>
              <option value="health">Health & Wellness</option>
              <option value="entertainment">Entertainment</option>
              <option value="sports">Sports & Fitness</option>
              <option value="arts">Arts & Culture</option>
              <option value="networking">Networking</option>
              <option value="food">Food & Drink</option>
              <option value="travel">Travel & Tourism</option>
              <option value="charity">Charity & Non-profit</option>
              <option value="other">Other</option>
            </select>
            {eventCategoryError && <p className="text-red-500 text-sm mt-1 font-semibold">{eventCategoryError}</p>}
          </div>

          <div>
            <label htmlFor="event-image" className="block text-gray-700 text-base font-bold mb-2">Event Image</label>
            <div className={`flex flex-col items-center justify-center h-56 border-2 ${eventImageError ? 'border-red-500' : 'border-dashed border-gray-300'} rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200`}>
              <input
                type="file"
                id="event-image"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <label htmlFor="event-image" className="flex flex-col items-center justify-center h-full w-full cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-gray-500 mt-2 font-semibold">Upload Here</p>
                {eventImage && (
                  <>
                    <img src={eventImage} alt="Preview" className="mt-2 h-24 rounded-lg object-contain border" />
                    <p className="text-gray-700 text-sm mt-1 font-semibold">Image selected</p>
                  </>
                )}
              </label>
            </div>
            {eventImageError && <p className="text-red-500 text-sm mt-1 font-semibold">{eventImageError}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="event-description" className="block text-gray-700 text-base font-bold">Event Description</label>
              <button
                type="button"
                onClick={generateDescription}
                className="bg-[#8A2BE2] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-[#7a1bd1] transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </span>
                ) : (
                  'Generate with AI'
                )}
              </button>
            </div>
            <textarea
              id="event-description"
              rows="6"
              className={`w-full p-4 border ${eventDescriptionError ? 'border-red-500' : 'border-gray-300'} rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] text-gray-800 placeholder-gray-400 resize-y font-semibold text-lg`}
              placeholder="Type here or use AI to generate..."
              value={eventDescription}
              onChange={(e) => { setEventDescription(e.target.value); setEventDescriptionError(''); }}
              required
            ></textarea>
            {eventDescriptionError && <p className="text-red-500 text-sm mt-1 font-semibold">{eventDescriptionError}</p>}
          </div>

          {formMessage && (
            <p className={`text-center text-base font-bold ${formMessage.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
              {formMessage}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-[#320ed4] text-white font-extrabold py-4 px-8 rounded-2xl shadow-lg hover:bg-[#7a1bd1] transform hover:-translate-y-1 transition-all duration-300 text-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-6 w-6 text-white mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Create Event'
            )}
          </button>
        </form>
      </div>
    
    </div>
      <Footer />
    </div>
  );
};

export default CreateEvent;