import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/profile(.*)"]);

const hasClerkSecret = (process.env.CLERK_SECRET_KEY ?? "").startsWith("sk_");

function passthrough() {
  return NextResponse.next();
}

// Without keys the middleware passes everything through (wallet-only mode).
// With keys, /profile requires sign-in; Clerk hosts verification + reset flows.
// NOTE: clerkMiddleware() is only constructed when a secret exists —
// constructing it without one throws at module load.
export default hasClerkSecret
  ? clerkMiddleware((auth, req) => {
      if (isProtectedRoute(req)) auth().protect();
    })
  : passthrough;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
