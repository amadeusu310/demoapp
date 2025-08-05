-- Supabase database schema for Todo App

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  current_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  deadline DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Project participants (many-to-many relationship)
CREATE TABLE IF NOT EXISTS project_participants (
  id SERIAL PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  username VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  category VARCHAR(100) DEFAULT '仕事',
  period DATE,
  point INTEGER DEFAULT 0,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Sessions table (for tracking user sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(255) NOT NULL,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_participants_project_id ON project_participants(project_id);
CREATE INDEX IF NOT EXISTS idx_project_participants_username ON project_participants(username);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data
INSERT INTO users (username, password, current_points) VALUES
  ('田中太郎', 'password123', 0),
  ('佐藤花子', 'password456', 0),
  ('山田次郎', 'password789', 0)
ON CONFLICT (username) DO NOTHING;

-- Insert initial projects
WITH inserted_projects AS (
  INSERT INTO projects (id, name, description, deadline) VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, 'プロジェクト1', '最初のプロジェクトです。基本的なタスク管理を行います。', '2025-08-30'),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'プロジェクト2', '2番目のプロジェクトです。より高度な機能を含みます。', '2025-09-15')
  ON CONFLICT (id) DO NOTHING
  RETURNING id, name
)
INSERT INTO project_participants (project_id, username)
SELECT '11111111-1111-1111-1111-111111111111'::uuid, unnest(ARRAY['田中太郎', '佐藤花子'])
UNION ALL
SELECT '22222222-2222-2222-2222-222222222222'::uuid, unnest(ARRAY['田中太郎', '山田次郎'])
ON CONFLICT DO NOTHING;

-- Insert initial tasks
INSERT INTO tasks (project_id, title, completed, category, period, point, comment) VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'タスク1', false, '仕事', '2025-08-10', 3, '重要なタスクです'),
  ('11111111-1111-1111-1111-111111111111'::uuid, 'タスク2', true, '個人', '2025-08-08', 2, '簡単なタスク'),
  ('22222222-2222-2222-2222-222222222222'::uuid, '設計書作成', true, '仕事', '2025-08-05', 8, '詳細な設計が必要')
ON CONFLICT DO NOTHING;

-- Row Level Security Policies (optional, for security)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_participants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
