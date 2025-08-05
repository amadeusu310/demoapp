import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// データベースの型定義
export interface User {
  id: number;
  username: string;
  password: string;
  current_points: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  deadline: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectParticipant {
  id: number;
  project_id: string;
  username: string;
  created_at: string;
}

export interface Task {
  id: number;
  project_id: string;
  title: string;
  completed: boolean;
  category: string;
  period: string;
  point: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: number;
  username: string;
  login_time: string;
  expires_at: string;
  created_at: string;
}

// プロジェクトの詳細情報（参加者情報含む）
export interface ProjectWithParticipants extends Project {
  participants: string[];
}

// レスポンス型
export interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}
