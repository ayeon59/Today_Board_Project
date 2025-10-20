// src/app/App.jsx
import { Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout"; // 홈 화면(헤더 포함)
import LoginPage from "../features/auth/LoginPage"; // 로그인 페이지

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
