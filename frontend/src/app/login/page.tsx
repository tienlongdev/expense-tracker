"use client";

import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_45%,#f1f5f9_100%)] px-4 py-12">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(14,165,233,0.08)_35%,transparent_70%)]" />
      <div className="absolute -left-16 top-20 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -right-12 bottom-16 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="relative z-10 flex w-full max-w-5xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Expense Tracker
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Dữ liệu tài chính riêng cho từng tài khoản.
          </h1>
          <p className="max-w-lg text-base leading-7 text-slate-600">
            Phase 1 bổ sung authentication, hồ sơ người dùng và cô lập toàn bộ dữ
            liệu theo `UserId` để chuyển dự án từ demo đơn người dùng sang nền
            tảng có thể mở rộng cho nhiều người dùng thực tế.
          </p>
        </div>

        <AuthForm />
      </div>
    </div>
  );
}
