# Today_Board

> 사용자들이 자유롭게 글을 작성하고 소통할 수 있는 커뮤니티형 게시판입니다.

## 🚀 프로젝트 개요

이 프로젝트는 React 기반의 게시판 웹 애플리케이션으로,
UI는 **Tailwind CSS**를 사용해 빠르고 일관된 디자인을 제공합니다.

---

## 기술 스택

| 영역                 | 기술                                       |
| -------------------- | ------------------------------------------ |
| **Frontend**         | React (Vite), React Router, Tailwind CSS   |
| **State Management** | React Hooks / Context API                  |
| **Data Layer**       | JSON 기반 Mock API (추후 NestJS 연동 예정) |
| **Build Tool**       | Vite                                       |
| **Version Control**  | Git / GitHub                               |

---

## 📁 현재 폴더 구조

```
Today_Board_Project/
 ├─ frontend/             # React + Vite 프론트엔드
 │   ├─ index.html
 │   ├─ src/
 │   │   ├─ app/
 │   │   │   ├─ App.jsx
 │   │   │   ├─ layout/
 │   │   │   │   └─ Header.jsx
 │   │   │   └─ main.jsx
 │   │   ├─ features/
 │   │   │   └─ auth/
 │   │   │       ├─ LoginPage.jsx
 │   │   │       └─ RegisterPage.jsx
 │   │   └─ shared/styles/index.css
 │   └─ package.json
 └─ backend/              # NestJS 백엔드 (초기 세팅 완료)
    ├─ src/
    ├─ package.json
     └─ tsconfig.json
```

---

## 💡 주요 기능

- **게시판 홈**
  - 전체 글 수, 좋아요 수, 댓글 수 통계 표시
  - 전체 게시판 중 오늘 하루 가장 핫한 게시판 글 표시

---
