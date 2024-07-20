import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState('signup');

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'signup' ? 'login' : 'signup'));
  };

  useEffect(() => {
    navigate(mode === 'signup' ? '/signup' : '/login');
  }, [mode, navigate]);

  const handleSignup = async () => {
    try {
      console.log(email, password);
      const response = await axios.post(`http://localhost:5000/auth/signup`, {
        userEmail: email,
        password: password,
      });
      console.log(response)
      navigate('/login');
    } catch (error) {
      toast.error('Signup error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen ">
      <nav className="bg-gray-800 w-full py-4 flex justify-center">
        <h1 className="text-white text-2xl">Welcome To HospitalityHub!</h1>
      </nav>
      <div className="container mx-auto mt-10 pt-12">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white shadow-lg rounded-lg p-8">
              <h2 className="text-2xl font-bold text-center mb-6">Signup</h2>
              <form>
                <div className="mb-4">
                  <label className="block text-gray-700">Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Password:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Confirm Password:</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSignup}
                  className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                  Signup
                </button>
                <p className="text-center mt-4">
                  {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
                  <span
                    className="text-blue-500 ml-1 cursor-pointer"
                    onClick={toggleMode}
                  >
                    {mode === 'signup' ? ' Login' : ' Signup'}
                  </span>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
