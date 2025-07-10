
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Filter,
  Search,
  Calendar,
  Building,
  Tag,
  CheckCircle,
  FileSpreadsheet
} from "lucide-react";

interface SearchFiltersProps {
  year: string;
  setYear: (year: string) => void;
  quarter: string;
  setQuarter: (quarter: string) => void;
  affiliateFilter: string;
  setAffiliateFilter: (affiliate: string) => void;
  employeeIdFilter: string;
  setEmployeeIdFilter: (employeeId: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onSearch: () => void;
  onExport: () => void;
  isLoading: boolean;
  hasSearched: boolean;
  userCount: number;
}

export const SearchFilters = ({
  year,
  setYear,
  quarter,
  setQuarter,
  affiliateFilter,
  setAffiliateFilter,
  employeeIdFilter,
  setEmployeeIdFilter,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  onSearch,
  onExport,
  isLoading,
  hasSearched,
  userCount
}: SearchFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>조회조건</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 등록일, 계열사, 카테고리, 처리상태 */}
          <div className="grid grid-cols-12 gap-4 items-end">
            {/* 등록일 */}
            <div className="col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                등록일
              </label>
              <div className="flex items-center space-x-2">
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="년도" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024년</SelectItem>
                    <SelectItem value="2025">2025년</SelectItem>
                    <SelectItem value="2026">2026년</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={quarter} onValueChange={setQuarter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="분기" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">1분기</SelectItem>
                    <SelectItem value="Q2">2분기</SelectItem>
                    <SelectItem value="Q3">3분기</SelectItem>
                    <SelectItem value="Q4">4분기</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 계열사 */}
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="inline h-4 w-4 mr-1" />
                계열사
              </label>
              <Select value={affiliateFilter} onValueChange={setAffiliateFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="계열사 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="본사">본사</SelectItem>
                  <SelectItem value="계열사A">계열사A</SelectItem>
                  <SelectItem value="계열사B">계열사B</SelectItem>
                  <SelectItem value="오케이데이터시스템">오케이데이터시스템</SelectItem>
                  <SelectItem value="오케이데이타시스템">오케이데이타시스템</SelectItem>
                  <SelectItem value="전략기획팀">전략기획팀</SelectItem>
                  <SelectItem value="오케이저축은행">오케이저축은행</SelectItem>
                  <SelectItem value="오케이캐피탈">오케이캐피탈</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 카테고리 */}
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="inline h-4 w-4 mr-1" />
                카테고리
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="업무개선">업무개선</SelectItem>
                  <SelectItem value="복리후생">복리후생</SelectItem>
                  <SelectItem value="시설환경">시설환경</SelectItem>
                  <SelectItem value="교육/훈련">교육/훈련</SelectItem>
                  <SelectItem value="조직문화">조직문화</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 처리상태 */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CheckCircle className="inline h-4 w-4 mr-1" />
                처리상태
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="접수">접수</SelectItem>
                  <SelectItem value="처리중">처리중</SelectItem>
                  <SelectItem value="답변완료">답변완료</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* 통합검색과 버튼들 */}
          <div className="flex items-end space-x-4">
            {/* 통합검색 */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline h-4 w-4 mr-1" />
                통합검색
              </label>
              <Input
                type="text"
                value={employeeIdFilter}
                onChange={(e) => setEmployeeIdFilter(e.target.value)}
                placeholder="사번, 이름, 제목, 내용 검색"
                className="w-full"
              />
            </div>

            {/* 조회 및 다운로드 버튼 */}
            <div className="flex space-x-2">
              <Button 
                onClick={onSearch}
                className="bg-orange-600 hover:bg-orange-700"
                disabled={isLoading}
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "조회중..." : "조회"}
              </Button>
              <Button 
                onClick={onExport}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
                disabled={isLoading || !hasSearched}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {hasSearched && (
          <div className="mt-4 text-sm text-gray-600">
            총 {userCount}건의 의견이 조회되었습니다.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
