import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/profile(.*)"]);

const hasClerkSecret = (process.env.CLERK_SECRET_KEY ?? "").startsWith("sk_");

// Without keys the middleware passes everything through (wallet-only mode).
// With keys, /profile requires sign-in; Clerk hosts verification + reset flows.
const withClerk = clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

function passthrough() {
  return NextResponse.next();
}

export default hasClerkSecret ? withClerk : passthrough;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
