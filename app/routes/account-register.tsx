import type { Route } from "./+types/account-register";
import { useState, useRef } from "react";
import {UserCircleIcon} from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router";
import { login, registerAccount, /*uploadIcon*/ } from "~/utils/supabaseClient";
import { hashPassword } from "~/utils/hashPassword";

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
    //const [iconFile, setIconFile] = useState<File | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) {
            setPreview(URL.createObjectURL(file)); //プレビュー用URL
            //setIconFile(file); //supabaseアップロード用
        }
    };

    const handleClick = () =>{
        fileInputRef.current?.click();
    };

    const handleRegister = async(e: React.FormEvent) =>{
        e.preventDefault();

        //登録エラーあるとき
        const newErrors: typeof errors = {};

        if(!username) {
            newErrors.username=("ユーザー名を入力してください");
        } 
        if(password.length < 8){
            newErrors.username=("８文字以上のパスワードを設定してください");
        }
        setErrors(newErrors);
        if(Object.keys(newErrors).length > 0) return;
        //
/*
        let iconUrl = "";
        if (iconFile) {
            const uploaded = await uploadIcon(iconFile, username);
            if (uploaded) iconUrl = uploaded;
        } */

        try {
            const hashed = await hashPassword(password);
            console.log("ハッシュ化したパスワード:", hashed);//確認用

            const user = await registerAccount(username, hashed, ""/*iconUrl*/);
            console.log("registerAccountの戻り値:", user);//確認用

            if(user) {
            //自動ログイン
            const session = await login(username, password);
            if(!session) {
                console.error("セッション作成に失敗");
                return;
            }
            alert("登録成功！タスクルへようこそ！！"); //ここで通知
            console.log("登録完了:", { username, password }, "タスクルでタスクる♪");
            navigate("/"); //ホーム画面へ
            } else {alert("登録に失敗しました");}
        } catch (error) {
            console.error("予期せぬエラーが発生:", error);//例外エラーあるとき
        }

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
                    className="w-full bg-red-400 text-white no-underline px-6 py-3 text-base text-center rounded-md cursor-pointer transition-colors duration-200 hover:bg-red-800 block"
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