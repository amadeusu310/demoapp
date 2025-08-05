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
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const user = await getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setCurrentUser(user);

      // 全ユーザーのポイントを計算してランキングを作成
      const users = await getUsers();
      const userRankings = await Promise.all(
        users.map(async (u) => ({
          username: u.username,
          points: await calculateUserPoints(u.username),
          rank: 0
        }))
      );

      // ポイント順でソート（降順）
      userRankings.sort((a, b) => b.points - a.points);

      // ランクを設定
      userRankings.forEach((user, index) => {
        user.rank = index + 1;
      });

      setRankings(userRankings);

      // 現在のユーザーのランクを取得
      const currentUserRank = userRankings.find(u => u.username === user.username)?.rank || 0;
      setUserRank(currentUserRank);
    };
    
    loadData();
  }, [navigate]);

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
                    {calculateUserPoints(currentUser.username)}pt
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
