import type { Route } from "./+types/account-register";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { login, registerAccount } from "~/utils/supabaseClient";
import { hashPassword } from "~/utils/hashPassword";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "タスクル | 新規登録画面" },
    { name: "description", content: "アカウントを作成してタスクルを始めましょう。" },
  ];
}

export default function register(){
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

    const handleRegister = async(e: React.FormEvent) => {
        e.preventDefault();

        // バリデーション
        if (!formData.username.trim()) {
            setError("ユーザー名を入力してください");
            return;
        }
        if (!formData.password.trim()) {
            setError("パスワードを入力してください");
            return;
        }
        if(formData.password.length < 8){
            setError("パスワードは8文字以上で入力してください");
            return;
        }

        try {
            const hashed = await hashPassword(formData.password);
            console.log("ハッシュ化したパスワード:", hashed);

            const user = await registerAccount(formData.username, hashed, "");
            console.log("registerAccountの戻り値:", user);

            if(user) {
                // 自動ログイン
                const session = await login(formData.username, formData.password);
                if(!session) {
                    console.error("セッション作成に失敗");
                    setError("ログインに失敗しました");
                    return;
                }
                alert("登録成功！タスクルへようこそ！");
                console.log("登録完了:タスクルでタスクる♪");
                navigate("/");
            } else {
                setError("登録に失敗しました");
            }
        } catch (error) {
            console.error("予期せぬエラーが発生:", error);
            setError("予期せぬエラーが発生しました");
        }
    };

    return(
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">新規登録</h1>
                    <p className="text-gray-600">アカウントを作成してタスクルを始めましょう</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                            ユーザー名
                        </label>
                        <input 
                            id="username"
                            type="text" 
                            placeholder="ユーザー名を入力" 
                            value={formData.username}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            onChange={(e) => handleInputChange("username", e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            パスワード
                        </label>
                        <input 
                            id="password"
                            type="password"
                            placeholder="パスワード（8文字以上）を入力" 
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-blue-500 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        登録
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link 
                        to="/login" 
                        className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors"
                    >
                        ← ログイン画面に戻る
                    </Link>
                </div>
            </div>
        </div>
    );
}