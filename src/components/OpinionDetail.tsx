
'use client'

import { useState } from "react";
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
  Settings
} from "lucide-react";

interface Opinion {
  id: string;
  title: string;
  content: string;
  category: string;
  affiliate: string;
  department: string;
  employeeId: string;
  name: string;
  status: "submitted" | "in_review" | "actioned" | "deferred" | "rejected";
  submittedAt: string;
  updatedAt: string;
  aiSummary?: string;
  keywords?: string[];
  adminNotes?: string;
  processingStatus?: string;
}

interface OpinionDetailProps {
  opinionId: string;
  isAdmin: boolean;
}

export const OpinionDetail = ({ opinionId, isAdmin }: OpinionDetailProps) => {
  const router = useRouter();
  const { toast } = useToast();

  // Mock data - 실제 구현에서는 API에서 가져올 데이터
  const mockOpinion: Opinion = {
    id: opinionId,
    title: "사내 카페테리아 메뉴 개선 요청",
    content: "현재 사내 카페테리아의 메뉴가 너무 단조롭고 가격이 비싸다고 생각합니다. 더 다양하고 건강한 메뉴 옵션을 제공해주시면 좋겠습니다. 특히 샐러드나 저칼로리 메뉴가 부족해서 다이어트 중인 직원들이 선택할 수 있는 옵션이 제한적입니다.",
    category: "복리후생 혁신",
    affiliate: "오케이저축은행",
    department: "총무팀",
    employeeId: "2024001",
    name: "김직원",
    status: "in_review",
    submittedAt: "2024-01-15",
    updatedAt: "2024-01-16",
    aiSummary: "사내 카페테리아의 메뉴 다양성과 가격 개선을 요청하는 의견",
    keywords: ["카페테리아", "메뉴", "가격", "건강식"],
    adminNotes: "",
    processingStatus: ""
  };

  const [opinion, setOpinion] = useState<Opinion>(mockOpinion);
  const [adminNotes, setAdminNotes] = useState(opinion.adminNotes || "");
  const [processingStatus, setProcessingStatus] = useState(opinion.status);
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: Opinion["status"]) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "in_review":
        return "bg-yellow-100 text-yellow-800";
      case "actioned":
        return "bg-green-100 text-green-800";
      case "deferred":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Opinion["status"]) => {
    switch (status) {
      case "submitted":
        return "대기";
      case "in_review":
        return "처리중";
      case "actioned":
        return "처리완료";
      case "deferred":
        return "보류";
      case "rejected":
        return "반려";
      default:
        return "알 수 없음";
    }
  };

  const handleStatusChange = (value: string) => {
    setProcessingStatus(value as Opinion["status"]);
  };

  const handleSaveAdminNotes = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Make 웹훅으로 실제 요청 보내기
      // const response = await fetch('MAKE_WEBHOOK_URL', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     opinionId: opinion.id,
      //     status: processingStatus,
      //     adminNotes: adminNotes,
      //     updatedAt: new Date().toISOString(),
      //   }),
      // });

      // 현재는 로컬 상태만 업데이트
      setOpinion(prev => ({
        ...prev,
        adminNotes,
        status: processingStatus,
        updatedAt: new Date().toISOString().split('T')[0]
      }));

      toast({
        title: "처리 정보 저장됨",
        description: "의견 처리 상태와 내용이 저장되었습니다.",
      });

      console.log("처리 정보 저장:", {
        opinionId: opinion.id,
        status: processingStatus,
        adminNotes: adminNotes,
      });

    } catch (error) {
      toast({
        title: "저장 실패",
        description: "처리 정보 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      console.error("저장 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
            router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-auto">
      <div className="w-full max-w-4xl mx-auto space-y-4 p-3 sm:p-4 md:p-6">
        {/* Header - 모바일 최적화 */}
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
            <Badge variant="outline" className="text-xs">{opinion.category}</Badge>
            <Badge className={`${getStatusColor(opinion.status)} text-xs`}>
              {getStatusText(opinion.status)}
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
                  <span className="truncate">제출일: {opinion.submittedAt}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>수정일: {opinion.updatedAt}</span>
              </div>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 p-4 sm:p-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center text-sm sm:text-base">
                <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                의견 내용
              </h3>
              <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 sm:p-4 rounded-lg text-sm sm:text-base leading-relaxed">
                {opinion.content}
              </div>
            </div>

            {/* AI Summary and Keywords */}
            {isAdmin && opinion.aiSummary && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center text-blue-600 text-sm sm:text-base">
                      <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                      AI 요약
                    </h3>
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      {opinion.aiSummary}
                    </div>
                  </div>

                  {opinion.keywords && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center text-green-600 text-sm sm:text-base">
                        <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                        키워드
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {opinion.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

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
                          <SelectItem value="submitted">대기</SelectItem>
                          <SelectItem value="in_review">처리중</SelectItem>
                          <SelectItem value="rejected">반려</SelectItem>
                          <SelectItem value="actioned">처리완료</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminNotes" className="text-sm">처리 내용</Label>
                      <Textarea
                        id="adminNotes"
                        placeholder="처리 내용 및 관리자 메모를 입력하세요..."
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
