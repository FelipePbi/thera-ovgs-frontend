import type { User } from "@/lib/types";

const JWT_SECRET = "ovgs-mock-secret";
const TOKEN_TTL_SECONDS = 60 * 60 * 8; // 8h

export const MOCK_USER: User = {
  id: "u1",
  username: "teste",
  name: "Usuário Teste",
};

type JwtPayload = {
  sub: string;
  username: string;
  name: string;
  exp: number;
};

function toBase64Url(value: string): string {
  if (typeof btoa === "function") {
    return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const normalized = padded + pad;
  if (typeof atob === "function") {
    return atob(normalized);
  }
  return Buffer.from(normalized, "base64").toString("utf8");
}

export function createMockJwt(user: User = MOCK_USER): string {
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload: JwtPayload = {
    sub: user.id,
    username: user.username,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const body = toBase64Url(JSON.stringify(payload));
  const signature = toBase64Url(`${header}.${body}.${JWT_SECRET}`);
  return `${header}.${body}.${signature}`;
}

export function verifyMockJwt(token: string): User | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expected = toBase64Url(`${header}.${body}.${JWT_SECRET}`);
  if (signature !== expected) return null;

  try {
    const payload = JSON.parse(fromBase64Url(body)) as JwtPayload;
    if (!payload.sub || !payload.username || !payload.exp) return null;
    if (payload.exp * 1000 < Date.now()) return null;
    return {
      id: payload.sub,
      username: payload.username,
      name: payload.name ?? payload.username,
    };
  } catch {
    return null;
  }
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

export function getUserFromRequest(request: Request): User | null {
  const token = getBearerToken(request);
  if (!token) return null;
  return verifyMockJwt(token);
}

export function authenticateCredentials(
  username: string,
  password: string,
): User | null {
  if (username === "teste" && password === "123456") {
    return MOCK_USER;
  }
  return null;
}
