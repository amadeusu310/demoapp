// src/components/MainContent.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { getCurrentUser, getUserProjects } from '~/utils/supabaseClient';

const Main = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const user = await getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      
      setCurrentUser(user);
      const projects = await getUserProjects(user.username);
      setUserProjects(projects);
    };
    
    loadData();
  }, [navigate]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex-grow pt-20 md:pt-24 lg:pt-28 pb-20 md:pb-16 lg:pb-20 overflow-y-auto p-4 md:p-6 lg:p-8">
      {/* グリッドレイアウトでレスポンシブ対応 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        
        {/* ユーザーのプロジェクト一覧 */}
        {userProjects && userProjects.length > 0 ? userProjects.map((project) => (
          <Link 
            key={project.id}
            to={`/project/${project.id}`}
            className="bg-white rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow duration-200 block"
          >
            <div className="space-y-2">
              <span className="text-black font-bold text-lg md:text-xl block">{project.name}</span>
              <div className="text-sm text-gray-600">
                <div>期限: {new Date(project.deadline).toLocaleDateString('ja-JP')}</div>
                <div>参加者: {project.participants.length}人</div>
                <div>タスク: {project.tasks ? project.tasks.length : 0}個</div>
              </div>
              {project.description && (
                <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
          </Link>
        )) : null}
        
        {/* 新規プロジェクト追加ボタン */}
        <Link
          to="/create-project" 
          className="flex justify-center items-center h-32 md:h-40 border-2 border-dashed border-gray-400 rounded-lg hover:border-gray-600 hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="text-center">
            <svg className="w-8 h-8 md:w-10 md:h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-gray-500 text-sm md:text-base font-medium">新規プロジェクト作成</span>
          </div>
        </Link>
        
      </div>
      
      {/* プロジェクトがない場合のメッセージ */}
      {userProjects.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">プロジェクトがありません</h3>
          <p className="text-gray-500 mb-4">新しいプロジェクトを作成して始めましょう！</p>
          <Link
            to="/create-project"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            プロジェクトを作成
          </Link>
        </div>
      )}
    </main>
  );
};

export default Main;