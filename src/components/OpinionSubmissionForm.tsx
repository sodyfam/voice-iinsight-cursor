
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
import { useAuth } from "@/contexts/AuthContext";

interface MakeResponse {
  effect: string;
  case: string;
  nagative_score: number;
}

export const OpinionSubmissionForm = () => {
  const { userProfile, signOut } = useAuth();
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    suggestion: ""
  });

  // 현재 분기 자동 계산
  const getCurrentQuarter = (): "Q1" | "Q2" | "Q3" | "Q4" => {
    const currentMonth = new Date().getMonth() + 1;
    if (currentMonth >= 1 && currentMonth <= 3) return "Q1";
    else if (currentMonth >= 4 && currentMonth <= 6) return "Q2";
    else if (currentMonth >= 7 && currentMonth <= 9) return "Q3";
    else return "Q4";
  };

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

  // 로그아웃 함수
  const handleLogout = async () => {
    await signOut();
    toast({
      title: "👋 로그아웃 완료",
      description: "안전하게 로그아웃되었습니다.",
    });
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
    
    if (!userProfile) {
      toast({
        title: "⚠️ 로그인 필요",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    console.log('🚀 의견 제출 시작');
    console.log('📝 폼 데이터:', formData);
    console.log('👤 사용자 정보:', userProfile);
    
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

    setIsSubmitting(true);
    
    try {
      // 1. 선택된 카테고리와 계열사의 ID 찾기
      const selectedCategory = categories.find(cat => cat.name === formData.category);
      const selectedCompany = companies.find(comp => comp.name === userProfile.company_name);

      console.log('🔍 선택된 카테고리:', selectedCategory);
      console.log('🔍 선택된 계열사:', selectedCompany);

      if (!selectedCategory) {
        throw new Error(`카테고리 '${formData.category}'를 찾을 수 없습니다.`);
      }
      
      if (!selectedCompany && userProfile.company_id) {
        // company_name이 없으면 company_id로 직접 찾기
        const { data: companyData } = await supabase
          .from('company_affiliate')
          .select('id, name')
          .eq('id', userProfile.company_id)
          .single();
        
        if (!companyData) {
          throw new Error(`계열사 정보를 찾을 수 없습니다.`);
        }
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
      }

      // 3. Supabase에 의견 데이터 저장
      const companyId = selectedCompany?.id || userProfile.company_id;
      
      if (!companyId) {
        throw new Error('계열사 정보가 없습니다. 관리자에게 문의하세요.');
      }

      const opinionData = {
        category_id: selectedCategory.id,
        company_affiliate_id: companyId,
        quarter: getCurrentQuarter(),
        content: formData.title,
        title: formData.title,
        asis: null,
        tobe: formData.suggestion,
        user_id: userProfile.employee_id,
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

      console.log('✅ 의견 제출 성공:', data);

      // 성공 메시지 및 폼 초기화
      toast({
        title: "✅ 의견 제출 완료!",
        description: `${userProfile.name}님의 소중한 의견이 접수되었습니다.`,
      });

      // 폼 초기화
      setFormData({
        category: "",
        title: "",
        suggestion: ""
      });

    } catch (error) {
      console.error('❌ 의견 제출 실패:', error);
      toast({
        title: "❌ 제출 실패",
        description: error instanceof Error ? error.message : "의견 제출 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 사용자 정보가 없으면 로그인 안내 표시
  if (!userProfile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">로그인 필요</CardTitle>
            <CardDescription className="text-center">
              의견을 제출하려면 로그인이 필요합니다.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">💡 개선 의견 제출</CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1">
                소중한 의견을 공유해주세요. AI가 분석하여 효과를 예측해드립니다.
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 사용자 정보 표시 */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="font-medium text-orange-800 mb-2">📋 제출자 정보</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">계열사:</span>
                <span className="ml-2 font-medium">{userProfile.company_name || '정보 없음'}</span>
              </div>
              <div>
                <span className="text-gray-600">부서:</span>
                <span className="ml-2 font-medium">{userProfile.dept || '정보 없음'}</span>
              </div>
              <div>
                <span className="text-gray-600">사번:</span>
                <span className="ml-2 font-medium">{userProfile.employee_id}</span>
              </div>
              <div>
                <span className="text-gray-600">이름:</span>
                <span className="ml-2 font-medium">{userProfile.name}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 카테고리 선택 */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                개선 카테고리 <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="개선하고 싶은 영역을 선택해주세요" />
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

            {/* 제목 입력 */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                제목 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="의견의 제목을 간단히 작성해주세요"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full"
                maxLength={100}
              />
              <div className="text-xs text-gray-500 text-right">
                {formData.title.length}/100
              </div>
            </div>

            {/* 개선제안 입력 */}
            <div className="space-y-2">
              <Label htmlFor="suggestion" className="text-sm font-medium text-gray-700">
                개선 제안 내용 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="suggestion"
                placeholder="구체적인 개선 방안을 자세히 작성해주세요. AI가 효과를 분석해드립니다."
                value={formData.suggestion}
                onChange={(e) => setFormData(prev => ({ ...prev, suggestion: e.target.value }))}
                className="w-full min-h-[120px] resize-none"
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 text-right">
                {formData.suggestion.length}/1000
              </div>
            </div>



            {/* 제출 버튼 */}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.category || !formData.title || !formData.suggestion}
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-2"
              >
                {isSubmitting ? (
                  <>
                    <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                    분석 및 제출 중...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    의견 제출
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
