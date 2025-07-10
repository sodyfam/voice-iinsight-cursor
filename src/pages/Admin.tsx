
'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// AdminPanel을 동적 임포트로 클라이언트 사이드에서만 렌더링
const AdminPanel = dynamic(() => import("@/components/AdminPanel").then(mod => ({ default: mod.AdminPanel })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">로딩 중...</div>
})

const Admin = () => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 클라이언트 사이드에서만 렌더링
  if (!isClient) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminPanel />
      </div>
    </div>
  );
};

export default Admin;
