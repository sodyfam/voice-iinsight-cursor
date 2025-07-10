'use client'

import React from 'react'
import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-orange-600 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-8">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
          >
            로그인 페이지로 이동
          </Link>
          
          <Link
            href="/dashboard"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-md transition-colors"
          >
            대시보드로 이동
          </Link>
        </div>
      </div>
    </div>
  )
} 