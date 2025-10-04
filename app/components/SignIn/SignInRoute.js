'use client';
import React from 'react';
import { useState } from 'react';
import { Mail, Lock, User, LogIn } from 'lucide-react';
import Image from 'next/image';

const SignInPage = () => {
    // Mock state for form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Mock sign in function
    const handleSignIn = (e) => {
        e.preventDefault();
        alert(`Signing in with Email: ${email}`);
    };
    
    // Mock Google sign in function
    const handleGoogleSignIn = () => {
        alert('Signing in with Google...');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
            <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-3xl shadow-2xl shadow-gray-200 border border-gray-100 transform transition-all">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-500">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSignIn} className="space-y-6">
                    {/* Email Address Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-yellow-500 focus:border-yellow-500 transition-shadow outline-none text-gray-800"
                            />
                            <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-yellow-500 focus:border-yellow-500 transition-shadow outline-none text-gray-800"
                            />
                            <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* Sign In Button */}
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-yellow-300/50 text-base font-bold text-gray-900 bg-yellow-400 hover:bg-yellow-500 transition-colors duration-200"
                    >
                        Sign In
                    </button>
                </form>

                {/* Separator and Google Button */}
                <div className="mt-6 space-y-4">
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-2 text-gray-400 font-medium">OR</span>
                        <div className="absolute inset-x-0 top-1/2 border-t border-gray-200 -z-10" />
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <Image 
                            src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" 
                            height={20}
                            width={60}
                            alt="Google" 
                            className="w-5 h-5 mr-3" 
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/20x20/ffffff/374151?text=G"; }}
                        />
                        Sign in with Google
                    </button>
                </div>

                {/* Footer Links */}
                <div className="mt-8 text-center text-sm">
                    <a href="#" className="font-medium text-orange-500 hover:text-orange-600 transition-colors block mb-2">
                        Forgot password?
                    </a>
                    <p className="text-gray-500">
                        Don&apos;t have an account? 
                        <a href="#" className="font-medium text-orange-500 hover:text-orange-600 ml-1" onClick={() => setCurrentView('signUp')}>
                             Sign up here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
