import React, { useState } from 'react';
import { Zap, Search, LogIn, UserPlus, Upload, Code } from 'lucide-react';
import './ToImage.css';

const ToImage = () => (
    <div className="flex-grow">
        {/* Reference Image Section */}
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">
                    • Reference Image
                </label>
                <span className="text-xs font-semibold text-orange-500">0/3</span>
            </div>

            {/* Upload Dropzone */}
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-10 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                <Upload size={32} className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                    Drag and drop images, or <span className="text-orange-500 font-semibold">click to select</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">(Max 3 images, 10MB each)</p>
            </div>
        </div>

        {/* Creative Prompt Section */}
        <label htmlFor="creative-prompt-image" className="block text-sm font-bold text-gray-700 mb-2">
            • Your Creative Prompt
        </label>
        <textarea
            id="creative-prompt-image"
            rows="4"
            placeholder="Cyberpunk futuristic city, neon lights, rainy streets, holographic..."
            className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-orange-500 focus:border-orange-500 text-gray-800 transition-shadow outline-none"
        ></textarea>

        {/* "Generate Now" Button (Gradient Style) */}
        <div className="mt-4">
            <button className="w-full font-bold py-3 rounded-xl transition-all duration-300 shadow-xl text-lg
                             bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-400 hover:to-orange-600
                             shadow-yellow-300/70 flex items-center justify-center">
                <Zap size={20} className="mr-2" /> Generate Now
            </button>
        </div>
    </div>
);
export default ToImage;