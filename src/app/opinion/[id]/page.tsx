'use client'

import React, { useState, useEffect } from 'react'
import { OpinionDetail } from '@/components/OpinionDetail'

export default function OpinionDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [opinionId, setOpinionId] = useState<string | null>(null)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setOpinionId(resolvedParams.id)
    }
    
    getParams()
    
    // 사용자 권한 확인
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      const user = JSON.parse(userInfo)
      setIsAdmin(user.role === '관리자')
    }
  }, [params])

  if (!opinionId) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OpinionDetail opinionId={opinionId} isAdmin={isAdmin} />
    </div>
  )
} 