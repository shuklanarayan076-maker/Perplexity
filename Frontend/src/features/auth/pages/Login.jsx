import React, { useState } from 'react';
import { Link ,useNavigate} from 'react-router';
import { useAuth } from '../hook/useAuth';
import { useSelector } from 'react-redux';
import {Navigate} from "react-router"

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

const user = useSelector(state=> state.auth.user)
const loading = useSelector(state=> state.auth.loading)

  const {handleLogin} = useAuth();
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
     
    const payload = {
      email,
      password,
    }
    await handleLogin(payload)
    navigate('/')
  };

  if(!loading && user){
    return <Navigate to="/" replace/>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto p-10 rounded-3xl shadow-2xl border border-slate-700/50 bg-black/30 backdrop-blur-xl">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Sign in to your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-4 py-4 border border-slate-600/60 placeholder-slate-400 text-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:border-slate-400/70 bg-slate-800/60 backdrop-blur-xl transition-all duration-200 mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-4 py-4 border border-slate-600/60 placeholder-slate-400 text-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:border-slate-400/70 bg-slate-800/60 backdrop-blur-xl transition-all duration-200 mt-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md gradient-btn text-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 bg-slate-400/20"
              >
                Sign in
              </button>
            </div>
            <div className="text-center">
              <span className="text-sm text-slate-400">Don&apos;t have an account? </span>
              <Link to="/register" className="font-medium text-slate-200 hover:text-white transition-colors">Register</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;


