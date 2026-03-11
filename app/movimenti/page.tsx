'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import MetricCard from '@/components/MetricCard'
import TransactionForm from '@/components/TransactionForm'
import AdvancedFilters from '@/components/AdvancedFilters'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Download, Plus, Calendar, Filter, MoreVertical, Edit, Trash2, FileText, FileSpreadsheet } from 'lucide-react'
import { TrendingUp, TrendingDown, Building2 } from 'lucide-react'

const categoryColors: Record<string, string> = {
  Vendite: 'bg-green-100 text-green-700',
  Immobili: 'bg-red-100 text-red-700',
  Tecnologia: 'bg-blue-100 text-blue-700',
  Personale: 'bg-gray-100 text-gray-700',
  Consulenza: 'bg-emerald-100 text-emerald-700',
  Marketing: 'bg-purple-100 text-purple-700',
}

const statusColors: Record<string, string> = {
  Confermato: 'bg-green-500',
  'In sospeso': 'bg-yellow-500',
  Annullato: 'bg-red-500',
}

interface Transaction {
  id: string
  date: string
  description: string
  details?: string
  amount: number
  status: string
  type: string
  category: {
    id: string
    name: string
  }
  account: {
    id: string
    name: string
  }
}

export default function MovimentiPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>()
  const [appliedFilters, setAppliedFilters] = useState<any>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    // Recupera la query di ricerca da sessionStorage
    const loadSearchQuery = () => {
      if (typeof window !== 'undefined') {
        try {
          const storedQuery = sessionStorage.getItem('searchQuery')
          if (storedQuery) {
            setSearchQuery(storedQuery)
            setAppliedFilters((prev: any) => ({ ...prev, search: storedQuery }))
            sessionStorage.removeItem('searchQuery')
          }
        } catch (error) {
          console.error('Error accessing sessionStorage:', error)
        }
      }
    }

    if (typeof window !== 'undefined') {
      loadSearchQuery()

      // Ascolta gli eventi di aggiornamento ricerca
      window.addEventListener('searchUpdate', loadSearchQuery)
      
      return () => {
        window.removeEventListener('searchUpdate', loadSearchQuery)
      }
    }
  }, [])

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (appliedFilters.startDate) params.append('startDate', appliedFilters.startDate)
      if (appliedFilters.endDate) params.append('endDate', appliedFilters.endDate)
      if (appliedFilters.categoryId) params.append('categoryId', appliedFilters.categoryId)
      if (appliedFilters.accountId) params.append('accountId', appliedFilters.accountId)
      if (searchQuery || appliedFilters.search) {
        params.append('search', searchQuery || appliedFilters.search)
      }

      const queryString = params.toString()
      const url = queryString ? `/api/transactions?${queryString}` : '/api/transactions'
      
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      
      // Applica filtri lato client per importo e stato
      let filteredData = data
      if (appliedFilters.minAmount) {
        filteredData = filteredData.filter((t: Transaction) => Math.abs(t.amount) >= parseFloat(appliedFilters.minAmount))
      }
      if (appliedFilters.maxAmount) {
        filteredData = filteredData.filter((t: Transaction) => Math.abs(t.amount) <= parseFloat(appliedFilters.maxAmount))
      }
      if (appliedFilters.status) {
        filteredData = filteredData.filter((t: Transaction) => t.status === appliedFilters.status)
      }
      
      setTransactions(filteredData)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      alert('Errore nel caricamento dei movimenti. Controlla la console per i dettagli.')
    } finally {
      setLoading(false)
    }
  }, [appliedFilters, searchQuery])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Reset alla prima pagina quando cambiano i filtri o le transazioni
  useEffect(() => {
    setCurrentPage(1)
  }, [appliedFilters, searchQuery])

  // Calcola paginazione
  const totalPages = Math.ceil(transactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = transactions.slice(startIndex, endIndex)
  const startItem = transactions.length > 0 ? startIndex + 1 : 0
  const endItem = Math.min(endIndex, transactions.length)

  // Reset alla prima pagina se la pagina corrente non esiste più
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  const handleNewTransaction = () => {
    setSelectedTransaction(undefined)
    setIsFormOpen(true)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsFormOpen(true)
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo movimento?')) return

    // Ottimisticamente rimuovi l'elemento dallo stato locale
    const previousTransactions = transactions
    const previousPage = currentPage
    
    // Calcola la nuova lista senza l'elemento eliminato
    const updatedTransactions = transactions.filter((t) => t.id !== id)
    setTransactions(updatedTransactions)

    // Gestisci la paginazione: se siamo sull'ultima pagina e rimane vuota, vai alla pagina precedente
    const newTotalPages = Math.ceil(updatedTransactions.length / itemsPerPage)
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages)
    }

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        // Se l'eliminazione fallisce, ripristina lo stato precedente
        setTransactions(previousTransactions)
        setCurrentPage(previousPage)
        throw new Error('Failed to delete transaction')
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Errore nell\'eliminazione')
      // Lo stato è già stato ripristinato sopra se necessario
    }
  }

  const handleExport = async (format: 'csv' | 'pdf' = 'csv') => {
    try {
      const res = await fetch('/api/export/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: appliedFilters.startDate || null,
          endDate: appliedFilters.endDate || null,
          categoryId: appliedFilters.categoryId || null,
          accountId: appliedFilters.accountId || null,
          format,
        }),
      })

      if (format === 'csv') {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `movimenti_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        // PDF: scarica direttamente il file HTML (può essere salvato come PDF)
        const data = await res.json()
        if (data.success) {
          // Crea un blob con l'HTML
          const htmlBlob = new Blob([data.html], { type: 'text/html;charset=utf-8' })
          const url = window.URL.createObjectURL(htmlBlob)
          const a = document.createElement('a')
          a.href = url
          a.download = `movimenti_${new Date().toISOString().split('T')[0]}.html`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } else {
          alert('Errore nella generazione del PDF')
        }
      }
    } catch (error) {
      console.error('Error exporting transactions:', error)
      alert('Errore nell\'esportazione')
    }
  }

  const totalEntrate = transactions
    .filter((t) => t.type === 'entrata')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalUscite = Math.abs(
    transactions
      .filter((t) => t.type === 'uscita')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const saldoTotale = totalEntrate - totalUscite

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-8 pb-20 sm:pb-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Movimenti</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Gestione e monitoraggio delle transazioni finanziarie in tempo reale
            </p>
          </div>
          {/* Desktop Actions */}
          <div className="hidden md:flex space-x-3">
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              title="Esporta in formato CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Esporta CSV</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              title="Esporta in formato PDF"
            >
              <FileText className="w-4 h-4" />
              <span>Esporta PDF</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleNewTransaction()
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Movimento</span>
            </button>
          </div>
          {/* Mobile Actions - Compact */}
          <div className="flex md:hidden space-x-2">
            <button
              onClick={() => handleExport('csv')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Esporta CSV"
            >
              <FileSpreadsheet className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Esporta PDF"
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Entrate"
            value={`€ ${totalEntrate.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change="+12.5%"
            changeLabel="Rispetto al mese precedente"
            trend="up"
            icon={<TrendingUp className="w-8 h-8" />}
          />
          <MetricCard
            title="Uscite"
            value={`€ ${totalUscite.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change="-5.2%"
            changeLabel="Gestione costi ottimizzata"
            trend="down"
            icon={<TrendingDown className="w-8 h-8" />}
          />
          <MetricCard
            title="Saldo Totale"
            value={`€ ${saldoTotale.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change="+7.1%"
            changeLabel="Disponibilità liquida corrente"
            trend="up"
            isHighlighted
            icon={<Building2 className="w-8 h-8" />}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <button className="px-2 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Questa settimana</span>
              <span className="sm:hidden">Settimana</span>
            </button>
            <button className="px-2 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Tutte le Categorie</span>
              <span className="sm:hidden">Categorie</span>
            </button>
            <button className="px-2 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Tutti i Conti</span>
              <span className="sm:hidden">Conti</span>
            </button>
            <div className="ml-auto">
              <button
                onClick={() => setIsFiltersOpen(true)}
                className="text-primary hover:text-primary-dark flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
              >
                <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Filtri Avanzati</span>
                <span className="sm:hidden">Filtri</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transactions - Desktop Table / Mobile Cards */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DATA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DESCRIZIONE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CATEGORIA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CONTO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IMPORTO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AZIONI
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Caricamento...
                    </td>
                  </tr>
                ) : paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Nessun movimento trovato. Crea il primo movimento!
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(transaction.date), 'dd MMM yyyy', { locale: it })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </div>
                        {transaction.details && (
                          <div className="text-sm text-gray-500">{transaction.details}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            categoryColors[transaction.category.name] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {transaction.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.account.name}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.amount > 0 ? '+' : ''} €{' '}
                        {Math.abs(transaction.amount).toLocaleString('it-IT', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${
                              statusColors[transaction.status] || 'bg-gray-500'
                            }`}
                          ></span>
                          <span className="text-sm text-gray-900">{transaction.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="text-primary hover:text-primary-dark flex items-center"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Modifica
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="text-red-600 hover:text-red-800 flex items-center"
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

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-500">
                Caricamento...
              </div>
            ) : paginatedTransactions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                Nessun movimento trovato. Crea il primo movimento!
              </div>
            ) : (
              paginatedTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </h3>
                        <span
                          className={`text-sm font-semibold ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.amount > 0 ? '+' : ''}€{' '}
                          {Math.abs(transaction.amount).toLocaleString('it-IT', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      {transaction.details && (
                        <p className="text-xs text-gray-500 mb-2">{transaction.details}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                        <span>
                          {format(new Date(transaction.date), 'dd MMM yyyy', { locale: it })}
                        </span>
                        <span>•</span>
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            categoryColors[transaction.category.name] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {transaction.category.name}
                        </span>
                        <span>•</span>
                        <span>{transaction.account.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center">
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          statusColors[transaction.status] || 'bg-gray-500'
                        }`}
                      ></span>
                      <span className="text-xs text-gray-600">{transaction.status}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEditTransaction(transaction)}
                        className="text-primary hover:text-primary-dark p-2"
                        title="Modifica"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Elimina"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {totalPages <= 1 ? (
            <div className="bg-gray-50 px-6 py-4">
              <p className="text-sm text-gray-700">
                Mostrando {startItem} a {endItem} di {transactions.length} movimenti
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-700">
                Mostrando {startItem} a {endItem} di {transactions.length} movimenti
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 border border-gray-300 rounded text-sm ${
                    currentPage === 1
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  Precedente
                </button>
                
                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Mostra sempre la prima pagina, l'ultima, la pagina corrente e quelle adiacenti
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded text-sm ${
                            currentPage === page
                              ? 'bg-primary text-white'
                              : 'border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2 text-gray-500">
                          ...
                        </span>
                      )
                    }
                    return null
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 border border-gray-300 rounded text-sm ${
                    currentPage === totalPages
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  Successivo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchTransactions}
        transaction={selectedTransaction}
      />

      <AdvancedFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApply={setAppliedFilters}
      />

      {/* Mobile Floating Action Button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleNewTransaction()
        }}
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark flex items-center justify-center z-50"
        aria-label="Nuovo Movimento"
      >
        <Plus className="w-6 h-6" />
      </button>
    </Layout>
  )
}
