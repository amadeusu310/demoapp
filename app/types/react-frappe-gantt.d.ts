//型定義専用ファイル
declare module "react-frappe-gantt"{
    export interface GanttTask {
        id: string;
        name: string;
        start: string;
        end: string;
        progress: number;
    }
    const Gantt: React.FC<{ tasks: GanttTask[]; viewMode?: string }>;
    export default Gantt;
}

export type DbTask = {
    id: number | string;
    title: string;
    created_at: string | Date;
    period: string | Date;
    completed: boolean;
};

export type { GanttTask };