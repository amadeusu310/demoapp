import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/ranking";
import { getCurrentUser, getUsers, calculateUserPoints } from "~/utils/supabaseClient";
import Header from "~/components/Header";
import Footer from "~/components/Footer";

export function meta(): ReturnType<Route.MetaFunction> {
  return [
    { title: "ランキング - ToDo App" },
    { name: "description", content: "ユーザーのポイントランキング画面" },
  ];
}

interface UserRanking {
  username: string;
  points: number;
  rank: number;
}

export default function Ranking() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [currentUserPoints, setCurrentUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('ランキングデータの読み込みを開始...');
        setLoading(true);
        const user = await getCurrentUser();
        console.log('現在のユーザー:', user);
        if (!user) {
          console.log('ユーザーがログインしていません。ログイン画面にリダイレクトします。');
          navigate('/login');
          return;
        }
        setCurrentUser(user);

        // 現在のユーザーのポイントを計算
        console.log('現在のユーザーのポイントを計算中...');
        const userPoints = await calculateUserPoints(user.username);
        console.log('現在のユーザーのポイント:', userPoints);
        setCurrentUserPoints(userPoints);

        // 全ユーザーのポイントを計算してランキングを作成
        console.log('全ユーザーの情報を取得中...');
        const users = await getUsers();
        console.log('取得したユーザー数:', users.length);
        
        console.log('各ユーザーのポイントを計算中...');
        const userRankings = await Promise.all(
          users.map(async (u) => {
            const points = await calculateUserPoints(u.username);
            console.log(`${u.username}のポイント: ${points}`);
            return {
              username: u.username,
              points,
              rank: 0
            };
          })
        );

        // ポイント順でソート（降順）
        userRankings.sort((a, b) => b.points - a.points);

        // ランクを設定
        userRankings.forEach((user, index) => {
          user.rank = index + 1;
        });

        console.log('ランキング結果:', userRankings);
        setRankings(userRankings);

        // 現在のユーザーのランクを取得
        const currentUserRank = userRankings.find(u => u.username === user.username)?.rank || 0;
        console.log('現在のユーザーのランク:', currentUserRank);
        setUserRank(currentUserRank);
        
        console.log('ランキングデータの読み込み完了');
      } catch (error) {
        console.error('ランキングデータの読み込みに失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-green-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">ランキングを読み込み中...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const topFiveRankings = rankings.slice(0, 5);
  const maxPoints = topFiveRankings.length > 0 ? topFiveRankings[0].points : 0;

  // トロフィーアイコンの色を決定
  const getTrophyColor = (rank: number) => {
    switch (rank) {
      case 1: return "text-yellow-500"; // 金
      case 2: return "text-gray-400"; // 銀
      case 3: return "text-yellow-600"; // 銅
      default: return "text-gray-300";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-green-50">
      <Header />
      <main className="flex-grow pt-20 md:pt-24 lg:pt-28 pb-20 md:pb-16 lg:pb-20 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                🏆 ポイントランキング
              </h1>
              <p className="text-gray-600">
                あなたの現在のランク: <span className="font-bold text-blue-600">{userRank}位</span>
              </p>
            </div>

            {/* 現在のユーザーの情報 */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {currentUser.username.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{currentUser.username}</h3>
                    <p className="text-sm text-gray-600">あなた</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentUserPoints}pt
                  </div>
                  <div className="text-sm text-gray-600">{userRank}位</div>
                </div>
              </div>
            </div>
          </div>

          {/* ランキンググラフ */}
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">上位5名</h2>
            
            {topFiveRankings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">ランキングデータがありません</p>
            ) : (
              <>
                <div className="space-y-4">
                  {topFiveRankings.map((user, index) => {
                    const barWidth = maxPoints > 0 ? (user.points / maxPoints) * 100 : 0;
                    const isCurrentUser = user.username === currentUser.username;
                    
                    return (
                      <div 
                        key={user.username}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          isCurrentUser 
                            ? 'border-blue-300 bg-blue-50' 
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {/* ランクアイコン */}
                            <div className={`w-8 h-8 flex items-center justify-center ${
                              user.rank <= 3 ? 'text-2xl' : 'text-lg font-bold text-gray-600'
                            }`}>
                              {user.rank <= 3 ? (
                                <svg className={`w-6 h-6 ${getTrophyColor(user.rank)}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 2L13 8l6 .75-4.12 4.62L16 19l-6-3-6 3 1.13-5.63L1 8.75 7 8l3-6z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                `${user.rank}`
                              )}
                            </div>
                            
                            {/* ユーザー情報 */}
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isCurrentUser ? 'bg-blue-400' : 'bg-gray-400'
                              }`}>
                                <span className="text-white font-bold">
                                  {user.username.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h3 className={`font-bold ${isCurrentUser ? 'text-blue-800' : 'text-gray-800'}`}>
                                  {user.username}
                                  {isCurrentUser && <span className="text-sm text-blue-600 ml-2">(あなた)</span>}
                                </h3>
                              </div>
                            </div>
                          </div>
                          
                          {/* ポイント表示 */}
                          <div className="text-right">
                            <div className={`text-xl font-bold ${isCurrentUser ? 'text-blue-600' : 'text-gray-800'}`}>
                              {user.points}pt
                            </div>
                          </div>
                        </div>
                        
                        {/* プログレスバー */}
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div 
                            className={`h-4 rounded-full transition-all duration-1000 ease-out ${
                              isCurrentUser ? 'bg-blue-500' : 'bg-gray-400'
                            }`}
                            style={{ 
                              width: `${barWidth}%`,
                              minWidth: user.points > 0 ? '8px' : '0px'
                            }}
                          ></div>
                        </div>
                        
                        {/* パーセンテージ表示 */}
                        <div className="text-right mt-1">
                          <span className="text-xs text-gray-500">
                            {maxPoints > 0 ? Math.round(barWidth) : 0}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 縦棒グラフセクション */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-6 text-center">
                    ポイント比較グラフ
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    {/* グラフエリア */}
                    <div className="flex items-end justify-center space-x-3 md:space-x-6" style={{ height: '280px' }}>
                      {topFiveRankings.map((user, index) => {
                        const isCurrentUser = user.username === currentUser.username;
                        const barHeight = maxPoints > 0 ? (user.points / maxPoints) * 100 : 0;
                        
                        // 順位に基づく色の決定
                        const getBarColor = () => {
                          if (isCurrentUser) return 'bg-blue-500';
                          switch (user.rank) {
                            case 1: return 'bg-yellow-500'; // 金
                            case 2: return 'bg-gray-400';   // 銀
                            case 3: return 'bg-yellow-600'; // 銅
                            default: return 'bg-gray-300';
                          }
                        };

                        const getBarShadow = () => {
                          if (isCurrentUser) return 'shadow-blue-200';
                          switch (user.rank) {
                            case 1: return 'shadow-yellow-200';
                            case 2: return 'shadow-gray-200';
                            case 3: return 'shadow-yellow-200';
                            default: return 'shadow-gray-200';
                          }
                        };

                        return (
                          <div key={user.username} className="flex flex-col items-center" style={{ width: '60px' }}>
                            {/* ポイント表示（棒グラフの上） */}
                            <div className="mb-2 text-center">
                              <div className={`text-sm md:text-base font-bold ${
                                isCurrentUser ? 'text-blue-600' : 'text-gray-700'
                              }`}>
                                {user.points}pt
                              </div>
                              {/* ランクアイコン */}
                              <div className="flex justify-center mt-1">
                                {user.rank <= 3 ? (
                                  <svg className={`w-4 h-4 md:w-5 md:h-5 ${getTrophyColor(user.rank)}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2L13 8l6 .75-4.12 4.62L16 19l-6-3-6 3 1.13-5.63L1 8.75 7 8l3-6z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <span className="text-xs md:text-sm font-bold text-gray-600">
                                    {user.rank}位
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* 棒グラフ */}
                            <div className="relative w-full flex items-end" style={{ height: '200px' }}>
                              <div
                                className={`w-full rounded-t-lg transition-all duration-1000 ease-out ${getBarColor()} ${getBarShadow()} shadow-lg ${
                                  isCurrentUser ? 'ring-2 ring-blue-300 ring-opacity-50' : ''
                                }`}
                                style={{ 
                                  height: `${Math.max(barHeight, user.points > 0 ? 5 : 0)}%`,
                                  minHeight: user.points > 0 ? '12px' : '0px'
                                }}
                              >
                                {/* グラデーション効果 */}
                                <div className="w-full h-full rounded-t-lg bg-gradient-to-t from-transparent to-white opacity-20"></div>
                              </div>
                            </div>
                            
                            {/* ユーザー名（棒グラフの下） */}
                            <div className="mt-3 text-center">
                              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mx-auto mb-1 ${
                                isCurrentUser ? 'bg-blue-400' : 'bg-gray-400'
                              }`}>
                                <span className="text-white font-bold text-xs md:text-sm">
                                  {user.username.charAt(0)}
                                </span>
                              </div>
                              <div className={`text-xs md:text-sm font-medium ${
                                isCurrentUser ? 'text-blue-700' : 'text-gray-600'
                              } truncate max-w-full`}>
                                {user.username.length > 8 ? `${user.username.substring(0, 8)}...` : user.username}
                                {isCurrentUser && (
                                  <div className="text-xs text-blue-500 font-bold">(あなた)</div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Y軸の目盛り表示 */}
                    <div className="mt-4 text-center">
                      <div className="text-xs text-gray-500">
                        最高ポイント: {maxPoints}pt
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 全員のポイントが0の場合のメッセージ */}
            {topFiveRankings.length > 0 && maxPoints === 0 && (
              <div className="text-center py-6 bg-gray-50 rounded-lg mt-6">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-600 mb-1">まだポイントを獲得したユーザーがいません</h3>
                <p className="text-gray-500 text-sm">タスクを完了してポイントを獲得しましょう！</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
