import { clerkMiddleware } from "@clerk/nextjs/server";

// Export the middleware function without any options
export default clerkMiddleware();

// Configure the middleware matcher
export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}; 