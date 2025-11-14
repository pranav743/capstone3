import { NextRequest, NextResponse } from "next/server";
import { AuthManager } from "@/Auth/AuthManager";

export async function POST(request: NextRequest) {
  const authManager = AuthManager.getInstance();
  
  try {
    const res = NextResponse.json(
      { message: "Token refreshed successfully" },
      { status: 200 }
    );
    
    await authManager.refreshToken(request, res);
    return res;
  } catch (error) {
    console.error("Token refresh failed:", error);
    
    // Clear cookies on refresh failure
    const res = NextResponse.json(
      { error: "Token refresh failed" },
      { status: 401 }
    );
    
    await authManager.logout(request, res);
    return res;
  }
}
