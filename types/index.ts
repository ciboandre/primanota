export interface Transaction {
  id: string
  date: Date
  description: string
  details?: string
  category: string
  account: string
  amount: number
  status: 'Confermato' | 'In sospeso' | 'Annullato'
  type: 'entrata' | 'uscita'
}

export interface RevenueItem {
  id: string
  name: string
  amount: number
  percentage: number
}

export interface CostItem {
  id: string
  name: string
  amount: number
  percentage: number
}

export interface FinancialMetrics {
  totalRevenue: number
  totalCosts: number
  netProfit: number
  revenueChange: number
  costChange: number
  profitChange: number
  profitMargin: number
}

export interface MonthlyData {
  month: string
  revenue: number
  costs: number
  profit: number
}

export type PeriodType = 'Mensile' | 'Trimestrale' | 'Annuale'
