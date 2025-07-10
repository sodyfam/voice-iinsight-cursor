
'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Building, 
  Users, 
  Hash, 
  Mail,
  FileText,
  MessageSquare,
  Settings,
  Reply
} from "lucide-react";

interface Opinion {
  id: string;
  seq: number;
  title: string;
  content: string;
  asis?: string;
  tobe?: string;
  effect?: string;
  case_study?: string;
  category: string;
  affiliate: string;
  department: string;
  employeeId: string;
  name: string;
  status: string;
  submittedAt: string;
  updatedAt?: string;
  proc_desc?: string;
  proc_user_id?: string;
  proc_date?: string;
  responder_department?: string;
  responder_name?: string;
  negative_score?: number;
}

interface OpinionDetailProps {
  opinionId: string;
  isAdmin: boolean;
}

export const OpinionDetail = ({ opinionId, isAdmin }: OpinionDetailProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [opinion, setOpinion] = useState<Opinion | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processingStatus, setProcessingStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // 날짜를 YYYY-MM-DD 형식으로 포맷하는 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toISOString().split('T')[0];
  };

  // 의견 데이터 가져오기
  const fetchOpinionDetail = async () => {
    try {
      setIsDataLoading(true);
      
      // 의견 데이터 가져오기
      const { data: opinionData, error: opinionError } = await supabase
        .from('opinion')
        .select(`
          *,
          category:category_id(name),
          company_affiliate:company_affiliate_id(name)
        `)
        .eq('id', parseInt(opinionId))
        .single();

      if (opinionError) {
        console.error('의견 데이터 조회 오류:', opinionError);
        throw opinionError;
      }

      if (!opinionData) {
        toast({
          title: "데이터 없음",
          description: "해당 의견을 찾을 수 없습니다.",
          variant: "destructive",
        });
        return;
      }

      // 제출자 정보 가져오기
      const { data: submitterData, error: submitterError } = await supabase
        .from('users')
        .select('name, dept')
        .eq('employee_id', opinionData.user_id || '')
        .single();

      // 답변자 정보 가져오기 (proc_id가 있는 경우)
      let responderData = null;
      if (opinionData.proc_id) {
        console.log('답변자 ID 조회 중:', opinionData.proc_id);
        const { data: responder, error: responderError } = await supabase
          .from('users')
          .select('name, dept')
          .eq('employee_id', opinionData.proc_id)
          .single();
        
        console.log('답변자 데이터:', responder, '오류:', responderError);
        
        if (!responderError && responder) {
          responderData = responder;
        }
      }

      console.log('=== 데이터 디버깅 ===');
      console.log('원본 의견 데이터:', opinionData);
      console.log('proc_desc 값:', opinionData.proc_desc);
      console.log('proc_desc 타입:', typeof opinionData.proc_desc);
      console.log('proc_id 값:', opinionData.proc_id);
      console.log('답변자 데이터:', responderData);

      const formattedOpinion: Opinion = {
        id: opinionData.id.toString(),
        seq: opinionData.seq || 0,
        title: opinionData.title || '',
        content: opinionData.content || '',
        asis: opinionData.asis || undefined,
        tobe: opinionData.tobe || undefined,
        effect: opinionData.effect || undefined,
        case_study: opinionData.case_study || undefined,
        category: opinionData.category?.name || '미분류',
        affiliate: opinionData.company_affiliate?.name || '미지정',
        department: submitterData?.dept || '미지정',
        employeeId: opinionData.user_id || '',
        name: submitterData?.name || '익명',
        status: opinionData.status || '접수',
        submittedAt: opinionData.reg_date || opinionData.created_at || '',
        updatedAt: opinionData.updated_at || undefined,
        proc_desc: opinionData.proc_desc || undefined,
        proc_user_id: opinionData.proc_id || undefined,
        proc_date: opinionData.updated_at || undefined,
        responder_department: responderData?.dept || undefined,
        responder_name: responderData?.name || undefined,
        negative_score: opinionData.negative_score || undefined
      };

      console.log('포맷된 의견 데이터:', formattedOpinion);
      console.log('포맷된 proc_desc:', formattedOpinion.proc_desc);
      console.log('포맷된 responder_name:', formattedOpinion.responder_name);
      console.log('포맷된 responder_department:', formattedOpinion.responder_department);

      setOpinion(formattedOpinion);
      setAdminNotes(formattedOpinion.proc_desc || "");
      setProcessingStatus(formattedOpinion.status);

    } catch (error) {
      console.error('데이터 조회 오류:', error);
      toast({
        title: "조회 실패",
        description: "의견 정보를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (opinionId) {
      fetchOpinionDetail();
    }
  }, [opinionId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "접수":
        return "bg-blue-100 text-blue-800";
      case "검토중":
      case "처리중":
        return "bg-yellow-100 text-yellow-800";
              case "답변완료":
      case "답변완료":
        return "bg-green-100 text-green-800";
      case "보류":
        return "bg-gray-100 text-gray-800";
      case "반려":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = (value: string) => {
    setProcessingStatus(value);
  };

  const handleSaveAdminNotes = async () => {
    if (!opinion) return;
    
    setIsLoading(true);
    
    try {
      const currentDate = new Date().toISOString();
      
      const { error } = await supabase
        .from('opinion')
        .update({
          status: processingStatus,
          proc_desc: adminNotes,
          proc_date: currentDate,
          updated_at: currentDate,
          // TODO: 실제 관리자 ID로 설정
          proc_id: 'admin001'
        })
        .eq('id', parseInt(opinion.id));

      if (error) {
        throw error;
      }

      // 로컬 상태 업데이트
      setOpinion(prev => prev ? {
        ...prev,
        proc_desc: adminNotes,
        status: processingStatus,
        proc_date: currentDate,
        updatedAt: currentDate
      } : null);

      toast({
        title: "처리 정보 저장됨",
        description: "의견 처리 상태와 내용이 저장되었습니다.",
      });

    } catch (error) {
      console.error('저장 오류:', error);
      toast({
        title: "저장 실패",
        description: "처리 정보 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">의견 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!opinion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">의견을 찾을 수 없습니다.</p>
          <Button onClick={handleBackClick} className="mt-4">
            뒤로 가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-auto">
      <div className="w-full max-w-4xl mx-auto space-y-4 p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-2">
          <Button 
            variant="outline" 
            onClick={handleBackClick}
            className="self-start w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로 가기
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">#{opinion.seq}</Badge>
            <Badge variant="outline" className="text-xs">{opinion.category}</Badge>
            <Badge className={`${getStatusColor(opinion.status)} text-xs`}>
              {opinion.status}
            </Badge>
          </div>
        </div>

        {/* Opinion Content */}
        <Card className="w-full">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl md:text-2xl leading-tight">
              {opinion.title}
            </CardTitle>
            <CardDescription className="space-y-3 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{opinion.name} ({opinion.employeeId})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{opinion.affiliate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{opinion.department}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">제출일: {formatDate(opinion.submittedAt)}</span>
                </div>
              </div>
              {opinion.updatedAt && (
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>수정일: {formatDate(opinion.updatedAt)}</span>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 p-4 sm:p-6">
            {/* 의견 내용 */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center text-sm sm:text-base">
                <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                의견 내용
              </h3>
              <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 sm:p-4 rounded-lg text-sm sm:text-base leading-relaxed">
                {opinion.content}
              </div>
            </div>

            {/* ASIS/TOBE/효과/사례 */}
            {(opinion.asis || opinion.tobe || opinion.effect || opinion.case_study) && (
              <>
                <Separator />
                <div className="space-y-4">
                  {opinion.asis && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm">현재 상황 (AS-IS)</h4>
                      <div className="text-gray-700 bg-red-50 p-3 rounded-lg text-sm">
                        {opinion.asis}
                      </div>
                    </div>
                  )}
                  {opinion.tobe && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm">개선 방안 (TO-BE)</h4>
                      <div className="text-gray-700 bg-blue-50 p-3 rounded-lg text-sm">
                        {opinion.tobe}
                      </div>
                    </div>
                  )}
                  {opinion.effect && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm">기대 효과</h4>
                      <div className="text-gray-700 bg-green-50 p-3 rounded-lg text-sm">
                        {opinion.effect}
                      </div>
                    </div>
                  )}
                  {opinion.case_study && (
                    <div>
                      <h4 className="font-medium mb-2 text-sm">사례 연구</h4>
                      <div className="text-gray-700 bg-yellow-50 p-3 rounded-lg text-sm">
                        {opinion.case_study}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 답변 내용 - 디버깅용 */}
            <div className="bg-yellow-100 p-4 rounded border">
              <h4 className="font-bold">디버깅 정보:</h4>
              <p>proc_desc: {JSON.stringify(opinion.proc_desc)}</p>
              <p>proc_desc 타입: {typeof opinion.proc_desc}</p>
              <p>responder_name: {JSON.stringify(opinion.responder_name)}</p>
              <p>responder_department: {JSON.stringify(opinion.responder_department)}</p>
              <p>조건 체크: {opinion.proc_desc ? 'true' : 'false'}</p>
            </div>

            {/* 답변 내용 */}
            {(() => {
              console.log('답변 내용 체크:', opinion.proc_desc, typeof opinion.proc_desc);
              return null;
            })()}
            {/* 답변 내용 - 테스트용 강제 표시 */}
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center text-green-600 text-sm sm:text-base">
                  <Reply className="h-4 w-4 mr-2 flex-shrink-0" />
                  답변 내용 (테스트)
                </h3>
                <div className="text-gray-700 whitespace-pre-wrap bg-green-50 p-3 sm:p-4 rounded-lg text-sm sm:text-base leading-relaxed border-l-4 border-green-500">
                  {opinion.proc_desc || '답변 내용이 없습니다.'}
                </div>
                <div className="mt-3 text-xs text-gray-500 space-y-1">
                  <div className="flex items-center space-x-2">
                    <User className="h-3 w-3" />
                    <span>
                      답변자: {opinion.responder_name || '미지정'}
                      {opinion.responder_department && ` (${opinion.responder_department})`}
                    </span>
                  </div>
                  {opinion.proc_date && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3" />
                      <span>답변일: {formatDate(opinion.proc_date)}</span>
                    </div>
                  )}
                </div>
              </div>
            </>

            {/* Admin Processing Section */}
            {isAdmin && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center text-orange-600 text-sm sm:text-base">
                    <Settings className="h-4 w-4 mr-2 flex-shrink-0" />
                    관리자 처리
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm">처리 상태</Label>
                      <Select value={processingStatus} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="상태 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="접수">접수</SelectItem>
                          <SelectItem value="검토중">검토중</SelectItem>
                          <SelectItem value="처리중">처리중</SelectItem>
                                                      <SelectItem value="답변완료">답변완료</SelectItem>
                          <SelectItem value="보류">보류</SelectItem>
                          <SelectItem value="반려">반려</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminNotes" className="text-sm">답변 내용</Label>
                      <Textarea
                        id="adminNotes"
                        placeholder="답변 내용을 입력하세요..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="min-h-[100px] sm:min-h-[120px] text-sm resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                      <Button 
                        onClick={handleSaveAdminNotes} 
                        disabled={isLoading}
                        className="w-full sm:w-auto text-sm"
                      >
                        {isLoading ? "저장 중..." : "저장"}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
