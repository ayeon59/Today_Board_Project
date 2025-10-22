# Today_Board

> 사용자들이 자유롭게 글을 작성하고 소통할 수 있는 커뮤니티형 게시판입니다.

## 🚀 프로젝트 개요

React + NestJS 기반의 게시판 애플리케이션입니다. 게시글과 댓글 CRUD, 좋아요, 통계 위젯, 마이페이지 등 커뮤니티 운영에 필요한 핵심 기능을 제공합니다. 프론트엔드는 Vite 기반 SPA로 Tailwind CSS를 사용해 일관된 UI를 제공하며, 백엔드는 NestJS + Prisma 조합으로 PostgreSQL을 사용합니다.

## 💡 주요 기능

- **게시판 홈 대시보드**: 전체 글 수, 좋아요 수, 댓글 수, 오늘의 인기 글 카드 제공
- **게시글 관리**: 목록/검색/정렬, 상세 조회, 작성·수정·삭제, 이미지 업로드, 좋아요 토글
- **댓글 시스템**: 권한 체크 기반 댓글 작성/삭제, 비회원도 열람 가능한 댓글 목록
- **인증/인가**: JWT 기반 로그인·회원가입, 내 게시글 목록 등 보호된 API
- **반응형 UI**: Tailwind CSS와 재사용 가능한 컴포넌트로 데스크톱/모바일 대응

## 🛠️ 기술 스택

| 영역            | 기술                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**    | React (Vite), React Router, Tailwind CSS, Context API                                                                                |
| **Backend**     | NestJS, Prisma, Passport JWT, Class Validator                                                                                        |
| **Database**    | PostgreSQL                                                                                                                            |
| **Build / Dev** | Vite, Nest CLI, ESLint, Prettier                                                                                                     |
| **Infra**       | .env 기반 환경 분리, Prisma Migration, 업로드 디렉터리(Local)                                                                        |

## 아키텍처

<img width="880" height="481" alt="스크린샷 2025-10-23 오전 12 17 22" src="https://github.com/user-attachments/assets/6e54c265-893b-44c7-a268-b74a46f7d418" />

## 📁 프로젝트 구조

### Frontend (`frontend/`)

```
frontend/
 ├─ public/                       # 정적 자산
 ├─ src/
 │   ├─ app/                      # 앱 엔트리 및 레이아웃
 │   ├─ features/                 # 도메인별 UI + 상태
 │   └─ shared/                   # 공용 API, 컴포넌트, 스타일
 ├─ index.html
 └─ vite.config.js
```

### Backend (`backend/`)

```
backend/
 ├─ prisma/                       # Prisma 스키마, 서비스, 마이그레이션
 ├─ src/
 │   ├─ auth/                     # JWT 인증 모듈
 │   ├─ posts/                    # 게시글 CRUD + 통계
 │   ├─ comments/                 # 댓글 CRUD
 │   └─ uploads/                  # 파일 업로드 모듈
 ├─ uploads/                      # 업로드된 파일 저장소
 └─ package.json
```

### 주요 백엔드 엔드포인트

| 영역      | Method | Path                        | 설명                         | 인증 |
| --------- | ------ | --------------------------- | ---------------------------- | ---- |
| Auth      | POST   | `/auth/register`            | 회원가입                     | -    |
|           | POST   | `/auth/login`               | 로그인                       | -    |
|           | GET    | `/auth/profile`             | 로그인 사용자 정보 조회      | 🔐   |
| Posts     | GET    | `/posts`                    | 게시글 목록 (필터/검색 지원) | 🔓/🔐 |
|           | GET    | `/posts/summary`            | 홈 대시보드 데이터           | 🔓/🔐 |
|           | GET    | `/posts/me/list`            | 내 게시글 목록               | 🔐   |
|           | GET    | `/posts/:id`                | 게시글 상세                  | 🔓/🔐 |
|           | POST   | `/posts`                    | 게시글 작성                  | 🔐   |
|           | PATCH  | `/posts/:id`                | 게시글 수정                  | 🔐   |
|           | DELETE | `/posts/:id`                | 게시글 삭제                  | 🔐   |
|           | POST   | `/posts/:id/like`           | 좋아요 토글                  | 🔐   |
| Comments  | GET    | `/posts/:postId/comments`   | 댓글 목록                    | 🔓/🔐 |
|           | POST   | `/posts/:postId/comments`   | 댓글 작성                    | 🔐   |
|           | DELETE | `/posts/:postId/comments/:commentId` | 댓글 삭제        | 🔐   |

## ✅ 시작하기

### 1. 사전 준비

- Node.js 20.x 이상
- npm 10.x 이상
- PostgreSQL 14 이상 (로컬 또는 클라우드 인스턴스)

### 2. 저장소 클론 및 의존성 설치

```bash
git clone <REPOSITORY_URL>
cd Today_Board_Project

# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 3. 환경 변수 설정

#### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:3000
```

#### Backend (`backend/.env`)

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/today_board?schema=public"
JWT_SECRET="change-me"
JWT_EXPIRES_IN="7d"
```

> 기본 `.env` 파일이 이미 존재합니다. 환경에 맞게 값을 수정하세요.

### 4. 데이터베이스 마이그레이션

```bash
cd backend
npx prisma migrate deploy
```

필요 시 Prisma Studio로 데이터 확인이 가능합니다.

```bash
npx prisma studio
```

### 5. 로컬 개발 서버 실행

#### Backend

```bash
cd backend
npm run start:dev   # http://localhost:3000
```

#### Frontend

```bash
cd frontend
npm run dev         # http://localhost:5173 (기본값)
```

프론트엔드 `.env`의 `VITE_API_URL`이 백엔드 주소와 일치하도록 설정하세요.

## 🧪 테스트 & 린트

| 영역      | 명령어                | 설명                    |
| --------- | --------------------- | ----------------------- |
| Frontend  | `npm run lint`        | ESLint 규칙 점검        |
| Backend   | `npm run test`        | 단위 테스트 실행        |
| Backend   | `npm run lint`        | NestJS ESLint 검사      |
| Backend   | `npm run test:e2e`    | E2E 테스트 (구성 시)    |

## 📦 배포 참고

- 백엔드는 `npm run build` 후 `npm run start:prod`로 실행합니다.
- Prisma 마이그레이션은 배포 파이프라인에서 `npx prisma migrate deploy`로 반영합니다.
- 업로드 파일은 `backend/uploads/` 경로를 사용하므로, 배포 환경에서 해당 디렉터리의 영속성 확보가 필요합니다.

## 📚 추가 참고 자료

- Tailwind 구성: `frontend/tailwind.config.js`
- 공통 API 클라이언트: `frontend/src/shared/api/client.js`
- Prisma 스키마: `backend/prisma/schema.prisma`

모든 기능이 정상 동작하는지 마지막으로 확인하고 필요한 설정은 위 내용을 참고해 마무리하세요.
