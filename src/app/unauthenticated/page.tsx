'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Lock, ArrowRight, Home } from 'lucide-react'

export default function Unauthenticated() {
  const router = useRouter()

  const handleSignIn = () => {
    router.push('/signin')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Access Restricted
            </CardTitle>
            <CardDescription className="text-base">
              You need to be signed in to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="text-center space-y-3">
              <p className="text-gray-600">
                This page contains authenticated content that requires you to sign in with your account.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>CalendarApp - Secure Access</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleSignIn} 
                className="w-full" 
                size="lg"
              >
                Sign In to Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                onClick={handleGoHome} 
                variant="outline" 
                className="w-full" 
                size="lg"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>
            </div>

            <div className="border-t pt-4">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-gray-900">Why do I need to sign in?</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Protect your personal calendar data</li>
                  <li>• Sync with your Google Calendar</li>
                  <li>• Access personalized features</li>
                  <li>• Secure team collaboration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Don't have an account? Sign in with Google to get started instantly.
          </p>
        </div>
      </div>
    </div>
  )
}
