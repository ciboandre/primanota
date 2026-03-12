'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { User, Trash2, Edit, Shield, Mail, Calendar, UserPlus, Copy, Key } from 'lucide-react'

const CREDENTIALS_STORAGE_KEY = 'primanota_created_credentials'

interface UserData {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
}

interface StoredCredential {
  email: string
  password: string
  name: string
  createdAt: string
}

function getStoredCredentials(): StoredCredential[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = sessionStorage.getItem(CREDENTIALS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredCredential[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function storeCredential(cred: StoredCredential) {
  const list = getStoredCredentials()
  list.unshift({ ...cred, createdAt: cred.createdAt || new Date().toISOString() })
  sessionStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(list.slice(0, 50)))
}

export default function UtentiPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [formData, setFormData] = useState({ name: '', role: 'user' })
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  })
  const [storedCredentials, setStoredCredentials] = useState<StoredCredential[]>([])
  const [creating, setCreating] = useState(false)

  const checkAuthAndLoadUsers = useCallback(async () => {
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
  }, [router])

  useEffect(() => {
    checkAuthAndLoadUsers()
  }, [checkAuthAndLoadUsers])

  useEffect(() => {
    setStoredCredentials(getStoredCredentials())
  }, [isAddFormOpen])

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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addFormData.email.trim() || !addFormData.password) {
      alert('Inserisci email e password.')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: addFormData.email.trim(),
          password: addFormData.password,
          name: addFormData.name.trim() || undefined,
          role: addFormData.role,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setUsers((prev) => [data.user, ...prev])
        storeCredential({
          email: addFormData.email.trim(),
          password: addFormData.password,
          name: addFormData.name.trim() || '',
          createdAt: new Date().toISOString(),
        })
        setStoredCredentials(getStoredCredentials())
        setIsAddFormOpen(false)
        setAddFormData({ name: '', email: '', password: '', role: 'user' })
      } else {
        alert(data.error || 'Errore nella creazione dell\'utente')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Errore nella creazione dell\'utente')
    } finally {
      setCreating(false)
    }
  }

  const copyCredential = (cred: StoredCredential) => {
    const text = `Email: ${cred.email}\nPassword: ${cred.password}`
    navigator.clipboard.writeText(text).then(() => alert('Credenziali copiate negli appunti.'))
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestione Utenti</h1>
            <p className="text-gray-600 mt-2">
              Gestisci gli utenti del sistema (solo amministratori)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddFormOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Aggiungi utente
          </button>
        </div>

        {storedCredentials.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-amber-900 flex items-center gap-2 mb-3">
              <Key className="w-5 h-5" />
              Credenziali memorizzate
            </h2>
            <p className="text-sm text-amber-800 mb-3">
              Le credenziali create in questa sessione sono salvate qui. Copiale per consegnarle all&apos;utente.
            </p>
            <ul className="space-y-2">
              {storedCredentials.map((cred, i) => (
                <li
                  key={`${cred.email}-${cred.createdAt}-${i}`}
                  className="flex flex-wrap items-center justify-between gap-2 bg-white/70 rounded px-3 py-2 text-sm"
                >
                  <span className="font-medium text-gray-900">{cred.name || cred.email}</span>
                  <span className="text-gray-600">{cred.email}</span>
                  <button
                    type="button"
                    onClick={() => copyCredential(cred)}
                    className="inline-flex items-center text-primary hover:text-primary-dark"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copia credenziali
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

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

        {/* Modal Aggiungi utente */}
        {isAddFormOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
            onClick={() => !creating && setIsAddFormOpen(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Aggiungi utente
              </h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={addFormData.name}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Mario Rossi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={addFormData.email}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="mario@esempio.it"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={addFormData.password}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Minimo 6 caratteri"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ruolo
                  </label>
                  <select
                    value={addFormData.role}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, role: e.target.value })
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
                    onClick={() => !creating && setIsAddFormOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={creating}
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
                  >
                    {creating ? 'Creazione...' : 'Crea utente'}
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
