'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { UserRegistrationForm } from "@/components/UserRegistrationForm"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const router = useRouter()
  const { signIn, loading: authLoading, user } = useAuth()
  const [employeeId, setEmployeeId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginSuccessData, setLoginSuccessData] = useState<any>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // 간단한 유효성 검사
    if (!employeeId || !password) {
      toast.error("사번과 비밀번호를 입력해주세요.")
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn(employeeId, password)
      
      if (result.success) {
        toast.success("로그인 성공!")
        // AuthContext에서 사용자 정보에 따라 리다이렉트 처리
      } else {
        toast.error(result.error || "로그인 실패")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("로그인 요청 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false)
    const isAdmin = loginSuccessData?.role === '관리자'
    
    if (isAdmin) {
      router.push("/dashboard")
    } else {
      router.push("/dashboard")
    }
  }

  // 클라이언트 사이드에서만 렌더링
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-500">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Background with the uploaded image styling */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500"
        style={{
          backgroundImage: `url('/lovable-uploads/9b11da15-2ca5-4c3c-8f25-eef9c093d723.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-orange-500/20"></div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-sm mx-auto relative z-10 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-3 md:space-y-4 pb-4">
          <CardTitle className="text-2xl md:text-4xl font-bold text-orange-600">
            OK금융그룹
          </CardTitle>
          <CardDescription className="text-base md:text-lg font-semibold text-orange-600">
            열린마음 협의회
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId" className="text-sm font-medium text-gray-700">
                사번
              </Label>
              <Input
                id="employeeId"
                type="text"
                placeholder="사번을 입력하세요"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="h-10 text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 text-base"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-base"
              disabled={isLoading}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="text-center pt-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="text-orange-600 hover:text-orange-700 font-medium text-sm md:text-base">
                  사용자등록
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl font-bold text-center text-gray-900">
                    사용자 등록
                  </DialogTitle>
                  <DialogDescription className="text-center text-gray-600 text-sm md:text-base">
                    새로운 계정을 등록하세요
                  </DialogDescription>
                </DialogHeader>
                <UserRegistrationForm 
                  onSuccess={() => {
                    toast.success("사용자 등록이 완료되었습니다!")
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Login Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="mx-4 max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-600 text-lg md:text-xl">로그인 성공! 🎉</AlertDialogTitle>
            <AlertDialogDescription className="text-sm md:text-base">
              사용자 정보:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-60 overflow-y-auto p-3 md:p-4 bg-green-50 rounded-md border border-green-200">
            <div className="space-y-2 text-xs md:text-sm">
              <div><strong>회사:</strong> {loginSuccessData?.company || 'N/A'}</div>
              <div><strong>부서:</strong> {loginSuccessData?.dept || 'N/A'}</div>
              <div><strong>사번:</strong> {loginSuccessData?.id || 'N/A'}</div>
              <div><strong>이름:</strong> {loginSuccessData?.name || 'N/A'}</div>
              <div><strong>이메일:</strong> {loginSuccessData?.email || 'N/A'}</div>
              <div><strong>권한:</strong> <span className={`font-semibold ${loginSuccessData?.role === '관리자' ? 'text-red-600' : 'text-blue-600'}`}>
                {loginSuccessData?.role || 'N/A'}
              </span></div>
              <div><strong>상태:</strong> {loginSuccessData?.status || 'N/A'}</div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSuccessDialogClose} className="bg-green-600 hover:bg-green-700">
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 