
import { UserCard } from "./UserCard";

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

interface UserListProps {
  users: AdminUser[];
}

export const UserList = ({ users }: UserListProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">조회 결과</h3>
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};
