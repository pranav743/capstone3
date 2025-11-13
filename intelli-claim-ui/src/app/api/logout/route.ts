import { NextRequest, NextResponse } from "next/server";
import { AuthManager } from "@/Auth/AuthManager";

export async function POST(request: NextRequest) {
  try {
    // Attempt logout using AuthManager
    const authManager = AuthManager.getInstance();
    try {
      const res = NextResponse.json(
        { message: "Logout successful" },
        { status: 200 }
      );
      await authManager.logout(request, res);
      return res;
    } catch (error) {
      return NextResponse.json(
        { error: "Not able to Logout: " + error },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong: " + error },
      { status: 400 }
    );
  }
}
