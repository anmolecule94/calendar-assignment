import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import connectToDatabase from "@/lib/mongodb"
import UserModel from "@/lib/models/User"
import { options } from "../../auth/[...nextauth]/route"

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(options)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role } = await req.json()
    
    if (!role || (role !== "Buyer" && role !== "Seller")) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    await connectToDatabase()
    
    const user = await UserModel.findOneAndUpdate(
      { email: session.user.email },
      { role },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, role: user.role })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
