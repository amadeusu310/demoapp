import { Link } from "react-router";
import type { Route } from "./+types/calendar";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import { getTasks } from "~/utils/supabaseClient";
import { useState, useEffect } from "react";
import Gantt from "react-frappe-gantt";
import type {GanttTask, DbTask} from "~/types/react-frappe-gantt";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "タスクル | カレンダー" },
    { name: "description", content: "タスクの進捗を確認できるカレンダーです。" },
  ];
}

export default function Calendar(){
  const [tasks,setTasks] = useState<GanttTask[]>([]);//型指定

  useEffect(()=>{
    (async () => {
      const data: DbTask[] = await getTasks();

      const formatted: GanttTask[] = data.map(task =>({  //ガントチャート
        id: String(task.id),
        name: task.title,
        start: typeof task.created_at==="string" 
          ? task.created_at 
          : task.created_at
          ? task.created_at.toISOString().slice(0,10) 
          : "",
        end: typeof task.period==="string"
          ? task.period
          : task.period
          ? task.period.toISOString().slice(0,10)
          : "",
        progress: task.completed ? 100:0, //完了なら100%, 未完了は0%
      }));
      setTasks(formatted);
    })();
  }, []);

  return(
    <div className="flex flex-col h-screen bg-green-50">
      <Header />
      <main className="flex-grow pt-20 pb-20 overflow-y-auto p-4">
        {tasks.length > 0 ? (
          <Gantt tasks={tasks} viewMode="Day"/>
        ):(<p>読み込み中...</p>)}
      </main>
      <Footer />
    </div>
  )
}