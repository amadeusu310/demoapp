import { useParams, Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/project.$id.add-task";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import { getCurrentUser, getProjectById, createTask } from "~/utils/supabaseClient";

export function meta({ params }: Route.MetaArgs): ReturnType<Route.MetaFunction> {
  return [
    { title: `タスクを追加 - プロジェクト ${params.id}` },
    { name: "description", content: "新しいタスクを追加する画面" },
  ];
}

export default function AddTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    period: "",
    point: "",
    comment: ""
  });
  const [loading, setLoading] = useState(true); // ローディング状態

  useEffect(() => {
    const loadData = async () => {
      const user = await getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setCurrentUser(user);

      const projectData = await getProjectById(id || "");
      if (!projectData) {
        navigate('/');
        return;
      }

      // アクセス権限チェック
      if (!projectData.participants.includes(user.username)) {
        navigate('/');
        return;
      }

      setProject(projectData);
      setLoading(false);
    };

    loadData();
  }, [id, navigate]);

  // フォームの入力処理
  const handleInputChange = (field: string, value: string) => {
    if (field === "point") {
      const numericValue = parseInt(value);
      if (!isNaN(numericValue)) {
        if (numericValue > 100) {
          value = "300"; // 最大値制限
        } else if (numericValue < 1) {
          value = "1"; // 最小値制限（任意）
        }
      }
    }
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // フォーム送信処理
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert("タスク名を入力してください");
      return;
    }

    if (!formData.category) {
      alert("カテゴリを選択してください");
      return;
    }

    if (!formData.period) {
      alert("期限を設定してください");
      return;
    }

    if (!formData.point) {
      alert("ポイントを選択してください");
      return;
    }

    try {
      const taskData = {
        project_id: id || "",
        title: formData.title,
        completed: false,
        category: formData.category,
        period: formData.period,
        point: parseInt(formData.point) || 0,
        comment: formData.comment
      };

      await createTask(taskData);
      alert("タスクを追加しました！");
      navigate(`/project/${id}`);
    } catch (error) {
      alert("タスクの追加に失敗しました");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-green-50">
      <Header />
      <main className="flex-grow pt-20 md:pt-20 lg:pt-24 pb-20 md:pb-16 lg:pb-20 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-md mx-auto">
          {/* ヘッダー */}
          <div className="bg-blue-400 text-white text-center py-4 rounded-t-lg">
            <h1 className="text-lg md:text-xl font-bold">タスクを追加</h1>
          </div>

          {/* フォーム */}
          <div className="bg-white rounded-b-lg shadow-md p-6 space-y-6">
            {/* タスク名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">タスク名</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="タスク名を入力してください"
              />
            </div>

            {/* カテゴリ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">選択してください</option>
                <option value="work">仕事</option>
                <option value="personal">個人</option>
                <option value="study">勉強</option>
                <option value="other">その他</option>
              </select>
            </div>

            {/* 期限 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">期限</label>
              <input
                type="date"
                value={formData.period}
                onChange={(e) => handleInputChange("period", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* ポイント */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ポイント（1〜300）</label>
              <input
                type="number"
                min="1"
                max="300"
                value={formData.point}
                onChange={(e) => handleInputChange("point", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* コメント */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">コメント</label>
              <textarea
                value={formData.comment}
                onChange={(e) => handleInputChange("comment", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="コメントを入力してください"
              />
            </div>

            {/* ボタン */}
            <div className="flex space-x-4 pt-4">
              <Link
                to={`/project/${id}`}
                className="flex-1 py-3 px-4 bg-gray-300 text-gray-700 rounded-full text-center font-medium hover:bg-gray-400 transition-colors duration-200"
              >
                戻る
              </Link>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors duration-200"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}