import { useParams, useNavigate } from "react-router";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/project.$id";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import { getCurrentUser, getProjectById, getTasksByProjectId, updateTask } from "~/utils/supabaseClient";

export function meta({ params }: Route.MetaArgs): ReturnType<Route.MetaFunction> {
  return [
    { title: `プロジェクト ${params.id} - ToDoアプリ` },
    { name: "description", content: `プロジェクト ${params.id} の詳細画面` },
  ];
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('プロジェクト詳細ページのデータ読み込み開始...');
        
        const user = await getCurrentUser();
        console.log('現在のユーザー:', user);
        if (!user) {
          console.log('ユーザーがログインしていません。ログイン画面にリダイレクトします。');
          navigate('/login');
          return;
        }
        setCurrentUser(user);

        console.log('プロジェクトデータを取得中...', id);
        const projectData = await getProjectById(id || "");
        console.log('取得したプロジェクトデータ:', projectData);
        
        if (!projectData) {
          console.log('プロジェクトが見つかりません');
          setProject(null);
          setAccessChecked(true);
          return;
        }

        // アクセス権限チェック：参加者リストに含まれているか確認
        const userHasAccess = projectData.participants.includes(user.username);
        console.log('アクセス権限チェック:', userHasAccess, 'ユーザー:', user.username, '参加者:', projectData.participants);
        setHasAccess(userHasAccess);
        setAccessChecked(true);
        
        if (userHasAccess) {
          // プロジェクトのタスクを取得
          console.log('タスクを取得中...');
          const tasks = await getTasksByProjectId(projectData.id);
          console.log('取得したタスク:', tasks);
          setProject({ ...projectData, tasks: tasks || [] });
        } else {
          console.log('アクセス権限がありません');
          setProject(projectData); // プロジェクトデータは設定するが、タスクは取得しない
        }
      } catch (error) {
        console.error('プロジェクト詳細データの読み込みに失敗しました:', error);
        setAccessChecked(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, navigate]);

  // タスクの完了状態をトグルする関数
  const toggleTaskCompletion = async (taskId: number) => {
    if (!project || !currentUser || !project.tasks) return;
    
    try {
      // 現在のタスクを見つける
      const currentTask = project.tasks.find((task: any) => task.id === taskId);
      if (!currentTask) return;

      // タスクの完了状態を更新
      await updateTask(taskId, { completed: !currentTask.completed });
      
      // プロジェクトのタスクリストを再取得
      const updatedTasks = await getTasksByProjectId(project.id);
      const updatedProject = { ...project, tasks: updatedTasks };
      
      setProject(updatedProject);
    } catch (error) {
      console.error('タスクの更新に失敗しました:', error);
    }
  };

  // ローディング中の表示
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-green-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">プロジェクトを読み込み中...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // アクセス権限チェック後の処理
  if (accessChecked && !hasAccess) {
    return (
      <div className="flex flex-col h-screen bg-green-50">
        <Header />
        <main className="flex-grow pt-20 md:pt-24 lg:pt-28 pb-20 md:pb-16 lg:pb-20 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                アクセスが拒否されました
              </h1>
              <p className="text-gray-600 mb-6">
                このプロジェクトにアクセスする権限がありません。<br />
                プロジェクトの参加者として追加されている必要があります。
              </p>
              <Link 
                to="/" 
                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                ホームに戻る
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col h-screen bg-green-50">
        <Header />
        <main className="flex-grow pt-20 md:pt-24 lg:pt-28 pb-20 md:pb-16 lg:pb-20 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8 text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                プロジェクトが見つかりません
              </h1>
              <p className="text-gray-600 mb-6">
                指定されたプロジェクトは存在しません。
              </p>
              <Link 
                to="/" 
                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                ホームに戻る
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const completedTasks = project.tasks ? project.tasks.filter((task: any) => task.completed).length : 0;
  const totalTasks = project.tasks ? project.tasks.length : 0;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="flex flex-col h-screen bg-green-50">
      <Header />
      <main className="flex-grow pt-20 md:pt-24 lg:pt-28 pb-20 md:pb-16 lg:pb-20 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* プロジェクトヘッダー */}
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 md:mb-0">
                {project.name}
              </h1>
              <Link 
                to="/" 
                className="inline-block bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm md:text-base"
              >
                ← ホームに戻る
              </Link>
            </div>
            
            {project.description && (
              <p className="text-gray-600 text-base md:text-lg mb-6">
                {project.description}
              </p>
            )}

            {/* プロジェクト情報 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">期限</h3>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date(project.deadline).toLocaleDateString('ja-JP')}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">参加者</h3>
                <p className="text-lg font-semibold text-gray-800">
                  {project.participants.length}人
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {project.participants.slice(0, 3).join(', ')}
                  {project.participants.length > 3 && '...'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">タスク</h3>
                <p className="text-lg font-semibold text-gray-800">
                  {completedTasks}/{totalTasks}
                </p>
              </div>
            </div>
            
            {/* プログレスバー */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm md:text-base text-gray-700 font-medium">進捗状況</span>
                <span className="text-sm md:text-base text-gray-600">
                  {Math.round(progressPercentage)}% 完了
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* タスクリスト */}
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">タスク一覧</h2>
            
            {!project.tasks || project.tasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">まだタスクがありません</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 md:px-4 text-sm md:text-base font-semibold text-gray-700 w-8"></th>
                      <th className="text-left py-3 px-2 md:px-4 text-sm md:text-base font-semibold text-gray-700">タスク名</th>
                      <th className="text-left py-3 px-2 md:px-4 text-sm md:text-base font-semibold text-gray-700 hidden md:table-cell">カテゴリ</th>
                      <th className="text-left py-3 px-2 md:px-4 text-sm md:text-base font-semibold text-gray-700 hidden lg:table-cell">期間</th>
                      <th className="text-left py-3 px-2 md:px-4 text-sm md:text-base font-semibold text-gray-700 hidden md:table-cell">ポイント</th>
                      <th className="text-left py-3 px-2 md:px-4 text-sm md:text-base font-semibold text-gray-700 hidden lg:table-cell">コメント</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(project.tasks || []).map((task: any) => (
                      <tr 
                        key={task.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
                          task.completed ? 'opacity-60' : ''
                        }`}
                      >
                        <td className="py-3 px-2 md:px-4">
                          <button
                            onClick={() => toggleTaskCompletion(task.id)}
                            className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-full"
                          >
                            {task.completed ? (
                              <div className="w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors duration-200">
                                <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-gray-300 rounded-full cursor-pointer hover:border-gray-400 transition-colors duration-200"></div>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-2 md:px-4">
                          <span className={`text-sm md:text-base font-medium ${
                            task.completed ? 'text-gray-500 line-through' : 'text-gray-800'
                          }`}>
                            {task.title}
                          </span>
                          {/* モバイル表示用の追加情報 */}
                          <div className="md:hidden mt-1 space-y-1">
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">カテゴリ:</span> {task.category}
                            </div>
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">ポイント:</span> {task.point}P
                            </div>
                            <div className="lg:hidden text-xs text-gray-600">
                              <span className="font-medium">期間:</span> {task.period}
                            </div>
                            <div className="lg:hidden text-xs text-gray-600 truncate">
                              <span className="font-medium">コメント:</span> {task.comment}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 md:px-4 hidden md:table-cell">
                          <span className="text-sm md:text-base text-gray-600 px-2 py-1 bg-gray-100 rounded-full">
                            {task.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 md:px-4 hidden lg:table-cell">
                          <span className="text-sm md:text-base text-gray-600">
                            {task.period}
                          </span>
                        </td>
                        <td className="py-3 px-2 md:px-4 hidden md:table-cell">
                          <span className="text-sm md:text-base font-semibold text-blue-600">
                            {task.point}P
                          </span>
                        </td>
                        <td className="py-3 px-2 md:px-4 hidden lg:table-cell">
                          <span className="text-sm md:text-base text-gray-600 max-w-xs truncate block">
                            {task.comment}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* 新規タスク追加ボタン */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link 
                to={`/project/${id}/add-task`}
                className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>新しいタスクを追加</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
