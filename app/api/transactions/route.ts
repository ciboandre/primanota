import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const categoryId = searchParams.get('categoryId')
    const accountId = searchParams.get('accountId')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }
    
    if (categoryId) where.categoryId = categoryId
    if (accountId) where.accountId = accountId

    // Aggiungi ricerca per descrizione e dettagli (PostgreSQL supporta case-insensitive)
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
        { account: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(transactions)

  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, description, details, amount, categoryId, accountId, status } = body

    // Determina il tipo basandosi sul segno dell'amount
    const type = amount >= 0 ? 'entrata' : 'uscita'

    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(date),
        description,
        details,
        amount: parseFloat(amount),
        categoryId,
        accountId,
        status: status || 'Confermato',
        type,
      },
      include: {
        category: true,
        account: true,
      },
    })

    // Aggiorna il saldo del conto
    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: parseFloat(amount),
        },
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
