'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import MetricCard from '@/components/MetricCard'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'

interface DashboardStats {
  totalRevenue: number
  totalCosts: number
  netProfit: number
  profitMargin: number
  revenueChange: number
  costChange: number
  profitChange: number
  quickStats: {
    transactionsCount: number
    categoriesCount: number
    accountsCount: number
    invoicesCount: number
  }
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/dashboard')
      if (!res.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `€ ${amount.toLocaleString('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Panoramica generale della situazione finanziaria
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Caricamento dati...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!stats) {
    return (
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Panoramica generale della situazione finanziaria
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <p className="text-red-500">Errore nel caricamento dei dati</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Panoramica generale della situazione finanziaria
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="TOTALE RICAVI"
            value={formatCurrency(stats.totalRevenue)}
            change={formatPercentage(stats.revenueChange)}
            changeLabel="vs mese prec."
            trend={stats.revenueChange >= 0 ? 'up' : 'down'}
            icon={<TrendingUp className="w-8 h-8" />}
          />
          <MetricCard
            title="TOTALE COSTI"
            value={formatCurrency(stats.totalCosts)}
            change={formatPercentage(stats.costChange)}
            changeLabel="vs mese prec."
            trend={stats.costChange <= 0 ? 'down' : 'up'}
            icon={<TrendingDown className="w-8 h-8" />}
          />
          <MetricCard
            title="UTILE NETTO"
            value={formatCurrency(stats.netProfit)}
            change={formatPercentage(stats.profitChange)}
            changeLabel={`margine ${stats.profitMargin.toFixed(1)}%`}
            trend={stats.netProfit >= 0 ? 'up' : 'down'}
            isHighlighted
            icon={<Wallet className="w-8 h-8" />}
          />
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Statistiche Rapide
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Movimenti questo mese</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.quickStats.transactionsCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Categorie attive</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.quickStats.categoriesCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Conti collegati</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.quickStats.accountsCount}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fatture emesse</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.quickStats.invoicesCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
