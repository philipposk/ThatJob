import { NextResponse, type NextRequest } from "next/server";

// Auth redirects stay off this edge file. Importing @supabase/ssr here
// throws "ReferenceError: __dirname is not defined" and 500s every page,
// including the public home page. The home page says the workspace is not ready.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
