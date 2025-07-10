'use client'

import React, { useState, useEffect } from 'react'
import { OpinionDetail } from '@/components/OpinionDetail'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function OpinionDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { userProfile } = useAuth()
  const [opinionId, setOpinionId] = useState<string | null>(null)

  const isAdmin = userProfile?.role === 'admin'

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setOpinionId(resolvedParams.id)
    }
    
    getParams()
  }, [params])

  if (!opinionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <OpinionDetail opinionId={opinionId} isAdmin={isAdmin} />
      </div>
    </ProtectedRoute>
  )
} 