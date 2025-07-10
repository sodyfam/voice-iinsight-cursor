'use client'

import { useState, useEffect } from "react";

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, BarChart3, Users, Settings, Send, TrendingUp, Menu, History, LogOut, X } from "lucide-react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { DashboardStats } from "@/components/DashboardStats";
import { OpinionSubmissionForm } from "@/components/OpinionSubmissionForm";
import { OpinionList } from "@/components/OpinionList";
import { UserManagement } from "@/components/UserManagement";
import { OpinionDetail } from "@/components/OpinionDetail";
import { AdminPanel } from "@/components/AdminPanel";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("submit");
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedOpinionId, setSelectedOpinionId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 사용자 정보 확인 및 관리자 권한 설정
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        console.log('🔍 사용자 정보 확인:', user);
        console.log('🔍 사용자 role:', user.role);
        console.log('🔍 관리자 여부:', user.role === 'admin');
        
        const adminStatus = user.role === 'admin';
        setIsAdmin(adminStatus);
        
        // URL에 tab 파라미터가 없을 때만 기본 탭 설정
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        
        if (!tabParam) {
          if (adminStatus) {
            console.log('🔧 관리자로 로그인 - 대시보드 탭으로 설정');
            setActiveTab("dashboard");
          } else {
            console.log('🔧 일반 사용자로 로그인 - 의견제출 탭으로 설정');
            setActiveTab("submit");
          }
        }
      }
    }
  }, []);

  // URL 쿼리 파라미터 처리
  useEffect(() => {
    if (!searchParams) return;
    
    const tab = searchParams.get('tab');
    const opinionId = searchParams.get('opinionId');
    
    if (opinionId) {
      setSelectedOpinionId(opinionId);
      setActiveTab('opinion-detail');
    } else if (tab) {
      setActiveTab(tab);
      setSelectedOpinionId(null);
    }
  }, [searchParams]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      // 쿠키 삭제
      const cookies = ['company', 'dept', 'id', 'name', 'email', 'role', 'isAdmin'];
      cookies.forEach(cookie => {
        document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      // localStorage 삭제
      localStorage.removeItem('userInfo');
    }
    
    // 로그인 페이지로 이동
    router.push('/login');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    
    // URL 업데이트
    const params = new URLSearchParams();
    if (tab !== 'submit') {
      params.set('tab', tab);
    }
    const newUrl = params.toString() ? `/dashboard?${params.toString()}` : '/dashboard';
    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="flex items-center">
              <h1 className="text-lg md:text-xl font-bold text-orange-600">열린마음 협의회</h1>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-4 lg:space-x-8">
              {isAdmin && (
                <button
                  onClick={() => handleTabChange("dashboard")}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "dashboard"
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>대시보드</span>
                </button>
              )}
              
              <button
                onClick={() => handleTabChange("submit")}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "submit"
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                <Send className="h-4 w-4" />
                <span>의견제출</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => handleTabChange("admin")}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "admin"
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>의견관리</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => handleTabChange("users")}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "users"
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>사용자</span>
                </button>
              )}
            </nav>

            {/* Desktop Logout Button */}
            <div className="hidden md:block">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 pb-3 pt-2">
              <div className="space-y-1">
                {isAdmin && (
                  <button
                    onClick={() => handleTabChange("dashboard")}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "dashboard"
                        ? "bg-orange-100 text-orange-700"
                        : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>대시보드</span>
                  </button>
                )}
                
                <button
                  onClick={() => handleTabChange("submit")}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "submit"
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <Send className="h-4 w-4" />
                  <span>의견제출</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleTabChange("admin")}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "admin"
                        ? "bg-orange-100 text-orange-700"
                        : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>의견관리</span>
                  </button>
                )}

                {isAdmin && (
                  <button
                    onClick={() => handleTabChange("users")}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "users"
                        ? "bg-orange-100 text-orange-700"
                        : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>사용자</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>로그아웃</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "dashboard" && isAdmin && <DashboardStats />}
        {activeTab === "submit" && <OpinionSubmissionForm />}
        {activeTab === "admin" && isAdmin && <AdminPanel />}
        {activeTab === "users" && isAdmin && <UserManagement />}
        {activeTab === "opinion-detail" && selectedOpinionId && (
          <OpinionDetail opinionId={selectedOpinionId} isAdmin={isAdmin} />
        )}
      </main>
    </div>
  );
} 