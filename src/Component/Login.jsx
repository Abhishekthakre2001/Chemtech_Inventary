// src/components/ChemtechLogin.jsx
import React, { useState, useEffect ,useContext  } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";
import toast, { Toaster } from 'react-hot-toast';
import Logo from '../assets/logo.webp';

const Login = () => {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}login/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.status === "success") {
        login(result.user, result.token);
        setIsLoading(false);
        navigate("/dashboard");
      } else {
        setIsLoading(false);
        toast.error("Login failed. Please try again.");
      }
    } catch (error) {
      setIsLoading(false);
      toast.error("Network error. Please try again.");
    }
  };


  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard"); // already logged in → skip login
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Toaster />
      <div className="w-full  bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Section - Branding */}
        <div className="md:w-2/5 hidden lg:flex bg-gradient-to-br from-blue-700 to-blue-900 text-white p-10  flex-col">
          <div className="mb-10">
            <div className="flex items-center">
              <div className="bg-blue-500 rounded-xl w-16 h-16 flex items-center justify-center mr-4">
                <FlaskIcon className="text-white w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold">Chemtech Engineers</h1>
            </div>
            <p className="text-blue-200 mt-2">Chemical Industry Inventory Solutions</p>
          </div>
          
          <div className="space-y-8 mt-10">
            <div className="flex items-start">
              <div className="bg-blue-500/30 p-3 rounded-lg mr-4">
                <BeakerIcon className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Inventory Management</h3>
                <p className="text-blue-200 mt-1">Track chemical stocks with precision</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-500/30 p-3 rounded-lg mr-4">
                <ChartIcon className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Real-time Analytics</h3>
                <p className="text-blue-200 mt-1">Monitor usage patterns and trends</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-blue-500/30 p-3 rounded-lg mr-4">
                <SafetyIcon className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Safety Compliance</h3>
                <p className="text-blue-200 mt-1">Ensure regulatory requirements are met</p>
              </div>
            </div>
          </div>
          
          <div className="mt-auto pt-10">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                <UserIcon className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <p className="font-medium">Need an account?</p>
                <a href="#" className="text-blue-300 hover:text-white underline">Contact our sales team</a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Section - Login Form */}
        <div className="md:w-3/5 p-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Sign in to your Chemtech Engineers account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Username"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-blue-500" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-500 hover:text-blue-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500 hover:text-blue-600" />
                  )}
                </div>
              </div>
              {/*
              <div className="flex justify-end mt-2">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800">Forgot password?</a>
              </div>
                */}
            </div>
            {/*
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
            </div>
             */}
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white shadow-lg transition-all ${
                isLoading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Secure chemical inventory management</span>
            </div>
           
          </div>
           <div className="flex justify-center">
                <img src={Logo} alt="Chemtech Logo" className="h-12" />
            </div>
        </div>
      </div>
    </div>
  );
};

// Icon Components
const FlaskIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.9 15.5c.2.4.1.9-.2 1.2l-3.1 3.1c-.3.3-.8.4-1.2.2-.1-.1-.3-.2-.4-.3-.8-1-1.7-1.8-2.7-2.5-1.6-1.1-3.3-1.9-5.1-2.3-1.1-.3-2.1-.4-3.1-.4H2v-2h1.1c1.1 0 2.1-.1 3.1-.4 1.8-.4 3.5-1.2 5.1-2.3 1-.7 1.9-1.5 2.7-2.5.1-.1.3-.2.4-.3.4-.2.9-.1 1.2.2l3.1 3.1c.3.3.4.8.2 1.2-.1.1-.2.3-.3.4-.8 1-1.7 1.8-2.7 2.5-1.6 1.1-3.3 1.9-5.1 2.3-1.1.3-2.1.4-3.1.4h-.9v2h.9c1.1 0 2.1.1 3.1.4 1.8.4 3.5 1.2 5.1 2.3 1 .7 1.9 1.5 2.7 2.5.1.1.2.3.3.4zM7 8c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
  </svg>
);

const BeakerIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.8 18.4L14 10.7V6h1c.6 0 1-.4 1-1s-.4-1-1-1H9c-.6 0-1 .4-1 1s.4 1 1 1h1v4.7l-5.8 7.7c-.3.4-.2 1 .2 1.3.4.3 1 .2 1.3-.2l5.3-7.1 5.3 7.1c.2.2.4.3.7.3.2 0 .4-.1.6-.2.4-.3.5-.9.2-1.3z"/>
  </svg>
);

const ChartIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 19h14c.6 0 1 .4 1 1s-.4 1-1 1H5c-.6 0-1-.4-1-1s.4-1 1-1zm1.4-12.2c.4-.4 1-.4 1.4 0l3.3 3.3 5.3-5.3c.4-.4 1-.4 1.4 0s.4 1 0 1.4l-6 6c-.2.2-.4.3-.7.3-.3 0-.5-.1-.7-.3L7 8.4l-2.3 2.3c-.4.4-1 .4-1.4 0s-.4-1 0-1.4l3-3z"/>
  </svg>
);

const SafetyIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4zm7 10c0 4.3-2.9 8.8-7 9.9-4.1-1.1-7-5.6-7-9.9V6.3l7-3.1 7 3.1V11z"/>
    <path d="M11 14.4l-2.3-2.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l3 3c.2.2.4.3.7.3s.5-.1.7-.3l5-5c.4-.4.4-1 0-1.4s-1-.4-1.4 0L11 14.4z"/>
  </svg>
);

const UserIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z"/>
  </svg>
);

const MailIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

const LockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 8h-1V6c0-2.8-2.2-5-5-5S7 3.2 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.7 1.3-3 3-3s3 1.3 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
  </svg>
);

const EyeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5zM12 17c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"/>
  </svg>
);

const EyeOffIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.8 8.2c-2 .3-3.5 2-3.5 4 0 2.2 1.8 4 4 4 2 0 3.7-1.5 4-3.5l-2.5-.5c-.3.9-1.1 1.5-2 1.5-1.1 0-2-.9-2-2 0-.9.6-1.7 1.5-2l-.5-2.5zM12 4.5C7 4.5 2.7 7.6 1 12c.9 2.3 2.5 4.2 4.6 5.6l1.4-1.4C5.2 14.8 4.2 13.5 3.5 12c1.4-3.6 5-6 8.5-6s7.1 2.4 8.5 6c-.7 1.5-1.7 2.8-2.9 3.8l1.4 1.4c2.1-1.4 3.7-3.3 4.6-5.6-1.7-4.4-6-7.5-11-7.5z"/>
    <path d="M21.7 2.3L2.3 21.7l1.4 1.4L23.1 3.7z"/>
  </svg>
);

export default Login;