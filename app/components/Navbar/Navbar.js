'use client';

import './Navbar.css'
import React from 'react'

const Navbar = (activeLink) => {
  const navItems = ["Image Editor", "My Creations", "Showcase", "Pricing"];

  function NavigateHome(){
    window.location.href = '/Home';
  }

  return (
    // <header className="fixed w-full z-10 shadow-sm h-20">
    //   <div>
    //     <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 flex justify-between items-center h-16">
    //         <h1 className='flex-shrink-0 font-extrabold text-xl text-gray-800' onClick={NavigateHome}>Nano Banana Biz</h1>
    //         <div className='hidden md:flex items-center gap-8'>
    //             {
    //                 navItems.map(item => (
    //                     <a key={item} href="#" className="text-gray-600 hover:text-orange-500 transition duration-150 ease-in-out font-medium">{item}</a>
    //                 ))
    //             }
    //         </div>
    //         <div className='flex items-center gap-4'>
    //             <a href="#" className='text-gray-600 hover:text-orange-500 transition duration-150 ease-in-out font-medium signIn'>Sign In</a>
    //             <a href="#" className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-orange-500 hover:bg-orange-600 transition duration-150 ease-in-out'>Sign Up</a>
    //         </div>
    //     </div>
    //   </div>
    // </header>
    <header className="sticky top-0 z-10 w-full bg-white bg-opacity-95 backdrop-blur-sm border-b border-gray-100">
    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-yellow-400 rounded-full" />
        <span className="text-xl font-extrabold text-gray-900">
          Fire Dragon <span className="text-orange-500">Biz</span>
        </span>
      </div>

      {/* Navigation (Hidden on Mobile, shown on MD and up) */}
      <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
        {['Image Editor', 'My Creations', 'Showcase', 'Pricing'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(' ', '-')}`}
            className={`hover:text-orange-500 transition-colors ${
              item === activeLink ? 'text-orange-500 font-semibold' : 'text-gray-600'
            }`}
          >
            {item}
          </a>
        ))}
      </nav>

      {/* Auth Buttons */}
      <div className="flex items-center space-x-3">
        <button className="hover:text-orange-500 transition-colors p-1 signIn">
          <a className="w-4 h-4 mr-1" />
          Sign In
        </button>
        <button className="flex items-center text-sm font-semibold text-white bg-orange-500 px-4 py-2 rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 transition-colors duration-200">
          <a className="w-4 h-4 mr-1 sm:hidden" />
          Sign Up
        </button>
      </div>
    </div>
  </header>
  );
}

export default Navbar
