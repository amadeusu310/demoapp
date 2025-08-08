import { supabase } from './supabase';
import type { User, Project, Task, Session, ProjectWithParticipants, ProjectParticipant } from './supabase';
import bcrypt from "bcryptjs";
import {useState} from "react";

// セッション管理（ブラウザのLocalStorageを使用）
const SESSION_KEY = 'todoapp_session';

// 遅延をシミュレート（開発時の動作確認用）
const delay = (ms: number = 50): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// ユーザー(アカウント)登録
export async function registerAccount(
  username: string,
  hashedPassword: string,
  iconData: string | null 
): Promise<User | null> {
const {data: existingUser, error: checkError} = await supabase
  .from("users").select("id").eq("username", username).single();

if(existingUser){
    alert("このユーザー名は既に使われています。別のユーザー名を設定してください。");
    console.error("このユーザー名は既に使われています");
    return null;
  }
if(checkError && checkError.code !== "PGRST116"){
  console.error("重複チェックエラー:", checkError);
  return null;
}
const {data, error} = await supabase
  .from("users")
  .insert([{ username, password: hashedPassword, icon_data: iconData },])
  .select()
  .single();

if (error) {
  console.error("supabase登録エラー:", error);
  return null;
}
  return data;
}


// ユーザー管理
export async function getUsers(): Promise<User[]> {
  await delay();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at');

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data || [];
}

export async function getUserById(id: number): Promise<User | null> {
  await delay();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
}

// 認証
export async function login(username: string, password: string): Promise<Session | null> {
  await delay();
  
  // ユーザー認証
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (userError || !user || user.length === 0) {
    console.error('Login failed: user not found', userError);
    return null;
  }

  // 既存のセッションを削除
  await supabase
    .from('sessions')
    .delete()
    .eq('user_id', user.id);

  // 新しいセッションを作成
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24時間後
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      username: user.username,
      expires_at: expiresAt
    })
    .select()
    .single();

  console.log("セッション作成結果", session);
  console.error("セッションエラー:", sessionError);

  if (sessionError || !session) {
    console.error('Session creation failed:', sessionError);
    return null;
  }

  // ローカルストレージにセッション情報を保存
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  return session;
}

export async function logout(): Promise<void> {//セッション削除＆＆ログアウト処理
  await delay();
  
  // ローカルストレージからセッション情報を取得
  if (typeof window !== 'undefined') {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      
      // データベースからセッションを削除
      await supabase
        .from('sessions')
        .delete()
        .eq('id', session.id);
    }
    
    // ローカルストレージからセッション情報を削除
    localStorage.removeItem(SESSION_KEY);
  }
}

export async function getCurrentSession(): Promise<Session | null> {//ローカルストレージとDBのセッション確認
  await delay();
  
  if (typeof window === 'undefined') return null;
  
  const sessionStr = localStorage.getItem(SESSION_KEY);
  if (!sessionStr) return null;

  const session = JSON.parse(sessionStr);
  
  // セッション有効期限チェック
  if (new Date(session.expires_at) < new Date()) {
    await logout();
    return null;
  }

  // データベースでセッションの存在確認
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', session.id)
    .eq('user_id', session.user_id)
    .single();

  if (error || !data) {
    await logout();
    return null;
  }

  return data;
}

export async function getCurrentUser(): Promise<User | null> {//セッションに紐づいたユーザーを取得
  const session = await getCurrentSession();
  if (!session) return null;
  return await getUserById(session.user_id);
}

// プロジェクト管理
export async function getProjects(): Promise<ProjectWithParticipants[]> {
  await delay();
  
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .order('created_at');

  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
    return [];
  }

  if (!projects) return [];

  // 各プロジェクトの参加者情報を取得
  const projectsWithParticipants = await Promise.all(
    projects.map(async (project) => {
      const { data: participants, error: participantsError } = await supabase
        .from('project_participants')
        .select('username')
        .eq('project_id', project.id);

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
        return { ...project, participants: [] };
      }

      return {
        ...project,
        participants: participants?.map(p => p.username) || []
      };
    })
  );

  return projectsWithParticipants;
}

export async function getProjectById(id: string): Promise<ProjectWithParticipants | null> {
  await delay();
  
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (projectError || !project) {
    console.error('Error fetching project:', projectError);
    return null;
  }

  // 参加者情報を取得
  const { data: participants, error: participantsError } = await supabase
    .from('project_participants')
    .select('username')
    .eq('project_id', id);

  if (participantsError) {
    console.error('Error fetching participants:', participantsError);
    return { ...project, participants: [] };
  }

  return {
    ...project,
    participants: participants?.map(p => p.username) || []
  };
}

export async function getUserProjects(username: string): Promise<ProjectWithParticipants[]> {
  await delay();
  
  // ユーザーが参加しているプロジェクトIDを取得
  const { data: participations, error: participationError } = await supabase
    .from('project_participants')
    .select('project_id')
    .eq('username', username);

  if (participationError) {
    console.error('Error fetching user participations:', participationError);
    return [];
  }

  if (!participations || participations.length === 0) return [];

  const projectIds = participations.map(p => p.project_id);

  // プロジェクト情報を取得
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .in('id', projectIds)
    .order('created_at');

  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
    return [];
  }

  if (!projects) return [];

  // 各プロジェクトの参加者情報を取得
  const projectsWithParticipants = await Promise.all(
    projects.map(async (project) => {
      const { data: participants, error: participantsError } = await supabase
        .from('project_participants')
        .select('username')
        .eq('project_id', project.id);

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
        return { ...project, participants: [] };
      }

      return {
        ...project,
        participants: participants?.map(p => p.username) || []
      };
    })
  );

  return projectsWithParticipants;
}

export async function createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'> & { participants: string[] }): Promise<ProjectWithParticipants | null> {
  await delay();
  
  const { participants, ...projectInfo } = projectData;

  // プロジェクトを作成
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert(projectInfo)
    .select()
    .single();

  if (projectError || !project) {
    console.error('Error creating project:', projectError);
    return null;
  }

  // 参加者を追加
  if (participants.length > 0) {
    const participantRows = participants.map(username => ({
      project_id: project.id,
      username
    }));

    const { error: participantsError } = await supabase
      .from('project_participants')
      .insert(participantRows);

    if (participantsError) {
      console.error('Error adding participants:', participantsError);
    }
  }

  return {
    ...project,
    participants
  };
}

export async function updateProject(id: string, projectData: Partial<Project> & { participants?: string[] }): Promise<ProjectWithParticipants | null> {
  await delay();
  
  let { participants, ...projectInfo } = projectData;

  // プロジェクト情報を更新
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .update(projectInfo)
    .eq('id', id)
    .select()
    .single();

  if (projectError || !project) {
    console.error('Error updating project:', projectError);
    return null;
  }

  // 参加者が指定されている場合は更新
  if (participants !== undefined) {
    // 既存の参加者を削除
    await supabase
      .from('project_participants')
      .delete()
      .eq('project_id', id);

    // 新しい参加者を追加
    if (participants.length > 0) {
      const participantRows = participants.map(username => ({
        project_id: id,
        username
      }));

      const { error: participantsError } = await supabase
        .from('project_participants')
        .insert(participantRows);

      if (participantsError) {
        console.error('Error updating participants:', participantsError);
      }
    }
  } else {
    // 参加者が指定されていない場合は既存の参加者を取得
    const { data: existingParticipants } = await supabase
      .from('project_participants')
      .select('username')
      .eq('project_id', id);

    participants = existingParticipants?.map(p => p.username) || [];
  }

  return {
    ...project,
    participants
  };
}

// タスク管理
export async function getTasks(): Promise<Task[]> {
  await delay();
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at');

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return data || [];
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  await delay();
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at');

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return data || [];
}

export async function getTaskById(id: number): Promise<Task | null> {
  await delay();
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching task:', error);
    return null;
  }

  return data;
}

export async function createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null> {
  await delay();
  
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData)
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    return null;
  }

  return data;
}

export async function updateTask(id: number, taskData: Partial<Task>): Promise<Task | null> {
  await delay();
  
  const { data, error } = await supabase
    .from('tasks')
    .update(taskData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    return null;
  }

  return data;
}

export async function deleteTask(id: number): Promise<boolean> {
  await delay();
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting task:', error);
    return false;
  }

  return true;
}

// タスクとプロジェクト名をまとめて取得
export async function getTasksWithProjectName() {
  // タスク一覧
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at');

  if (tasksError || !tasks) {
    console.error('Error fetching tasks:', tasksError);
    return [];
  }

  // プロジェクト一覧
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, name');

  if (projectsError || !projects) {
    console.error('Error fetching projects:', projectsError);
    return [];
  }

  // project_id で名前を付与
  return tasks.map(task => {
    const project = projects.find(p => p.id === task.project_id);
    return {
      ...task,
      project_name: project ? project.name : ''
    };
  });
}

// ポイント計算
export async function calculateUserPoints(username: string): Promise<number> {
  await delay();
  
  // ユーザーが参加しているプロジェクトを取得
  const projects = await getUserProjects(username);
  let totalPoints = 0;
  
  for (const project of projects) {
    const tasks = await getTasksByProjectId(project.id);
    const completedPoints = tasks
      .filter(task => task.completed)
      .reduce((sum, task) => sum + (task.point || 0), 0);
    totalPoints += completedPoints;
  }
  
  return totalPoints;
}

export async function getUserRankings(): Promise<Array<{username: string, points: number, rank: number}>> {
  await delay();
  
  const users = await getUsers();
  
  const userRankings = await Promise.all(
    users.map(async (user) => ({
      username: user.username,
      points: await calculateUserPoints(user.username),
      rank: 0
    }))
  );

  // ポイント順でソート（降順）
  userRankings.sort((a, b) => b.points - a.points);

  // ランクを設定
  userRankings.forEach((user, index) => {
    user.rank = index + 1;
  });

  return userRankings;
}

// データベース接続テスト
export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    return !error;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}
