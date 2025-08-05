// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { getCurrentUser, logout, calculateUserPoints } from '~/utils/supabaseClient';

const Header = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userPoints, setUserPoints] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setCurrentUser(user);
      
      // ポイントを計算
      const points = await calculateUserPoints(user.username);
      setUserPoints(points);
    };
    
    loadUser();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!currentUser) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 z-50 w-full h-16 md:h-20 bg-blue-400 shadow-md flex items-center px-4 md:px-6 lg:px-8">
      <div className="flex items-center flex-1">
        {/* ユーザーアイコン */}
        <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-400 rounded-full flex items-center justify-center mr-3 md:mr-4 overflow-hidden">
          <img 
            src="/logo.png" 
            alt="ユーザーアイコン" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* ユーザー名とポイント */}
        <div className="flex flex-col">
          <span className="text-lg md:text-xl lg:text-2xl font-bold text-white">{currentUser.username}</span>
          <span className="text-xs md:text-sm text-blue-100">
            現在のポイント: {userPoints}pt
          </span>
        </div>
      </div>
      
      {/* デスクトップ用の追加機能とログアウトボタン */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* プロジェクト作成ボタン（デスクトップのみ） */}
        <button
          onClick={() => navigate('/create-project')}
          className="hidden md:flex items-center px-3 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          プロジェクト作成
        </button>
        
        {/* ログアウトボタン */}
        <button
          onClick={handleLogout}
          className="flex items-center px-2 md:px-3 py-2 bg-red-500 text-white rounded-md text-xs md:text-sm font-medium hover:bg-red-600 transition-colors duration-200"
        >
          <svg className="w-4 h-4 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden md:inline">ログアウト</span>
        </button>
      </div>
    </header>
  );
};

export default Header;