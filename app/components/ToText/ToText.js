'use client';

import React, { useState } from 'react';
import { Zap, Search, LogIn, UserPlus, Upload, Code } from 'lucide-react';
import './ToText.css';

const ToText = () => {
    const [prompt, setPrompt] = useState(5);
    function prompting(){
        if(prompt>0){
            setPrompt(prompt-1);
        } else{
            alert("You have no credits left. Please purchase more to continue generating images.");
        }
    }
    return (
    <div className="flex-grow">
        <label htmlFor="creative-prompt-text" className="block text-sm font-bold text-gray-700 mb-2">
            • Your Creative Prompt
        </label>
        <textarea
            id="creative-prompt-text"
            rows="4"
            placeholder="Cyberpunk futuristic city, neon lights, rainy streets, holographic..."
            className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-orange-500 focus:border-orange-500 text-gray-800 transition-shadow outline-none"
        ></textarea>
        <div className="mt-4">
            <button className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors duration-200 shadow-lg shadow-orange-300 flex items-center justify-center">
                <Zap size={20} className="mr-2" onClick={prompting}/> Generate Image ({prompt} Credits)
            </button>
        </div>
    </div>
)};
export default ToText