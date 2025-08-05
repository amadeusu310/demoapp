import { Link } from "react-router";
import type { Route } from "./+types/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "このアプリについて - ハッカソンテンプレート" },
    { name: "description", content: "ハッカソンテンプレートアプリの紹介ページ" },
  ];
}

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-2xl w-11/12 border border-gray-200">
        <h1 className="text-4xl font-bold text-gray-800 mb-5">
          このアプリについて
        </h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          ハッカソンテンプレートアプリの紹介ページです
        </p>
        
        <div className="mb-8 p-5 border border-gray-200 rounded-md bg-gray-50 text-left">
          <h2 className="text-2xl text-gray-800 mb-4 text-center">機能紹介</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>カウンターの増減機能</li>
            <li>シンプルな画面遷移</li>
            <li>Reactの状態管理</li>
            <li>Tailwind CSSによるスタイリング</li>
          </ul>
        </div>
        
        <div className="mb-8 p-5 border border-gray-200 rounded-md bg-gray-50 text-left">
          <h2 className="text-2xl text-gray-800 mb-4 text-center">使用技術</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>React 19</li>
            <li>React Router v7</li>
            <li>TypeScript</li>
            <li>Tailwind CSS v4</li>
            <li>Vite</li>
          </ul>
        </div>
        
        <div className="mt-8 flex justify-center flex-wrap gap-2">
          <Link
            to="/"
            className="inline-block bg-gray-600 text-white no-underline px-6 py-3 text-base rounded cursor-pointer transition-colors duration-200 hover:bg-gray-700"
          >
            メインページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}