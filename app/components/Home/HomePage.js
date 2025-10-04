'use client';

import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import Image from 'next/image';
import CardSection from '../CardSection/CardSection';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('textToImage');

  return (
    <div className=' bg-yellow-50'>
      <Navbar />
      <div className='p-5 gap-10 flex flex-col items-center justify-center text-center mt-10'>
        <h1 className='text-3xl font-bold text-orange-500'>Fire Dragon Image Editor</h1>
        <p className='text-lg px-10 text-gray-600'>
          Transform your images with the power of natural language. Simply describe <br />
          what you want, and watch the magic happen.
        </p>
        <Image
          src='/image.jpg'
          alt='Home Illustration'
          width={200}
          height={100}
          className='rounded-lg shadow-lg'
        />
      </div>
      <CardSection />
      {/*Tips Section */}
      <div className='w-full max-w-5xl mx-auto p-5 md:p-10 bg-white rounded-lg shadow-2xl shadow-gray-100 border border-orange-400 mb-10 flex flex-col items-center'>
        <div className='w-full text-center'>
          <h2 className='text-lg font-bold mb-3'>Your Recent Edits</h2>
          <hr />
          <ul className='list-disc list-inside mt-4 text-left text-gray-700 space-y-2 mx-auto max-w-xl'>
            <li>Be hyper-specific: Use precise descriptors like: photorealistic portrait of a woman with emerald eyes.</li>
            <li>Provide clear context: Explain the mood, style, and purpose of your desired image.</li>
            <li>Use step-by-step instructions: Break complex generations into clear, sequential steps.</li>
            <li>Employ negative prompts: Specify what you dont want, like no blurry backgrounds.</li>
            <li>Control composition: Use photographic terms like `wide-angle shot` or `low-angle perspective`.</li>
          </ul>
        </div>
      </div>
      <footer className='w-full text-center p-5 bg-gray-900 text-white mt-10'>
        &copy; {new Date().getFullYear()} Fire Dragon Image Editor. All rights reserved.
        <div className="mt-2">
          <a href="#" className="text-white hover:text-gray-400 mx-2">Privacy Policy</a> |
          <a href="#" className="text-white hover:text-gray-400 mx-2">Terms of Service</a> |
          <a href="#" className="text-white hover:text-gray-400 mx-2">Refund Policy</a>
        </div>
      </footer> 
    </div>
  );
};

export default HomePage;
