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
   //日付フォーマット関数
  const formatDateYYMMDD = (date: Date) =>{
    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth()+1).padStart(2,"0");
    const dd = String(date.getDate()).padStart(2,"0");
    return `${yy}/${mm}/${dd}`;
  };

  //期間の日付表示をカスタム
  const CustomToolTip = ({task}: {task: Task})=>{
    return (
      <div className="p-2 text-sm">
        <p><strong>{task.name}</strong></p>
        <p>開始: {formatDateYYMMDD(task.start)}</p>
        <p>期限: {formatDateYYMMDD(task.end)}</p>
      </div>
    );
  };

export default function Calendar() {
  const [username, setUsername] = useState("");
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [projects, setProjects] = useState<{id: string; name: string}[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("全て");
  const [selectedCategory, setSelectedCategory] = useState<string>("全て");
  const [loading, setLoading] = useState(true);

  // タスク配列を安全にする関数
const sanitizeTasks = (tasks: any[]): Task[] => {
  return (tasks || []).filter(
    (t): t is Task =>
      t != null &&
      typeof t === "object" &&
      !!t.start &&
      !!t.end &&
      !isNaN(new Date(t.start).getTime())&&
      !isNaN(new Date(t.end).getTime())&&
      typeof t.name === "string"
  )
  .map((t)=>({
    ...t,
    start: t.start instanceof Date ? t.start : new Date(t.start),
    end: t.end instanceof Date ? t.end : new Date(t.end),
  }));
};
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

//ヘッダー日本語化（月・曜日・日付）
    useEffect(() => {
  // 置換ルール
  const replacements: [RegExp, string | ((...args: any[])=>string)][] = [
    // 「水 6 8月 2025」→「25/08/06」
    [ /([月火水木金土日]) (\d{1,2}) (\d{1,2})月 (\d{4})/g,
    (_, _youbi, day, month, year) => {
      const mm = month.padStart(2, "0");
      const dd = day.padStart(2, "0");
      return `${year.slice(2)}/${mm}/${dd}`;
    }
    ],
    // 曜日（略称）
    [/\bMon\b/g, "月"],
    [/\bTue\b/g, "火"],
    [/\bWed\b/g, "水"],
    [/\bThu\b/g, "木"],
    [/\bFri\b/g, "金"],
    [/\bSat\b/g, "土"],
    [/\bSun\b/g, "日"],

    // 月（省略形＆完全形）
    [/Jan(uary)?/gi, "1月"],
    [/Feb(ruary)?/gi, "2月"],
    [/Mar(ch)?/gi, "3月"],
    [/Apr(il)?/gi, "4月"],
    [/May/gi, "5月"],
    [/Jun(e)?/gi, "6月"],
    [/Jul(y)?/gi, "7月"],
    [/Aug(ust)?/gi, "8月"],
    [/Sep(tember)?/gi, "9月"],
    [/Oct(ober)?/gi, "10月"],
    [/Nov(ember)?/gi, "11月"],
    [/Dec(ember)?/gi, "12月"],

    // name / From / To（大小・単語境界）
    [/\bName\b/gi, "タスク名"],
    [/\bname\b/gi, "タスク名"],
    [/\bFrom\b/gi, "開始"],
    [/\bTo\b/gi, "期限"],
    [/\bfrom\b/gi, "開始"],
    [/\bto\b/gi, "期限"],
  ];

  // テキストノードだけを置換するヘルパー
  const replaceTextInElement = (el: Element | Document) => {
    const walker = document.createTreeWalker(
      el,
      NodeFilter.SHOW_TEXT,
      null
    );
    let node: Node | null = walker.nextNode();
    while (node) {
      const original = node.nodeValue || "";
      let replaced = original;
      for (const [regex, rep] of replacements) {
        if(typeof rep === "string"){replaced = replaced.replace(regex, rep);
        } else {
          replaced = replaced.replace(regex, rep as(...args: any[])=> string);
        }
      }
      if (replaced !== original) node.nodeValue = replaced;
      node = walker.nextNode();
    }
  };

  // 初回：Gantt ルート（見つかればそれを使い、無ければ body）を探す
  const selectors = [
    ".gantt",
    ".gantt-wrapper",
    ".gantt-container",
    ".gantt-task-react",
    "#gantt",
    ".react-gantt"
  ];
  let container: Element | null = null;
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) {
      container = el;
      break;
    }
  }
  // 見つからなければ main 内を試し、それでも無ければ body を使う
  if (!container) container = document.querySelector("main") || document.body;

  // 初回置換（既にあるヘッダー等に対して）
  replaceTextInElement(container);

  // MutationObserver：動的に追加されたテキストを置換
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      // 子ノードの追加があったらそのノード（または親）を置換
      m.addedNodes.forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE) {
          // テキストノード単体が来たら親要素を置換
          const parent = n.parentElement;
          if (parent) replaceTextInElement(parent);
        } else if (n.nodeType === Node.ELEMENT_NODE) {
          const el = n as Element;
          // 要素自体とその子孫を置換
          replaceTextInElement(el);
        }
      });

      // textContent が変わるタイプの mutation (characterData) も処理
      if (m.type === "characterData" && m.target.nodeType === Node.TEXT_NODE) {
        const parent = (m.target as Node).parentElement;
        if (parent) replaceTextInElement(parent);
      }
    }
  });

  observer.observe(container, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  return () => observer.disconnect();
}, [filteredTasks]); // filteredTasks が変わったら初回置換を再実行


//ガントチャート描画
  const ganttComponent = useMemo(()=>{
      const safeFilteredTasks = sanitizeTasks(filteredTasks);
      if(safeFilteredTasks.length === 0){
        return <div>タスクがありません</div>
      }
    return (
      <Gantt tasks={safeFilteredTasks}
      viewMode={ViewMode.Day}
      TooltipContent={CustomToolTip}
      columnWidth={60}
      listCellWidth="155px"/>);
    }, [filteredTasks]);

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