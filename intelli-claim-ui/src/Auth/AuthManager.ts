import axios from "axios";
import Cookies from "js-cookie";

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

  public async refreshToken(): Promise<void> {
    const refreshToken = this.getRefreshToken();
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
    // Update tokens in cookies
    Cookies.set("access_token", response.data.access_token, {
      expires: expiresIn / 86400,
    });
    Cookies.set("refresh_token", response.data.refresh_token, {
      expires: refreshExpiresIn / 86400,
    });
    Cookies.set("token_expiry", (Date.now() + expiresIn * 1000).toString(), {
      expires: expiresIn / 86400,
    });
  }

  public async login(username: string, password: string): Promise<void> {
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
      // Set tokens in cookies
      Cookies.set("access_token", response.data.access_token, {
        expires: expiresIn / 86400,
      });
      Cookies.set("refresh_token", response.data.refresh_token, {
        expires: refreshExpiresIn / 86400,
      });
      Cookies.set("token_expiry", (Date.now() + expiresIn * 1000).toString(), {
        expires: expiresIn / 86400,
      });

      const userInfo = this.getInfoFromToken(response.data.access_token);
      console.log("User info:", userInfo);
      Cookies.set("user_info", JSON.stringify(userInfo), { expires: 7 });
    } catch (error) {
      throw new Error("Login failed : " + error);
    }
  }

  public getToken(): string | null {
    const token = Cookies.get("access_token");
    const expiry = Cookies.get("token_expiry");
    if (token && expiry && Date.now() < parseInt(expiry)) {
      return token;
    }
    return null;
  }

  public async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
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
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("token_expiry");
    Cookies.remove("user_info");
  }

  private getInfoFromToken(token: string): any {
    const payload = token.split(".")[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  public getRefreshToken(): string | null {
    return Cookies.get("refresh_token") || null;
  }

  public getUserRoles(): string[] {
    const userInfo = this.getUserInfo();
    const roles = userInfo?.resource_access.getAttribute('capstone-3')?.roles;
    return roles || [];
  }

  public getUserInfo(): any {
    const userInfo = Cookies.get("user_info");
    const expiry = Cookies.get("token_expiry");
    if (!userInfo || !expiry || Date.now() >= parseInt(expiry)) {
      return null;
    }
    return JSON.parse(userInfo);
  }
}
