'use client';
import React from 'react';
import { useState } from 'react';
import { Grid, Menu } from 'lucide-react';
import { Zap } from 'lucide-react';
import Image from 'next/image';
import Navbar from '../Navbar/Navbar';

// Mock data for the categories and showcase images
const CATEGORIES = ['All', 'Portrait', 'Landscape', 'Product', 'Creative', 'Anime'];

const MOCK_SHOWCASE = [
    { id: 1, category: 'Landscape', imageUrl: "https://placehold.co/400x500/6b7280/ffffff?text=Landscape%0A(Rock+Formation)", height: 500, prompt: "A dramatic rock formation at sunset." },
    { id: 2, category: 'Product', imageUrl: "https://placehold.co/400x350/ffffff/374151?text=Product%0A(Earbuds+on+White)", height: 350, prompt: "Wireless earbuds against a pristine white background." },
    { id: 3, category: 'Creative', imageUrl: "https://placehold.co/400x450/111827/d1d5db?text=Creative%0A(Aurora+Borealis)", height: 450, prompt: "Vibrant aurora borealis over a dark forest." },
    { id: 4, category: 'Portrait', imageUrl: "https://placehold.co/400x550/f97316/ffffff?text=Portrait%0A(Cinematic+Close-up)", height: 550, prompt: "Cinematic close-up portrait with deep shadow." },
    { id: 5, category: 'Anime', imageUrl: "https://placehold.co/400x300/4f46e5/ffffff?text=Anime%0A(Future+City+Scene)", height: 300, prompt: "Detailed anime style futuristic city street." },
    { id: 6, category: 'Landscape', imageUrl: "https://placehold.co/400x400/065f46/ffffff?text=Landscape%0A(Japanese+Garden)", height: 400, prompt: "Traditional Japanese garden with cherry blossoms." },
    { id: 7, category: 'Product', imageUrl: "https://placehold.co/400x480/fb923c/ffffff?text=Product%0A(Vintage+Camera)", height: 480, prompt: "A vintage film camera on a wooden desk." },
];

const ShowcaseDashboard = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const filteredShowcase = activeCategory === 'All'
        ? MOCK_SHOWCASE
        : MOCK_SHOWCASE.filter(item => item.category === activeCategory);

    return (
        <div>
        <Navbar/>
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="max-w-7xl mx-auto px-4 pt-8 pb-32">
                {/* Showcase Header/Hero Section (Light Yellow Background) */}
                <div className="bg-yellow-50 bg-opacity-80 rounded-3xl shadow-xl p-8 md:p-16 text-center mb-12 border border-yellow-200">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
                        <span className="text-orange-500">Showcase</span> Gallery
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Explore amazing image transformations created by our community using Nano Banana.
                    </p>
                    <button
                        
                        className="inline-flex items-center space-x-2 px-8 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-300 transition-colors hover:bg-orange-600"
                    >
                        <Zap size={20} />
                        <span>Try Now</span>
                    </button>
                </div>

                {/* Category Filters and View Toggle */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 p-4 bg-white rounded-xl shadow-md">
                    <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-0">
                        {CATEGORIES.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                                    activeCategory === category
                                        ? 'bg-yellow-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* View Toggles (Mock Functionality) */}
                    <div className="flex space-x-2">
                        <button className="p-2 border border-gray-300 rounded-lg text-orange-500 bg-orange-50 shadow-inner">
                            <Grid size={20} />
                        </button>
                        <button className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-100">
                            <Menu size={20} />
                        </button>
                    </div>
                </div>

                {/* Waterfall Gallery */}
                <div className="columns-2 md:columns-3 lg:columns-4 gap-6">
                    {filteredShowcase.map((item) => (
                        <div 
                            key={item.id} 
                            className="mb-6 break-inside-avoid-column bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer group relative overflow-hidden"
                        >
                            <Image
                                height={item.height}
                                width={400}
                                src={item.imageUrl}
                                alt={item.prompt}
                                className="w-full object-cover rounded-xl"
                                unoptimized
                            />
                            
                            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                {item.category}
                            </div>
                            
                            <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-end justify-center p-4">
                                <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 truncate w-full">
                                    {item.prompt}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </div>
    );
};

export default ShowcaseDashboard;
