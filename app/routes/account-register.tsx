import type { Route } from "./+types/account-register";
import { useState, useRef } from "react";
import {UserCircleIcon} from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "タスクル | 新規登録画面" },
    { name: "description", content: "アカウントを作成してタスクルを始めましょう。" },
  ];
}

export default function register(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ username?: string; password?: string}>({});

    const navigate = useNavigate();

    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) {
            setPreview(URL.createObjectURL(file)); //プレビュー用URL
        }
    };

    const handleClick = () =>{
        fileInputRef.current?.click();
    };

    const handleRegister = (e: React.FormEvent) =>{
        e.preventDefault();
        const newErrors: typeof errors = {};
        if(username && password.length >= 8) {
            alert("登録成功！タスクルへようこそ！！"); //ここで通知
            console.log("仮登録成功:", { username, password });
            navigate("/home"); //ホーム画面へ
        } 
        if(!username) {
            newErrors.username=("ユーザー名を入力してください");
        } 
        if(password.length < 8){
            newErrors.username=("８文字以上のパスワードを設定してください");
        }
        setErrors(newErrors);
    }

    return(
        <div>
            <div className="text-2xl text-center font-bold">
                新規登録
            </div>
            <div className="bg-green-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-b-lg shadow-md p-6">
                <form onSubmit={handleRegister}>
                {/*アイコン */}
                <div className="w-64 h-64 rounded-full border-2 border-dashed border-gray-400
                        flex items-center justify-center  relativ cursor-pointer overflow-hidden bg-gray-100 hover:opacity-80"
                        onClick={handleClick}>
                    {preview ? (
                    <img src={preview} alt="アイコンプレビュー" className="w-full h-full rounded-full object-cover"/>):(
                    <UserCircleIcon className="w-full h-full text-blue-400"/>
                    )}

                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden"
                    aria-label="プロフィール画像をアップロード"/>
                </div>
                <div  className="flex flex-col mb-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        ユーザー名
                    </label>
                    <input type="account" placeholder="ユーザー名を作成" value={username}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onChange={(e)=> setUsername(e.target.value)}
                        required />
                    {errors.username && <div className="mt-1 text-sm text-red-600">
                        {errors.username}</div>}
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        パスワード
                    </label>
                    {errors.password && <div className="mt-1 text-sm text-red-600">
                        {errors.password}</div>}
                    <input type="password"
                        placeholder="パスワード(8文字以上)を作成" value={password}
                        onChange={(e)=> setPassword(e.target.value)}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required />
                </div>
                <button type="submit"
                    className="inline-block bg-red-400 text-white no-underline px-6 py-3 text-base rounded cursor-pointer transition-colors duration-200 hover:bg-red-800"
                >
                    登録
                </button>
                </form>
            </div>
            </div>
            <Link to="/login" className="flex items-center space-x-2 justify-center">
            <div className="block text-sm font-medium text-gray-700 mb-2 hover:text-blue-800">◀ログイン画面に戻る</div>
            </Link>
        </div>
    );
}