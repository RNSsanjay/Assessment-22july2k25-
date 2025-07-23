import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSignup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setFormMessage('');

    if (!name.trim()) {
      setNameError('Name cannot be empty.');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('Email cannot be empty.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email address is invalid.');
      isValid = false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}[\]:;<>,.?~\\/-]).{8,}$/;
    if (!password) {
      setPasswordError('Password cannot be empty.');
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      setPasswordError('Password must include uppercase, lowercase, number, and special character.');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormMessage(data.error || 'Admin signup failed');
        setIsLoading(false);
        return;
      }
      // Set adminToken cookie if token is returned
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        document.cookie = `adminToken=${data.token}; path=/; SameSite=Strict;`;
      }
      setFormMessage('Admin registered successfully!');
      navigate('/admin/login');
    } catch (err) {
      setFormMessage('Network error: ' + (err.message || 'An error occurred during admin signup'));
      console.error('Admin signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-inter">
      {/* Left Section - Welcome Back */}
      <div
        className="relative w-full md:w-2/5 bg-cover bg-center p-8 flex items-center justify-center group cursor-pointer"
        style={{ backgroundImage: "url('/src/assets/signup_img.svg')" }}
        onClick={() => navigate('/admin/login')}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-white text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Welcome back</h2>
          <p className="text-base md:text-lg mb-8 opacity-80">
            To keep connected with us provide us with your information
          </p>
          <button
            className="bg-white text-[#8A2BE2] font-semibold py-3 px-10 rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-300 text-lg opacity-0 group-hover:opacity-100 pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/admin/login');
            }}
            type="button"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Right Section - Admin Sign Up Form */}
      <div className="w-full md:w-3/5 bg-[#F5F5F7] p-8 md:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-xl font-bold mb-4 text-center">
            <span className="text-[#1b1515]">Event </span>
            <span className="text-[#8A2BE2]">Hive</span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-[#2C2C2C] mb-8 text-center">Sign Up to Event Hive</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-[#6C6C6C] text-sm font-bold mb-2 uppercase tracking-wide">
                YOUR Name
              </label>
              <input
                type="text"
                id="name"
                className={`w-full p-3 border ${nameError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] transition-all duration-200 text-gray-800 placeholder-gray-400`}
                placeholder="Enter your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError('');
                }}
                required
              />
              {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-[#6C6C6C] text-sm font-bold mb-2 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                id="email"
                className={`w-full p-3 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] transition-all duration-200 text-gray-800 placeholder-gray-400`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                required
              />
              {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-[#6C6C6C] text-sm font-bold mb-2 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                id="password"
                className={`w-full p-3 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] transition-all duration-200 text-gray-800 placeholder-gray-400`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                required
              />
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.
              </p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-[#6C6C6C] text-sm font-bold mb-2 uppercase tracking-wide">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className={`w-full p-3 border ${confirmPasswordError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] transition-all duration-200 text-gray-800 placeholder-gray-400`}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordError('');
                }}
                required
              />
              {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-[#8A2BE2] text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-[#7a1bd1] transform hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>
          {formMessage && (
            <p className={`mt-6 text-center text-sm ${formMessage.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
              {formMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
