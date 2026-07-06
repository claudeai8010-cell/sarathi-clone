'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store';
import { useUserProfile } from '@/hooks';
import { LogOut, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { data: user, isLoading, error } = useUserProfile();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    clearAuth();
    router.push('/auth/login');
  };

  if (error) {
    return (
      <div className="space-y-6 pb-8">
        <div className="space-y-2 p-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account settings</p>
        </div>
        <div className="space-y-3 px-4">
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Failed to load profile</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-2 p-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>

      {/* Personal Information */}
      <div className="space-y-3 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              {isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <Input disabled value={user?.name || ''} />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              {isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <Input disabled value={user?.phone || ''} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Information */}
      <div className="space-y-3 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vehicle Information</CardTitle>
            <CardDescription>Your vehicle details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vehicle Model</label>
              {isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <Input disabled value={user?.vehicleModel || ''} />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Vehicle Number</label>
              {isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <Input disabled value={user?.vehicleNumber || ''} />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fuel Type</label>
              {isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <Input disabled value={user?.fuelType || ''} />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Base Mileage (km/liter)</label>
              {isLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : (
                <Input disabled value={user?.baseMileage?.toString() || ''} />
              )}
            </div>
            <Button variant="secondary" size="lg" className="w-full" disabled={isLoading}>
              Edit Vehicle Details
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <div className="space-y-3 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
            <CardDescription>App preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="secondary" size="lg" className="w-full">
              Privacy Policy
            </Button>
            <Button variant="secondary" size="lg" className="w-full">
              Terms of Service
            </Button>
            <Button variant="secondary" size="lg" className="w-full">
              About
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Logout */}
      <div className="space-y-3 px-4">
        <Button
          variant="destructive"
          size="lg"
          className="w-full"
          disabled={isLoggingOut}
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
    </div>
  );
}
