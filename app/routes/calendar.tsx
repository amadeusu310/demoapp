import { Link } from "react-router";
import type { Route } from "./+types/calendar";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import { getCurrentUser } from "~/utils/supabaseClient";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "タスクル | カレンダー" },
    { name: "description", content: "タスクの進捗を確認できるカレンダーです。" },
  ];
}

export default function calendar(){
  
}