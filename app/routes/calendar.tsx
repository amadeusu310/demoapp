import { Link } from "react-router";
import type { Route } from "./+types/calendar";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import { useState, useEffect, useMemo } from "react";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import type { Task } from "gantt-task-react";
import { getCurrentUser} from "~/utils/supabaseClient";
import { supabase } from "~/utils/supabase";

interface ProjectTask extends Task {
  projectName: string;
  category: string;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "タスクル | カレンダー" },
    { name: "description", content: "タスクの進捗を確認できるカレンダーです。" },
  ];
}

//ユーザーの参加プロジェクトを取得
  const getUserProjects = async(username: string) => {
    const {data: parts, error: partError} = await supabase
      .from("project_participants")
      .select("project_id")
    .eq("username", username);

    if(partError) {
      console.error("参加プロジェクト取得エラー:", partError);
      return [];
    }
    const projectIds = Array.from(
      new Set((parts || []).map((p: any) => String(p.project_id)).filter(Boolean))
    );
    if (projectIds.length === 0) return [];

    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select("id, name")
      .in("id", projectIds);
    if(projectsError) {
      console.error("projects 取得エラー:", projectsError);
      return [];
    }
    return (projectsData || []).map((p:any)=>({
      id: String(p.id),
      name: p.name ?? "不明なプロジェクト",
    }));
  };

   //プロジェクトに属するタスクを取得
  const getUserTasksWithProjectName = async (projectIds: string[])=>{
    if(!projectIds || projectIds.length === 0) return [];

     const { data: projectsData, error: projectsError } = await supabase
    .from("projects")
    .select("id, name")
    .in("id", projectIds);

    const projectMap: Record<string, string> = {};
    if (!projectsError && projectsData) {
      for (const p of projectsData) {
        projectMap[String(p.id)] = p.name ?? "不明なプロジェクト";
      }
    } else if (projectsError) {
      console.warn("projects マップ取得で警告:", projectsError);
    }

    const {data, error} = await supabase
      .from("tasks").select(`
        id, title, created_at, period, completed, project_id, projects(name), category`
      ).in("project_id", projectIds);

    if(error){
      console.error("タスク取得エラー:", error);
      return [];
    }

    return (data || []).map((task:any) => {
    const start= task.created_at ? new Date(task.created_at) : new Date();
    const end = task.period ? new Date(task.period) : new Date(start.getTime()+1000*60*60*24);

     return {
      id: String(task.id),
      name: task.title ?? "(無題)",
      start,
      end,
      type: "task" as const,
      progress: task.completed ? 100: 0,
      isDisabled: true,
      projectName: projectMap[String(task.project_id)]?? "不明なプロジェクト",
      category: task.category ?? "",
    } as ProjectTask;
  });
  };

export default function Calendar() {
  const [username, setUsername] = useState("");
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [projects, setProjects] = useState<{id: string; name: string}[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("全て");
  const [selectedCategory, setSelectedCategory] = useState<string>("全て");

  //ユーザー名・プロジェクト・タスクを取得
  useEffect(()=>{
    const loadData = async ()=>{
      const user = await getCurrentUser();
      if (!user) return;

      setUsername(user.username);
      const userProjects= await getUserProjects(user.username);
      setProjects(userProjects);

      const projectIds = userProjects.map(p=>p.id);
      const userTasks = await getUserTasksWithProjectName(projectIds);
      setTasks(userTasks);
    };
    loadData();
  },[]);


  //プロジェクト一覧作成(選択用)
  const projectList = useMemo(() => {
    const name = tasks.map(t => t.projectName);
    return ["全て", ...Array.from(new Set(name))];
  }, [tasks]);

  //カテゴリ一覧作成(洗濯用)
  const categoryList = useMemo(()=>{
    const cats = tasks.map((t)=>t.category || "(未設定)");
    return ["全て", ...Array.from(new Set(cats))];
  }, [tasks]);

  //フィルタリング(プロジェクト・カテゴリ)
  const filteredTasks = useMemo(() => {
    return tasks.filter((tasks)=>{
      const projectMatch = selectedProject === "全て" || 
        tasks.projectName === selectedProject;
      const categoryMatch = selectedCategory === "全て" || 
        (tasks.category || "未設定") === selectedCategory;
      return projectMatch && categoryMatch;
    }); },[tasks, selectedProject, selectedCategory]);

  const ganttComponent = useMemo(()=>(
    <Gantt tasks={filteredTasks} viewMode={ViewMode.Day}/>
  ), [filteredTasks]);

  return (
    <div className="flex flex-col h-screen bg-green-50">
      <Header/>
      <main className="flex-grow pt-30 pb-20 overflow-y-auto p-4">
        <div className="mb-4 flex gap-2">
        {/*プロジェクト選択 */}
          <select value={selectedProject} title="プロジェクトを選択"
            onChange={(e)=>{
              console.log("選択されたproject:", e.target.value);
              setSelectedProject(e.target.value);}}
            className="border rounded p-2">
            {projectList.map((project)=>(
              <option key={project} value={project}>
                {project === "全て" ? "全てのプロジェクト" : project}
              </option>
            ))}
          </select>
        {/*カテゴリ選択 */}
          <select value={selectedCategory} title="カテゴリを選択"
            onChange={(e)=> setSelectedCategory(e.target.value)}
            className="border rounded p-2">
            {categoryList.map((cat)=>(
              <option key={cat} value={cat}>
                {cat === "全て" ? "全てのカテゴリ" : cat}
              </option>
            ))}
          </select>
        </div>
        {/*ガントチャート */}
          {tasks.length > 0 ? ganttComponent :
            <p>タスクがありません</p>}
      </main>
      <Footer />
    </div>
  );
}