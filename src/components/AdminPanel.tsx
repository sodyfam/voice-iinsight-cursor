'use client'

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AdminPanelHeader } from "./admin/AdminPanelHeader";
import { SearchFilters } from "./admin/SearchFilters";
import { SearchResults } from "./admin/SearchResults";
import { UserList } from "./admin/UserList";
import { LoadingState } from "./admin/LoadingState";
import { EmptyState } from "./admin/EmptyState";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

interface AdminUser {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  affiliate: string;
  department: string;
  category: string;
  status: "active" | "inactive" | "pending";
  registeredAt: string;
}

interface OpinionData {
  id: string;
  seq: number;
  name: string;
  dept: string;
  company: string;
  category: string;
  title: string;
  tobe: string;
  status: string;
  reg_date: string;
  negative_score: number;
  prod_dept?: string;
  proc_desc?: string;
}

export const AdminPanel = () => {
  const { toast } = useToast();
  
  const getCurrentQuarter = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 1 && month <= 3) return "Q1";
    if (month >= 4 && month <= 6) return "Q2";
    if (month >= 7 && month <= 9) return "Q3";
    return "Q4";
  };

  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [quarter, setQuarter] = useState(getCurrentQuarter());
  const [affiliateFilter, setAffiliateFilter] = useState("all");
  const [employeeIdFilter, setEmployeeIdFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [opinionData, setOpinionData] = useState<OpinionData[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const getQuarterDateRange = (year: string, quarter: string) => {
    const yearNum = parseInt(year);
    switch (quarter) {
      case "Q1":
        return { start: `${yearNum}-01-01`, end: `${yearNum}-03-31` };
      case "Q2":
        return { start: `${yearNum}-04-01`, end: `${yearNum}-06-30` };
      case "Q3":
        return { start: `${yearNum}-07-01`, end: `${yearNum}-09-30` };
      case "Q4":
        return { start: `${yearNum}-10-01`, end: `${yearNum}-12-31` };
      default:
        return { start: `${yearNum}-01-01`, end: `${yearNum}-12-31` };
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setOpinionData([]);
    setUsers([]);
    
    try {
      console.log('🔍 관리자 의견 데이터 조회 시작...');

      // 날짜 범위 계산
      const { start: sDate, end: eDate } = getQuarterDateRange(year, quarter);
      
      // 기본 의견 데이터 조회
      let query = supabase
        .from('opinion')
        .select(`
          id,
          seq,
          title,
          asis,
          tobe,
          user_id,
          status,
          quarter,
          created_at,
          updated_at,
          category_id,
          company_affiliate_id,
          negative_score
        `)
        .gte('created_at', sDate)
        .lte('created_at', eDate + 'T23:59:59')
        .order('id', { ascending: false });

      // 필터 적용
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (employeeIdFilter) {
        query = query.eq('user_id', employeeIdFilter);
      }

      const { data: opinionData, error: opinionError } = await query;

      if (opinionError) {
        console.error('❌ 의견 데이터 조회 오류:', opinionError);
        throw opinionError;
      }

      console.log('✅ 의견 데이터:', opinionData?.length, '개');

      // 카테고리와 계열사 정보 조회
      const [categoriesResult, companiesResult] = await Promise.all([
        supabase.from('category').select('id, name'),
        supabase.from('company_affiliate').select('id, name')
      ]);

      const categories = categoriesResult.data || [];
      const companies = companiesResult.data || [];

      // 데이터 조합 및 필터링
      let enrichedOpinions = opinionData?.map(opinion => {
        const category = categories.find(c => c.id === opinion.category_id);
        const company = companies.find(c => c.id === opinion.company_affiliate_id);
        
        return {
          id: opinion.id.toString(),
          seq: opinion.seq || opinion.id,
          name: (opinion.user_id || '익명') as string, // 타입 단언으로 string 보장
          dept: '부서명', // 기본값 (실제로는 사용자 테이블과 조인해야 함)
          company: company?.name || '알 수 없음',
          category: category?.name || '기타',
          title: opinion.title || '',
          tobe: opinion.tobe || '',
          status: opinion.status || '접수',
          reg_date: opinion.created_at || '', // created_at을 reg_date로 매핑
          negative_score: opinion.negative_score || 0,
          prod_dept: '담당부서', // 기본값
          proc_desc: '' // 기본값
        };
      }) || [];

      // 추가 필터링
      if (categoryFilter !== 'all') {
        enrichedOpinions = enrichedOpinions.filter(opinion => 
          opinion.category === categoryFilter
        );
      }

      if (affiliateFilter !== 'all') {
        enrichedOpinions = enrichedOpinions.filter(opinion => 
          opinion.company === affiliateFilter
        );
      }

      console.log('✅ 조합된 의견 데이터:', enrichedOpinions.length, '개');
      
      setOpinionData(enrichedOpinions);
      setHasSearched(true);
      
      toast({
        title: "조회 완료",
        description: `${enrichedOpinions.length}건의 의견을 조회했습니다.`,
      });
      
    } catch (error) {
      console.error("💥 의견 데이터 조회 실패:", error);
      toast({
        title: "조회 실패",
        description: "데이터 조회 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!opinionData || opinionData.length === 0) {
      toast({
        title: "내보내기 실패",
        description: "조회된 데이터가 없습니다.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Filter out inappropriate content (negative_score >= 3)
      const filteredData = opinionData.filter(item => item.negative_score < 3);
      
      if (filteredData.length === 0) {
        toast({
          title: "내보내기 실패",
          description: "다운로드 가능한 데이터가 없습니다.",
          variant: "destructive"
        });
        return;
      }

      // Excel 데이터 구조 정의
      const excelData = filteredData.map((item, index) => ({
        'No': index + 1,
        '업무주관부서': item.prod_dept || '',
        '안건구분': item.category || '',
        '안건상세': item.title || '',
        '안건요청부서': item.dept || '',
        '상세내용': item.tobe || '',
        '답변': item.proc_desc || '',
        '등록일': item.reg_date || '',
        '상태': item.status || '',
        '작성자': item.name || '',
        '계열사': item.company || ''
      }));

      // 워크북 생성
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // 컬럼 너비 자동 조정
      const colWidths = [
        { wch: 5 },  // No
        { wch: 15 }, // 업무주관부서
        { wch: 20 }, // 안건구분
        { wch: 30 }, // 안건상세
        { wch: 15 }, // 안건요청부서
        { wch: 50 }, // 상세내용
        { wch: 50 }, // 답변
        { wch: 12 }, // 등록일
        { wch: 10 }, // 상태
        { wch: 10 }, // 작성자
        { wch: 15 }  // 계열사
      ];
      worksheet['!cols'] = colWidths;

      // 워크시트를 워크북에 추가
      XLSX.utils.book_append_sheet(workbook, worksheet, '의견목록');

      // Excel 파일 다운로드
      const fileName = `의견목록_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      const excludedCount = opinionData.length - filteredData.length;
      const toastMessage = excludedCount > 0 
        ? `Excel 파일이 다운로드되었습니다. (부적절한 내용 ${excludedCount}건 제외)`
        : "Excel 파일이 다운로드되었습니다.";

      toast({
        title: "내보내기 완료",
        description: toastMessage,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "내보내기 실패",
        description: "Excel 파일 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <AdminPanelHeader />

      <SearchFilters
        year={year}
        setYear={setYear}
        quarter={quarter}
        setQuarter={setQuarter}
        affiliateFilter={affiliateFilter}
        setAffiliateFilter={setAffiliateFilter}
        employeeIdFilter={employeeIdFilter}
        setEmployeeIdFilter={setEmployeeIdFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onSearch={handleSearch}
        onExport={handleExport}
        isLoading={isLoading}
        hasSearched={hasSearched}
        userCount={opinionData.length}
      />

      {isLoading && <LoadingState />}

      {/* Search Results - Opinion Data */}
      {!isLoading && (
        <SearchResults 
          data={opinionData} 
          hasSearched={hasSearched}
        />
      )}

      {/* Legacy User List - for backward compatibility */}
      {hasSearched && !isLoading && users.length > 0 && (
        <UserList users={users} />
      )}

      {hasSearched && !isLoading && users.length === 0 && opinionData.length === 0 && (
        <EmptyState />
      )}
    </div>
  );
};
