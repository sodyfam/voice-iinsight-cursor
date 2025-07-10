# 열린마음협의회 정보 구조 (Information Architecture)

## 📋 목차
1. [시스템 개요](#시스템-개요)
2. [사용자 유형](#사용자-유형)
3. [사이트맵](#사이트맵)
4. [페이지별 상세 구조](#페이지별-상세-구조)
5. [컴포넌트 계층구조](#컴포넌트-계층구조)
6. [데이터 구조](#데이터-구조)
7. [네비게이션 시스템](#네비게이션-시스템)
8. [상태 관리](#상태-관리)

---

## 시스템 개요

**열린마음협의회**는 OK금융그룹 내부 직원들의 의견 수집 및 관리를 위한 웹 애플리케이션입니다.

### 기술 스택
- **Frontend**: Next.js 14 + TypeScript (App Router)
- **UI Framework**: shadcn/ui + Tailwind CSS
- **상태 관리**: Zustand + React Query
- **Backend**: Supabase (PostgreSQL + Realtime)
- **인증**: localStorage 기반 세션 관리
- **배포**: Vercel

---

## 사용자 유형

### 👤 일반 사용자 (직원)
- **권한**: 의견 제출, 본인 의견 조회
- **기본 페이지**: 대시보드 (의견제출 탭)
- **접근 가능**: 대시보드, 의견제출, 의견목록, 로그아웃

### 👨‍💼 관리자
- **권한**: 전체 의견 조회/관리, 통계 대시보드, 사용자 관리
- **기본 페이지**: 대시보드
- **접근 가능**: 모든 기능 (관리자 패널 포함)

---

## 사이트맵

```
열린마음협의회
├── 🔐 로그인 (/login)
│   ├── 로그인 폼 (SHA256 해시 인증)
│   └── 사용자등록 폼
│
├── 📊 통합 대시보드 (/dashboard)
│   ├── 사이드바 네비게이션
│   ├── 📈 대시보드 (관리자만)
│   │   ├── KPI 카드 (4개)
│   │   ├── 실시간 통계
│   │   └── 최근 의견 목록
│   ├── ✍️ 의견제출
│   │   ├── 카테고리 선택
│   │   ├── 제목 입력
│   │   └── 제안사항 입력 (AI 분석 자동 적용)
│   ├── 📋 의견목록
│   │   ├── 검색 및 필터
│   │   ├── 페이지네이션
│   │   └── 상세보기 다이얼로그
│   └── 👥 관리자 패널 (관리자만)
│       ├── 고급 검색 및 필터
│       ├── 의견 관리 (상태 변경)
│       ├── 사용자 관리
│       └── Excel 내보내기
│
├── 📄 의견상세 (/opinion/[id])
│   ├── 기본 정보
│   ├── 의견 내용 (ASIS/TOBE)
│   ├── 🧠 AI 분석 결과
│   │   ├── 기대효과 (effect)
│   │   └── 적용사례 (case_study)
│   ├── 관리자 답변 (처리완료 시)
│   └── 처리 상태 관리 (관리자만)
│
└── ❌ 404 (/not-found)
    └── 페이지 없음 안내
```

---

## 페이지별 상세 구조

### 🔐 로그인 페이지 (`/login`)
```
📋 로그인 시스템
├── 브랜딩 헤더
│   ├── 열린마음 협의회 로고
│   └── Voice Pulse Insight 부제목
├── 탭 기반 인터페이스
│   ├── 🔑 로그인 탭
│   │   ├── 사번 입력
│   │   ├── 비밀번호 입력 (SHA256 해시)
│   │   └── 로그인 버튼
│   └── 📝 사용자등록 탭
│       ├── 개인 정보 입력
│       ├── 계열사/부서 선택
│       └── 등록 버튼
└── 반응형 레이아웃 (모바일 최적화)
```

**인증 흐름**:
1. SHA256 해시 기반 비밀번호 암호화
2. Supabase 인증 후 localStorage에 사용자 정보 저장
3. 권한별 리다이렉트 (관리자 → 대시보드, 일반 → 의견제출)

### 📊 통합 대시보드 (`/dashboard`)
```
🏠 메인 대시보드
├── 🧭 AppSidebar (좌측 사이드바)
│   ├── 브랜딩 영역
│   ├── 네비게이션 메뉴
│   │   ├── 📊 대시보드 (관리자만)
│   │   ├── ✍️ 의견제출
│   │   ├── 📋 의견목록
│   │   └── 👥 관리자 (관리자만)
│   └── 사용자 정보 및 로그아웃
├── 📱 메인 콘텐츠 영역
│   ├── 📈 DashboardStats (관리자만)
│   │   ├── KPI 카드 (총 의견, 참여자, 참여율, 처리율)
│   │   ├── 분기별 추이 차트
│   │   ├── 카테고리 분포 차트
│   │   └── 최근 의견 테이블
│   ├── ✍️ OpinionSubmissionForm
│   │   ├── 카테고리 선택 (Supabase 동적 로드)
│   │   ├── 제목 입력
│   │   ├── 제안사항 입력
│   │   └── AI 자동 분석 (제출 시)
│   ├── 📋 OpinionList
│   │   ├── 검색 필터 (제목, 내용, 상태별)
│   │   ├── 분기/연도 필터
│   │   ├── 카테고리 필터
│   │   ├── 의견 카드 목록
│   │   └── 상세보기 다이얼로그
│   └── 👥 AdminPanel (관리자만)
│       ├── 고급 검색 필터
│       ├── 사용자 관리
│       ├── 의견 상태 관리
│       └── Excel 내보내기
└── 🌙 테마 토글 및 반응형 지원
```

### 📝 의견 제출 시스템
```
💭 의견 등록 폼
├── 폼 필드 섹션
│   ├── 📂 카테고리 선택 (Supabase 연동)
│   ├── 📝 제목 입력 (필수)
│   └── 💬 제안사항 (필수, 최대 1000자)
├── 🧠 AI 분석 자동 처리
│   ├── 기대효과 자동 생성
│   ├── 적용사례 자동 생성
│   └── 부적절 내용 자동 감지
├── 제출 버튼 (로딩 상태 표시)
└── Toast 피드백 시스템
```

### 📋 의견 관리 시스템
```
🔍 의견 관리 인터페이스
├── 📊 AdminPanel (관리자 전용)
│   ├── 검색 및 필터 영역
│   │   ├── 🔎 통합 검색 (사번, 이름, 제목, 내용)
│   │   ├── 📅 분기/연도 필터
│   │   ├── 🏷️ 상태 필터 (접수/처리중/답변완료)
│   │   ├── 📂 카테고리 필터
│   │   └── �� 계열사 필터
│   ├── 검색 결과 테이블
│   │   ├── 정렬 기능 (날짜, 상태)
│   │   ├── 페이지네이션
│   │   └── 상세보기 모달
│   └── 📊 사용자 관리
│       ├── 사용자 목록
│       └── 사용자 카드 정보
├── 📋 OpinionList (일반 사용자)
│   ├── 간단한 검색 필터
│   ├── 의견 카드 목록
│   └── 상세보기 다이얼로그
└── 📤 Excel 내보내기 (관리자만)
```

---

## 컴포넌트 계층구조

### 🏗️ Next.js App Router 구조
```
app/
├── layout.tsx (RootLayout)
│   ├── QueryClientProvider
│   ├── TooltipProvider
│   └── Toaster
├── page.tsx (Home → 로그인으로 리다이렉트)
├── login/
│   └── page.tsx (Login Component)
├── dashboard/
│   └── page.tsx (Dashboard Layout with Sidebar)
├── admin/
│   └── page.tsx (Admin Panel)
├── opinion/[id]/
│   └── page.tsx (Opinion Detail)
└── not-found.tsx (404 페이지)
```

### 📱 컴포넌트 구조
```
components/
├── 🧭 AppSidebar.tsx (사이드바 네비게이션)
├── 📊 DashboardStats.tsx (관리자 대시보드)
├── ✍️ OpinionSubmissionForm.tsx (의견 제출)
├── 📋 OpinionList.tsx (의견 목록)
├── 📄 OpinionDetail.tsx (의견 상세보기)
├── 👥 UserManagement.tsx (사용자 관리)
├── 🔧 AdminPanel.tsx (관리자 패널)
├── admin/ (관리자 전용 컴포넌트)
│   ├── AdminPanelHeader.tsx
│   ├── SearchFilters.tsx
│   ├── SearchResults.tsx
│   ├── OpinionDetailModal.tsx
│   ├── UserCard.tsx
│   ├── UserList.tsx
│   ├── LoadingState.tsx
│   ├── EmptyState.tsx
│   └── AdminActions.tsx
└── ui/ (shadcn/ui 컴포넌트)
    ├── sidebar.tsx (최신 추가)
    ├── card.tsx, dialog.tsx, button.tsx
    ├── form.tsx, input.tsx, textarea.tsx
    ├── table.tsx, badge.tsx
    └── toast.tsx, alert.tsx
```

---

## 데이터 구조

### 🗃️ Supabase 스키마
```typescript
// 사용자 정보
interface User {
  id: string;           // 고유 ID
  employee_id: string;  // 사번 (고유)
  name: string;         // 이름
  email?: string;       // 이메일
  company_id: string;   // 계열사 ID (FK)
  dept?: string;        // 부서
  role: string;         // 권한 (user/admin)
  password_hash: string; // 해시된 비밀번호
  status: string;       // 상태 (active/inactive)
  created_at: string;   // 생성일시
  last_login_at?: string; // 최종 로그인
}

// 의견 데이터 (핵심 확장)
interface Opinion {
  id: number;           // 고유 ID
  seq: number;          // 순번 (고유)
  user_id: string;      // 제출자 ID
  category_id: number;  // 카테고리 ID (FK)
  company_affiliate_id: number; // 계열사 ID (FK)
  title?: string;       // 제목
  content: string;      // 내용 (제목과 동일)
  asis?: string;        // 현재 상황
  tobe?: string;        // 개선 제안
  effect?: string;      // 🧠 AI 기대효과
  case_study?: string;  // 🧠 AI 적용사례
  quarter: string;      // 분기 (Q1-Q4)
  status: string;       // 상태 (접수/처리중/답변완료)
  negative_score?: number; // 부적절 표현 점수 (0-10)
  proc_id?: string;     // 처리자 ID
  proc_name?: string;   // 처리자명
  proc_desc?: string;   // 처리 내용
  reg_date?: string;    // 등록일시
  created_at: string;   // 생성일시
  updated_at?: string;  // 수정일시
  answered?: boolean;   // 답변 완료 여부
}

// 카테고리 마스터
interface Category {
  id: number;           // 고유 ID
  name: string;         // 카테고리명
  code?: string;        // 코드
  description?: string; // 설명
  sort_order: number;   // 정렬 순서
  status: string;       // 상태 (active/inactive)
  created_at: string;   // 생성일시
}

// 계열사 마스터
interface CompanyAffiliate {
  id: number;           // 고유 ID
  name: string;         // 계열사명
  code?: string;        // 코드
  description?: string; // 설명
  status: string;       // 상태 (active/inactive)
  created_at: string;   // 생성일시
}
```

### 📊 실시간 통계 데이터
```typescript
interface DashboardStats {
  totalOpinions: number;      // 총 의견 수
  totalParticipants: number;  // 참여자 수
  participationRate: number;  // 참여율 (%)
  processingRate: number;     // 처리율 (%)
  quarterlyTrend: Array<{     // 분기별 추이
    quarter: string;
    count: number;
  }>;
  categoryDistribution: Array<{ // 카테고리 분포
    category: string;
    count: number;
    percentage: number;
  }>;
}
```

---

## 네비게이션 시스템

### 🧭 사이드바 기반 네비게이션
```
AppSidebar (shadcn/ui sidebar)
├── 📊 대시보드 (관리자만)
├── ✍️ 의견제출 (모든 사용자)
├── 📋 의견목록 (모든 사용자)
├── 👥 관리자 (관리자만)
└── 🚪 로그아웃
```

### 📱 반응형 네비게이션
- **데스크톱**: 고정 사이드바 (280px)
- **모바일**: 접을 수 있는 사이드바 (오버레이)
- **태블릿**: 자동 축소/확장

### 🔗 URL 구조 (App Router)
```
/                    # 홈 (로그인으로 리다이렉트)
/login              # 로그인/등록
/dashboard          # 통합 대시보드
/admin              # 관리자 패널
/opinion/[id]       # 의견 상세보기
/not-found          # 404 페이지
```

---

## 상태 관리

### 🔄 React Query (TanStack Query)
```typescript
// 주요 쿼리 키
'opinions'                // 의견 목록
'opinion', id            // 개별 의견
'categories'             // 카테고리 목록
'companies'              // 계열사 목록
'users'                  // 사용자 목록 (관리자)
'dashboard-stats'        // 대시보드 통계
```

### 💾 로컬 상태 (useState + useEffect)
```typescript
// 전역 상태 (localStorage 기반)
interface UserInfo {
  id: string;
  name: string;
  role: string;
  employeeId: string;
  company: string;
  dept?: string;
}

// 컴포넌트별 로컬 상태
const [isAdmin, setIsAdmin] = useState<boolean>()
const [selectedOpinion, setSelectedOpinion] = useState<Opinion | null>()
const [searchTerm, setSearchTerm] = useState<string>()
const [statusFilter, setStatusFilter] = useState<string>()
```

### 🛡️ SSR 안전 localStorage 유틸리티
```typescript
// safeLocalStorage (SSR 호환)
export const safeLocalStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // 무시
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // 무시
    }
  }
};
```

---

## 🧠 AI 분석 시스템

### AI 자동 분석 기능
```
의견 제출 시 자동 처리
├── 📝 기대효과 생성 (effect)
├── 📚 적용사례 생성 (case_study)
├── 🚫 부적절 내용 감지 (negative_score)
└── 📊 실시간 UI 반영
```

### AI 분석 결과 표시
- **OpinionDetailModal**: AI 분석 답변 섹션
- **OpinionDetail**: 기대효과/적용사례 카드
- **색상 구분**: 기대효과(초록), 적용사례(노랑)

---

## 📊 현재 구현 상태

### ✅ 완료된 기능
- 🔐 Next.js App Router 기반 인증 시스템
- 📊 Supabase 실시간 데이터베이스 연동
- 🧭 shadcn/ui 사이드바 네비게이션
- 📱 완전 반응형 UI (모바일 최적화)
- 🧠 AI 분석 자동 처리 (effect, case_study)
- ✍️ 의견 제출 시스템 (실시간 검증)
- 📋 의견 목록 및 검색 (페이지네이션)
- 👥 관리자 패널 (사용자/의견 관리)
- 📤 Excel 내보내기 (관리자 전용)
- 🔔 Toast 기반 실시간 피드백
- 🌙 다크 모드 지원
- ♿ 접근성 최적화

### 🔄 개선 예정
- 📈 고급 통계 차트 확장
- 🔍 전문 검색 엔진 도입
- 📱 PWA 지원
- 🚀 성능 최적화 (코드 분할)
- 🔒 고급 보안 기능

---

**최종 업데이트**: 2024년 12월 현재  
**문서 버전**: v2.0  
**기술 스택**: Next.js 14 + Supabase + shadcn/ui  
**작성자**: AI Assistant (실제 구현 코드 분석 기반)
