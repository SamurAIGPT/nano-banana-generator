'use client';

import './Navbar.css'
import React from 'react'
import Link from 'next/link';

const Navbar = (activeLink) => {
  const navItems = ["Image Editor", "My Creations", "Showcase", "Pricing"];

  function NavigateHome(){
    window.location.href = '/Home';
  }

  return (
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
        {/* {['Image Editor', 'My Creations', 'Showcase', 'Pricing'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(' ', '-')}`}
            className={`hover:text-orange-500 transition-colors ${
              item === activeLink ? 'text-orange-500 font-semibold' : 'text-gray-600'
            }`}
          >
            {item}
          </a>
        ))} */}
        <Link href={"/"} className="hover:text-orange-500 transition-colors text-gray-600 font-semibold">Image Editor</Link>
        <Link href={"/MyCreations"} className="hover:text-orange-500 transition-colors text-gray-600">My Creations</Link>
        <Link href={"/Showcase"} className="hover:text-orange-500 transition-colors text-gray-600">Showcase</Link>
        <Link href={"/Pricing"} className="hover:text-orange-500 transition-colors text-gray-600">Pricing</Link>
      </nav>

      {/* Auth Buttons */}
      <div className="flex items-center space-x-3">
        <button className="hover:text-orange-500 transition-colors p-1 signIn">
          <a className="w-4 h-4 mr-1" />
          <Link href={"/SignIn"}>Sign In</Link>
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
