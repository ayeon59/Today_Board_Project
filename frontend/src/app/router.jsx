import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

// 페이지들 (없다면 간단한 더미 컴포넌트로 대체 가능)
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import RegisterPage from "../features/auth/pages/RegisterPage.jsx";
import BoardHome from "../features/board/pages/BoardHome.jsx";
import BoardListPage from "../features/board/pages/BoardListPage.jsx";
import BoardDetailPage from "../features/board/pages/BoardDetailPage.jsx";
import MyPostsPage from "../features/board/pages/MyPostsPage.jsx";
import PostEditPage from "../features/board/pages/PostEditPage.jsx";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <BoardHome /> },
      { path: "posts", element: <BoardListPage /> },
      { path: "posts/:id", element: <BoardDetailPage /> },
      { path: "myposts", element: <MyPostsPage /> },
      { path: "editor/:id?", element: <PostEditPage /> },
    ],
  },
]);
