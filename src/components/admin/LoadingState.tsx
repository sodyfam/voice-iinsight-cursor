
import { Card, CardContent } from "@/components/ui/card";

export const LoadingState = () => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">사용자 정보를 조회하는 중...</p>
      </CardContent>
    </Card>
  );
};
