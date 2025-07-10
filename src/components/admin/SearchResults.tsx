
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, User, Calendar, Hash, Tag, EyeOff } from "lucide-react";
import { OpinionDetailModal } from "./OpinionDetailModal";

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
}

interface SearchResultsProps {
  data: OpinionData[];
  hasSearched: boolean;
}

export const SearchResults = ({ data, hasSearched }: SearchResultsProps) => {
  const [selectedOpinion, setSelectedOpinion] = useState<OpinionData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!hasSearched) {
    return null;
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-gray-500">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-lg">데이터가 존재하지 않습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
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
    if (category.includes('근무환경')) return 'bg-orange-50 text-orange-700 border-orange-300';
    if (category.includes('복리후생')) return 'bg-amber-50 text-amber-700 border-amber-300';
    if (category.includes('업무 프로세스') || category.includes('업무프로세스')) return 'bg-yellow-50 text-yellow-700 border-yellow-300';
    if (category.includes('교육')) return 'bg-red-50 text-red-700 border-red-300';
    if (category.includes('소통')) return 'bg-pink-50 text-pink-700 border-pink-300';
    return 'bg-gray-50 text-gray-700 border-gray-300';
  };

  const getEmojiByCategory = (category: string) => {
    if (category.includes('근무환경')) return '🏢';
    if (category.includes('복리후생')) return '💝';
    if (category.includes('업무 프로세스') || category.includes('업무프로세스')) return '⚙️';
    if (category.includes('교육')) return '📚';
    if (category.includes('소통')) return '💬';
    return '💡';
  };

  const handleCardClick = (opinion: OpinionData) => {
    // negative_score가 3이상이면 상세페이지 안뜨게 하기
    if (opinion.negative_score >= 3) {
      return;
    }
    setSelectedOpinion(opinion);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOpinion(null);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">📋 조회 결과</h3>
          <div className="text-sm text-gray-500">
            총 {data.length}건의 의견
          </div>
        </div>
        
        <div className="space-y-3">
          {data.map((item) => {
            const isBlinded = item.negative_score >= 3;
            
            return (
              <Card 
                key={item.seq} 
                className={`transition-all duration-200 ${
                  isBlinded 
                    ? 'bg-gray-100/70 hover:bg-gray-200/70 border-gray-300 opacity-60 blur-[0.5px] cursor-default' 
                    : 'hover:shadow-md hover:border-orange-300 cursor-pointer'
                }`}
                onClick={() => handleCardClick(item)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-lg">
                        {isBlinded ? '🚫' : getEmojiByCategory(item.category)}
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
                                {item.title}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {item.tobe}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h4 className="font-medium text-gray-900 text-sm">
                              {item.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {item.tobe}
                            </p>
                          </>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            <span className={isBlinded ? 'blur-sm' : ''}>
                              {isBlinded ? '익명' : item.name}
                            </span>
                          </div>
                          {item.company && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Building className="h-3 w-3" />
                              <span className={isBlinded ? 'blur-sm' : ''}>
                                {item.company}
                              </span>
                            </div>
                          )}
                          {item.dept && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Tag className="h-3 w-3" />
                              <span className={isBlinded ? 'blur-sm' : ''}>
                                {item.dept}
                              </span>
                            </div>
                          )}
                          {item.category && (
                            <Badge variant="outline" className={`text-xs px-2 py-0 ${
                              isBlinded 
                                ? 'bg-red-50 text-red-700 border-red-300' 
                                : getCategoryColor(item.category)
                            }`}>
                              {isBlinded ? '부적절한 내용' : item.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          isBlinded 
                            ? 'bg-red-50 text-red-700 border-red-300' 
                            : getStatusColor(item.status)
                        }`}
                      >
                        {isBlinded ? '비공개' : item.status}
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(item.reg_date).toLocaleDateString('ko-KR', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <OpinionDetailModal
        opinion={selectedOpinion}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};
