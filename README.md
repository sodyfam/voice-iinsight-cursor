# 열린마음 협의회 (Voice Pulse Insight)

OK금융그룹의 임직원 의견 수렴 및 관리 시스템입니다.

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: shadcn/ui
- **상태관리**: Zustand, React Query
- **데이터베이스**: Supabase
- **아이콘**: Lucide React

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/          # 대시보드 페이지
│   ├── login/             # 로그인 페이지
│   ├── admin/             # 관리자 페이지
│   ├── opinion/[id]/      # 의견 상세 페이지 (동적 라우트)
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈 페이지
├── components/            # 재사용 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── admin/            # 관리자 관련 컴포넌트
│   └── ...               # 기타 컴포넌트
├── hooks/                # 커스텀 훅
├── lib/                  # 유틸리티 함수
├── integrations/         # 외부 서비스 연동
│   └── supabase/         # Supabase 설정
└── pages/                # 기존 페이지 컴포넌트 (마이그레이션 중)
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 개발 서버 실행

```bash
npm run dev
```

애플리케이션이 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 주요 기능

### 사용자 기능
- **로그인**: 사번/비밀번호 기반 인증
- **의견 제출**: 카테고리별 의견 및 개선 제안 제출
- **의견 조회**: 제출한 의견의 처리 상태 확인

### 관리자 기능
- **대시보드**: 전체 의견 통계 및 현황 확인
- **의견 관리**: 제출된 의견 검토 및 처리
- **사용자 관리**: 사용자 권한 및 정보 관리
- **데이터 내보내기**: Excel 형태로 데이터 내보내기

## 배포

### 프로덕션 빌드

```bash
npm run build
npm start
```

### 정적 내보내기 (선택사항)

```bash
npm run build
npm run export
```

## 마이그레이션 노트

이 프로젝트는 Vite + React Router에서 Next.js App Router로 마이그레이션되었습니다.

### 주요 변경사항

1. **라우팅**: React Router → Next.js App Router
2. **번들러**: Vite → Next.js
3. **페이지 구조**: 파일 기반 라우팅 사용
4. **클라이언트 컴포넌트**: 인터랙티브 컴포넌트에 `'use client'` directive 추가

### 호환성

- 모든 기존 기능이 Next.js 환경에서 동일하게 작동합니다
- Supabase 연동 및 외부 API 호출 유지
- UI/UX 변경 없음

## 개발 가이드

### 코드 스타일

- TypeScript 사용
- Tailwind CSS 스타일링
- ESLint 규칙 준수
- shadcn/ui 컴포넌트 사용

### 커밋 규칙

- feat: 새로운 기능
- fix: 버그 수정
- docs: 문서 변경
- style: 코드 스타일 변경
- refactor: 코드 리팩토링
- test: 테스트 추가/수정

## 문의

프로젝트 관련 문의사항이 있으시면 개발팀에 연락해 주세요. 