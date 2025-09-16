"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, LogOut, User, CheckCircle, Star, ArrowRight, Zap, Shield, Smartphone } from "lucide-react"
import Header from "@/components/Header"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const handleSignIn = () => {
    router.push("/signin")
  }

  const handleDashboard = () => {
    router.push("/user/dashboard")
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-lime-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-lime-50">
      {/* Navigation */}
      <Header/>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 hero-gradient opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-8 fade-in">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold text-balance">
                <span className="text-foreground">Seamless</span>
                <br />
                <span className="bg-gradient-to-r from-primary via-cyan-500 to-secondary bg-clip-text text-transparent">
                  Appointment Booking
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto text-pretty">
                Connect buyers and sellers through intelligent calendar scheduling. Book appointments, manage
                availability, and sync with Google Calendar effortlessly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {session ? (
                <>
                  <Button onClick={handleDashboard} size="lg" className="text-lg px-8 py-4 hover-lift">
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Go to Dashboard
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8 py-4 hover-lift bg-transparent">
                    Watch Demo
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleSignIn} size="lg" className="text-lg px-8 py-4 hover-lift">
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Start Booking
                  </Button>
                  
                </>
              )}
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground pt-8">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>Free to get started</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>Google Calendar sync</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-secondary" />
                <span>Instant booking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">Everything you need for appointment booking</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make appointment scheduling between buyers and sellers effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover-lift border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-cyan-400 rounded-2xl flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Smart Scheduling</CardTitle>
                <CardDescription className="text-base">
                  Intelligent availability matching that finds the perfect meeting times between buyers and sellers
                  automatically.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-secondary to-lime-400 rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Instant Sync</CardTitle>
                <CardDescription className="text-base">
                  Real-time synchronization with Google Calendar for both buyers and sellers with automatic event
                  creation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Availability Management</CardTitle>
                <CardDescription className="text-base">
                  Sellers can easily manage their availability while buyers see real-time open slots for instant
                  booking.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Secure Booking</CardTitle>
                <CardDescription className="text-base">
                  Enterprise-grade security ensures all appointment data and calendar information remains completely
                  private.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Mobile Ready</CardTitle>
                <CardDescription className="text-base">
                  Book and manage appointments on any device with responsive design and seamless mobile experience.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-lift border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Automatic Events</CardTitle>
                <CardDescription className="text-base">
                  Automatically creates calendar events for both parties with meeting details and Google Meet links.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

     

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8 text-white">
            <h2 className="text-4xl lg:text-5xl font-bold text-balance">Ready to streamline your appointments?</h2>
            <p className="text-xl lg:text-2xl opacity-90 text-pretty">
              {session
                ? "Access your dashboard and start managing appointments today."
                : "Join as a buyer to book appointments or as a seller to manage your availability."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <Button
                  onClick={handleDashboard}
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-4 hover-lift bg-white text-primary hover:bg-white/90"
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Open Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSignIn}
                    size="lg"
                    variant="secondary"
                    className="text-lg px-8 py-4 hover-lift bg-white text-primary hover:bg-white/90"
                  >
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Get Started
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-4 hover-lift border-white/30 text-white hover:bg-white/10 bg-transparent"
                  >
                    Learn More
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-xl">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                CalendarPro
              </span>
            </div>
            <div className="text-sm text-muted-foreground">© 2024 CalendarPro. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
