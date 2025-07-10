
import { BarChart3, Plus, Users, Settings, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
'use client'

import { useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
}

export function AppSidebar({ activeTab, setActiveTab, isAdmin, setIsAdmin }: AppSidebarProps) {
  const { userProfile, signOut } = useAuth();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showUserInfoDialog, setShowUserInfoDialog] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

  const adminPassword = "admin123";

  // useAuth로 사용자 정보 확인
  useEffect(() => {
    if (userProfile) {
      const adminStatus = userProfile.role === 'admin';
      setIsAdmin(adminStatus);
      
      console.log("Auth에서 가져온 사용자 정보:", userProfile);
      console.log("관리자 여부:", adminStatus);
    }
  }, [userProfile, setIsAdmin]);

  // 모든 메뉴 아이템 (권한 상관없이 모두 표시)
  const allMenuItems = [
    {
      title: "대시보드",
      icon: BarChart3,
      value: "dashboard",
    },
    {
      title: "의견 제출",
      icon: Plus,
      value: "submit",
    },
    {
      title: "사용자",
      icon: Users,
      value: "users",
    },
    {
      title: "의견관리",
      icon: Settings,
      value: "admin",
    },
  ];

  // 쿠키에서 사용자 정보 가져오기 (deprecated)
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  const handleMenuClick = (tabValue: string) => {
    setActiveTab(tabValue);
    // 모바일에서 메뉴 클릭 시 사이드바 닫기
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      // 관리자 모드 해제
      setIsAdmin(false);
      setActiveTab("submit"); // 일반 사용자 기본 페이지로 이동
    } else {
      // 관리자 모드 활성화 - 비밀번호 입력 다이얼로그 표시
      setShowPasswordDialog(true);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === adminPassword) {
      setIsAdmin(true);
      setShowPasswordDialog(false);
      setPassword("");
      setActiveTab("dashboard"); // 관리자 기본 페이지로 이동
      toast({
        title: "관리자 인증 성공",
        description: "관리자 메뉴에 접근할 수 있습니다.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "인증 실패",
        description: "비밀번호가 올바르지 않습니다.",
      });
      setPassword("");
    }
  };

  const handleDialogClose = () => {
    setShowPasswordDialog(false);
    setPassword("");
  };

  const handleUserInfoDialogClose = () => {
    setShowUserInfoDialog(false);
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "로그아웃 완료",
      description: "안전하게 로그아웃되었습니다.",
    });
    router.push('/login');
  };

  return (
    <>
      <Sidebar className="border-r border-orange-200">
        <SidebarHeader className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">열린마음 협의회</h1>
              <p className="text-xs text-gray-500">자동화 시스템</p>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 w-fit">
              Beta v1.0
            </Badge>
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-full">
              <Settings className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {userProfile?.role === 'admin' ? "관리자" : "일반사용자"}
              </span>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-orange-600 font-medium">메뉴</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {allMenuItems.map((item) => (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton
                      onClick={() => handleMenuClick(item.value)}
                      isActive={activeTab === item.value}
                      className={`w-full justify-start ${
                        activeTab === item.value
                          ? "bg-orange-100 text-orange-900 border-r-2 border-orange-500"
                          : "hover:bg-orange-50 text-gray-700"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </SidebarFooter>
      </Sidebar>

      {/* User Info Dialog */}
      <Dialog open={showUserInfoDialog} onOpenChange={setShowUserInfoDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-orange-600">로그인된 사용자 정보 🎉</DialogTitle>
            <DialogDescription>
              Supabase Auth에서 가져온 사용자 정보입니다.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto p-4 bg-orange-50 rounded-md border border-orange-200">
            <div className="space-y-3 text-sm">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-700 mb-1">회사:</span>
                <span className="text-gray-900 bg-white p-2 rounded border break-all">
                  {userProfile?.company_name || 'N/A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-700 mb-1">사번:</span>
                <span className="text-gray-900 bg-white p-2 rounded border break-all">
                  {userProfile?.employee_id || 'N/A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-700 mb-1">이름:</span>
                <span className="text-gray-900 bg-white p-2 rounded border break-all">
                  {userProfile?.name || 'N/A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-700 mb-1">부서:</span>
                <span className="text-gray-900 bg-white p-2 rounded border break-all">
                  {userProfile?.dept || 'N/A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-700 mb-1">권한:</span>
                <span className={`font-semibold p-2 rounded border break-all ${
                  userProfile?.role === 'admin' ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'
                }`}>
                  {userProfile?.role || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUserInfoDialogClose} className="bg-orange-500 hover:bg-orange-600">
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>관리자 인증</DialogTitle>
            <DialogDescription>
              관리자 메뉴에 접근하려면 비밀번호를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordSubmit();
                }
              }}
              className="focus-visible:ring-orange-500"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              취소
            </Button>
            <Button 
              onClick={handlePasswordSubmit}
              className="bg-orange-500 hover:bg-orange-600"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
