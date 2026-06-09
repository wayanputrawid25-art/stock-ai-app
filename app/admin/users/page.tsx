import { UserManager } from "@/components/admin/user-manager";
import { getDictionary } from "@/lib/locale";

export default async function UsersPage() {
  const t = await getDictionary();
  
  const labels = {
    userManagement: t.admin.userManagement,
    createUser: t.admin.createUser,
    accounts: t.admin.accounts,
    name: t.admin.name,
    email: t.admin.email,
    role: t.admin.role,
    plan: t.admin.plan,
    status: t.admin.status,
    expiry: t.admin.expiry,
    actions: t.dashboard.actions,
    save: t.admin.save,
    delete: t.admin.delete,
    cancel: t.admin.delete,
    edit: "Edit",
    resetPassword: "Reset PW",
    confirmDelete: "Are you sure you want to delete this user?",
    userCreated: "User created successfully!",
    userUpdated: "User updated successfully!",
    userDeleted: "User deleted successfully!",
    passwordUpdated: "Password reset successfully!",
    error: "An error occurred",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-normal">{t.admin.userManagement}</h1>
      <UserManager labels={labels} />
    </div>
  );
}
