'use client'

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { UserRegistrationForm } from "@/components/UserRegistrationForm";
import { supabase } from "@/integrations/supabase/client";
import CryptoJS from 'crypto-js';
import { safeLocalStorage } from "@/lib/utils";

const Login = () => {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccessData, setLoginSuccessData] = useState<any>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 간단한 유효성 검사
    if (!employeeId || !password) {
      toast.error("사번과 비밀번호를 입력해주세요.");
      setIsLoading(false);
      return;
    }

    try {
      // 기존 localStorage와 쿠키 초기화
      console.log('🧹 기존 사용자 정보 초기화 중...');
      safeLocalStorage.removeItem('userInfo');
      
      // 쿠키 초기화
      const cookies = ['company', 'dept', 'id', 'name', 'email', 'role', 'isAdmin'];
      cookies.forEach(cookie => {
        document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      // SHA256 해시 생성 함수 (crypto-js 사용)
      const sha256 = (message: string) => {
        try {
          return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
        } catch (error) {
          console.error('SHA256 해시 생성 오류:', error);
          // 오류 발생 시 에러 발생
          throw new Error('비밀번호 해시 생성에 실패했습니다.');
        }
      };

      // 입력된 비밀번호를 SHA256으로 해시화
      const hashedPassword = sha256(password);
      console.log('🔐 로그인 시도 정보:');
      console.log('- 입력된 사번:', employeeId);
      console.log('- 입력된 비밀번호:', password);
      console.log('- 해시된 비밀번호:', hashedPassword);
      console.log('- 해시 길이:', hashedPassword.length);

      // 먼저 사번만으로 사용자 조회
      console.log('🔍 1단계: 사번으로 사용자 조회');
      const { data: userByEmployeeId, error: employeeError } = await supabase
        .from('users')
        .select('*')
        .eq('employee_id', employeeId);

      console.log('- 사번 조회 결과:', userByEmployeeId);
      console.log('- 사번 조회 오류:', employeeError);

      if (!userByEmployeeId || userByEmployeeId.length === 0) {
        toast.error("존재하지 않는 사번입니다.");
        setIsLoading(false);
        return;
      }

      const foundUser = userByEmployeeId[0];
      console.log('🔍 2단계: 찾은 사용자 정보');
      console.log('- DB 저장된 해시:', foundUser.password_hash);
      console.log('- 입력한 해시:', hashedPassword);
      console.log('- 해시 일치 여부:', foundUser.password_hash === hashedPassword);
      console.log('- 사용자 상태:', foundUser.status);

      // 비밀번호와 상태 확인
      if (foundUser.password_hash !== hashedPassword) {
        toast.error("비밀번호가 올바르지 않습니다.");
        setIsLoading(false);
        return;
      }

      if (foundUser.status !== 'active') {
        toast.error("비활성화된 계정입니다.");
        setIsLoading(false);
        return;
      }

      console.log('📊 Supabase 쿼리 실행 중...');
      const { data: userDataArray, error } = await supabase
        .from('users')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('password_hash', hashedPassword)
        .eq('status', 'active');

      console.log('📊 Supabase 응답:');
      console.log('- 데이터 배열:', userDataArray);
      console.log('- 오류:', error);

      const userData = userDataArray && userDataArray.length > 0 ? userDataArray[0] : foundUser;
      console.log('- 첫 번째 사용자 데이터:', userData);

      if (error || !userData) {
        console.error('❌ 로그인 실패 상세:');
        console.error('- Error code:', error?.code);
        console.error('- Error message:', error?.message);
        console.error('- Error details:', error?.details);
        console.error('- Error hint:', error?.hint);
        
        // 사번만으로 사용자 존재 여부 확인
        const { data: userCheck } = await supabase
          .from('users')
          .select('employee_id, password_hash, status')
          .eq('employee_id', employeeId)
          .single();
          
        console.log('🔍 사번 확인 결과:', userCheck);
        
        toast.error("사번 또는 비밀번호가 올바르지 않습니다.");
        setIsLoading(false);
        return;
      }

      console.log('로그인 성공:', userData);

      // Supabase에서 최신 사용자 정보 다시 조회 (권한 확인용)
      console.log('🔄 최신 사용자 정보 조회 중...');
      const { data: latestUserData, error: userFetchError } = await supabase
        .from('users')
        .select('*')
        .eq('employee_id', employeeId)
        .single();

      if (userFetchError || !latestUserData) {
        console.error('❌ 최신 사용자 정보 조회 실패:', userFetchError);
        toast.error("사용자 정보를 불러오는 중 오류가 발생했습니다.");
        setIsLoading(false);
        return;
      }

      console.log('📋 최신 사용자 정보:', latestUserData);

      // 회사 정보 조회
      let companyName = "";
      if (latestUserData.company_id) {
        const { data: companyData } = await supabase
          .from('company_affiliate')
          .select('name')
          .eq('id', latestUserData.company_id)
          .single();
        companyName = companyData?.name || "";
      }

      // 최신 role 정보로 관리자 여부 판단
      console.log('🔍 사용자 권한 확인 (최신 정보):');
      console.log('- latestUserData.role:', latestUserData.role);
      console.log('- typeof latestUserData.role:', typeof latestUserData.role);
      console.log('- latestUserData.role === "admin":', latestUserData.role === 'admin');
      
      const isAdmin = latestUserData.role === 'admin';
      console.log('- 최종 관리자 여부:', isAdmin);
      
      // 브라우저 쿠키에 최신 사용자 정보 저장
      const userInfo = {
        company: companyName,
        dept: latestUserData.dept || "",
        id: latestUserData.employee_id,
        name: latestUserData.name || "",
        email: latestUserData.email || "",
        role: latestUserData.role || "user",
        isAdmin: isAdmin.toString()
      };

      console.log('💾 쿠키에 저장할 사용자 정보:', userInfo);

      // 쿠키에 저장 (7일 유효)
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      
      Object.entries(userInfo).forEach(([key, value]) => {
        document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/`;
      });

      // localStorage에 최신 사용자 정보 저장 - 모든 필드 포함
      const userStorageInfo = {
        company: companyName,
        dept: latestUserData.dept || "",
        id: latestUserData.employee_id,
        name: latestUserData.name || "",
        email: latestUserData.email || "",
        role: latestUserData.role || "user",
        status: latestUserData.status || ""
      };
      safeLocalStorage.setItem('userInfo', JSON.stringify(userStorageInfo));

      console.log("💾 localStorage에 저장된 사용자 정보:", userStorageInfo);

      // 마지막 로그인 시간 업데이트
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('employee_id', employeeId);

      toast.success(`${latestUserData.name}님, 환영합니다!`);
      
      // 관리자와 일반 사용자에 따라 다른 페이지로 이동
      if (isAdmin) {
        console.log('🔧 관리자 로그인 - 대시보드로 이동');
        router.push("/dashboard?tab=dashboard");
      } else {
        console.log('🔧 일반 사용자 로그인 - 의견제출로 이동');
        router.push("/dashboard?tab=submit");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("로그인 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    const isAdmin = loginSuccessData?.role === '관리자';
    
    // 관리자면 대시보드로, 일반 사용자면 의견제출 화면으로 이동
    if (isAdmin) {
      router.push("/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

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
                    toast.success("사용자 등록이 완료되었습니다!");
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
  );
};

export default Login;
