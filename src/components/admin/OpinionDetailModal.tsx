import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, User, Hash, Tag, FileText, Lightbulb, Target, CheckCircle, EyeOff, Sparkles, Settings, Calendar, Bot } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  // Correct API response keys
  asis?: string;
  effect?: string;
  case_study?: string;
  processing_content?: string;
  proc_id?: string;
  proc_name?: string;
  proc_desc?: string;
}

interface OpinionDetailModalProps {
  opinion: OpinionData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export const OpinionDetailModal = ({ opinion, isOpen, onClose, onUpdate }: OpinionDetailModalProps) => {
  const { userProfile } = useAuth();
  const [processingStatus, setProcessingStatus] = useState("");
  const [responseContent, setResponseContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    if (opinion && isOpen) {
      // 처리상태와 답변 내용을 올바르게 설정
      console.log("OpinionDetailModal - 받은 데이터:", {
        id: opinion.id,
        seq: opinion.seq,
        title: opinion.title,
        effect: opinion.effect,
        case_study: opinion.case_study,
        status: opinion.status,
        proc_desc: opinion.proc_desc
      });
      
      setProcessingStatus(opinion.status || "");
      setResponseContent(opinion.proc_desc || "");
    }
  }, [opinion, isOpen]);

  if (!opinion) return null;

  // Changed inappropriate content threshold from >= 4 to >= 3
  const isBlinded = opinion.negative_score >= 3;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "접수":
        return "bg-blue-100 text-blue-800";
      case "처리중":
        return "bg-yellow-100 text-yellow-800";
      case "답변완료":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    if (category.includes('근무환경')) return 'bg-orange-50 text-orange-700 border-orange-300';
    if (category.includes('복리후생')) return 'bg-amber-50 text-amber-700 border-amber-300';
    if (category.includes('업무 프로세스') || category.includes('업무프로세스')) return 'bg-yellow-50 text-yellow-700 border-yellow-300';
    if (category.includes('교육')) return 'bg-red-50 text-red-700 border-red-300';
    if (category.includes('소통')) return 'bg-pink-50 text-pink-700 border-pink-300';
    return 'bg-gray-50 text-gray-700 border-gray-300';
  };

  const handleSubmit = async () => {
    if (!isAdmin || !userProfile) {
      toast.error("관리자 권한이 필요합니다.");
      return;
    }

    if (!processingStatus) {
      toast.error("처리상태를 선택해주세요.");
      return;
    }

    if (!responseContent.trim()) {
      toast.error("답변 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("업데이트 시도 중:", {
        seq: opinion.seq,
        status: processingStatus,
        proc_id: userProfile.employee_id,
        proc_name: userProfile.name,
        proc_desc: responseContent
      });

      // Supabase에 직접 업데이트
      const { error } = await supabase
        .from('opinion')
        .update({
          status: processingStatus,
          proc_id: userProfile.employee_id,
          proc_name: userProfile.name,
          proc_desc: responseContent,
          updated_at: new Date().toISOString()
        })
        .eq('seq', opinion.seq);

      if (error) {
        console.error("Supabase 업데이트 오류:", error);
        throw error;
      }

      // 로컬 상태 업데이트
      if (opinion) {
        opinion.status = processingStatus;
        opinion.proc_id = userProfile.employee_id;
        opinion.proc_name = userProfile.name;
        opinion.proc_desc = responseContent;
      }

      toast.success("의견이 성공적으로 처리되었습니다.");
      
      // 부모 컴포넌트에 업데이트 알림
      if (onUpdate) {
        onUpdate();
      }
      
      onClose();
    } catch (error) {
      console.error("Error updating opinion:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`의견 처리 중 오류가 발생했습니다: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>의견 상세 정보</span>
          </DialogTitle>
        </DialogHeader>

        {isBlinded && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <EyeOff className="h-5 w-5 text-red-500" />
              <span className="text-red-700 font-medium">
                AI 자동 분석 결과, 부적절한 내용이 감지되어 비공개 처리 되었습니다.
              </span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📋 기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">계열사:</span>
                  <span className={`font-medium ${isBlinded ? 'blur-sm' : ''}`}>
                    {opinion.company || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">부서:</span>
                  <span className={`font-medium ${isBlinded ? 'blur-sm' : ''}`}>
                    {opinion.dept || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">사번:</span>
                  <span className={`font-medium ${isBlinded ? 'blur-sm' : ''}`}>
                    {opinion.id}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">이름:</span>
                  <span className={`font-medium ${isBlinded ? 'blur-sm' : ''}`}>
                    {opinion.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">등록일:</span>
                  <span className={`font-medium ${isBlinded ? 'blur-sm' : ''}`}>
                    {opinion.reg_date}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">카테고리:</span>
                <Badge variant="outline" className={`${getCategoryColor(opinion.category)}`}>
                  {opinion.category}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">상태:</span>
                <Badge variant="outline" className={`${getStatusColor(opinion.status)} border-current`}>
                  {opinion.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 의견 내용 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💬 의견 내용</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">제목</h4>
                <p className={`text-gray-700 ${isBlinded ? 'blur-sm' : ''}`}>
                  {opinion.title}
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium text-gray-900 mb-2">제안사항</h4>
                <p className={`text-gray-700 whitespace-pre-wrap ${isBlinded ? 'blur-sm' : ''}`}>
                  {opinion.tobe}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI 분석 답변 */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                          <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-indigo-600" />
                  <span className="text-indigo-800">🧠 AI 분석 답변</span>
                  <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-300 text-xs">
                    자동 생성
                  </Badge>
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-indigo-900 mb-2 flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>기대효과</span>
                </h4>
                <div className="bg-white/50 rounded-lg p-3 border border-indigo-100">
                  <p className={`text-indigo-800 whitespace-pre-wrap ${isBlinded ? 'blur-sm' : ''}`}>
                    {opinion.effect || 'AI가 분석한 이 제안의 기대효과가 여기에 표시됩니다. 업무 효율성 향상, 직원 만족도 증대, 비용 절감 등의 효과를 기대할 수 있습니다.'}
                  </p>
                </div>
              </div>
              <Separator className="bg-indigo-200" />
              <div>
                <h4 className="font-medium text-indigo-900 mb-2 flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4" />
                  <span>적용사례</span>
                </h4>
                <div className="bg-white/50 rounded-lg p-3 border border-indigo-100">
                  <p className={`text-indigo-800 whitespace-pre-wrap ${isBlinded ? 'blur-sm' : ''}`}>
                    {opinion.case_study || 'AI가 분석한 유사한 적용사례가 여기에 표시됩니다. 타 기업이나 부서에서의 성공 사례를 참고하여 실행 방안을 제시합니다.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center pt-2">
                <div className="flex items-center space-x-2 text-xs text-indigo-600 bg-indigo-100/50 px-3 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  <span>AI가 의견 내용을 분석하여 자동으로 생성된 답변입니다</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 관리자 전용 처리 영역 */}
          {isAdmin && (
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <span className="text-purple-800"> 담당자 답변</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-purple-900 mb-2">처리상태</h4>
                  <Select value={processingStatus} onValueChange={setProcessingStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="처리상태를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="접수">접수</SelectItem>
                      <SelectItem value="처리중">처리중</SelectItem>
                      <SelectItem value="답변완료">답변완료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator className="bg-purple-200" />
                <div>
                  <h4 className="font-medium text-purple-900 mb-2">답변</h4>
                  <Textarea
                    value={responseContent}
                    onChange={(e) => setResponseContent(e.target.value)}
                    placeholder="답변 내용을 입력하세요..."
                    className="min-h-[100px] resize-none"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isSubmitting ? "처리 중..." : "등록"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 일반 사용자가 볼 수 있는 처리 결과 (답변완료 상태일 때만) */}
          {!isAdmin && opinion.status === "답변완료" && opinion.proc_desc && (
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2 text-gray-800">
                  <CheckCircle className="h-5 w-5" />
                  <span>처리 결과</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">처리상태</h4>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(opinion.status)} border-current`}
                  >
                    {opinion.status}
                  </Badge>
                </div>
                <Separator className="bg-gray-200" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">답변</h4>
                  <p className={`text-gray-700 whitespace-pre-wrap ${isBlinded ? 'blur-sm' : ''}`}>
                    {opinion.proc_desc}
                  </p>
                  {opinion.proc_name && (
                    <div className="mt-3 text-sm text-gray-600">
                      처리자: {opinion.proc_name}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
