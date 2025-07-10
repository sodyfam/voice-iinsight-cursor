
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

export const EmptyState = () => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">🔍 검색 조건에 맞는 사용자가 없습니다.</p>
      </CardContent>
    </Card>
  );
};
