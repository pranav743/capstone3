import { NextRequest, NextResponse } from "next/server";
import { AuthManager } from "@/Auth/AuthManager";
import { apiClient } from "../client";

async function updateClaimStatus(id: string, newStatus: string) {
  const updateURL = `${process.env.API_BASE_URL}/claims/${id}/status`;
  try {
    const response = await apiClient.patch(updateURL, { status: newStatus });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Error updating claim status:", error);
    return NextResponse.json(
      { error, message: "Failed to update claim status" },
      { status: 500 }
    );
  }
}

async function dummyUpdateClaimStatus(id: string, newStatus: string) {
  return NextResponse.json(
    { message: `Claim ${id} status updated to ${newStatus}` },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  const authManager = AuthManager.getInstance();
  const isUserLoggedIn = authManager.isAuthenticated(req);

  if (!isUserLoggedIn) {
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    authManager.logout(req, res);
    return res;
  }

  const body = await req.json();
  const { id, newStatus } = body;
  if (!id || !newStatus) {
    return NextResponse.json(
      { error: "Missing id or newStatus" },
      { status: 400 }
    );
  }

  const res = await updateClaimStatus(id, newStatus);
  return res;
}
