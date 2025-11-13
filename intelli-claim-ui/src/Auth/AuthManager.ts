import axios from "axios";
import Cookies from "js-cookie";
import { NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

interface AuthTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  not_before_policy: number;
  session_state: string;
  scope: string;
}

export class AuthManager {
  private static instance: AuthManager;

  private authUrl =
    "http://localhost:8080/realms/master/protocol/openid-connect/token";
  private clientId = "capstone-3";

  private constructor() {}

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  public async refreshToken(req: NextRequest, res: NextResponse): Promise<void> {
    const refreshToken = this.getRefreshToken(req);
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", this.clientId);
    params.append("refresh_token", refreshToken);

    const response = await axios.post<AuthTokenResponse>(this.authUrl, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const expiresIn = response.data.expires_in;
    const refreshExpiresIn = response.data.refresh_expires_in;
    
    // Calculate expiry dates
    const accessTokenExpiry = new Date(Date.now() + expiresIn * 1000);
    const refreshTokenExpiry = new Date(Date.now() + refreshExpiresIn * 1000);
    
    // Update tokens in cookies
    res.cookies.set("access_token", response.data.access_token, {
      expires: accessTokenExpiry,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      path: "/",
    });
    res.cookies.set("refresh_token", response.data.refresh_token, {
      expires: refreshTokenExpiry,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      path: "/",
    });
    res.cookies.set("token_expiry", (Date.now() + expiresIn * 1000).toString(), {
      expires: accessTokenExpiry,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      path: "/",
    });
  }

  public async login(username: string, password: string, res: NextResponse): Promise<any> {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);
    params.append("grant_type", "password");
    params.append("client_id", this.clientId);

    try {
      const response = await axios.post<AuthTokenResponse>(
        this.authUrl,
        params,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const expiresIn = response.data.expires_in;
      const refreshExpiresIn = response.data.refresh_expires_in;
      
      const accessTokenExpiry = new Date(Date.now() + expiresIn * 1000);
      const refreshTokenExpiry = new Date(Date.now() + refreshExpiresIn * 1000);
      
      // Set tokens in cookies
      console.log("Response.data:", response.data);
      console.log("Setting cookies with expiry:", {
        accessTokenExpiry: accessTokenExpiry.toISOString(),
        refreshTokenExpiry: refreshTokenExpiry.toISOString()
      });
      
      res.cookies.set("access_token", response.data.access_token, {
        expires: accessTokenExpiry,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "lax",
        path: "/",
      });
      res.cookies.set("refresh_token", response.data.refresh_token, {
        expires: refreshTokenExpiry,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "lax",
        path: "/",
      });
      res.cookies.set("token_expiry", (Date.now() + expiresIn * 1000).toString(), {
        expires: accessTokenExpiry,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "lax",
        path: "/",
      });

      const userInfo = this.getInfoFromToken(response.data.access_token);
      console.log("User info:", userInfo);
      res.cookies.set("user_info", JSON.stringify(userInfo), { 
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "lax",
        path: "/"
      });
      return userInfo;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Login failed : " + error);
    }
  }

  public getToken(req: NextRequest): string | null {
    const token = req.cookies.get("access_token")?.value;
    const expiry = req.cookies.get("token_expiry")?.value;
    if (token && expiry && Date.now() < parseInt(expiry)) {
      return token;
    }
    return null;
  }

  public async logout(req: NextRequest, res: NextResponse): Promise<void> {
    const refreshToken = this.getRefreshToken(req);
    if (refreshToken) {
      try {
        const params = new URLSearchParams();
        params.append("client_id", this.clientId);
        params.append("refresh_token", refreshToken);

        await axios.post(
          "http://localhost:8080/realms/master/protocol/openid-connect/logout",
          params,
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
        console.log("Successfully logged out from auth server");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }
    
    // Clear all auth cookies
    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
    res.cookies.delete("token_expiry");
    res.cookies.delete("user_info");
  }

  private getInfoFromToken(token: string): any {
    const payload = token.split(".")[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  }

  public isAuthenticated(req: NextRequest): boolean {
    return !!this.getToken(req);
  }

  public getRefreshToken(req: NextRequest): string | null {
    return req.cookies.get("refresh_token")?.value || null;
  }

  public getUserRoles(req: NextRequest): string[] {
    const userInfo = this.getUserInfo(req);
    const roles = userInfo?.resource_access?.['capstone-3']?.roles;
    console.log("User roles from token:", userInfo?.resource_access);
    return roles || [];
  }

  public getUserInfo(req: NextRequest): any {
    const userInfo = req.cookies.get("user_info")?.value;
    const expiry = req.cookies.get("token_expiry")?.value;
    if (!userInfo || !expiry || Date.now() >= parseInt(expiry)) {
      return null;
    }
    return JSON.parse(userInfo);
  }
}
