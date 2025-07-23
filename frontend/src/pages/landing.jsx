import React from 'react';
import { useNavigate } from 'react-router-dom';


// Main App component for the landing page
const App = () => {
  const navigate = useNavigate();

  // Function to handle card selection and navigate to login
  const handleCardSelection = (userType) => {
    if (userType === 'Admin') {
      navigate('/admin/login');
    } else if (userType === 'User') {
      navigate('/user/login');
    }
  };

  // Render the initial card selection screen
  const renderSelectionCards = () => (
    <>
      {/* Header Section */}
      <header className="text-center mb-10">
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#1F1D4F] mb-4 leading-tight">
          Event Management
        </h1>
        <p className="text-xl md:text-2xl text-gray-600">
          Your seamless event management solution.
        </p>
      </header>

      {/* User Type Selection Cards Container */}
      <div className="flex flex-col md:flex-row gap-8 w-full justify-center">

        {/* Admin Card */}
        <div className="flex-1 bg-[#2C2B6A] p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 cursor-pointer"
             onClick={() => handleCardSelection('Admin')}>
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Admin</h2>
          <p className="text-white text-opacity-80 text-center mb-8">
            Manage events, users, and system settings.
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); handleCardSelection('Admin'); }}
            className="w-full bg-[#8A2BE2] text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-[#7a1bd1] transform hover:-translate-y-1 transition-all duration-300 text-lg"
          >
            Continue as Admin
          </button>
        </div>

        {/* User Card */}
        <div className="flex-1 bg-[#2C2B6A] p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 cursor-pointer"
             onClick={() => handleCardSelection('User')}>
          <h2 className="text-3xl font-bold text-white mb-6 text-center">User</h2>
          <p className="text-white text-opacity-80 text-center mb-8">
            Browse events, register, and manage your bookings.
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); handleCardSelection('User'); }}
            className="w-full bg-[#8A2BE2] text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-[#7a1bd1] transform hover:-translate-y-1 transition-all duration-300 text-lg"
          >
            Continue as User
          </button>
        </div>
      </div>
    </>
  );

  return (
    // Main container for the entire page, centered and with a pleasant background inspired by the image
    <div className="min-h-screen bg-[#1F1D4F] flex items-center justify-center p-4 font-inter">
      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 max-w-4xl w-full flex flex-col items-center">

        {/* Only show the selection cards, navigation will handle the rest */}
        {renderSelectionCards()}

        {/* Footer or additional links - always visible */}
        <footer className="mt-10 text-center text-gray-600 text-md">
          <p>&copy; 2025 EventFlow. All rights reserved.</p>
          <p className="mt-2">
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> | <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
