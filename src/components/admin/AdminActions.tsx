
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users, Download } from "lucide-react";

interface AdminActionsProps {
  onExport: () => void;
}

export const AdminActions = ({ onExport }: AdminActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>관리자 도구</span>
        </CardTitle>
        <CardDescription>
          사용자 관리를 위한 기본 도구들입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Button variant="outline" className="flex flex-col items-center space-y-2 h-20" onClick={onExport}>
            <Download className="h-6 w-6" />
            <span className="text-xs">CSV 내보내기</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
            <Users className="h-6 w-6" />
            <span className="text-xs">사용자 관리</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
            <Settings className="h-6 w-6" />
            <span className="text-xs">설정</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
