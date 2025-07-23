import React, { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setMessage('Please enter a valid email address.');
      return;
    }
    // Placeholder for subscription logic
    setMessage(`Subscribing with: ${email}`);
    console.log('Subscribe Email:', email);
    setEmail(''); // Clear input after submission
    // In a real application, you would send this to your backend
  };

  return (
    <footer className="bg-[#1F1D4F] text-white py-12 px-6 md:px-12 font-inter">
      <div className="max-w-7xl mx-auto flex flex-col items-center"> {/* Centered content */}
        {/* Top Section: Logo and Subscription */}
        <div className="flex flex-col items-center mb-10 space-y-8 w-full"> {/* Centered and full width */}
          <div className="text-4xl font-bold text-white mb-6">Event <span className="text-[#8A2BE2]">Hive</span></div> {/* Adjusted margin */}
          <form className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full justify-center" onSubmit={handleSubscribe}> {/* Centered form */}
            <input
              type="email"
              placeholder="Enter your mail"
              className="p-3 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] w-full sm:w-80" // Increased width for input
              value={email}
              onChange={(e) => { setEmail(e.target.value); setMessage(''); }}
              required
            />
            <button
              type="submit"
              className="bg-[#8A2BE2] text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-[#7a1bd1] transition-all duration-300 w-full sm:w-auto"
            >
              Subscribe
            </button>
          </form>
        </div>
        {message && <p className="text-center text-sm mb-4">{message}</p>}

        {/* Middle Section: Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-10 text-lg font-medium"> {/* Already centered */}
          <a href="#" className="hover:text-[#8A2BE2] transition-colors duration-200">Home</a>
          <a href="#" className="hover:text-[#8A2BE2] transition-colors duration-200">About</a>
          <a href="#" className="hover:text-[#8A2BE2] transition-colors duration-200">Services</a>
          <a href="#" className="hover:text-[#8A2BE2] transition-colors duration-200">Get in touch</a>
          <a href="#" className="hover:text-[#8A2BE2] transition-colors duration-200">FAQs</a>
        </nav>

        {/* Separator Line */}
        <hr className="border-t border-gray-700 w-full mb-8" /> {/* Full width line */}

        {/* Bottom Section: Language, Social, Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 w-full"> {/* Full width */}
          {/* Language Selector */}
          <div className="flex space-x-2">
            <button className="bg-[#8A2BE2] text-white text-sm py-2 px-4 rounded-lg">English</button>
            <button className="text-gray-400 text-sm py-2 px-4 hover:text-white transition-colors duration-200">French</button>
            <button className="text-gray-400 text-sm py-2 px-4 hover:text-white transition-colors duration-200">Hindi</button>
          </div>

          {/* Social Media Icons */}
          <div className="flex space-x-6 text-2xl">
            <a href="#" className="hover:text-[#8A2BE2] transition-colors duration-200">
              {/* LinkedIn Icon */}
              <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="hover:text-[#8A2BE2] transition-colors duration-200">
              {/* Instagram Icon */}
              <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6">
                <path fillRule="evenodd" d="M12 0C8.74 0 8.333.014 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.723-2.126 1.39-.667.666-1.084 1.334-1.39 2.126-.297.765-.499 1.635-.56 2.913-.058 1.28-.072 1.67-.072 4.016s.014 2.737.072 4.016c.06 1.278.261 2.148.558 2.913.306.788.723 1.457 1.39 2.126.666.667 1.333 1.084 2.126 1.39.766.296 1.636.499 2.913.56 1.28.058 1.67.072 4.016.072s2.737-.014 4.016-.072c1.278-.06 2.148-.262 2.913-.558.788-.306 1.457-.723 2.126-1.39.667-.666 1.084-1.333 1.39-2.126.296-.766.499-1.636.56-2.913.058-1.28.072-1.67.072-4.016s-.014-2.737-.072-4.016c-.06-1.278-.262-2.148-.558-2.913-.306-.789-.723-1.459-1.39-2.126-.666-.667-1.333-1.084-2.126-1.39-.766-.297-1.636-.499-2.913-.56C15.26 0 14.87 0 12 0zm0 4.32a7.68 7.68 0 100 15.36 7.68 7.68 0 000-15.36zm0 2.32a5.36 5.36 0 110 10.72 5.36 5.36 0 010-10.72zm6.4-.96a1.28 1.28 0 100 2.56 1.28 1.28 0 000-2.56z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="hover:text-[#8A2BE2] transition-colors duration-200">
              {/* Facebook Icon */}
              <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.776-3.89 1.094 0 2.24.195 2.24.195v2.46h-1.262c-1.225 0-1.628.766-1.628 1.563V12h2.773l-.443 2.89h-2.33V22C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <p className="text-gray-400 text-sm">Non Copyrighted &copy; 2023 Upload by EventHive</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;