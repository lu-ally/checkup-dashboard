import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware() {
    // Add custom middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/api/client-data/:path*", "/api/users/:path*"]
}