"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  plan: "MONTHLY" | "YEARLY" | "LIFETIME";
  active: boolean;
  expiredAt: string;
  createdAt: string;
}

interface UserManagerProps {
  labels: {
    userManagement: string;
    createUser: string;
    accounts: string;
    name: string;
    email: string;
    role: string;
    plan: string;
    status: string;
    expiry: string;
    actions: string;
    save: string;
    delete: string;
    cancel: string;
    edit: string;
    resetPassword: string;
    confirmDelete: string;
    userCreated: string;
    userUpdated: string;
    userDeleted: string;
    passwordUpdated: string;
    error: string;
    newPassword: string;
    confirmPassword: string;
  };
}

export function UserManager({ labels }: UserManagerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Create user form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER" as "ADMIN" | "USER",
    plan: "MONTHLY" as "MONTHLY" | "YEARLY" | "LIFETIME",
    active: true,
    expiredAt: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  // Edit state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Reset password state
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Fetch users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Show success/error messages
  const showMessage = (type: "success" | "error", message: string) => {
    if (type === "success") {
      setSuccess(message);
      setError(null);
    } else {
      setError(message);
      setSuccess(null);
    }
    setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 4000);
  };

  // Create user
  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      showMessage("error", "Please fill all required fields");
      return;
    }
    
    setIsCreating(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showMessage("success", labels.userCreated);
        setNewUser({
          name: "",
          email: "",
          password: "",
          role: "USER",
          plan: "MONTHLY",
          active: true,
          expiredAt: "",
        });
        fetchUsers();
      } else {
        showMessage("error", data.error || labels.error);
      }
    } catch {
      showMessage("error", labels.error);
    } finally {
      setIsCreating(false);
    }
  };

  // Update user
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showMessage("success", labels.userUpdated);
        setShowEditForm(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        showMessage("error", data.error || labels.error);
      }
    } catch {
      showMessage("error", labels.error);
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    if (!resetPasswordUser) return;
    
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/users/${resetPasswordUser.id}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      
      if (response.ok) {
        showMessage("success", labels.passwordUpdated);
        setResetPasswordUser(null);
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
      } else {
        const data = await response.json();
        showMessage("error", data.error || labels.error);
      }
    } catch {
      showMessage("error", labels.error);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm(labels.confirmDelete)) return;
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        showMessage("success", labels.userDeleted);
        fetchUsers();
      } else {
        const data = await response.json();
        showMessage("error", data.error || labels.error);
      }
    } catch {
      showMessage("error", labels.error);
    }
  };

  // Toggle user active status
  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentStatus }),
      });
      
      if (response.ok) {
        fetchUsers();
      }
    } catch {
      showMessage("error", labels.error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-pulse">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm animate-pulse">
          {success}
        </div>
      )}

      {/* Create User Card */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {labels.createUser}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{labels.name} *</label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{labels.email} *</label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Password *</label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{labels.role}</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "ADMIN" | "USER" })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{labels.plan}</label>
              <select
                value={newUser.plan}
                onChange={(e) => setNewUser({ ...newUser, plan: e.target.value as "MONTHLY" | "YEARLY" | "LIFETIME" })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
              >
                <option value="MONTHLY">MONTHLY</option>
                <option value="YEARLY">YEARLY</option>
                <option value="LIFETIME">LIFETIME</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{labels.expiry} *</label>
              <Input
                type="date"
                value={newUser.expiredAt}
                onChange={(e) => setNewUser({ ...newUser, expiredAt: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{labels.status}</label>
              <select
                value={String(newUser.active)}
                onChange={(e) => setNewUser({ ...newUser, active: e.target.value === "true" })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
              >
                <option value="true">Active</option>
                <option value="false">Suspended</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleCreateUser} 
                disabled={isCreating || !newUser.name || !newUser.email || !newUser.password}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {isCreating ? (
                  <>
                    <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14m7-7h-14" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {labels.createUser}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Form */}
      {showEditForm && editingUser && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-lg">Edit User: {editingUser.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{labels.name}</label>
                <Input
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{labels.email}</label>
                <Input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{labels.role}</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as "ADMIN" | "USER" })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{labels.plan}</label>
                <select
                  value={editingUser.plan}
                  onChange={(e) => setEditingUser({ ...editingUser, plan: e.target.value as "MONTHLY" | "YEARLY" | "LIFETIME" })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="MONTHLY">MONTHLY</option>
                  <option value="YEARLY">YEARLY</option>
                  <option value="LIFETIME">LIFETIME</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{labels.expiry}</label>
                <Input
                  type="date"
                  value={editingUser.expiredAt.split("T")[0]}
                  onChange={(e) => setEditingUser({ ...editingUser, expiredAt: e.target.value })}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleUpdateUser} className="flex-1">
                  {labels.save}
                </Button>
                <Button variant="outline" onClick={() => { setShowEditForm(false); setEditingUser(null); }}>
                  {labels.cancel}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Password Form */}
      {resetPasswordUser && (
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <CardHeader>
            <CardTitle className="text-lg">Reset Password: {resetPasswordUser.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{labels.newPassword}</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError(""); }}
                  placeholder="Min 6 characters"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{labels.confirmPassword}</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(""); }}
                  placeholder="Re-enter password"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleResetPassword} className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600">
                  {labels.resetPassword}
                </Button>
                <Button variant="outline" onClick={() => { setResetPasswordUser(null); setNewPassword(""); setConfirmPassword(""); }}>
                  {labels.cancel}
                </Button>
              </div>
            </div>
            {passwordError && <p className="text-sm text-red-600 mt-2">{passwordError}</p>}
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>{labels.accounts} ({users.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-8 h-8 mx-auto animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="mt-2">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-semibold">{labels.name}</th>
                    <th className="text-left p-3 font-semibold">{labels.email}</th>
                    <th className="text-left p-3 font-semibold">{labels.role}</th>
                    <th className="text-left p-3 font-semibold">{labels.plan}</th>
                    <th className="text-left p-3 font-semibold">{labels.status}</th>
                    <th className="text-left p-3 font-semibold">{labels.expiry}</th>
                    <th className="text-left p-3 font-semibold">{labels.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="p-3 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          {user.name}
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{user.email}</td>
                      <td className="p-3">
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className={user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : ""}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{user.plan}</Badge>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleActive(user.id, user.active)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            user.active
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {user.active ? "● Active" : "○ Suspended"}
                        </button>
                      </td>
                      <td className="p-3 text-gray-600">{formatDate(user.expiredAt)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setEditingUser(user); setShowEditForm(true); setResetPasswordUser(null); }}
                          >
                            {labels.edit}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                            onClick={() => { setResetPasswordUser(user); setShowEditForm(false); }}
                          >
                            {labels.resetPassword}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            {labels.delete}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}