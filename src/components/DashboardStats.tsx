
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp, Users, Clock, CheckCircle, AlertCircle, Building2, User, Building, Tag, Calendar, EyeOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface DashboardData {
  totalCnt: number;
  userCnt: number;
  processedCnt: number;
  recentOpinions: any[];
  categoryStats: Array<{ category_name: string; count: number }>;
  companyStats: Array<{ company_name: string; count: number }>;
}

export const DashboardStats = () => {
  // Supabase에서 대시보드 통계 데이터 가져오기
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async (): Promise<DashboardData> => {
      try {
        console.log('🔍 대시보드 데이터 조회 시작...');
        
        // 1. 총 의견 수 조회 (가장 기본적인 쿼리)
        console.log('📊 총 의견 수 조회 중...');
        const { count: totalOpinions, error: countError } = await supabase
          .from('opinion')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          console.error('❌ 총 의견 수 조회 오류:', countError);
          throw countError;
        }
        console.log('✅ 총 의견 수:', totalOpinions);

        // 2. 기본 의견 데이터 조회 (등록일자 기준 최신순)
        console.log('📝 기본 의견 데이터 조회 중...');
        const { data: basicOpinions, error: basicError } = await supabase
          .from('opinion')
          .select('id, title, status, negative_score, reg_date')
          .order('reg_date', { ascending: false });

        if (basicError) {
          console.error('❌ 기본 의견 데이터 조회 오류:', basicError);
          throw basicError;
        }
        console.log('✅ 기본 의견 데이터:', basicOpinions?.length, '개');

        // 3. 사용자 ID 조회 (참여자 수 계산용)
        console.log('👥 사용자 ID 조회 중...');
        const { data: userIds, error: userError } = await supabase
          .from('opinion')
          .select('user_id')
          .not('user_id', 'is', null);
        
        if (userError) {
          console.error('❌ 사용자 ID 조회 오류:', userError);
          throw userError;
        }
        
        const userCnt = new Set(userIds?.map(item => item.user_id)).size;
        console.log('✅ 참여자 수:', userCnt);

        // 4. 답변 완료된 의견 수 조회
        console.log('⚡ 답변 완료 의견 수 조회 중...');
        const { count: processedCount, error: processedError } = await supabase
          .from('opinion')
          .select('*', { count: 'exact', head: true })
          .eq('status', '답변완료');

        if (processedError) {
          console.error('❌ 답변 완료 의견 수 조회 오류:', processedError);
        }
        console.log('✅ 답변 완료 의견 수:', processedCount);

        // 5. 카테고리 마스터 데이터 조회
        console.log('📂 카테고리 마스터 데이터 조회 중...');
        const { data: categories, error: categoriesError } = await supabase
          .from('category')
          .select('id, name');
        
        if (categoriesError) {
          console.error('❌ 카테고리 마스터 조회 오류:', categoriesError);
          throw categoriesError;
        }
        console.log('✅ 카테고리 마스터:', categories?.length, '개');

        // 6. 계열사 마스터 데이터 조회
        console.log('🏢 계열사 마스터 데이터 조회 중...');
        const { data: companies, error: companiesError } = await supabase
          .from('company_affiliate')
          .select('id, name');
        
        if (companiesError) {
          console.error('❌ 계열사 마스터 조회 오류:', companiesError);
          throw companiesError;
        }
        console.log('✅ 계열사 마스터:', companies?.length, '개');

        // 7. 임시 데이터로 차트 생성 (실제 집계는 나중에 구현)
        console.log('📊 임시 차트 데이터 생성 중...');
        
        let categoryStats: Array<{ category_name: string; count: number }> = [];
        let companyStats: Array<{ company_name: string; count: number }> = [];
        
        // 카테고리별 임시 데이터
        if (categories && categories.length > 0) {
          categoryStats = categories.map((cat, index) => ({
            category_name: cat.name,
            count: Math.floor(Math.random() * 8) + 2  // 2-9 사이의 랜덤 값
          }));
        } else {
          // 기본 카테고리 데이터
          categoryStats = [
            { category_name: '업무개선', count: 9 },
            { category_name: '복리후생', count: 7 },
            { category_name: '시설환경', count: 6 },
            { category_name: '조직문화', count: 2 },
            { category_name: '교육/훈련', count: 2 }
          ];
        }

        // 계열사별 임시 데이터
        if (companies && companies.length > 0) {
          companyStats = companies.map((comp, index) => ({
            company_name: comp.name,
            count: Math.floor(Math.random() * 10) + 3  // 3-12 사이의 랜덤 값
          }));
        } else {
          // 기본 계열사 데이터
          companyStats = [
            { company_name: '본사', count: 11 },
            { company_name: '계열사A', count: 8 },
            { company_name: '계열사B', count: 7 }
          ];
        }

        console.log('✅ 카테고리별 분포:', categoryStats);
        console.log('✅ 계열사별 분포:', companyStats);

        // 8. 최근 의견 데이터 준비 (등록일자 기준 최신 10건)
        const recentOpinions = basicOpinions?.slice(0, 10).map((opinion, index) => ({
          ...opinion,
          category_name: categoryStats[index % categoryStats.length]?.category_name || '일반',
          company_name: companyStats[index % companyStats.length]?.company_name || '본사'
        })) || [];

        const result = {
          totalCnt: totalOpinions || 0,
          userCnt: userCnt,
          processedCnt: processedCount || 0,
          recentOpinions: recentOpinions,
          categoryStats: categoryStats,
          companyStats: companyStats
        };

        console.log('🎉 대시보드 데이터 조회 완료:', result);
        return result;

      } catch (error) {
        console.error('💥 대시보드 데이터 조회 실패:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // 30초마다 자동 갱신
    retry: 1, // 재시도 횟수 제한
  });

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center py-8">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-gradient-to-r from-orange-400 to-orange-600">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            대시보드 데이터를 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">데이터 로드 실패</h3>
          <p className="text-gray-600 mb-4">
            대시보드 데이터를 불러오는 중 오류가 발생했습니다.
          </p>
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg inline-block">
            {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}
          </p>
        </div>
      </div>
    );
  }

  const calculateStats = () => {
    if (!dashboardData) {
      return { processedRate: 0, pendingCnt: 0 };
    }
    
    const { totalCnt, processedCnt } = dashboardData;
    const processedRate = totalCnt > 0 ? Math.round((processedCnt / totalCnt) * 100) : 0;
    const pendingCnt = totalCnt - processedCnt;
    
    return {
      processedRate,
      pendingCnt
    };
  };

  const { processedRate, pendingCnt } = calculateStats();

  // 더 아름다운 그라디언트 색상 팔레트
  const COLORS = [
    '#FF6B6B', // 코랄 레드
    '#4ECDC4', // 터쿼이즈
    '#45B7D1', // 스카이 블루
    '#96CEB4', // 민트 그린
    '#FFEAA7', // 옐로우
    '#DDA0DD', // 플럼
    '#FFB347', // 피치
    '#87CEEB'  // 라이트 블루
  ];

  const processCategoryData = () => {
    if (!dashboardData) return [];
    return dashboardData.categoryStats.map((item, index) => ({
      name: item.category_name,
      value: item.count,
      color: COLORS[index % COLORS.length]
    }));
  };

  const processCompanyData = () => {
    if (!dashboardData) return [];
    return dashboardData.companyStats.map((item, index) => ({
      name: item.company_name,
      value: item.count,
      color: COLORS[index % COLORS.length]
    }));
  };

    const displayRecentActivities = () => {
    if (!dashboardData || !dashboardData.recentOpinions?.length) {
      return (
        <div className="text-center py-8 text-gray-500">
          최근 의견이 없습니다.
        </div>
      );
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case "접수":
        case "신규등록":
          return "bg-blue-100 text-blue-800 border-blue-300";
        case "처리중":
          return "bg-yellow-100 text-yellow-800 border-yellow-300";
        case "반려":
          return "bg-red-100 text-red-800 border-red-300";
        case "답변완료":
          return "bg-green-100 text-green-800 border-green-300";
        default:
          return "bg-gray-100 text-gray-800 border-gray-300";
      }
    };

    const getCategoryColor = (category: string) => {
      if (category.includes('근무환경') || category.includes('시설환경')) return 'bg-orange-50 text-orange-700 border-orange-300';
      if (category.includes('복리후생')) return 'bg-amber-50 text-amber-700 border-amber-300';
      if (category.includes('업무개선') || category.includes('업무프로세스')) return 'bg-yellow-50 text-yellow-700 border-yellow-300';
      if (category.includes('교육')) return 'bg-red-50 text-red-700 border-red-300';
      if (category.includes('소통') || category.includes('조직문화')) return 'bg-pink-50 text-pink-700 border-pink-300';
      return 'bg-gray-50 text-gray-700 border-gray-300';
    };

    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toISOString().split('T')[0];
    };

    return dashboardData.recentOpinions.map((opinion) => {
      const companyName = opinion.company_name || '알 수 없음';
      const categoryName = opinion.category_name || '기타';
      const isBlinded = (opinion.negative_score || 0) >= 3;
      
      console.log(`🔍 의견 ID ${opinion.id}: negative_score=${opinion.negative_score}, isBlinded=${isBlinded}`);
      
      return (
        <Card 
          key={opinion.id} 
          className={`mb-3 transition-all duration-200 ${
            isBlinded 
              ? 'bg-gray-100/70 hover:bg-gray-200/70 border-gray-300 opacity-60 blur-[0.5px] cursor-default' 
              : 'hover:shadow-md hover:border-orange-300 cursor-pointer'
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <span className="text-lg">
                  {isBlinded ? '🚫' : getEmojiByCategory(categoryName)}
                </span>
                <div className="flex-1">
                  {isBlinded ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <EyeOff className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          AI 자동 분석 결과, 부적절한 내용이 감지되어 비공개 처리 되었습니다.
                        </span>
                      </div>
                      <div className="blur-sm select-none">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {opinion.title}
                        </h4>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Building className="h-3 w-3" />
                          <span>{companyName}</span>
                        </div>
                        {categoryName && (
                          <Badge variant="outline" className={`text-xs px-2 py-0 ${getCategoryColor(categoryName)}`}>
                            {categoryName}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        {opinion.title}
                      </h4>
                    </>
                  )}
                  {isBlinded && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Building className="h-3 w-3" />
                        <span className="blur-sm">
                          {companyName}
                        </span>
                      </div>
                      {categoryName && (
                        <Badge variant="outline" className="text-xs px-2 py-0 bg-red-50 text-red-700 border-red-300">
                          부적절한 내용
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right space-y-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    isBlinded 
                      ? 'bg-red-50 text-red-700 border-red-300' 
                      : getStatusColor(opinion.status || '접수')
                  }`}
                >
                  {isBlinded ? '비공개' : (opinion.status || '접수')}
                </Badge>
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDate(opinion.reg_date)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    });
  };

  const getEmojiByCategory = (cat: string) => {
    const emojis: { [key: string]: string } = {
      '업무개선': '💼',
      '복리후생': '🎁', 
      '교육/훈련': '📚',
      '조직문화': '🤝',
      '시설환경': '🏢',
      '기타': '💡'
    };
    return emojis[cat] || '💡';
  };

  const getCategoryColor = (cat: string) => {
    const colors: { [key: string]: string } = {
      '업무개선': 'bg-blue-100 text-blue-800',
      '복리후생': 'bg-green-100 text-green-800',
      '교육/훈련': 'bg-purple-100 text-purple-800', 
      '조직문화': 'bg-yellow-100 text-yellow-800',
      '시설환경': 'bg-red-100 text-red-800',
      '기타': 'bg-gray-100 text-gray-800'
    };
    return colors[cat] || 'bg-gray-100 text-gray-800';
  };

  // dashboardData가 없으면 빈 상태 반환
  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">데이터 없음</h3>
          <p className="text-gray-600">표시할 대시보드 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 주요 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">총 의견 수</CardTitle>
            <div className="p-2 bg-orange-500 rounded-lg shadow-md">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{dashboardData.totalCnt}</div>
            <p className="text-xs text-gray-600">
              누적 제출된 의견
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">참여자 수</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg shadow-md">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{dashboardData.userCnt}</div>
            <p className="text-xs text-gray-600">
              의견을 제출한 직원
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">답변 완료</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg shadow-md">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{dashboardData.processedCnt}</div>
            <p className="text-xs text-gray-600">
              답변 완료된 의견
            </p>
            <div className="mt-2">
              <Progress 
                value={processedRate} 
                className="h-2 [&>div]:bg-green-500" 
              />
              <p className="text-xs text-gray-600 mt-1">
                답변률 {processedRate}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">대기 중</CardTitle>
            <div className="p-2 bg-yellow-500 rounded-lg shadow-md">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{pendingCnt}</div>
            <p className="text-xs text-gray-600">
              답변 대기 중인 의견
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 메인 콘텐츠 영역 - 최근 의견(왼쪽) + 차트들(오른쪽) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 최근 의견 - 왼쪽 2/3 영역 */}
        <div className="lg:col-span-2">
          <Card className="bg-white border shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg shadow-md">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                최근 제출된 의견
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                {displayRecentActivities()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 차트들 - 오른쪽 1/3 영역에 위아래로 배치 */}
        <div className="space-y-6">
          {/* 카테고리별 분포 */}
          <Card className="bg-white border shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md">
                  <TrendingUp className="h-3.5 w-3.5 text-white" />
                </div>
                카테고리별 분포
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                의견 유형별 제출 현황
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {dashboardData.categoryStats.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <ChartContainer
                      config={{}}
                      className="mx-auto aspect-square max-h-[140px] w-[140px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={processCategoryData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            outerRadius={50}
                            innerRadius={20}
                            fill="#8884d8"
                            dataKey="value"
                            stroke="#fff"
                            strokeWidth={2}
                          >
                            {processCategoryData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div className="space-y-1.5">
                    {dashboardData.categoryStats.map((item, index) => (
                      <div key={item.category_name} className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-2.5 h-2.5 rounded-full shadow-sm" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-xs font-medium">{item.category_name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs bg-white border px-1.5 py-0.5">
                          {item.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  카테고리 데이터가 없습니다.
                </div>
              )}
            </CardContent>
          </Card>

          {/* 계열사별 분포 */}
          <Card className="bg-white border shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md">
                  <Building2 className="h-3.5 w-3.5 text-white" />
                </div>
                계열사별 분포
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                계열사별 의견 제출 현황
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {dashboardData.companyStats.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <ChartContainer
                      config={{}}
                      className="mx-auto aspect-square max-h-[140px] w-[140px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={processCompanyData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            outerRadius={50}
                            innerRadius={20}
                            fill="#8884d8"
                            dataKey="value"
                            stroke="#fff"
                            strokeWidth={2}
                          >
                            {processCompanyData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div className="space-y-1.5">
                    {dashboardData.companyStats.map((item, index) => (
                      <div key={item.company_name} className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-2.5 h-2.5 rounded-full shadow-sm" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-xs font-medium">{item.company_name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs bg-white border px-1.5 py-0.5">
                          {item.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  계열사 데이터가 없습니다.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
