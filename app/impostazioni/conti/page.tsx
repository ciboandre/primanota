'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Plus, Edit, Trash2, X } from 'lucide-react'

interface Account {
  id: string
  name: string
  type: string
  balance: number
}

export default function ContiPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>()
  const [formData, setFormData] = useState({
    name: '',
    type: 'bancario',
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/accounts')
      const data = await res.json()
      setAccounts(data)
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = selectedAccount
        ? `/api/accounts/${selectedAccount.id}`
        : '/api/accounts'
      const method = selectedAccount ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        fetchAccounts()
        setIsFormOpen(false)
        setSelectedAccount(undefined)
        setFormData({ name: '', type: 'bancario' })
      }
    } catch (error) {
      console.error('Error saving account:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo conto?')) return

    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchAccounts()
      }
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestione Conti</h1>
            <p className="text-gray-600 mt-2">
              Gestisci i conti bancari e contanti
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedAccount(undefined)
              setFormData({ name: '', type: 'bancario' })
              setIsFormOpen(true)
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Conto</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Saldo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Caricamento...
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Nessun conto trovato
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {account.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {account.type === 'bancario' ? 'Bancario' : account.type === 'contanti' ? 'Contanti' : 'Altro'}
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium ${
                      account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      € {account.balance.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            setSelectedAccount(account)
                            setFormData({
                              name: account.name,
                              type: account.type,
                            })
                            setIsFormOpen(true)
                          }}
                          className="text-primary hover:text-primary-dark"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(account.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedAccount ? 'Modifica Conto' : 'Nuovo Conto'}
              </h2>
              <button onClick={() => setIsFormOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="bancario">Bancario</option>
                  <option value="contanti">Contanti</option>
                  <option value="altro">Altro</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg"
                >
                  Salva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
