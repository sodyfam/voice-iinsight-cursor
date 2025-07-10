'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Filter, Calendar, User, MessageSquare, FileText, CalendarRange, List, Grid, Eye, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Opinion {
  id: number;
  seq: number;
  title: string;
  content?: string;
  asis?: string;
  tobe?: string;
  category_name?: string;
  company_name?: string;
  user_id: string;
  status: string;
  quarter: string;
  reg_date: string;
  updated_at?: string;
}

interface OpinionListProps {
  isAdmin: boolean;
}

export const OpinionList = ({ isAdmin }: OpinionListProps) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [quarterFilter, setQuarterFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewType, setViewType] = useState("card");
  const [selectedOpinion, setSelectedOpinion] = useState<Opinion | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // 분기별 날짜 범위 계산 함수
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

  // Supabase에서 의견 데이터 조회
  const { data: opinions, isLoading, error, refetch } = useQuery({
    queryKey: ['opinions', searchTerm, statusFilter, categoryFilter, yearFilter, quarterFilter, dateFrom, dateTo],
    queryFn: async (): Promise<Opinion[]> => {
      try {
        console.log('🔍 의견 데이터 조회 시작...');

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
            company_affiliate_id
          `)
          .order('id', { ascending: false });

        // 분기별 필터링 (created_at 기준)
        if (quarterFilter !== 'all') {
          const { start, end } = getQuarterDateRange(yearFilter, quarterFilter);
          query = query
            .gte('created_at', start)
            .lte('created_at', end + 'T23:59:59');
        } else {
          // 연도별 필터링
          const { start, end } = getQuarterDateRange(yearFilter, "all");
          query = query
            .gte('created_at', start)
            .lte('created_at', end + 'T23:59:59');
        }

        // 추가 날짜 범위 필터링 (사용자 지정)
        if (dateFrom) {
          query = query.gte('created_at', dateFrom);
        }
        if (dateTo) {
          query = query.lte('created_at', dateTo + 'T23:59:59');
        }

        // 상태 필터 적용
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
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

        // 데이터 조합
        const enrichedOpinions = opinionData?.map(opinion => {
          const category = categories.find(c => c.id === opinion.category_id);
          const company = companies.find(c => c.id === opinion.company_affiliate_id);
          
          return {
            id: opinion.id,
            seq: opinion.seq,
            title: opinion.title || '',
            asis: opinion.asis || '',
            tobe: opinion.tobe || '',
            user_id: opinion.user_id || '',
            status: opinion.status || '접수',
            quarter: opinion.quarter,
            updated_at: opinion.updated_at || undefined,
            category_name: category?.name || '기타',
            company_name: company?.name || '알 수 없음',
            content: opinion.title || '', // content 필드가 없으므로 title 사용
            reg_date: opinion.created_at || '' // created_at을 reg_date로 매핑
          };
        }) || [];

        console.log('✅ 조합된 의견 데이터:', enrichedOpinions.length, '개');
        return enrichedOpinions;

      } catch (error) {
        console.error('💥 의견 데이터 조회 실패:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // 30초마다 자동 갱신
  });

  // 카테고리 목록 조회
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('category')
        .select('id, name')
        .eq('status', 'active')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "접수":
        return "bg-blue-100 text-blue-800";
      case "검토중":
        return "bg-yellow-100 text-yellow-800";
      case "처리중":
        return "bg-orange-100 text-orange-800";
      case "처리완료":
        return "bg-green-100 text-green-800";
      case "보류":
        return "bg-gray-100 text-gray-800";
      case "반려":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    return status || "알 수 없음";
  };

  // 클라이언트 사이드 필터링
  const filteredOpinions = opinions?.filter(opinion => {
    const matchesSearch = !searchTerm || 
      opinion.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opinion.asis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opinion.tobe?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || opinion.category_name === categoryFilter;
    
    // 기간 필터링
    let matchesDate = true;
    if (dateFrom && opinion.reg_date) {
      matchesDate = matchesDate && opinion.reg_date >= dateFrom;
    }
    if (dateTo && opinion.reg_date) {
      matchesDate = matchesDate && opinion.reg_date <= dateTo;
    }
    
    return matchesSearch && matchesCategory && matchesDate;
  }) || [];

  const handleViewDetail = (opinionId: number) => {
    const opinion = opinions?.find(op => op.id === opinionId);
    if (opinion) {
      setSelectedOpinion(opinion);
      setShowDetailDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setShowDetailDialog(false);
    setSelectedOpinion(null);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>의견 데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-red-800 font-medium mb-2">데이터 로딩 오류</h3>
          <p className="text-red-600 text-sm mb-4">
            의견 데이터를 불러오는 중 오류가 발생했습니다.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>필터 및 검색</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="제목이나 내용으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="접수">접수</SelectItem>
                <SelectItem value="검토중">검토중</SelectItem>
                <SelectItem value="처리중">처리중</SelectItem>
                <SelectItem value="처리완료">처리완료</SelectItem>
                <SelectItem value="보류">보류</SelectItem>
                <SelectItem value="반려">반려</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="yearFilter" className="text-sm font-medium">연도</Label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="연도 선택" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quarterFilter" className="text-sm font-medium">분기</Label>
              <Select value={quarterFilter} onValueChange={setQuarterFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="분기 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 분기</SelectItem>
                  <SelectItem value="Q1">1분기</SelectItem>
                  <SelectItem value="Q2">2분기</SelectItem>
                  <SelectItem value="Q3">3분기</SelectItem>
                  <SelectItem value="Q4">4분기</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateFrom" className="text-sm font-medium">시작일</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo" className="text-sm font-medium">종료일</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">보기 형태:</span>
              <RadioGroup
                value={viewType}
                onValueChange={setViewType}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center space-x-1 cursor-pointer">
                    <Grid className="h-4 w-4" />
                    <span>카드</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="table" id="table" />
                  <Label htmlFor="table" className="flex items-center space-x-1 cursor-pointer">
                    <List className="h-4 w-4" />
                    <span>테이블</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="text-sm text-gray-600">
              총 {filteredOpinions.length}건의 의견
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {viewType === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpinions.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">의견이 없습니다</h3>
              <p className="text-gray-600">검색 조건을 변경하거나 새로운 의견을 제출해보세요.</p>
            </div>
          ) : (
            filteredOpinions.map((opinion) => (
              <Card key={opinion.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2 mb-2">
                        {opinion.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Badge variant="outline" className="text-xs">
                          {opinion.category_name}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {opinion.company_name}
                        </Badge>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(opinion.status)}`}>
                      {getStatusText(opinion.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-700 line-clamp-3">
                      <strong>현재상황:</strong> {opinion.asis || '내용 없음'}
                    </div>
                    <div className="text-sm text-gray-700 line-clamp-3">
                      <strong>개선제안:</strong> {opinion.tobe || '내용 없음'}
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3" />
                        <span>{opinion.user_id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3" />
                        <span>{opinion.reg_date ? new Date(opinion.reg_date).toLocaleDateString('ko-KR') : '날짜 미상'}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleViewDetail(opinion.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      자세히 보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>제목</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead>계열사</TableHead>
                  <TableHead>제출자</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>제출일</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOpinions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">의견이 없습니다</h3>
                      <p className="text-gray-600">검색 조건을 변경하거나 새로운 의견을 제출해보세요.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOpinions.map((opinion) => (
                    <TableRow key={opinion.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {opinion.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {opinion.category_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {opinion.company_name}
                        </Badge>
                      </TableCell>
                      <TableCell>{opinion.user_id}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getStatusColor(opinion.status)}`}>
                          {getStatusText(opinion.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {opinion.reg_date ? new Date(opinion.reg_date).toLocaleDateString('ko-KR') : '날짜 미상'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(opinion.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                의견 상세 정보
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseDialog}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedOpinion && (
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">제목</Label>
                  <p className="mt-1 text-sm">{selectedOpinion.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">상태</Label>
                  <div className="mt-1">
                    <Badge className={`text-xs ${getStatusColor(selectedOpinion.status)}`}>
                      {getStatusText(selectedOpinion.status)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">카테고리</Label>
                  <p className="mt-1 text-sm">{selectedOpinion.category_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">계열사</Label>
                  <p className="mt-1 text-sm">{selectedOpinion.company_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">제출자</Label>
                  <p className="mt-1 text-sm">{selectedOpinion.user_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">제출일</Label>
                  <p className="mt-1 text-sm">
                    {selectedOpinion.reg_date ? new Date(selectedOpinion.reg_date).toLocaleDateString('ko-KR') : '날짜 미상'}
                  </p>
                </div>
              </div>

              <Separator />

              {/* 의견 내용 */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">현재 상황 (AS-IS)</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedOpinion.asis || '내용이 없습니다.'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">개선 제안 (TO-BE)</Label>
                  <div className="mt-2 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedOpinion.tobe || '내용이 없습니다.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
