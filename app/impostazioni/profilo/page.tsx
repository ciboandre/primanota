'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { User, Mail, Shield, Save } from 'lucide-react'

interface UserData {
  id: string
  email: string
  name: string | null
  role: string
}

export default function ProfiloPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ name: '' })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const loadUserProfile = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/auth/login')
        return
      }

      // Carica il profilo utente
      const res = await fetch('/api/users')
      if (res.ok) {
        const users = await res.json()
        const currentUser = users.find((u: UserData) => u.email === authUser.email)
        
        if (currentUser) {
          setUser(currentUser)
          setFormData({ name: currentUser.name || '' })
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadUserProfile()
  }, [loadUserProfile])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: formData.name }),
      })

      if (res.ok) {
        const updatedUser = await res.json()
        setUser(updatedUser)
        alert('Profilo aggiornato con successo!')
      } else {
        const error = await res.json()
        alert(error.error || 'Errore nell\'aggiornamento')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Errore nell\'aggiornamento')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Le password non corrispondono')
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert('La password deve essere di almeno 6 caratteri')
      return
    }

    setSaving(true)
    try {
      const supabase = createClient()
      
      // Aggiorna la password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) {
        alert(error.message || 'Errore nel cambio password')
      } else {
        alert('Password aggiornata con successo!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Errore nel cambio password')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Caricamento...</div>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-8 text-red-500">
          Errore nel caricamento del profilo
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Il Mio Profilo</h1>
          <p className="text-gray-600 mt-2">
            Gestisci le informazioni del tuo account
          </p>
        </div>

        {/* Informazioni Profilo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Informazioni Personali
          </h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-2" />
                Nome
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Il tuo nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                L&apos;email non può essere modificata
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Shield className="w-4 h-4 inline mr-2" />
                Ruolo
              </label>
              <input
                type="text"
                value={user.role === 'admin' ? 'Amministratore' : 'Utente'}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
            </div>
          </form>
        </div>

        {/* Cambio Password */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Cambio Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nuova Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Minimo 6 caratteri"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conferma Nuova Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ripeti la nuova password"
                minLength={6}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                {saving ? 'Aggiornamento...' : 'Cambia Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
