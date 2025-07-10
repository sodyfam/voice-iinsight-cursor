
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Filter,
  Search,
  Calendar,
  Building,
  Hash,
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
          <span>검색 조건</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Year and Quarter Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              등록일
            </label>
            <div className="flex items-center space-x-2">
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="년도" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024년</SelectItem>
                  <SelectItem value="2025">2025년</SelectItem>
                  <SelectItem value="2026">2026년</SelectItem>
                </SelectContent>
              </Select>
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="분기" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1분기</SelectItem>
                  <SelectItem value="2">2분기</SelectItem>
                  <SelectItem value="3">3분기</SelectItem>
                  <SelectItem value="4">4분기</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Affiliate Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="inline h-4 w-4 mr-1" />
                계열사
              </label>
              <Select value={affiliateFilter} onValueChange={setAffiliateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="계열사 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="오케이저축은행">오케이저축은행</SelectItem>
                  <SelectItem value="오케이캐피탈">오케이캐피탈</SelectItem>
                  <SelectItem value="오케이홀딩스">오케이홀딩스</SelectItem>
                  <SelectItem value="오케이데이터시스템">오케이데이터시스템</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Employee ID Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="inline h-4 w-4 mr-1" />
                사번
              </label>
              <Input
                type="text"
                value={employeeIdFilter}
                onChange={(e) => setEmployeeIdFilter(e.target.value)}
                placeholder="사번 입력"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="inline h-4 w-4 mr-1" />
                카테고리
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="근무환경 개선">근무환경 개선</SelectItem>
                  <SelectItem value="복리후생 혁신">복리후생 혁신</SelectItem>
                  <SelectItem value="업무 프로세스 개선">업무 프로세스 개선</SelectItem>
                  <SelectItem value="교육/개발 제안">교육/개발 제안</SelectItem>
                  <SelectItem value="소통/문화 변화">소통/문화 변화</SelectItem>
                  <SelectItem value="기타 혁신 아이디어">기타 혁신 아이디어</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CheckCircle className="inline h-4 w-4 mr-1" />
                처리상태
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="신규등록">신규등록</SelectItem>
                  <SelectItem value="처리중">처리중</SelectItem>
                  <SelectItem value="반려">반려</SelectItem>
                  <SelectItem value="답변완료">답변완료</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex items-center justify-end mt-6 space-x-2">
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
      </CardContent>
    </Card>
  );
};
