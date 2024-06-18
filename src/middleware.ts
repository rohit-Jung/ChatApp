import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname;

    const isAuth = await getToken({ req });
    // console.log("Authenticated", isAuth);
    const isLoginPage = pathname.startsWith("/login");

    //sensitive routes
    const sensitiveRoutes = ["/dashboard"];
    const isSensitiveRoute = sensitiveRoutes.some((route) =>
      pathname.startsWith(route)
    );

    //is accessing login page and authorized
    if (isLoginPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    //is accessing dashboard page without being authorized
    if (!isAuth && isSensitiveRoute) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    //since the main page is /dashboard
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      async authorized() {
        return true;
      },
    },
  }
);

//config object for where the middleware should be applied
export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
