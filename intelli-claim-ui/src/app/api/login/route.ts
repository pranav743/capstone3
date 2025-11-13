import { NextResponse } from "next/server";
import { AuthManager } from "@/Auth/AuthManager";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;
    console.log("Received login request for user:", username);
    console.log("Password received:", password ? "Yes" : "No");
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    // Attempt login using AuthManager
    const authManager = AuthManager.getInstance();
    try {
      const res = NextResponse.json(
        {
          message: "Login successful"
        },
        { status: 200 }
      );
      await authManager.login(username, password, res);
      console.log(res);
      return res;
    } catch (error) {
        console.log(error)
      return NextResponse.json(
        { error: "Invalid credentials : " + error },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body : " + error },
      { status: 400 }
    );
  }
}
