console.log("🟢 index.tsx loaded");
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
import { supabase } from "./supabaseClient";

async function checkConnection() {
  const { data, error } = await supabase.auth.getUser();
  console.log("Supabase接続テスト:", { data, error });
}

checkConnection();