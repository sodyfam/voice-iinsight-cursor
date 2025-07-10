'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
        router.push('/login')
        return
      }

      if (requireAdmin && userProfile?.role !== 'admin') {
        // 관리자 권한이 필요한데 관리자가 아닌 경우 대시보드로 리다이렉트
        router.push('/dashboard')
        return
      }
    }
  }, [user, userProfile, loading, router, requireAdmin])

  // 로딩 중이거나 인증되지 않은 경우 로딩 표시
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 관리자 권한이 필요한데 관리자가 아닌 경우
  if (requireAdmin && userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-8">이 페이지는 관리자만 접근할 수 있습니다.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 