"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Laden...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-semibold text-gray-900">
                Checkup Dashboard
              </Link>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {session?.user && (session.user as any).role === "ADMIN" && (
                <div className="flex space-x-6">
                  <Link
                    href="/dashboard"
                    className={`text-sm font-medium transition-colors ${
                      pathname === "/dashboard"
                        ? "text-blue-600 border-b-2 border-blue-600 pb-2"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Klient:innen
                  </Link>
                  <Link
                    href="/dashboard/users"
                    className={`text-sm font-medium transition-colors ${
                      pathname === "/dashboard/users"
                        ? "text-blue-600 border-b-2 border-blue-600 pb-2"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Benutzer
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {session.user.name} ({session.user.role})
              </span>
              <button
                onClick={() => signOut()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}