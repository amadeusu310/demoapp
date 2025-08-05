import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/home";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Main from "~/components/Main";
import { getCurrentUser } from "~/utils/supabaseClient";

export function meta(): ReturnType<Route.MetaFunction> {
  return [
    { title: "ホーム - ToDoアプリ" },
    { name: "description", content: "プロジェクト管理とタスク管理のホーム画面" },
  ];
}

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (!user) {
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen bg-green-50">
      <Header />
      <Main />
      <Footer />
    </div>
  );
}
