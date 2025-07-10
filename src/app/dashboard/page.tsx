'use client'

import { useState, useEffect, Suspense } from "react";

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
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("submit");
  const [selectedOpinionId, setSelectedOpinionId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = userProfile?.role === 'admin';

  // 인증되지 않은 사용자 리다이렉트
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 사용자 정보에 따른 기본 탭 설정
  useEffect(() => {
    if (userProfile) {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      
      if (!tabParam) {
        if (userProfile.role === 'admin') {
          setActiveTab("dashboard");
        } else {
          setActiveTab("submit");
        }
      }
    }
  }, [userProfile]);

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

  const handleLogout = async () => {
    await signOut();
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
    <ProtectedRoute>
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
    </ProtectedRoute>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
} 