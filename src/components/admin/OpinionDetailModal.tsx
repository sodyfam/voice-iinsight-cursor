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
import { Building, User, Hash, Tag, FileText, Lightbulb, Target, CheckCircle, EyeOff, Sparkles, Settings, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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
  case?: string;
  processing_content?: string;
  proc_id?: string;
  proc_name?: string;
  proc_desc?: string;
}

interface OpinionDetailModalProps {
  opinion: OpinionData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OpinionDetailModal = ({ opinion, isOpen, onClose }: OpinionDetailModalProps) => {
  const [processingStatus, setProcessingStatus] = useState("");
  const [responseContent, setResponseContent] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // localStorage에서 사용자 정보를 읽어와서 role로 권한 확인
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        console.log("User info from localStorage:", user);
        console.log("User role:", user.role);
        
        // role이 '관리자'인지 확인
        const adminStatus = user.role === '관리자';
        setIsAdmin(adminStatus);
        setCurrentUser(user);
        
        console.log("Is admin:", adminStatus);
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (opinion && isOpen) {
      // 처리상태와 답변 내용을 올바르게 설정
      console.log("Setting initial values:", {
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
      case "검토중":
      case "처리중":
        return "bg-yellow-100 text-yellow-800";
      case "보류":
        return "bg-gray-100 text-gray-800";
      case "반려":
        return "bg-red-100 text-red-800";
      case "완료":
      case "답변완료":
      case "처리완료":
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
    if (!isAdmin || !currentUser) {
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
      const updateData = {
        id: opinion.id,
        seq: opinion.seq,
        name: opinion.name,
        dept: opinion.dept,
        company: opinion.company,
        category: opinion.category,
        title: opinion.title,
        asis: opinion.asis,
        tobe: opinion.tobe,
        effect: opinion.effect,
        case: opinion.case,
        status: processingStatus,
        proc_id: currentUser.id,
        proc_name: currentUser.name,
        proc_desc: responseContent,
        proc_date: new Date().toISOString(),
        negative_score: opinion.negative_score,
        reg_date: opinion.reg_date
      };

      console.log("Updating opinion with data:", updateData);

      const response = await fetch("https://hook.us2.make.com/vplimw73admlz31a4qaxzj1ue3778e31", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        toast.success("의견이 성공적으로 처리되었습니다.");
        onClose();
      } else {
        throw new Error("서버 응답 오류");
      }
    } catch (error) {
      console.error("Error updating opinion:", error);
      toast.error("의견 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 일반 사용자가 처리상태/답변을 볼 수 있는 조건: 반려, 처리완료 상태일 때
  const canViewProcessingForRegularUser = opinion.status === "반려" || opinion.status === "처리완료";

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
                <h4 className="font-medium text-gray-900 mb-2">현재상황</h4>
                <p className={`text-gray-700 whitespace-pre-wrap ${isBlinded ? 'blur-sm' : ''}`}>
                  {opinion.asis || '현재 상황에 대한 설명이 여기에 표시됩니다.'}
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

          {/* AI 분석 결과 */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800"> AI 분석 결과</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>기대효과</span>
                </h4>
                <p className={`text-blue-700 whitespace-pre-wrap ${isBlinded ? 'blur-sm' : ''}`}>
                  {opinion.effect || 'AI가 분석한 이 제안의 기대효과가 여기에 표시됩니다. 업무 효율성 향상, 직원 만족도 증대, 비용 절감 등의 효과를 기대할 수 있습니다.'}
                </p>
              </div>
              <Separator className="bg-blue-200" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4" />
                  <span>적용사례</span>
                </h4>
                <p className={`text-blue-700 whitespace-pre-wrap ${isBlinded ? 'blur-sm' : ''}`}>
                  {opinion.case || 'AI가 분석한 유사한 적용사례가 여기에 표시됩니다. 타 기업이나 부서에서의 성공 사례를 참고하여 실행 방안을 제시합니다.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 관리자 전용 처리 영역 */}
          {isAdmin && (
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <span className="text-purple-800"> 관리자 처리</span>
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
                      <SelectItem value="처리중">처리중</SelectItem>
                      <SelectItem value="반려">반려</SelectItem>
                      <SelectItem value="처리완료">처리완료</SelectItem>
                    </SelectContent>
                  </Select>
                  {processingStatus && (
                    <div className="mt-2 text-sm text-purple-700">
                      현재 상태: <Badge className={`${getStatusColor(processingStatus)} text-xs`}>
                        {processingStatus}
                      </Badge>
                    </div>
                  )}
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
                  {responseContent && (
                    <div className="mt-2 text-sm text-purple-600">
                      답변 미리보기: {responseContent.substring(0, 50)}{responseContent.length > 50 ? '...' : ''}
                    </div>
                  )}
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

          {/* 일반 사용자가 볼 수 있는 처리 결과 (반려, 처리완료 상태일 때만) */}
          {!isAdmin && canViewProcessingForRegularUser && (
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
                {opinion.proc_desc && (
                  <>
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
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
