export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/api/keywords/:path*", "/api/content/:path*", "/api/blogger/:path*", "/api/scheduler/:path*", "/api/queue/:path*", "/api/posts/:path*", "/api/settings/:path*"],
};
