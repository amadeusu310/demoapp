import type { Route } from "./+types/test-supabase";
import { testConnection } from '~/utils/supabaseClient';

export function meta(): ReturnType<Route.MetaFunction> {
  return [
    { title: "Supabase接続テスト - ToDoアプリ" },
    { name: "description", content: "Supabaseデータベースの接続をテストします" },
  ];
}

// Supabase接続テスト用のコンポーネント
export default function TestSupabase() {
  const handleTest = async () => {
    const isConnected = await testConnection();
    if (isConnected) {
      alert('Supabase接続成功！');
    } else {
      alert('Supabase接続失敗。環境変数を確認してください。');
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Supabase接続テスト</h2>
      <button 
        onClick={handleTest}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        接続テスト
      </button>
      <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        このテストは環境変数が正しく設定されているかを確認します
      </p>
    </div>
  );
}
