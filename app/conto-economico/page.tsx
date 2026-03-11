'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import MetricCard from '@/components/MetricCard'
import ProgressBar from '@/components/ProgressBar'
import ExportPDF from '@/components/ExportPDF'
import { PeriodType } from '@/types'
import { TrendingUp, TrendingDown, Wallet, Calendar, Plus, Minus, ArrowRight } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function ContoEconomicoPage() {
  const [period, setPeriod] = useState<PeriodType>('Mensile')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCosts: 0,
    netProfit: 0,
    profitMargin: 0,
    revenueDetails: [] as Array<{ id: string; name: string; amount: number; percentage: number }>,
    costDetails: [] as Array<{ id: string; name: string; amount: number; percentage: number }>,
  })
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; revenue: number; costs: number; profit: number }>>([])

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      // Calcola le date in base al periodo
      const now = new Date()
      let startDate: Date
      
      if (period === 'Mensile') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      } else if (period === 'Trimestrale') {
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
      } else {
        startDate = new Date(now.getFullYear(), 0, 1)
      }

      const res = await fetch(
        `/api/stats?startDate=${startDate.toISOString()}&endDate=${now.toISOString()}`
      )
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }, [period])

  const fetchMonthlyData = useCallback(async () => {
    try {
      // Recupera i dati degli ultimi 6 mesi
      const now = new Date()
      const months: Array<{ month: string; revenue: number; costs: number; profit: number }> = []
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
        
        const res = await fetch(
          `/api/stats?startDate=${date.toISOString()}&endDate=${endDate.toISOString()}`
        )
        const data = await res.json()
        
        const monthNames = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC']
        months.push({
          month: monthNames[date.getMonth()],
          revenue: data.totalRevenue,
          costs: data.totalCosts,
          profit: data.netProfit,
        })
      }
      
      setMonthlyData(months)
    } catch (error) {
      console.error('Error fetching monthly data:', error)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    fetchMonthlyData()
  }, [period, fetchStats, fetchMonthlyData])

  const { totalRevenue, totalCosts, netProfit, profitMargin, revenueDetails, costDetails } = stats
  const revenueChange = 12.5 // TODO: Calcolare dal database
  const costChange = -2.1 // TODO: Calcolare dal database
  const profitChange = 18.4 // TODO: Calcolare dal database

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Conto Economico</h1>
            <p className="text-gray-600 mt-2">
              Analisi dettagliata della performance finanziaria per il periodo selezionato.
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Ottobre 2023</span>
            </button>
            <ExportPDF period={period} />
          </div>
        </div>

        {/* Period Tabs */}
        <div className="flex space-x-1 border-b border-gray-200">
          {(['Mensile', 'Trimestrale', 'Annuale'] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                period === p
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="TOTALE RICAVI"
            value={`€ ${totalRevenue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change={`+${revenueChange}%`}
            changeLabel="vs mese prec."
            trend="up"
            icon={<TrendingUp className="w-8 h-8" />}
          />
          <MetricCard
            title="TOTALE COSTI"
            value={`€ ${totalCosts.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change={`${costChange}%`}
            changeLabel="vs mese prec."
            trend="down"
            icon={<TrendingDown className="w-8 h-8" />}
          />
          <MetricCard
            title="UTILE NETTO"
            value={`€ ${netProfit.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change={`+${profitChange}%`}
            changeLabel={`margine ${profitMargin.toFixed(1)}%`}
            trend="up"
            isHighlighted
            icon={<Wallet className="w-8 h-8" />}
          />
        </div>

        {/* Revenue and Costs Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                  <Plus className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Dettaglio Ricavi</h2>
              </div>
              <span className="text-sm text-gray-500">100% del Totale</span>
            </div>
            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-gray-500">Caricamento...</p>
              ) : revenueDetails.length === 0 ? (
                <p className="text-sm text-gray-500">Nessun dato disponibile</p>
              ) : (
                revenueDetails.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <span className="text-sm text-gray-500">({Math.round(item.percentage)}%)</span>
                    </div>
                    <ProgressBar
                      value={item.amount}
                      maxValue={totalRevenue || 1}
                      color="green"
                      showPercentage={false}
                    />
                  </div>
                ))
              )}
            </div>
            <button className="mt-4 text-primary hover:text-primary-dark flex items-center space-x-1 text-sm font-medium">
              <span>Vedi tutte le voci ricavo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Costs Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                  <Minus className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Dettaglio Costi</h2>
              </div>
              <span className="text-sm text-gray-500">
                {(totalCosts / 1000).toFixed(1)}k Totale
              </span>
            </div>
            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-gray-500">Caricamento...</p>
              ) : costDetails.length === 0 ? (
                <p className="text-sm text-gray-500">Nessun dato disponibile</p>
              ) : (
                costDetails.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <span className="text-sm text-gray-500">({Math.round(item.percentage)}%)</span>
                    </div>
                    <ProgressBar
                      value={item.amount}
                      maxValue={totalCosts || 1}
                      color="orange"
                      showPercentage={false}
                    />
                  </div>
                ))
              )}
            </div>
            <button className="mt-4 text-primary hover:text-primary-dark flex items-center space-x-1 text-sm font-medium">
              <span>Vedi tutte le voci di costo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Net Profit Trend Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Andamento Utile Netto</h2>
              <p className="text-sm text-gray-500 mt-1">Confronto ultimi 6 mesi</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Ricavi</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Costi</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    '',
                  ]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Ricavi"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="costs"
                  name="Costi"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: '#f97316', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Utile Netto"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  )
}
