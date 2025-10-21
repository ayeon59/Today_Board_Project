// src/app/router.jsx
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

// 페이지
import BoardHome from "../features/board/pages/BoardHome.jsx";
import PostsPage from "../features/board/pages/PostsPage.jsx";
import MyPostsPage from "../features/board/pages/MyPostsPage.jsx";
import PostEditPage from "../features/board/pages/PostEditPage.jsx";
import BoardDetailPage from "../features/board/pages/BoardDetailPage.jsx";

// 인증 페이지들은 그대로
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import RegisterPage from "../features/auth/pages/RegisterPage.jsx";
import RequireAuth from "../features/auth/components/RequireAuth.jsx";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <BoardHome /> }, // 메인
      { path: "posts", element: <PostsPage /> }, // 전체/자유/질문 탭
      {
        path: "myposts",
        element: (
          <RequireAuth>
            <MyPostsPage />
          </RequireAuth>
        ),
      }, // 내가 쓴 글
      {
        path: "editor/:id?",
        element: (
          <RequireAuth>
            <PostEditPage />
          </RequireAuth>
        ),
      },
      { path: "posts/:id", element: <BoardDetailPage /> }, // (옵션) 상세
    ],
  },
]);
