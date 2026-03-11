import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Statistiche mese corrente
    const currentMonthTransactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startOfMonth,
        },
      },
    })

    const currentMonthRevenue = currentMonthTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)

    const currentMonthCosts = Math.abs(
      currentMonthTransactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    )

    const currentMonthProfit = currentMonthRevenue - currentMonthCosts
    const currentMonthMargin =
      currentMonthRevenue > 0 ? (currentMonthProfit / currentMonthRevenue) * 100 : 0

    // Statistiche mese precedente
    const lastMonthTransactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    })

    const lastMonthRevenue = lastMonthTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)

    const lastMonthCosts = Math.abs(
      lastMonthTransactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    )

    const lastMonthProfit = lastMonthRevenue - lastMonthCosts

    // Calcola le variazioni percentuali
    const revenueChange =
      lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0

    const costChange =
      lastMonthCosts > 0
        ? ((currentMonthCosts - lastMonthCosts) / lastMonthCosts) * 100
        : 0

    const profitChange =
      lastMonthProfit !== 0
        ? ((currentMonthProfit - lastMonthProfit) / Math.abs(lastMonthProfit)) * 100
        : 0

    // Statistiche rapide
    const transactionsCount = currentMonthTransactions.length
    const categoriesCount = await prisma.category.count()
    const accountsCount = await prisma.account.count()
    const invoicesCount = currentMonthTransactions.filter(
      (t) => t.description.toLowerCase().includes('fattura') || t.description.toLowerCase().includes('invoice')
    ).length

    return NextResponse.json({
      totalRevenue: currentMonthRevenue,
      totalCosts: currentMonthCosts,
      netProfit: currentMonthProfit,
      profitMargin: currentMonthMargin,
      revenueChange,
      costChange,
      profitChange,
      quickStats: {
        transactionsCount,
        categoriesCount,
        accountsCount,
        invoicesCount,
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
