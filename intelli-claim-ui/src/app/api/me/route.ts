import { NextRequest, NextResponse } from "next/server";
import { AuthManager } from "@/Auth/AuthManager";


export type UserInfoData = {
    exp: number;
    iat: number;
    roles?: string[];
    username: string;
    preferred_username: string;
    email: string;
    name: string;
    family_name: string;
}


export async function GET(request: NextRequest) {
  const authManager = AuthManager.getInstance();
  try {
    const userInfo = authManager.getUserInfo(request);
    console.log("User Info1:", userInfo);
    const userInfoData = {
      exp: userInfo.exp,
      iat: userInfo.iat,
      roles: userInfo.resource_access?.['capstone-3']?.roles,
      username: userInfo.preferred_username,
      preferred_username: userInfo.preferred_username,
      email: userInfo.email,
      name: userInfo.name,
      family_name: userInfo.family_name
    }
    return NextResponse.json(userInfoData, { status: 200 });
  } catch (error) {
    const res = NextResponse.json(
      { error: "Failed to fetch user info : " + error },
      { status: 500 }
    );
    authManager.logout(request, res);
    return res;
  }
}
