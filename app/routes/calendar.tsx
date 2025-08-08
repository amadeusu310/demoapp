import { Link } from "react-router";
import type { Route } from "./+types/calendar";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import { useState, useEffect, useMemo } from "react";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import type { Task } from "gantt-task-react";
import { getTasks, getProjects } from "~/utils/supabaseClient";

interface ProjectTask extends Task {
  projectName: string;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "タスクル | カレンダー" },
    { name: "description", content: "タスクの進捗を確認できるカレンダーです。" },
  ];
}

export default function Calendar() {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("全て");

  useEffect(()=>{
    (async () => {
      const tasksData = await getTasks();
      const projectsData = await getProjects();

      const formatted: ProjectTask[] = tasksData.map((task) => {
        const project = projectsData.find(p=> p.id === task.project_id);
        return {
          id: String(task.id),
          name: task.title,
          start: new Date(task.created_at),//始まりでいいか？
          end: new Date(task.period),
          type: "task",
          progress: task.completed ? 100:0,
          isDisabled: true,
          projectName: project? project.name : "不明"
        } as ProjectTask;
        });
      setTasks(formatted);
    })();
  },[]);
  //プロジェクト一覧作成
  const projectList = useMemo(() => {
    const name = tasks.map(t => t.projectName);
    return ["全て", ...Array.from(new Set(name))];
  }, [tasks]);
  //プロジェクトでフィルタリング
  const filteredTasks = useMemo(() => {
    return selectedProject ==="全て"
    ? tasks : tasks.filter(task => task.projectName === selectedProject)
    },[tasks, selectedProject]);

  const ganttComponent = useMemo(()=>(
    <Gantt tasks={filteredTasks} viewMode={ViewMode.Day}/>
  ), [filteredTasks]);

  return (
    <div className="flex flex-col h-screen bg-green-50">
      <Header/>
      <main className="flex-grow pt-30 pb-20 overflow-y-auto p-4">
        {/*プロジェクト選択 */}
        <div className="mb-4">
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
        </div>
        {/*ガントチャート */}
          {tasks.length > 0 ? ganttComponent :(
            <p>タスクがありません</p>
          )}
      </main>
      <Footer />
    </div>
  );
}