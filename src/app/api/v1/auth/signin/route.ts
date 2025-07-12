import { createAuthToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "viem";

export async function POST(request: NextRequest) {
  try {
    const { address, signature, message, chainId } = await request.json();

    // Verify the signature
    const isValid = await verifyMessage({
      address,
      message,
      signature,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Create JWT token
    const token = await createAuthToken(address, chainId);

    const response = NextResponse.json({ success: true });

    // Set HTTP-only cookie
    response.cookies.set("liquidarena.auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.warn(error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Signed out" });

  // Clear the cookie by setting it to expire immediately
  response.cookies.delete("liquidarena.auth-token");

  return response;
}
