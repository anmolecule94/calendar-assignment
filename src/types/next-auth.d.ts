import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      name: string;
      email: string;
      image?: string;
      refreshToken?: string;
      role?: "Buyer" | "Seller";
    };
  }

  interface User extends DefaultUser {
    googleId: string;
    role: "Buyer" | "Seller";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    refreshToken?: string;
  }
}
