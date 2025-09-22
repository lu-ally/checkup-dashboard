"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name: string
  role: string
  coachId: string | null
  createdAt: string
  updatedAt: string
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Redirect wenn nicht ADMIN
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((session.user as any).role !== "ADMIN") {
        router.push("/dashboard")
      }
    }
  }, [status, session, router])

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        console.error("Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      fetchUsers()
    }
  }, [status, fetchUsers])

  const handleDelete = async (userId: string) => {
    if (!confirm("Bist du sicher, dass du diesen Benutzer löschen möchtest?")) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchUsers()
      } else {
        const error = await response.json()
        alert(`Fehler beim Löschen: ${error.error}`)
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Fehler beim Löschen des Benutzers")
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleAdd = () => {
    setEditingUser(null)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingUser(null)
    fetchUsers()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Benutzer werden geladen...</div>
      </div>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Zugriff verweigert. Nur Administratoren können diese Seite aufrufen.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Benutzerverwaltung</h2>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Neuen Benutzer hinzufügen
        </button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Keine Benutzer gefunden</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rolle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Erstellt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Bearbeiten
                    </button>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {user.id !== (session.user as any).id && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Löschen
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <UserForm
          user={editingUser}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}

interface UserFormProps {
  user: User | null
  onClose: () => void
}

function UserForm({ user, onClose }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "COACH",
    coachId: user?.coachId || "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = user ? `/api/users/${user.id}` : "/api/users"
      const method = user ? "PUT" : "POST"

      const body: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      }

      if (formData.password) {
        body.password = formData.password
      }

      if (formData.coachId) {
        body.coachId = formData.coachId
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        onClose()
      } else {
        const error = await response.json()
        alert(`Fehler: ${error.error}`)
      }
    } catch (error) {
      console.error("Error saving user:", error)
      alert("Fehler beim Speichern des Benutzers")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {user ? "Benutzer bearbeiten" : "Neuen Benutzer erstellen"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Passwort {user && "(leer lassen um beizubehalten)"}
              </label>
              <input
                type="password"
                required={!user}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rolle
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="COACH">Coach</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? "Speichern..." : "Speichern"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}