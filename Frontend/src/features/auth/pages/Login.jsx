import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../hook/useAuth';
import { useSelector } from 'react-redux';
import { Navigate } from "react-router";
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import ContinueWithGoogle from '../components/ContinueWithGoogle';


const Login = () => {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');

    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)

    const { handleLogin } = useAuth();
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

    if (!loading && user) {
        return <Navigate to="/" replace />
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-secondary p-4 font-sans selection:bg-accent/30">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-110 z-10"
            >
                <div className="glass-morphism p-8 md:p-10 rounded-4xl shadow-2xl space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-accent/50 to-transparent" />
                    
                    <div className="text-center space-y-2">
                        <motion.h2 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl font-semibold tracking-tight text-white"
                        >
                            Welcome Back
                        </motion.h2>
                        <p className="text-text-muted text-sm">
                            Enter your credentials to access your threads
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-text-muted ml-1">
                                    Email address
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent transition-colors" />
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50 text-white placeholder:text-text-muted/50 transition-all"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label htmlFor="password" className="text-sm font-medium text-text-muted">
                                        Password
                                    </label>
                                    <a href="#" className="text-xs text-accent hover:text-accent-hover transition-colors">Forgot?</a>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent transition-colors" />
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50 text-white placeholder:text-text-muted/50 transition-all"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-accent hover:bg-accent-hover text-bg-secondary font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-xl shadow-accent/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </motion.button>
                    </form>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-text-muted text-xs">or</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    <ContinueWithGoogle />

                    <div className="text-center pt-2">
                        <p className="text-text-muted text-sm">
                            Don&apos;t have an account?{" "}
                            <Link to="/register" className="text-white font-medium hover:text-accent transition-colors">
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;


