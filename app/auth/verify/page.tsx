'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store';

type VerifyStep = 'otp' | 'register';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const phone = searchParams.get('phone') || '';

  const [step, setStep] = useState<VerifyStep>('otp');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const setAuth = useAuthStore((state) => state.setAuth);

  // Registration form state
  const [name, setName] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [fuelType, setFuelType] = useState('diesel');
  const [baseMileage, setBaseMileage] = useState('');

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/v1/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      if (response.status === 404) {
        // User doesn't exist, go to registration
        setStep('register');
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Invalid OTP');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setAuth(data.user.userId, phone, data.token);
      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate form
      if (!name.trim() || !vehicleModel.trim() || !vehicleNumber.trim() || !baseMileage.trim()) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      // Register user
      const registerResponse = await fetch('/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          name,
          vehicleModel,
          vehicleNumber,
          fuelType,
          baseMileage: parseFloat(baseMileage),
        }),
      });

      if (!registerResponse.ok) {
        const data = await registerResponse.json();
        setError(data.error || 'Registration failed');
        setIsLoading(false);
        return;
      }

      // Now verify with OTP
      const verifyResponse = await fetch('/v1/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      if (!verifyResponse.ok) {
        const data = await verifyResponse.json();
        setError(data.error || 'Verification failed');
        setIsLoading(false);
        return;
      }

      const data = await verifyResponse.json();
      setAuth(data.user.userId, phone, data.token);
      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResendCountdown(60);

    try {
      const response = await fetch('/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        setError('Failed to resend OTP');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        {step === 'otp' ? (
          <>
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl">Verify OTP</CardTitle>
              <CardDescription>Enter the OTP sent to {phone}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="otp" className="block text-sm font-medium text-foreground">
                    One-Time Password
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    disabled={isLoading}
                    className="text-center text-2xl tracking-widest"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Check your phone for the OTP code
                  </p>
                </div>

                {error && (
                  <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  size="lg"
                  className="w-full"
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  disabled={resendCountdown > 0 || isLoading}
                  onClick={handleResend}
                  className="w-full"
                >
                  {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl">Register Account</CardTitle>
              <CardDescription>Complete your driver profile</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle Model</label>
                  <Input
                    placeholder="e.g., Tata Ace"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle Number</label>
                  <Input
                    placeholder="e.g., MH01AB1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    disabled={isLoading}
                    className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
                  >
                    <option value="diesel">Diesel</option>
                    <option value="petrol">Petrol</option>
                    <option value="cng">CNG</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Base Mileage (km/liter)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 6.5"
                    value={baseMileage}
                    onChange={(e) => setBaseMileage(e.target.value)}
                    disabled={isLoading}
                    step="0.1"
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button type="submit" disabled={isLoading} size="lg" className="w-full">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
