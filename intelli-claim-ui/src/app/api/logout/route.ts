import { NextResponse } from "next/server";
import { AuthManager } from "@/Auth/AuthManager";

export async function POST(request: Request) {
  try {
    // Attempt logout using AuthManager
    const authManager = AuthManager.getInstance();
    try {
      await authManager.logout();
      return NextResponse.redirect(new URL("/login", request.url));
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
