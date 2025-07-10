
'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, AlertCircle, Brain, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { safeLocalStorage } from "@/lib/utils";

interface UserInfo {
  company?: string;
  dept?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

interface MakeResponse {
  effect: string;
  case: string;
  nagative_score: number;
}

export const OpinionSubmissionForm = () => {
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    suggestion: ""
  });
  
  // 히든 필드들 (로그인된 사용자 정보)
  const [userInfo, setUserInfo] = useState({
    affiliate: "",
    department: "",
    employeeId: "",
    name: "",
    quarter: "Q1" as "Q1" | "Q2" | "Q3" | "Q4"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Array<{id: number, name: string}>>([]);
  const [companies, setCompanies] = useState<Array<{id: number, name: string}>>([]);
  const { toast } = useToast();

  // Supabase에서 카테고리와 계열사 데이터 가져오기
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        // 카테고리 데이터 조회
        const { data: categoryData, error: categoryError } = await supabase
          .from('category')
          .select('id, name')
          .eq('status', 'active')
          .order('sort_order', { ascending: true });

        if (categoryError) {
          console.error('카테고리 조회 오류:', categoryError);
        } else {
          setCategories(categoryData || []);
        }

        // 계열사 데이터 조회
        const { data: companyData, error: companyError } = await supabase
          .from('company_affiliate')
          .select('id, name')
          .eq('status', 'active')
          .order('id', { ascending: true });

        if (companyError) {
          console.error('계열사 조회 오류:', companyError);
        } else {
          setCompanies(companyData || []);
        }
      } catch (error) {
        console.error('마스터 데이터 조회 실패:', error);
      }
    };

    fetchMasterData();
  }, []);

  // localStorage에서 사용자 정보 가져오기 및 분기 자동 설정
  useEffect(() => {
    const userInfoStr = safeLocalStorage.getItem('userInfo');
    
    if (userInfoStr) {
      try {
        const userData: UserInfo = JSON.parse(userInfoStr);
        
        // 현재 분기 자동 계산
        const currentMonth = new Date().getMonth() + 1;
        let currentQuarter: "Q1" | "Q2" | "Q3" | "Q4" = "Q1";
        
        if (currentMonth >= 1 && currentMonth <= 3) currentQuarter = "Q1";
        else if (currentMonth >= 4 && currentMonth <= 6) currentQuarter = "Q2";
        else if (currentMonth >= 7 && currentMonth <= 9) currentQuarter = "Q3";
        else currentQuarter = "Q4";
        
        const userInfoData = {
          affiliate: userData.company || "",
          department: userData.dept || "",
          employeeId: userData.id || "",
          name: userData.name || "",
          quarter: currentQuarter
        };
        
        setUserInfo(userInfoData);
        console.log('👤 로그인된 사용자 정보 로드:', userInfoData);
      } catch (error) {
        console.error("❌ 사용자 정보 파싱 오류:", error);
        toast({
          title: "⚠️ 사용자 정보 오류",
          description: "로그인 정보가 올바르지 않습니다. 다시 로그인해주세요.",
          variant: "destructive",
        });
      }
    } else {
      console.warn("⚠️ localStorage에 사용자 정보가 없습니다.");
      toast({
        title: "⚠️ 로그인 필요",
        description: "로그인이 필요합니다. 로그인 페이지로 이동합니다.",
        variant: "destructive",
      });
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    }
  }, []);

  // 로그아웃 함수
  const handleLogout = () => {
    // localStorage와 쿠키 정리
    safeLocalStorage.removeItem('userInfo');
    
    // 쿠키 삭제
    const cookies = ['company', 'dept', 'id', 'name', 'email', 'role', 'isAdmin'];
    cookies.forEach(cookie => {
      document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    toast({
      title: "👋 로그아웃 완료",
      description: "안전하게 로그아웃되었습니다.",
    });
    
    // 로그인 페이지로 이동
    window.location.href = '/login';
  };

  // Make.com AI 분석 요청
  const requestAIAnalysis = async (opinion: string): Promise<MakeResponse | null> => {
    try {
      console.log('🤖 AI 분석 요청 시작:', opinion);
      
      const response = await fetch('https://hook.us2.make.com/2180h2521vieihld9u6oyw83m40wg77r', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opinion: opinion
        })
      });

      if (!response.ok) {
        throw new Error(`Make.com API 오류: ${response.status}`);
      }

      const result: MakeResponse = await response.json();
      console.log('✅ AI 분석 결과:', result);
      
      return result;
    } catch (error) {
      console.error('❌ AI 분석 요청 실패:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 의견 제출 시작');
    console.log('📝 폼 데이터:', formData);
    console.log('👤 사용자 정보:', userInfo);
    console.log('📂 카테고리 목록:', categories);
    console.log('🏢 계열사 목록:', companies);
    
    // 필수 항목 검증
    if (!formData.category || !formData.title || !formData.suggestion) {
      console.error('❌ 필수 항목 누락:', { 
        category: formData.category, 
        title: formData.title, 
        suggestion: formData.suggestion 
      });
      toast({
        title: "⚠️ 입력 오류",
        description: "카테고리, 제목, 개선제안을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 사용자 정보 검증
    if (!userInfo.affiliate || !userInfo.employeeId) {
      console.error('❌ 사용자 정보 누락:', userInfo);
      toast({
        title: "⚠️ 사용자 정보 오류",
        description: "로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. 선택된 카테고리와 계열사의 ID 찾기 (AI 분석 전에 검증)
      const selectedCategory = categories.find(cat => cat.name === formData.category);
      const selectedCompany = companies.find(comp => comp.name === userInfo.affiliate);

      console.log('🔍 선택된 카테고리:', selectedCategory);
      console.log('🔍 선택된 계열사:', selectedCompany);

      if (!selectedCategory) {
        throw new Error(`카테고리 '${formData.category}'를 찾을 수 없습니다. 사용 가능한 카테고리: ${categories.map(c => c.name).join(', ')}`);
      }
      
      if (!selectedCompany) {
        throw new Error(`계열사 '${userInfo.affiliate}'를 찾을 수 없습니다. 사용 가능한 계열사: ${companies.map(c => c.name).join(', ')}`);
      }

      // 2. AI 분석 요청 (선택사항)
      console.log('🤖 AI 분석 요청 시작...');
      toast({
        title: "🤖 AI 분석 중...",
        description: "개선제안을 AI가 분석하고 있습니다.",
      });

      let aiResult: MakeResponse | null = null;
      try {
        aiResult = await requestAIAnalysis(formData.suggestion);
        console.log('✅ AI 분석 완료:', aiResult);
      } catch (aiError) {
        console.warn('⚠️ AI 분석 실패, 계속 진행:', aiError);
        // AI 분석 실패해도 의견 제출은 계속 진행
      }

      // 3. Supabase에 의견 데이터 저장
      const opinionData = {
        category_id: selectedCategory.id,
        company_affiliate_id: selectedCompany.id,
        quarter: userInfo.quarter,
        content: formData.title, // content 필드 추가 (제목을 content로 사용)
        title: formData.title,
        asis: null, // 현재상황은 null로 저장
        tobe: formData.suggestion,
        user_id: userInfo.employeeId,
        status: '접수',
        reg_date: new Date().toISOString(),
        // AI 분석 결과 추가
        effect: aiResult?.effect || null,
        case_study: aiResult?.case || null,
        negative_score: aiResult?.nagative_score || 0
      };

      console.log('💾 Supabase 저장 데이터:', opinionData);

      const { data, error } = await supabase
        .from('opinion')
        .insert([opinionData])
        .select();

      if (error) {
        console.error('❌ Supabase 저장 오류:', error);
        throw new Error(`데이터베이스 저장 실패: ${error.message}`);
      }

      console.log('✅ 의견 저장 성공:', data);

      toast({
        title: "✨ 의견이 성공적으로 제출되었습니다!",
        description: aiResult 
          ? "AI 분석 결과와 함께 저장되었습니다. 검토 후 처리 결과를 알려드리겠습니다." 
          : "검토 후 처리 결과를 알려드리겠습니다.",
      });
      
      // 폼 초기화
      setFormData({
        category: "",
        title: "",
        suggestion: ""
      });

    } catch (error) {
      console.error("❌ 의견 제출 오류:", error);
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      toast({
        title: "❌ 제출 실패",
        description: `의견 제출 중 오류가 발생했습니다: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          의견 제출
        </CardTitle>
        <CardDescription>
          여러분의 소중한 의견을 부담 갖지 마시고 자유롭게 등록해 주세요. 😊
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 사용자 정보 표시 (읽기 전용) */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="mb-3">
              <h3 className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                제출자 정보
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-gray-600 text-xs">계열사</span>
                <div className="font-medium text-gray-900">{userInfo.affiliate || '정보 없음'}</div>
              </div>
              <div className="space-y-1">
                <span className="text-gray-600 text-xs">부서</span>
                <div className="font-medium text-gray-900">{userInfo.department || '정보 없음'}</div>
              </div>
              <div className="space-y-1">
                <span className="text-gray-600 text-xs">사번</span>
                <div className="font-medium text-gray-900">{userInfo.employeeId || '정보 없음'}</div>
              </div>
              <div className="space-y-1">
                <span className="text-gray-600 text-xs">이름</span>
                <div className="font-medium text-gray-900">{userInfo.name || '정보 없음'}</div>
              </div>
            </div>
          </div>

          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <Label htmlFor="category">카테고리 *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="의견의 제목을 입력하세요"
              maxLength={100}
            />
          </div>

          {/* 개선제안 */}
          <div className="space-y-2">
            <Label htmlFor="suggestion">개선제안 *</Label>
            <Textarea
              id="suggestion"
              value={formData.suggestion}
              onChange={(e) => setFormData({...formData, suggestion: e.target.value})}
              placeholder="구체적인 개선제안을 입력해주세요. AI가 자동으로 기대효과와 적용사례를 분석해드립니다."
              rows={6}
              maxLength={2000}
            />
            <div className="text-xs text-gray-500 text-right">
              {formData.suggestion.length}/2000
            </div>
          </div>

          {/* 제출 버튼 */}
          <Button 
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Brain className="mr-2 h-4 w-4 animate-spin" />
                AI 분석 및 제출 중...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                의견 제출
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
