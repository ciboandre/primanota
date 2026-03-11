import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        account: true,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { date, description, details, amount, categoryId, accountId, status } = body

    // Recupera la transazione esistente per calcolare la differenza
    const oldTransaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!oldTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    const type = amount >= 0 ? 'entrata' : 'uscita'
    const amountDiff = parseFloat(amount) - oldTransaction.amount

    // Aggiorna la transazione
    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        date: new Date(date),
        description,
        details,
        amount: parseFloat(amount),
        categoryId,
        accountId,
        status: status || oldTransaction.status,
        type,
      },
      include: {
        category: true,
        account: true,
      },
    })

    // Aggiorna i saldi dei conti se necessario
    if (oldTransaction.accountId !== accountId) {
      // Rimuovi l'importo dal vecchio conto
      await prisma.account.update({
        where: { id: oldTransaction.accountId },
        data: {
          balance: {
            decrement: oldTransaction.amount,
          },
        },
      })
      // Aggiungi l'importo al nuovo conto
      await prisma.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: parseFloat(amount),
          },
        },
      })
    } else {
      // Aggiorna solo il saldo del conto corrente
      await prisma.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: amountDiff,
          },
        },
      })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Rimuovi la transazione
    await prisma.transaction.delete({
      where: { id: params.id },
    })

    // Aggiorna il saldo del conto
    await prisma.account.update({
      where: { id: transaction.accountId },
      data: {
        balance: {
          decrement: transaction.amount,
        },
      },
    })

    return NextResponse.json({ message: 'Transaction deleted' })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
