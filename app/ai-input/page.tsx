'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Upload, Mic } from 'lucide-react';

export default function AIInputPage() {
  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-2 p-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Add Trip with AI</h1>
        <p className="text-sm text-muted-foreground">Let AI extract trip details for you</p>
      </div>

      {/* Input Methods */}
      <div className="space-y-3 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Choose Input Method</CardTitle>
            <CardDescription>Select how you want to input trip data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button size="lg" variant="secondary" className="w-full justify-start">
              <MessageSquare className="mr-3 h-5 w-5" />
              Paste WhatsApp Message
            </Button>
            <Button size="lg" variant="secondary" className="w-full justify-start">
              <Upload className="mr-3 h-5 w-5" />
              Upload Screenshot
            </Button>
            <Button size="lg" variant="secondary" className="w-full justify-start">
              <Mic className="mr-3 h-5 w-5" />
              Voice Input
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Information Card */}
      <div className="space-y-3 px-4">
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              AI will extract pickup, drop, distance, and other details. You can review and edit
              before confirming.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
