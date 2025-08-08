import type { Route } from "./+types/account-register";
import { useState, useRef } from "react";
import {UserCircleIcon} from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router";
import { login, registerAccount, /*iconSelector*/ } from "~/utils/supabaseClient";
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
    password: ""});
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    //const [selectedIcon, setSelectedIcon] = useState("");

    /*const avaterOptions = [
      "https://i.pravatar.cc/150?img=1",
      "https://i.pravatar.cc/150?img=2",
      "https://i.pravatar.cc/150?img=3",
      "https://i.pravatar.cc/150?img=4",
      "https://i.pravatar.cc/150?img=5",
    ];
    {avaterOptions.map((url) => (
        <img src={url}
            onClick={() => setSelectedIcon(url)}
            className={`${selectedIcon === url ? url: null`}/>
    ))

    }*/

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) {
            setPreview(URL.createObjectURL(file)); //プレビュー用URL
        }
    };

    const handleClick = () =>{
        fileInputRef.current?.click();
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError("");
    };

    const handleRegister = async(e: React.FormEvent) =>{
        e.preventDefault();

        //登録エラーあるとき
        if (!formData.username.trim()) {
            setError("ユーザー名を作成してください");
            return;
        }
        if (!formData.password.trim()) {
            setError("パスワードを作成してください");
            return;
        }
        if(formData.password.length < 8){
            setError("８文字以上のパスワードを設定してください");
            return;
        }
        //

        try {
            const hashed = await hashPassword(formData.password);
            console.log("ハッシュ化したパスワード:", hashed);//確認用

            const user = await registerAccount(formData.username, hashed, ""/*iconUrl*/);
            console.log("registerAccountの戻り値:", user);//確認用

            if(user) {
            //自動ログイン
            const session = await login(formData.username, formData.password);
            if(!session) {
                console.error("セッション作成に失敗");
                return;
            }
            alert("登録成功！タスクルへようこそ！！"); //ここで通知
            console.log("登録完了:タスクルでタスクる♪");
            navigate("/"); //ホーム画面へ
            } else {alert("登録に失敗しました");}
        } catch (error) {
            console.error("予期せぬエラーが発生:", error);//例外エラーあるとき
        }

    }

    return(
        <div>
            <div className="text-3xl text-center font-bold">
                新規登録
            </div>
            <div className="bg-green-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-b-lg shadow-md p-6">
                <form onSubmit={handleRegister}>
                {/*アイコン */}
                <div className="w-64 h-64 rounded-full border-2 border-dashed border-gray-400 mb-3
                        flex items-center justify-center  relative cursor-pointer overflow-hidden bg-gray-100 hover:opacity-80 mx-auto"
                        onClick={handleClick}>
                    {preview ? (
                    <img src={preview} alt="アイコンプレビュー" className="w-full h-full rounded-full object-cover"/>):(
                    <UserCircleIcon className="w-full h-full text-blue-400"/>
                    )}

                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden"
                    aria-label="プロフィール画像をアップロード"/>
                </div>

            {/* エラーメッセージ */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
                </div>
                )}

                <div  className="flex flex-col mb-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        ユーザー名
                    </label>
                    <input type="account" placeholder="ユーザー名を作成" value={formData.username}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                        onChange={(e) => handleInputChange("username", e.target.value)}/>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        パスワード
                    </label>
                    <input type="password"
                        placeholder="パスワード(8文字以上)を作成" value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
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