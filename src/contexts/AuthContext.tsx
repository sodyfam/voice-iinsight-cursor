'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { Tables } from '@/integrations/supabase/types'

type UserProfile = Tables<'users'> & {
  company_name?: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (employeeId: string, password: string) => Promise<{success: boolean, error?: string}>
  signOut: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // 사용자 프로필 정보 가져오기
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          company_affiliate!company_id (
            name
          )
        `)
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('사용자 프로필 조회 오류:', userError)
        return null
      }

      if (userData) {
        const profile: UserProfile = {
          ...userData,
          company_name: userData.company_affiliate?.name || ''
        }
        return profile
      }
      
      return null
    } catch (error) {
      console.error('사용자 프로필 조회 중 오류:', error)
      return null
    }
  }

  // 사용자 프로필 새로고침
  const refreshUserProfile = async () => {
    if (user?.id) {
      const profile = await fetchUserProfile(user.id)
      setUserProfile(profile)
    }
  }

  // 로그인 함수
  const signIn = async (employeeId: string, password: string): Promise<{success: boolean, error?: string}> => {
    try {
      setLoading(true)

      // SHA256 해시 생성 (기존 시스템과 호환)
      const CryptoJS = await import('crypto-js')
      const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex)

      // 사번으로 사용자 조회
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('employee_id', employeeId)
        .single()

      if (userError || !userData) {
        return { success: false, error: '존재하지 않는 사번입니다.' }
      }

      // 비밀번호 확인
      if (userData.password_hash !== hashedPassword) {
        return { success: false, error: '비밀번호가 올바르지 않습니다.' }
      }

      // 계정 상태 확인
      if (userData.status !== 'active') {
        return { success: false, error: '비활성화된 계정입니다.' }
      }

      // 마지막 로그인 시간 업데이트
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('employee_id', employeeId)

      // 사용자 프로필 정보 로드
      const profile = await fetchUserProfile(userData.id)
      setUserProfile(profile)

      // 로컬 세션 생성 (간단한 세션 관리)
      const sessionData = {
        id: `session_${Date.now()}`,
        user: {
          id: userData.id,
          user_metadata: {
            employee_id: employeeId,
            name: userData.name,
            role: userData.role,
            dept: userData.dept,
            company_id: userData.company_id,
            user_id: userData.id
          }
        },
        access_token: `token_${Date.now()}`,
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24시간 후 만료
      }

      // localStorage에 세션 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('supabase.auth.token', JSON.stringify(sessionData))
      }

      // 상태 업데이트
      setSession(sessionData as any)
      setUser(sessionData.user as any)

      // 로그인 성공 후 자동 리다이렉트
      setTimeout(() => {
        if (userData.role === 'admin') {
          window.location.href = "/dashboard?tab=dashboard"
        } else {
          window.location.href = "/dashboard?tab=submit"
        }
      }, 1000)

      return { success: true }
    } catch (error) {
      console.error('로그인 오류:', error)
      return { success: false, error: '로그인 처리 중 오류가 발생했습니다.' }
    } finally {
      setLoading(false)
    }
  }

  // 로그아웃 함수
  const signOut = async () => {
    try {
      setLoading(true)
      
      // localStorage에서 세션 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token')
      }
      
      setUser(null)
      setUserProfile(null)
      setSession(null)
    } catch (error) {
      console.error('로그아웃 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  // 세션 상태 변화 감지
  useEffect(() => {
    let mounted = true

    // 현재 세션 가져오기
    const getSession = async () => {
      if (typeof window === 'undefined') {
        setLoading(false)
        return
      }

      try {
        const storedSession = localStorage.getItem('supabase.auth.token')
        
        if (storedSession) {
          const sessionData = JSON.parse(storedSession)
          
          // 세션 만료 확인
          if (sessionData.expires_at && Date.now() > sessionData.expires_at) {
            localStorage.removeItem('supabase.auth.token')
            setSession(null)
            setUser(null)
            setUserProfile(null)
          } else {
            setSession(sessionData)
            setUser(sessionData.user)
            
            if (sessionData.user?.user_metadata?.user_id) {
              const profile = await fetchUserProfile(sessionData.user.user_metadata.user_id)
              setUserProfile(profile)
            }
          }
        } else {
          setSession(null)
          setUser(null)
          setUserProfile(null)
        }
      } catch (error) {
        console.error('세션 복원 오류:', error)
        localStorage.removeItem('supabase.auth.token')
        setSession(null)
        setUser(null)
        setUserProfile(null)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getSession()

    return () => {
      mounted = false
    }
  }, [])

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    loading,
    signIn,
    signOut,
    refreshUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 