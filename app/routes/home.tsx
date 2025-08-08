import { useEffect, useState } from "react";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Main from "~/components/Main";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true); // 最初はスピナー表示

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false); // 1.5秒後にスピナー非表示
    }, 1500);

    return () => clearTimeout(timer); // クリーンアップ
  }, []);

  if (showSplash) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-green-50">
      <Header />
      <Main />
      <Footer />
    </div>
  );
}


// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router"; 
// import type { Route } from "./+types/home";
// import Header from "~/components/Header";
// import Footer from "~/components/Footer";
// import Main from "~/components/Main";
// import { getCurrentUser } from "~/utils/supabaseClient";

// // メタ情報
// export function meta(): ReturnType<Route.MetaFunction> {
//   return [
//     { title: "ホーム - ToDoアプリ" },
//     {
//       name: "description",
//       content: "プロジェクト管理とタスク管理のホーム画面",
//     },
//   ];
// }

// export default function Home() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const checkAuth = async () => {
//       const user = await getCurrentUser();
//       if (!user) {
//         navigate("/login");
//       } else {
//         setLoading(false);
//       }
//     };

//     checkAuth();
//   }, [navigate]);

//   return (
//     <div className="flex flex-col h-screen bg-green-50 relative">
//       {/* スピナーオーバーレイ */}
//       {loading && (
//         <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
//           <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
//         </div>
//       )}

//       {/* 通常のページ構成 */}
//       <Header />
//       <Main />
//       <Footer />
//     </div>
//   );
// }

// // import { useEffect } from "react";
// // import { useNavigate } from "react-router";
// // import type { Route } from "./+types/home";
// // import Header from "~/components/Header";
// // import Footer from "~/components/Footer";
// // import Main from "~/components/Main";
// // import { getCurrentUser } from "~/utils/supabaseClient";

// // export function meta(): ReturnType<Route.MetaFunction> {
// //   return [
// //     { title: "ホーム - ToDoアプリ" },
// //     { name: "description", content: "プロジェクト管理とタスク管理のホーム画面" },
// //   ];
// // }

// // export default function Home() {
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     const checkAuth = async () => {
// //       const user = await getCurrentUser();
// //       if (!user) {
// //         navigate('/login');
// //       }
// //     };
    
// //     checkAuth();
// //   }, [navigate]);

// //   return (
// //     <div className="flex flex-col h-screen bg-green-50">
// //       <Header />
// //       <Main />
// //       <Footer />
// //     </div>
// //   );
// // }
