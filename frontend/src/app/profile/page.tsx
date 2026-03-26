"use client";

import ProfileForm from "@/components/auth/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý thông tin người dùng và thiết lập mặc định cho tài khoản.
        </p>
      </div>

      <ProfileForm />
    </div>
  );
}
