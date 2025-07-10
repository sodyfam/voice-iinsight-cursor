import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserRegistrationFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export const UserRegistrationForm = ({ onClose, onSuccess }: UserRegistrationFormProps) => {
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
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [companies, setCompanies] = useState<Array<{id: number, name: string}>>([]);

  // Supabase에서 계열사 데이터 가져오기
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data: companyData, error } = await supabase
          .from('company_affiliate')
          .select('id, name')
          .eq('status', 'active')
          .order('id', { ascending: true });

        if (error) {
          console.error('계열사 조회 오류:', error);
        } else {
          console.log('📋 계열사 데이터:', companyData);
          setCompanies(companyData || []);
        }
      } catch (error) {
        console.error('계열사 데이터 조회 실패:', error);
      }
    };

    fetchCompanies();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 사번이 변경될 때 기존 사용자 체크
    if (field === 'employeeId' && value.length >= 3) {
      checkExistingUser(value);
    }
  };

  // 기존 사용자 체크 함수
  const checkExistingUser = async (employeeId: string) => {
    try {
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('employee_id, name, email, dept, company_id')
        .eq('employee_id', employeeId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
        console.error('사용자 조회 오류:', error);
        return;
      }

      if (existingUser) {
        setIsExistingUser(true);
        
        // 기존 사용자 정보로 폼 채우기
        console.log('🔍 기존 사용자 정보:', existingUser);
        console.log('🏢 계열사 목록:', companies);
        console.log('🔗 기존 사용자 company_id:', existingUser.company_id, typeof existingUser.company_id);
        
        const company = companies.find(c => c.id === existingUser.company_id);
        console.log('📍 찾은 계열사:', company);
        
        setFormData(prev => ({
          ...prev,
          name: existingUser.name || '',
          email: existingUser.email || '',
          department: existingUser.dept || '',
          company: company?.name || ''
        }));

        toast.info(`기존 사용자입니다: ${existingUser.name}님의 정보를 수정할 수 있습니다.`);
      } else {
        setIsExistingUser(false);
      }
    } catch (error) {
      console.error('사용자 체크 실패:', error);
    }
  };

  // SHA256 해시 생성 함수
  const sha256 = async (message: string) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 유효성 검사
    if (!formData.company || !formData.department || !formData.employeeId || !formData.name || !formData.email) {
      toast.error("필수 필드를 모두 입력해주세요.");
      setIsLoading(false);
      return;
    }

    // 비밀번호 검사 (신규 사용자이거나 비밀번호를 입력한 경우)
    if (!isExistingUser || formData.password) {
      if (!formData.password || !formData.confirmPassword) {
        toast.error("비밀번호를 입력해주세요.");
        setIsLoading(false);
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast.error("비밀번호가 일치하지 않습니다.");
        setIsLoading(false);
        return;
      }
    }

    try {
      // 선택된 계열사 ID 찾기
      const selectedCompany = companies.find(c => c.name === formData.company);
      if (!selectedCompany) {
        toast.error("올바른 계열사를 선택해주세요.");
        setIsLoading(false);
        return;
      }

      console.log('💾 선택된 계열사:', selectedCompany);
      console.log('💾 선택된 계열사 ID:', selectedCompany.id, typeof selectedCompany.id);

      // 사용자 데이터 준비
      const userData: any = {
        employee_id: formData.employeeId,
        name: formData.name,
        email: formData.email,
        dept: formData.department,
        company_id: selectedCompany.id, // 숫자 타입으로 저장
        status: 'active',
        role: 'user'
      };

      // 비밀번호가 있으면 해시화해서 추가
      if (formData.password) {
        userData.password_hash = await sha256(formData.password);
      }

      let result;
      if (isExistingUser) {
        // 기존 사용자 업데이트
        const { data, error } = await supabase
          .from('users')
          .update(userData)
          .eq('employee_id', formData.employeeId)
          .select();

        result = { data, error };
        
        if (!error) {
          toast.success(`${formData.name}님의 정보가 성공적으로 업데이트되었습니다!`);
        }
      } else {
        // 신규 사용자 등록 - id는 자동 생성되므로 제외
        userData.created_at = new Date().toISOString();
        
        console.log('💾 신규 사용자 데이터:', userData);
        
        const { data, error } = await supabase
          .from('users')
          .insert([userData])
          .select();

        result = { data, error };
        
        if (!error) {
          toast.success(`${formData.name}님이 성공적으로 등록되었습니다!`);
        }
      }

      if (result.error) {
        console.error('💥 사용자 저장 오류:', result.error);
        console.error('💥 에러 코드:', result.error.code);
        console.error('💥 에러 메시지:', result.error.message);
        console.error('💥 에러 세부사항:', result.error.details);
        
        // 중복 키 에러 처리
        if (result.error.code === '23505') {
          toast.error("이미 등록된 사번입니다.");
        } else {
          toast.error(`${isExistingUser ? '업데이트' : '등록'} 중 오류가 발생했습니다: ${result.error.message}`);
        }
        setIsLoading(false);
        return;
      }

      console.log('사용자 저장 성공:', result.data);

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
      setIsExistingUser(false);

      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess();
      }

      // 다이얼로그 닫기
      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error("사용자 저장 실패:", error);
      toast.error(`${isExistingUser ? '업데이트' : '등록'} 중 오류가 발생했습니다.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto px-1">
      {isExistingUser && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            🔄 기존 사용자 정보를 수정합니다. 비밀번호는 변경하려는 경우에만 입력하세요.
          </p>
        </div>
      )}

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
              <SelectItem key={company.id} value={company.name}>
                {company.name}
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
          사번 * {isExistingUser && <span className="text-blue-600">(기존 사용자)</span>}
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
          비밀번호 {isExistingUser ? "(변경시에만 입력)" : "*"}
        </Label>
        <Input
          id="password"
          type="password"
          placeholder={isExistingUser ? "변경하려면 새 비밀번호 입력" : "비밀번호를 입력하세요"}
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          required={!isExistingUser}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          비밀번호 확인 {isExistingUser ? "(변경시에만 입력)" : "*"}
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder={isExistingUser ? "새 비밀번호 확인" : "비밀번호를 다시 입력하세요"}
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          required={!isExistingUser}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
        disabled={isLoading}
      >
        {isLoading ? (isExistingUser ? "업데이트 중..." : "등록 중...") : (isExistingUser ? "정보 업데이트" : "신규 등록")}
      </Button>
    </form>
  );
};
