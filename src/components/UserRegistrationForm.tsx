import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface UserRegistrationFormProps {
  onClose?: () => void;
}

export const UserRegistrationForm = ({ onClose }: UserRegistrationFormProps) => {
  const [formData, setFormData] = useState({
    company: "",
    department: "",
    employeeId: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const companies = [
    "오케이캐피탈",
    "오케이저축은행",
    "오케이데이터시스템",
    "기타"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 유효성 검사
    if (Object.values(formData).some(value => !value)) {
      toast.error("모든 필드를 입력해주세요.");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      setIsLoading(false);
      return;
    }

    try {
      // Make webhook 호출
      const webhookUrl = "https://hook.us2.make.com/3mk7kus245araqya8shlicy4usqg3eqg";
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          company: formData.company,
          dept: formData.department,
          id: formData.employeeId,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          passwordConfirm: formData.confirmPassword,
          timestamp: new Date().toISOString()
        }),
      });

      toast.success("사용자 등록 요청이 전송되었습니다!");
      
      // 폼 초기화
      setFormData({
        company: "",
        department: "",
        employeeId: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
      });

      // 다이얼로그 닫기
      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error("Registration error:", error);
      toast.error("등록 요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto px-1">
      <div className="space-y-2">
        <Label htmlFor="company" className="text-sm font-medium">
          계열사 *
        </Label>
        <Select value={formData.company} onValueChange={(value) => handleInputChange("company", value)}>
          <SelectTrigger>
            <SelectValue placeholder="계열사를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company} value={company}>
                {company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="department" className="text-sm font-medium">
          부서 *
        </Label>
        <Input
          id="department"
          type="text"
          placeholder="부서명을 입력하세요"
          value={formData.department}
          onChange={(e) => handleInputChange("department", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="employeeId" className="text-sm font-medium">
          사번 *
        </Label>
        <Input
          id="employeeId"
          type="text"
          placeholder="사번을 입력하세요"
          value={formData.employeeId}
          onChange={(e) => handleInputChange("employeeId", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          이름 *
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="이름을 입력하세요"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          이메일 *
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="이메일을 입력하세요"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          비밀번호 *
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          비밀번호 확인 *
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
        disabled={isLoading}
      >
        {isLoading ? "등록 중..." : "등록"}
      </Button>
    </form>
  );
};
