"use client"

import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, ShoppingCart } from "lucide-react"

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"Buyer" | "Seller" | null>(null)

  const roleFromUrl = searchParams.get("role") as "Buyer" | "Seller" | null

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push("/user/dashboard")
      }
    })

    if (roleFromUrl && (roleFromUrl === "Buyer" || roleFromUrl === "Seller")) {
      setSelectedRole(roleFromUrl)
    }
  }, [router, roleFromUrl])

  const handleSignIn = async (role: "Buyer" | "Seller") => {
    setIsLoading(true)
    try {
      // Store role in localStorage before sign in
      localStorage.setItem("selectedRole", role)
      await signIn("google", {
        callbackUrl: `/user/dashboard`,
        redirect: true,
      })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-lime-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-primary rounded-xl">
              <Calendar className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-foreground">Join CalendarPro</h2>
          <p className="mt-4 text-lg text-muted-foreground">Choose your role to get started with appointment booking</p>
        </div>

        {!selectedRole ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              className="hover-lift cursor-pointer border-2 hover:border-primary/50 transition-all duration-200"
              onClick={() => setSelectedRole("Buyer")}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4">
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">I'm a Buyer</CardTitle>
                <CardDescription className="text-base">
                  I want to book appointments with sellers and service providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Browse available sellers</li>
                  <li>• Book appointments instantly</li>
                  <li>• Sync with your Google Calendar</li>
                  <li>• Manage your bookings</li>
                </ul>
              </CardContent>
            </Card>

            <Card
              className="hover-lift cursor-pointer border-2 hover:border-primary/50 transition-all duration-200"
              onClick={() => setSelectedRole("Seller")}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-secondary to-lime-400 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">I'm a Seller</CardTitle>
                <CardDescription className="text-base">
                  I want to offer my services and manage appointment bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Set your availability</li>
                  <li>• Accept appointment requests</li>
                  <li>• Manage your calendar</li>
                  <li>• Connect with buyers</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {selectedRole}
                </Badge>
              </div>
              <CardTitle className="text-2xl">Continue as {selectedRole}</CardTitle>
              <CardDescription className="text-base">
                Sign in with your Google account to access your {selectedRole.toLowerCase()} dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => handleSignIn(selectedRole)} disabled={isLoading} className="w-full" size="lg">
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </div>
                )}
              </Button>

              <Button variant="outline" onClick={() => setSelectedRole(null)} className="w-full">
                Choose Different Role
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-lime-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
