
type DbTask = {
    id: number | string;
    title: string;
    created_at: string | Date;
    period: string | Date;
    completed: boolean;
};

//global宣言、型定義専用ファイル
//react-frappe-ganttの宣言を確実に認識させる目的で作成
