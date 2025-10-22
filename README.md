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

## 📁 프로젝트 구조

### Frontend (`frontend/`)

```
frontend/
 ├─ public/                       # 정적 자산
 ├─ src/
 │   ├─ app/                      # 앱 엔트리 및 레이아웃
 │   │   ├─ main.jsx
 │   │   ├─ router.jsx
 │   │   └─ layout/
 │   │       ├─ AppLayout.jsx
 │   │       ├─ Header.jsx
 │   │       └─ NavTabs.jsx
 │   ├─ features/
 │   │   ├─ auth/                 # 인증 관련 화면/상태
 │   │   │   ├─ api/auth.api.js
 │   │   │   ├─ components/RequireAuth.jsx
 │   │   │   ├─ pages/{LoginPage,RegisterPage}.jsx
 │   │   │   └─ state/AuthContext.jsx
 │   │   └─ board/                # 게시판 기능
 │   │       ├─ api/{posts,comments}.api.js
 │   │       ├─ components/{PostList,PostItemRow,StatCard,...}.jsx
 │   │       └─ pages/{BoardHome,PostsPage,MyPostsPage,...}.jsx
 │   └─ shared/                   # 공통 유틸 및 스타일
 │       ├─ api/{client,uploads}.js
 │       ├─ components/
 │       └─ styles/{index,stat-animations}.css
 ├─ index.html
 └─ vite.config.js
```

### Backend (`backend/`)

```
backend/
 ├─ prisma/                       # Prisma 스키마 및 서비스
 │   ├─ schema.prisma
 │   ├─ prisma.service.ts
 │   └─ migrations/
 ├─ src/
 │   ├─ main.ts                   # Nest 부트스트랩
 │   ├─ app.module.ts
 │   ├─ auth/                     # JWT 인증 모듈
 │   │   ├─ auth.controller.ts
 │   │   ├─ auth.service.ts
 │   │   ├─ dto/{login,register,auth-response}.dto.ts
 │   │   └─ jwt-auth.guard.ts 등
 │   ├─ posts/                    # 게시글 도메인
 │   │   ├─ posts.controller.ts
 │   │   ├─ posts.service.ts
 │   │   ├─ dto/{create-post,update-post,post-response}.dto.ts
 │   │   └─ entities/
 │   ├─ comments/                 # 댓글 도메인
 │   │   ├─ comments.controller.ts
 │   │   └─ dto/
 │   └─ uploads/                  # 업로드 모듈
 ├─ uploads/                      # 업로드된 파일 저장소
 ├─ package.json
 └─ tsconfig.json
```

---

## 💡 주요 기능

- **게시판 홈**
  - 전체 글 수, 좋아요 수, 댓글 수 통계 표시
  - 전체 게시판 중 오늘 하루 가장 핫한 게시판 글 표시

---
