import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}
    
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const transactions = await prisma.transaction.findMany({
      where,
    })

    const totalRevenue = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)

    const totalCosts = Math.abs(
      transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
    )

    const netProfit = totalRevenue - totalCosts
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // Dettaglio ricavi per categoria
    const revenueByCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        ...where,
        amount: {
          gt: 0,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const revenueDetails = await Promise.all(
      revenueByCategory.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
        })
        return {
          id: item.categoryId,
          name: category?.name || 'Sconosciuto',
          amount: item._sum.amount || 0,
          percentage: totalRevenue > 0 ? ((item._sum.amount || 0) / totalRevenue) * 100 : 0,
        }
      })
    )

    // Dettaglio costi per categoria
    const costsByCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        ...where,
        amount: {
          lt: 0,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const costDetails = await Promise.all(
      costsByCategory.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
        })
        return {
          id: item.categoryId,
          name: category?.name || 'Sconosciuto',
          amount: Math.abs(item._sum.amount || 0),
          percentage: totalCosts > 0 ? (Math.abs(item._sum.amount || 0) / totalCosts) * 100 : 0,
        }
      })
    )

    return NextResponse.json({
      totalRevenue,
      totalCosts,
      netProfit,
      profitMargin,
      revenueDetails,
      costDetails,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
