import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserSession, UserRole } from "@/types";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "bgmb_auth_session";
const SECRET_KEY = process.env.SESSION_SECRET || "super_secret_jwt_and_cookie_signing_token_key_2026";
const encodedKey = new TextEncoder().encode(SECRET_KEY);

export async function signSessionToken(payload: UserSession): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(encodedKey);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    return {
      id: payload.id as string,
      phone: payload.phone as string,
      fullName: (payload.fullName as string) || null,
      zaloNumber: (payload.zaloNumber as string) || null,
      role: payload.role as UserRole,
    };
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

export async function setAuthCookie(session: UserSession): Promise<void> {
  const token = await signSessionToken(session);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await verifySessionToken(token);
    if (!session) return null;

    // Xác minh lại người dùng trong DB để đảm bảo không bị vô hiệu hóa
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, phone: true, fullName: true, zaloNumber: true, role: true, status: true },
    });

    if (!user || user.status === "SUSPENDED") {
      return null;
    }

    return {
      id: user.id,
      phone: user.phone,
      fullName: user.fullName,
      zaloNumber: user.zaloNumber,
      role: user.role as UserRole,
    };
  } catch (err) {
    console.error("Get session user error:", err);
    return null;
  }
}

export async function requireAdmin(): Promise<UserSession | null> {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return null;
  }
  return user;
}
