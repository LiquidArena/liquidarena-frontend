import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key",
);

export const TOKEN_COOKIE_NAME = "liquidarena.auth-token";

export interface AuthPayload {
  address: string;
  chainId: number;
  exp: number;
}

export async function createAuthToken(
  address: string,
  chainId: number,
): Promise<string> {
  return await new SignJWT({ address, chainId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(secret);
}

export async function verifyAuthToken(
  token: string,
): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}

export async function getServerSideAuth(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

  if (!token) return null;

  return await verifyAuthToken(token);
}
