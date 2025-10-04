'use client';
import React, { useState } from 'react'
import Navbar from '../Navbar/Navbar'
import { Grid } from 'lucide-react'


const MyCreationsRoute = () => {
  // Add state for creations
  const [creations, setCreations] = useState([])

  return (
    <div>
      <Navbar />
      <div className=' bg-yellow-50 min-h-screen'>
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <div className="bg-white p-6 md:p-12 rounded-3xl shadow-2xl shadow-gray-100 text-center flex flex-col items-center mb-12">
            <div className="w-16 h-16 flex items-center justify-center bg-yellow-100 rounded-2xl mb-4">
              <Grid size={32} className="text-yellow-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
              My <span className="text-orange-500">Creations</span>
            </h1>
            <p className="text-sm font-medium text-gray-700 mb-4">
              {creations.length} masterpiece{creations.length !== 1 ? 's' : ''} • AI generated gallery
            </p>
            <p className="text-md text-gray-500 max-w-xl">
              Your personal collection of AI generated artwork, organized in a beautiful waterfall layout.
            </p>
          </div>

          {creations.length === 0 ? (
            <div className="text-center p-16 border-2 border-dashed border-gray-200 rounded-xl bg-white">
              <Grid size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 font-semibold">No creations saved yet!</p>
              <p className="text-gray-500">Generate an image in the editor and click the save button to see it here.</p>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-6">
              
            </div>
          )}
        </div>
      </div>
        <footer className='w-full text-center p-5 bg-gray-900 text-white'>
        &copy; {new Date().getFullYear()} Fire Dragon Image Editor. All rights reserved.
        <div className="mt-2">
          <a href="#" className="text-white hover:text-gray-400 mx-2">Privacy Policy</a> |
          <a href="#" className="text-white hover:text-gray-400 mx-2">Terms of Service</a> |
          <a href="#" className="text-white hover:text-gray-400 mx-2">Refund Policy</a>
        </div>
      </footer> 
    </div>
  )
}

export default MyCreationsRoute
