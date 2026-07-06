'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate phone number
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        setError('Please enter a valid 10-digit phone number');
        setIsLoading(false);
        return;
      }

      // Call the login API endpoint
      const response = await fetch('/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to send OTP');
        setIsLoading(false);
        return;
      }

      // Redirect to OTP verification
      window.location.href = `/auth/verify?phone=${encodeURIComponent(phone)}`;
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Sarathi OS</CardTitle>
          <CardDescription>Enter your phone number to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                Phone Number
              </label>
              <div className="flex gap-2">
                <div className="flex h-12 items-center rounded-lg border border-input bg-muted px-3 py-2">
                  <span className="text-sm font-medium text-muted-foreground">+91</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                  disabled={isLoading}
                  className="flex-1"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">We'll send you an OTP to verify</p>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || phone.length !== 10}
              size="lg"
              className="w-full"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
