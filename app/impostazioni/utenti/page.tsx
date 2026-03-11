'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { User, Trash2, Edit, Shield, Mail, Calendar } from 'lucide-react'

interface UserData {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
}

export default function UtentiPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [formData, setFormData] = useState({ name: '', role: 'user' })

  useEffect(() => {
    checkAuthAndLoadUsers()
  }, [])

  const checkAuthAndLoadUsers = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Carica i dati dell'utente corrente
      const userRes = await fetch('/api/users')
      if (userRes.ok) {
        const allUsers = await userRes.json()
        const current = allUsers.find((u: UserData) => u.email === user.email)
        
        if (current) {
          setCurrentUser(current)
          setIsAdmin(current.role === 'admin')
          
          if (current.role === 'admin') {
            setUsers(allUsers)
          } else {
            router.push('/dashboard')
          }
        }
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: UserData) => {
    setSelectedUser(user)
    setFormData({
      name: user.name || '',
      role: user.role,
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo utente?')) return

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id))
      } else {
        const error = await res.json()
        alert(error.error || 'Errore nell\'eliminazione')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Errore nell\'eliminazione')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const updatedUser = await res.json()
        setUsers((prev) =>
          prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        )
        setIsFormOpen(false)
        setSelectedUser(null)
      } else {
        const error = await res.json()
        alert(error.error || 'Errore nell\'aggiornamento')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Errore nell\'aggiornamento')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Caricamento...</div>
      </Layout>
    )
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="text-center py-8 text-red-500">
          Accesso negato. Solo gli amministratori possono accedere a questa pagina.
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Utenti</h1>
          <p className="text-gray-600 mt-2">
            Gestisci gli utenti del sistema (solo amministratori)
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ruolo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data Registrazione
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {user.name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <Shield className="w-3 h-3 inline mr-1" />
                        {user.role === 'admin' ? 'Amministratore' : 'Utente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(user.createdAt).toLocaleDateString('it-IT')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-primary hover:text-primary-dark flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Modifica
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-800 flex items-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Form Modal */}
        {isFormOpen && selectedUser && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
            onClick={() => setIsFormOpen(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Modifica Utente
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ruolo
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="user">Utente</option>
                    <option value="admin">Amministratore</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    Salva
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
