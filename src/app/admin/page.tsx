'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Admin 컴포넌트를 동적 임포트로 클라이언트 사이드에서만 렌더링
const Admin = dynamic(() => import('@/pages/Admin'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-600 text-xl">로딩 중...</div>
    </div>
  )
})

export default function AdminPage() {
  return <Admin />
} 