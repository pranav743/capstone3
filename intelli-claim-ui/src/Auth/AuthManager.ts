import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { KEYCLOAK_CLIENT_SECRET } from "../constants";

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

interface UserInfo {
  exp: number;
  iat: number;
  preferred_username: string;
  email: string;
  name: string;
  family_name: string;
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
  [key: string]: unknown;
}

export class AuthManager {
  private static instance: AuthManager;

  private tokenUrl =
    "http://localhost:8080/realms/master/protocol/openid-connect/token";
  private clientId = "capstone-3";
  private clientSecret = KEYCLOAK_CLIENT_SECRET;
  private logoutUrl =
    "http://localhost:8080/realms/master/protocol/openid-connect/logout";
  private introspectUrl =
    "http://localhost:8080/realms/master/protocol/openid-connect/token/introspect";
  private refreshUrl =
    "http://localhost:8080/realms/master/protocol/openid-connect/token";


  private constructor() {}

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  public async refreshToken(
    req: NextRequest,
    res: NextResponse
  ): Promise<void> {
    const refreshToken = this.getRefreshToken(req);
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", this.clientId);
    params.append("client_secret", this.clientSecret);
    params.append("refresh_token", refreshToken);

    try {
      const response = await axios.post<AuthTokenResponse>(this.tokenUrl, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const expiresIn = response.data.expires_in;
      const refreshExpiresIn = response.data.refresh_expires_in;

      // Update tokens in cookies
      res.cookies.set("access_token", response.data.access_token, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      
      res.cookies.set("refresh_token", response.data.refresh_token, {
        maxAge: refreshExpiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      
      res.cookies.set("token_expiry", (Date.now() + expiresIn * 1000).toString(), {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      
      const userInfo = this.getInfoFromToken(response.data.access_token);
      console.log("Token refreshed, user info:", userInfo);
      
      res.cookies.set("user_info", JSON.stringify(userInfo), {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      throw new Error("Failed to refresh token");
    }
  }

  public async login(
    username: string,
    password: string,
    res: NextResponse
  ): Promise<UserInfo> {
    const params = new URLSearchParams();
    console.log("Client Secret:", this.clientSecret);
    params.append("username", username);
    params.append("password", password);
    params.append("grant_type", "password");
    params.append("client_id", this.clientId);
    params.append("client_secret", this.clientSecret);

    try {
      const response = await axios.post<AuthTokenResponse>(
        this.tokenUrl,
        params,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const expiresIn = response.data.expires_in;
      const refreshExpiresIn = response.data.refresh_expires_in;

      // Set tokens in cookies
      console.log("Login successful, setting cookies");
      console.log("Access Token:", response.data.access_token);
      res.cookies.set("access_token", response.data.access_token, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      
      res.cookies.set("refresh_token", response.data.refresh_token, {
        maxAge: refreshExpiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      
      res.cookies.set("token_expiry", (Date.now() + expiresIn * 1000).toString(), {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      const userInfo = this.getInfoFromToken(response.data.access_token);
      console.log("User info extracted:", userInfo);
      
      res.cookies.set("user_info", JSON.stringify(userInfo), {
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      
      return userInfo;
    } catch (error) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(`${error.response?.data?.error_description || error.message}`);
      }
      throw new Error(`${error}`);
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
        params.append("client_secret", this.clientSecret);
        params.append("refresh_token", refreshToken);

        await axios.post(this.logoutUrl, params, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });
        console.log("Successfully logged out from Keycloak");
      } catch (error) {
        console.error("Error during Keycloak logout:", error);
      }
    }

    // Clear all auth cookies
    res.cookies.set("access_token", "", { maxAge: 0, path: "/" });
    res.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
    res.cookies.set("token_expiry", "", { maxAge: 0, path: "/" });
    res.cookies.set("user_info", "", { maxAge: 0, path: "/" });
  }

  private getInfoFromToken(token: string): UserInfo {
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
    const roles = userInfo?.resource_access?.["capstone-3"]?.roles;
    console.log("User roles from token:", userInfo?.resource_access);
    return roles || [];
  }

  public async getUserRolesWithRefresh(req: NextRequest, res: NextResponse): Promise<string[]> {
    const userInfo = await this.getUserInfoWithRefresh(req, res);
    const roles = userInfo?.resource_access?.["capstone-3"]?.roles;
    console.log("User roles from token:", userInfo?.resource_access);
    return roles || [];
  }

  public getUserInfo(req: NextRequest): UserInfo | null {
    const userInfo = req.cookies.get("user_info")?.value;
    const expiry = req.cookies.get("token_expiry")?.value;
    if (!userInfo || !expiry || Date.now() >= parseInt(expiry)) {
      return null;
    }
    return JSON.parse(userInfo);
  }

  public async getUserInfoWithRefresh(req: NextRequest, res: NextResponse): Promise<UserInfo | null> {
    const userInfo = req.cookies.get("user_info")?.value;
    const expiry = req.cookies.get("token_expiry")?.value;
    
    // If user info exists and token is not expired, return it
    if (userInfo && expiry && Date.now() < parseInt(expiry)) {
      return JSON.parse(userInfo);
    }
    
    // Try to refresh the token if it's expired but we have a refresh token
    const refreshToken = this.getRefreshToken(req);
    if (refreshToken) {
      try {
        await this.refreshToken(req, res);
        // After successful refresh, get the new user info from the updated cookies in response
        const newUserInfo = res.cookies.get("user_info")?.value;
        return newUserInfo ? JSON.parse(newUserInfo) : null;
      } catch (error) {
        console.error("Failed to refresh token in getUserInfo:", error);
        return null;
      }
    }
    
    return null;
  }

  public verifyJWT(req: NextRequest): boolean {
    try {
      const token = this.getToken(req);
      if (!token) {
        return false;
      }
      return true;
    } catch (error) {
      console.error("JWT verification failed:", error);
      return false;
    }
  }

  public async introspectToken(token: string): Promise<boolean> {
    try {
      const params = new URLSearchParams();
      params.append("client_id", this.clientId);
      params.append("client_secret", this.clientSecret);
      params.append("token", token);

      const response = await axios.post(this.introspectUrl, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      return response.data.active === true;
    } catch (error) {
      console.error("Token introspection failed:", error);
      return false;
    }
  }
}
