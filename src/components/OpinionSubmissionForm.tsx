
'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserInfo {
  company?: string;
  dept?: string;
  id?: string;
  name?: string;
}

export const OpinionSubmissionForm = () => {
  const [formData, setFormData] = useState({
    category: "",
    affiliate: "",
    department: "",
    employeeId: "",
    name: "",
    title: "",
    currentSituation: "",
    suggestion: "",
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

  // localStorage에서 사용자 정보 가져오기
  useEffect(() => {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const userInfo: UserInfo = JSON.parse(userInfoStr);
        setFormData(prev => ({
          ...prev,
          affiliate: userInfo.company || "",
          department: userInfo.dept || "",
          employeeId: userInfo.id || "",
          name: userInfo.name || ""
        }));
      } catch (error) {
        console.error("사용자 정보 파싱 오류:", error);
      }
    }
  }, []);

  // 현재 분기 자동 설정
  useEffect(() => {
    const currentMonth = new Date().getMonth() + 1;
    let currentQuarter: "Q1" | "Q2" | "Q3" | "Q4" = "Q1";
    
    if (currentMonth >= 1 && currentMonth <= 3) currentQuarter = "Q1";
    else if (currentMonth >= 4 && currentMonth <= 6) currentQuarter = "Q2";
    else if (currentMonth >= 7 && currentMonth <= 9) currentQuarter = "Q3";
    else currentQuarter = "Q4";
    
    setFormData(prev => ({
      ...prev,
      quarter: currentQuarter
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.affiliate || !formData.department || 
        !formData.employeeId || !formData.name || !formData.title ||
        !formData.currentSituation || !formData.suggestion) {
      toast({
        title: "⚠️ 입력 오류",
        description: "모든 필수 항목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 선택된 카테고리와 계열사의 ID 찾기
      const selectedCategory = categories.find(cat => cat.name === formData.category);
      const selectedCompany = companies.find(comp => comp.name === formData.affiliate);

      if (!selectedCategory || !selectedCompany) {
        throw new Error('카테고리 또는 계열사 정보를 찾을 수 없습니다.');
      }

      // Supabase에 의견 데이터 저장
      const opinionData = {
        category_id: selectedCategory.id,
        company_affiliate_id: selectedCompany.id,
        quarter: formData.quarter,
        content: formData.title, // content 필드 추가 (제목을 content로 사용)
        title: formData.title,
        asis: formData.currentSituation,
        tobe: formData.suggestion,
        user_id: formData.employeeId,
        status: '접수',
        reg_date: new Date().toISOString()
      };

      console.log('제출할 의견 데이터:', opinionData);

      const { data, error } = await supabase
        .from('opinion')
        .insert([opinionData])
        .select();

      if (error) {
        console.error('의견 저장 오류:', error);
        throw error;
      }

      console.log('의견 저장 성공:', data);

      toast({
        title: "✨ 의견이 성공적으로 제출되었습니다!",
        description: "검토 후 처리 결과를 알려드리겠습니다.",
      });
      
      // 폼 초기화 (사용자 정보는 유지)
      setFormData(prev => ({
        category: "",
        affiliate: prev.affiliate,
        department: prev.department,
        employeeId: prev.employeeId,
        name: prev.name,
        title: "",
        currentSituation: "",
        suggestion: "",
        quarter: prev.quarter
      }));

    } catch (error) {
      console.error("의견 제출 오류:", error);
      toast({
        title: "❌ 제출 실패",
        description: "의견 제출 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>의견 제출</CardTitle>
        <CardDescription>
          여러분의 소중한 의견을 부담 갖지 마시고 자유롭게 등록해 주세요. 😊
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <Label htmlFor="category">카테고리 *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리를 선택해주세요" />
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

          {/* 계열사 & 분기 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="affiliate">계열사 *</Label>
              <Select value={formData.affiliate} onValueChange={(value) => setFormData(prev => ({...prev, affiliate: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="계열사를 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.name}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quarter">분기 *</Label>
              <Select value={formData.quarter} onValueChange={(value) => setFormData(prev => ({...prev, quarter: value as "Q1" | "Q2" | "Q3" | "Q4"}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1">Q1 (1-3월)</SelectItem>
                  <SelectItem value="Q2">Q2 (4-6월)</SelectItem>
                  <SelectItem value="Q3">Q3 (7-9월)</SelectItem>
                  <SelectItem value="Q4">Q4 (10-12월)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 부서 & 사번 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">부서 *</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({...prev, department: e.target.value}))}
                placeholder="부서명을 입력해주세요"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeId">사번 *</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => setFormData(prev => ({...prev, employeeId: e.target.value}))}
                placeholder="사번을 입력해주세요"
                required
              />
            </div>
          </div>

          {/* 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name">이름 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              placeholder="이름을 입력해주세요"
              required
            />
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
              placeholder="의견 제목을 입력해주세요"
              required
            />
          </div>

          {/* 현재 상황 */}
          <div className="space-y-2">
            <Label htmlFor="currentSituation">현재 상황 (AS-IS) *</Label>
            <Textarea
              id="currentSituation"
              value={formData.currentSituation}
              onChange={(e) => setFormData(prev => ({...prev, currentSituation: e.target.value}))}
              placeholder="현재 상황이나 문제점을 구체적으로 설명해주세요"
              rows={4}
              required
            />
          </div>

          {/* 개선 제안 */}
          <div className="space-y-2">
            <Label htmlFor="suggestion">개선 제안 (TO-BE) *</Label>
            <Textarea
              id="suggestion"
              value={formData.suggestion}
              onChange={(e) => setFormData(prev => ({...prev, suggestion: e.target.value}))}
              placeholder="개선 방안이나 제안사항을 구체적으로 설명해주세요"
              rows={4}
              required
            />
          </div>

          {/* 제출 버튼 */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  제출 중...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  의견 제출하기
                </>
              )}
            </Button>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">📝 작성 가이드</p>
                <ul className="space-y-1 text-xs">
                  <li>• 구체적이고 실현 가능한 의견을 제시해주세요</li>
                  <li>• 현재 상황과 개선 방안을 명확히 구분하여 작성해주세요</li>
                  <li>• 제출된 의견은 검토 후 처리 결과를 안내드립니다</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
