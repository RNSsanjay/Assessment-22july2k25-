import React, { useState } from 'react';

const Navbar = () => {
  // State for search input (placeholder)
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Implement your search logic here
  };

  return (
    <nav className="bg-white shadow-sm py-4 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center font-inter">
      {/* Left Section: Logo */}
      <div className="text-2xl font-bold text-[#1F1D4F] mb-4 md:mb-0">Event <span className="text-[#8A2BE2]">Hive</span></div>

      {/* Middle Section: Search Bar (appears centered on larger screens) */}
      <form className="flex items-center w-full md:w-auto mb-4 md:mb-0" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search events..."
          className="p-2 pl-4 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] w-full md:w-64 text-gray-800"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="bg-[#8A2BE2] text-white p-2 rounded-r-lg hover:bg-[#7a1bd1] transition-all duration-300 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {/* Right Section: Login/Signup Buttons */}
      <div className="flex items-center space-x-4">
        <button className="text-gray-700 hover:text-[#8A2BE2] font-medium py-2 px-4 rounded-lg transition-colors duration-200">Login</button>
        <button className="bg-[#8A2BE2] text-white py-2 px-6 rounded-lg shadow-md hover:bg-[#7a1bd1] transition-all duration-300">Signup</button>
      </div>
    </nav>
  );
}; 

export default Navbar;
