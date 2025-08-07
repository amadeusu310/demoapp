import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/login";
import { login } from "~/utils/supabaseClient";

export function meta(): ReturnType<Route.MetaFunction> {
  return [
    { title: "ログイン - ToDo App" },
    { name: "description", content: "ログイン画面" },
  ];
}

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      setError("ユーザー名を入力してください");
      return;
    }
    
    if (!formData.password.trim()) {
      setError("パスワードを入力してください");
      return;
    }

    const user = await login(formData.username, formData.password);
    if (user) {
      navigate("/");
    } else {
      setError("ユーザー名またはパスワードが間違っています");
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="bg-blue-400 text-white text-center py-6 rounded-t-lg">
          <h1 className="text-2xl font-bold">ログイン</h1>
          <p className="text-blue-100 mt-2">タスクルへようこそ</p>
        </div>
        
        {/* フォーム */}
        <div className="bg-white rounded-b-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* エラーメッセージ */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* ユーザー名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ユーザー名
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ユーザー名を入力してください"
              />
            </div>

            {/* パスワード */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="パスワードを入力してください"
              />
            </div>

            {/* ログインボタン */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              ログイン
            </button>
          </form>

          <div>
        <div className="title">
          初めてですか？
        </div>
        <Link
            to="/account-register"
            className="font-bold border-3 border-blue-500 inline-block bg-white-600 text-black no-underline px-6 py-3 text-base rounded cursor-pointer transition-colors duration-200 hover:bg-red-700 hover:text-white"
          >
            <button type="button">新規登録</button>
        </Link>
      </div>

          {/* テストアカウント情報 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">テストアカウント:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>田中太郎 / password123</div>
              <div>佐藤花子 / password456</div>
              <div>山田次郎 / password789</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
