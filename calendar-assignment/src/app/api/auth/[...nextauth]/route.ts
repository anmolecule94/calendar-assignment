import NextAuth, { type NextAuthOptions, type Account, type User, type Session } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import connectToDatabase from "@/lib/mongodb"
import UserModel from "@/lib/models/User"

const options: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }: { user: User; account: Account | null; profile?: any }) {
      await connectToDatabase()

      const existingUser = await UserModel.findOne({ googleId: user.id })
      if (existingUser) {
        if (account?.refresh_token) {
          existingUser.refreshToken = account.refresh_token
          await existingUser.save()
        }
        return true
      }

      // For new users, we'll set a default role and let them update it later
      // The role will be updated when they visit the dashboard
      await UserModel.create({
        name: user.name!,
        email: user.email!,
        googleId: user.id,
        refreshToken: account?.refresh_token,
        role: "Buyer", // Default role, will be updated on first dashboard visit
      })

      return true
    },

    async jwt({ token, account }) {
      if (account?.refresh_token) {
        token.refreshToken = account.refresh_token
      }
      return token
    },

    async session({ session, token }: { session: Session; token: any }) {
      if (token.refreshToken) {
        session.user.refreshToken = token.refreshToken
      }

      await connectToDatabase()
      const user = await UserModel.findOne({ email: session.user.email })
      if (user) {
        ;(session.user as any).role = user.role
      }

      return session
    },
  },
}

const handler = NextAuth(options)

export { handler as GET, handler as POST, options }
