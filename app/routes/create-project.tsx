import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from "./+types/create-project";
import { getCurrentUser, createProject, getUsers } from "~/utils/supabaseClient";
import Header from "~/components/Header";
import Footer from "~/components/Footer";

export function meta(): ReturnType<Route.MetaFunction> {
  return [
    { title: "プロジェクト作成 - ToDo App" },
    { name: "description", content: "新しいプロジェクトを作成する画面" },
  ];
}

export default function CreateProject() {
  const [formData, setFormData] = useState({
    name: "",
    deadline: "",
    participants: [] as string[],
    description: ""
  });
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const user = await getCurrentUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setCurrentUser(user);
      
      // 利用可能なユーザーリストを取得（現在のユーザーを含む）
      const users = await getUsers();
      setAvailableUsers(users.map(u => u.username));
      
      // デフォルトで現在のユーザーを参加者に追加
      setFormData(prev => ({
        ...prev,
        participants: [user.username]
      }));
    };
    
    loadData();
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleParticipantToggle = (username: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(username)
        ? prev.participants.filter(p => p !== username)
        : [...prev.participants, username]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("プロジェクト名を入力してください");
      return;
    }
    
    if (!formData.deadline) {
      alert("期限を設定してください");
      return;
    }
    
    if (formData.participants.length === 0) {
      alert("参加者を選択してください");
      return;
    }

    try {
      const newProject = await createProject({
        name: formData.name,
        deadline: formData.deadline,
        participants: formData.participants,
        description: formData.description
      });
      
      alert("プロジェクトを作成しました！");
      navigate("/");
    } catch (error) {
      alert("プロジェクトの作成に失敗しました");
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-green-50">
      <Header />
      <main className="flex-grow pt-20 md:pt-20 lg:pt-24 pb-20 md:pb-16 lg:pb-20 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-md mx-auto">
          {/* ヘッダー */}
          <div className="bg-blue-400 text-white text-center py-4 rounded-t-lg">
            <h1 className="text-lg md:text-xl font-bold">プロジェクト作成</h1>
          </div>
          
          {/* フォーム */}
          <div className="bg-white rounded-b-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* プロジェクト名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  プロジェクト名 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="プロジェクト名を入力してください"
                  required
                />
              </div>

              {/* 期限 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  期限 *
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange("deadline", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 参加者 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  参加者 *
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {availableUsers.map(username => (
                    <label key={username} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.participants.includes(username)}
                        onChange={() => handleParticipantToggle(username)}
                        disabled={username === currentUser.username}
                        className="rounded text-blue-500 focus:ring-blue-500"
                      />
                      <span className={`text-sm ${username === currentUser.username ? 'font-medium text-blue-600' : 'text-gray-700'}`}>
                        {username} {username === currentUser.username && '(自分)'}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  選択された参加者: {formData.participants.length}人
                </p>
              </div>

              {/* 説明 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明（任意）
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="プロジェクトの説明を入力してください"
                />
              </div>

              {/* ボタン */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex-1 py-3 px-4 bg-gray-300 text-gray-700 rounded-full text-center font-medium hover:bg-gray-400 transition-colors duration-200"
                >
                  戻る
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors duration-200"
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
