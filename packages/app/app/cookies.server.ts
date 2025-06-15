import { createCookie } from "react-router";

export const authData = createCookie("auth-data", {
  maxAge: 30 * 24 * 60 * 60 * 1000 // one month
});

export async function getAnonId(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await authData.parse(cookieHeader)) || {};
  return cookie.anonId;
}
