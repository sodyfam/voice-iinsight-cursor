'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Login 컴포넌트를 동적 임포트로 클라이언트 사이드에서만 렌더링
const Login = dynamic(() => import('@/pages/Login'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-orange-500">
      <div className="text-white text-xl">로딩 중...</div>
    </div>
  )
})

export default function LoginPage() {
  return <Login />
} 