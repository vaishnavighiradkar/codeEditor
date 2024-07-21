import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'signup' ? 'login' : 'signup'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        const response = await axios.post('http://localhost:5000/auth/login', {
          userEmail: email,
          password: password,
        });
        localStorage.setItem('token', response.data.token);
        navigate('/'); // Redirect to home page on successful login
      } else {
        await axios.post('http://localhost:5000/auth/signup', {
          userEmail: email,
          password: password,
        });
        toast.success('Signup successful');
        setMode('login');
      }
    } catch (error) {
      toast.error('Error occurred');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-gray-800 w-full py-4 flex justify-center">
        <h1 className="text-white text-2xl">Welcome To CodeEditor!</h1>
      </nav>
      <div className="container mx-auto mt-10 pt-32">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white shadow-lg rounded-lg p-8">
              <h2 className="text-2xl font-bold text-center mb-6">{mode === 'login' ? 'Login' : 'Signup'}</h2>
              <form onSubmit={handleSubmit}>
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
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                  {mode === 'login' ? 'Login' : 'Signup'}
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

export default Login;
