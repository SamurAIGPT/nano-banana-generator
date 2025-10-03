import React, { useState } from 'react';
import { Zap, Search, LogIn, UserPlus, Upload, Code } from 'lucide-react';
import ToImage from '../ToImage/ToImage';
import ToText from '../ToText/ToText';
import './CardSection.css';

const CardSection = () => {
    const [activeTab, setActiveTab] = useState('textToImage');
  return (
     <section className="flex flex-col md:flex-row gap-8 p-5 md:p-10 max-w-7xl mx-auto items-stretch">
                    
        {/* LEFT COLUMN: Prompt Engine */}
        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl shadow-gray-100 flex-1 flex flex-col h-full">
                        
                        {/* Title Block */}
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-12 h-12 flex items-center justify-center bg-yellow-100 rounded-xl">
                                <Zap size={28} className="text-yellow-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Prompt Engine</h3>
                                <p className="text-gray-500 text-sm">Transform your vision into reality</p>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                            <button
                                onClick={() => setActiveTab('textToImage')}
                                className={`flex-1 flex items-center justify-center py-2 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
                                    activeTab === 'textToImage'
                                        ? 'bg-white text-orange-600 shadow-md'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <Code size={16} className="mr-2" /> Text to Image
                            </button>
                            <button
                                onClick={() => setActiveTab('imageToImage')}
                                className={`flex-1 flex items-center justify-center py-2 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
                                    activeTab === 'imageToImage'
                                        ? 'bg-white text-orange-600 shadow-md'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                <Upload size={16} className="mr-2" /> Image to Image
                            </button>
                        </div>

                        {/* CONDITIONAL FORM RENDERING */}
                        {activeTab === 'textToImage' ? (
                            <ToText/>
                        ) : (
                            <ToImage />
                        )}
                    </div>

        {/* RIGHT COLUMN: Output Gallery */}
        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl shadow-gray-100 flex-1 flex flex-col h-full">
                        {/* Title Block */}
                        <div className="card-title-block flex items-center space-x-4 mb-6">
                            <div className="w-12 h-12 flex items-center justify-center bg-yellow-100 rounded-xl">
                                <Search size={28} className="text-yellow-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Output Gallery</h3>
                                <p className="text-gray-500 text-sm">Your AI creations appear here instantly</p>
                            </div>
                        </div>

                        {/* Gallery Placeholder */}
                        <div className="flex-grow h-full border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center p-8 bg-gray-50 ">
                            <p className="text-gray-400 text-center h-70 w-70 flex items-center justify-center">
                                Generated images will appear here. Start prompting!
                            </p>
                        </div>
                    </div>
     </section>
  )
}

export default CardSection
