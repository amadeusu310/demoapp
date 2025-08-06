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
            newErrors.username=("アカウント名を入力してください");
        } 
        if(password.length < 8){
            newErrors.username=("８文字以上のパスワードを設定してください");
        }
        setErrors(newErrors);
    }

    return(
        <div>
            <div className="title">
                新規登録
            </div>
            <form onSubmit={handleRegister}>
                <div>
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-400
                        flex items-center justify-center  relativ cursor-pointer overflow-hidden bg-gray-100 hover:opacity-80"
                        onClick={handleClick}>
                    {preview ? (
                    <img src={preview} alt="アイコンプレビュー" className="w-full h-full rounded-full object-cover"/>):(
                    <UserCircleIcon className="w-full h-full text-blue-400"/>
                    )}
                </div>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden"
                    aria-label="プロフィール画像をアップロード"/>
                </div>
                <div className="list">
                    <div className="list-item">
                        <label htmlFor="name" className="title">
                            アカウント名
                        </label>
                        <input type="account" placeholder="アカウント名を作成" value={username}
                            onChange={(e)=> setUsername(e.target.value)}
                            required />
                        {errors.username && <div className="mt-1 text-sm text-red-600">
                            {errors.username}</div>}
                    </div>
                    <div className="list-item">
                        <label htmlFor="password" className="title">
                            パスワード
                        </label>
                        <input type="password"
                            placeholder="パスワード(8文字以上)を作成" value={password}
                            onChange={(e)=> setPassword(e.target.value)}
                            required />
                        {errors.password && <div className="mt-1 text-sm text-red-600">
                            {errors.password}</div>}
                    </div>
                </div>
                <button type="submit"
                    className="inline-block bg-blue-600 text-white no-underline px-6 py-3 text-base rounded cursor-pointer transition-colors duration-200 hover:bg-blue-800"
                >
                    登録
                </button>
            </form>
            <Link to="/login" className="flex items-center space-x-2">
            <div className="w-0 h-0 border-1-[10px] border-r-[10px] border-b-[20px]
                            border-l-transport border-r-transparent border-b-blue-500" />
            <span className="text">ログイン画面に戻る</span>
            </Link>
        </div>
    );
}