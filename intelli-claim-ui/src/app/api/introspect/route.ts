import { NextRequest, NextResponse } from "next/server";
import { AuthManager } from "@/Auth/AuthManager";

export async function POST(request: NextRequest) {
  const authManager = AuthManager.getInstance();
  
  try {
    const body = await request.json();
    const { token } = body;
    
    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }
    
    const isActive = await authManager.introspectToken(token);
    
    return NextResponse.json(
      { active: isActive },
      { status: 200 }
    );
  } catch (error) {
    console.error("Token introspection failed:", error);
    return NextResponse.json(
      { error: "Token introspection failed" },
      { status: 500 }
    );
  }
}