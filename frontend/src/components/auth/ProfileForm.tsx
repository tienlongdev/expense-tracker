"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { FormEvent, useState } from "react";

export default function ProfileForm() {
  const { user, loading, error, updateProfile } = useAuth();
  const [success, setSuccess] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      return;
    }

    setSuccess(null);
    setLocalError(null);

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const preferredCurrency = String(formData.get("preferredCurrency") ?? "").trim().toUpperCase();
    const timeZone = String(formData.get("timeZone") ?? "").trim();

    try {
      await updateProfile({ fullName, preferredCurrency, timeZone });
      setSuccess("Profile updated.");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Unable to update profile");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>
          Manage display name, default currency, and timezone for this account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form key={user.id} className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" value={user.email} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-name">Full Name</Label>
            <Input id="profile-name" name="fullName" defaultValue={user.fullName} required />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-currency">Default Currency</Label>
              <Input
                id="profile-currency"
                name="preferredCurrency"
                defaultValue={user.preferredCurrency}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-timezone">Time Zone</Label>
              <Input
                id="profile-timezone"
                name="timeZone"
                defaultValue={user.timeZone}
                required
              />
            </div>
          </div>

          {(localError || error) && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {localError || error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
              {success}
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
