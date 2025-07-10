
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Users as UsersIcon, Mail, Building, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRegistrationForm } from "@/components/UserRegistrationForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  dept: string;
  role: string;
}

export const UserManagement = () => {
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Make webhook에서 사용자 데이터 가져오기
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching users from webhook...");
      
      // 실제 사용자 목록 조회용 webhook URL
      const userListWebhookUrl = "https://hook.us2.make.com/2ulqdk9j0p42t30a6x62s7urv2c6npmg";
      
      const response = await fetch(userListWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_users",
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Users loaded:", data);
        
        // 응답 데이터 구조에 따라 파싱
        let userData = [];
        if (data.json) {
          userData = JSON.parse(data.json);
        } else if (Array.isArray(data)) {
          userData = data;
        } else {
          userData = data.users || [];
        }
        
        setUsers(userData);
      } else {
        console.error("Failed to fetch users:", response.status);
        toast.error("사용자 데이터를 불러오는 중 오류가 발생했습니다.");
      }
      
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("사용자 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleUserRegistrationSuccess = () => {
    setShowRegistrationDialog(false);
    // 사용자 등록 후 목록 새로고침
    fetchUsers();
    toast.success("사용자가 성공적으로 등록되었습니다!");
  };

  return (
    <>
      <div className="space-y-4 md:space-y-6 px-4 md:px-0">
        <div className="text-left space-y-2 md:space-y-4">
          <h2 className="text-xl md:text-2xl lg:text-4xl font-bold text-gray-900 tracking-tight">사용자 관리</h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600">시스템 사용자를 관리합니다</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
              <div className="space-y-1">
                <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
                  <UsersIcon className="h-4 w-4 md:h-5 md:w-5" />
                  <span>사용자 목록</span>
                </CardTitle>
                <CardDescription className="text-sm md:text-base">
                  등록된 사용자들을 확인하고 관리할 수 있습니다.
                </CardDescription>
              </div>
              <Button 
                onClick={() => setShowRegistrationDialog(true)}
                className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto text-sm md:text-base"
                size="sm"
              >
                <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                사용자 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 검색 */}
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="이름, 사번, 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm md:text-base"
                />
              </div>
            </div>

            {/* 로딩 상태 */}
            {isLoading ? (
              <div className="text-center py-8 md:py-12">
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm md:text-base">사용자 목록을 불러오는 중...</p>
              </div>
            ) : (
              /* 사용자 카드 목록 - 모바일 최적화 */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {filteredUsers.length === 0 ? (
                  <div className="col-span-full text-center py-8 md:py-12 text-gray-500">
                    <UsersIcon className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm md:text-base">검색 조건에 맞는 사용자가 없습니다.</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <Card key={user.id} className="border border-gray-200 hover:shadow-md transition-shadow bg-white">
                      <CardContent className="p-3 md:p-4">
                        <div className="space-y-2 md:space-y-3">
                          {/* 상단: 아바타와 기본 정보 */}
                          <div className="flex items-center space-x-2 md:space-x-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <h3 className="font-semibold text-gray-900 truncate text-xs md:text-sm">{user.name}</h3>
                                {user.role === "관리자" && <span className="text-xs">⚙️</span>}
                              </div>
                              <p className="text-xs text-gray-600">사번: {user.id}</p>
                            </div>
                          </div>
                          
                          {/* 중단: 연락처 및 부서 정보 */}
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-600 truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-600 truncate">{user.company}</span>
                            </div>
                          </div>

                          {/* 하단: 부서 */}
                          <div className="border-t pt-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500">부서</span>
                              <span className="text-gray-700 font-medium truncate ml-2">{user.dept}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 사용자 등록 다이얼로그 */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg md:text-xl">새 사용자 등록</DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              새로운 사용자를 시스템에 등록합니다.
            </DialogDescription>
          </DialogHeader>
          <UserRegistrationForm onClose={handleUserRegistrationSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
};
