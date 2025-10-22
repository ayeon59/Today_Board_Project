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

#### Backend 주요 파일/폴더 요약

- `backend/src/main.ts` : NestJS 애플리케이션 부트스트랩과 전역 파이프/필터 설정.
- `backend/src/app.module.ts` : 루트 모듈, 각 도메인 모듈과 Prisma 모듈을 묶어줌.
- `backend/src/auth` : JWT 인증 전체 흐름 (컨트롤러, 서비스, 가드, DTO).
- `backend/src/posts` : 게시글 CRUD 및 좋아요 토글 로직.
  - `posts.controller.ts` : `/posts` 엔드포인트 라우팅과 가드/데코레이터 설정으로 요청을 서비스에 전달.
  - `posts.service.ts` : Prisma를 이용해 게시글 데이터를 조회/수정하고 DTO로 응답을 조립.
- `backend/src/comments` : 댓글 API 컨트롤러와 DTO.
- `backend/src/uploads` : 파일 업로드 처리 모듈.
- `backend/prisma/schema.prisma` : 데이터베이스 모델 정의.
- `backend/uploads/` : 실제 업로드 파일이 저장되는 디렉터리.

#### Posts 모듈 핵심 함수 개요

- `posts.controller.ts` 메서드들  
  `/posts` 라우트의 핸들러들(`list`, `summary`, `listMine`, `detail`, `create`, `update`, `remove`, `toggleLike`). 전부 Nest 데코레이터로 HTTP 메서드·경로·가드를 지정하고, `PostsService`의 대응 함수 결과를 그대로 반환하는 비동기 함수입니다.

- `posts.service.ts` 메서드들  
  `findAll`, `findOne`, `findMine`, `create`, `update`, `remove`, `toggleLike`, `getHomeSummary` 등이 Prisma ORM으로 DB를 조작합니다. 모든 메서드는 `async/await` 패턴을 공유하며, 권한 검사와 DTO 변환을 포함해 컨트롤러가 사용할 최종 데이터를 준비합니다.

---

## 💡 주요 기능

- **게시판 홈**
  - 전체 글 수, 좋아요 수, 댓글 수 통계 표시
  - 전체 게시판 중 오늘 하루 가장 핫한 게시판 글 표시

---
