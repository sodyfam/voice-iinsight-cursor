
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  affiliate: string;
  department: string;
  category: string;
  status: "active" | "inactive" | "pending";
  registeredAt: string;
}

interface UserCardProps {
  user: AdminUser;
}

export const UserCard = ({ user }: UserCardProps) => {
  const getStatusColor = (status: AdminUser["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: AdminUser["status"]) => {
    switch (status) {
      case "active":
        return "활성";
      case "inactive":
        return "비활성";
      case "pending":
        return "대기";
      default:
        return "알 수 없음";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {/* Left Section - User Info */}
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{user.name}</h4>
                  <p className="text-sm text-gray-500">{user.employeeId}</p>
                </div>
                
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700">{user.affiliate}</p>
                  <p className="text-sm text-gray-500">{user.department}</p>
                </div>
                
                <div className="hidden lg:flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>

                <div className="hidden lg:block">
                  <p className="text-sm text-gray-500">카테고리</p>
                  <p className="text-sm font-medium text-gray-700">{user.category}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Status and Actions */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-500">등록일</p>
              <p className="text-sm font-medium text-gray-700">{user.registeredAt}</p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Badge className={getStatusColor(user.status)}>
                {getStatusText(user.status)}
              </Badge>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                수정
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                삭제
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
