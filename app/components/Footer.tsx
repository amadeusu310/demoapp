// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 z-50 w-full bg-blue-400 shadow-md">
      {/* モバイル向けナビゲーション */}
      <div className="md:hidden flex justify-around items-center h-16">
        <Link 
          to="/ranking" 
          className="flex flex-col items-center justify-center flex-1 py-2 px-1 text-white hover:bg-blue-500 transition-colors duration-200"
        >
          <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2L13 8l6 .75-4.12 4.62L16 19l-6-3-6 3 1.13-5.63L1 8.75 7 8l3-6z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium">ランキング</span>
        </Link>
        
        <Link 
          to="/" 
          className="flex flex-col items-center justify-center flex-1 py-2 px-1 text-white hover:bg-blue-500 transition-colors duration-200"
        >
          <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span className="text-xs font-medium">ホーム</span>
        </Link>
        
        <Link 
          to="/calendar" 
          className="flex flex-col items-center justify-center flex-1 py-2 px-1 text-white hover:bg-blue-500 transition-colors duration-200"
        >
          <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium">カレンダー</span>
        </Link>
      </div>

      {/* デスクトップ向けナビゲーション */}
      <div className="hidden md:flex justify-center items-center h-12 lg:h-14">
        <nav className="flex space-x-8 lg:space-x-12">
          <Link 
            to="/ranking" 
            className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-blue-500 rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2L13 8l6 .75-4.12 4.62L16 19l-6-3-6 3 1.13-5.63L1 8.75 7 8l3-6z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">ランキング</span>
          </Link>
          
          <Link 
            to="/" 
            className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-blue-500 rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="font-medium">ホーム</span>
          </Link>
          
          <Link 
            to="/calendar" 
            className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-blue-500 rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">カレンダー</span>
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;