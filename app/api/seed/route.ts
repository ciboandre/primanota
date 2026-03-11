import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Pulisci il database
    await prisma.transaction.deleteMany()
    await prisma.category.deleteMany()
    await prisma.account.deleteMany()

    // Crea categorie
    const categories = await Promise.all([
      prisma.category.create({
        data: { name: 'Vendite', type: 'entrata', color: 'green' },
      }),
      prisma.category.create({
        data: { name: 'Consulenza', type: 'entrata', color: 'emerald' },
      }),
      prisma.category.create({
        data: { name: 'Licenze Software', type: 'entrata', color: 'blue' },
      }),
      prisma.category.create({
        data: { name: 'Personale', type: 'uscita', color: 'gray' },
      }),
      prisma.category.create({
        data: { name: 'Immobili', type: 'uscita', color: 'red' },
      }),
      prisma.category.create({
        data: { name: 'Tecnologia', type: 'uscita', color: 'blue' },
      }),
      prisma.category.create({
        data: { name: 'Marketing', type: 'uscita', color: 'purple' },
      }),
      prisma.category.create({
        data: { name: 'Oneri Diversi', type: 'uscita', color: 'orange' },
      }),
    ])

    // Crea conti
    const accounts = await Promise.all([
      prisma.account.create({
        data: { name: 'Intesa Business', type: 'bancario' },
      }),
      prisma.account.create({
        data: { name: 'Revolut Business', type: 'bancario' },
      }),
      prisma.account.create({
        data: { name: 'Cassa Contanti', type: 'contanti' },
      }),
    ])

    // Crea transazioni di esempio
    const transactions = [
      {
        date: new Date('2023-10-12'),
        description: 'Fattura n. 45 - Progetto Web',
        details: 'Cliente: Acme Corp',
        amount: 2400,
        categoryId: categories[0].id,
        accountId: accounts[0].id,
        status: 'Confermato',
      },
      {
        date: new Date('2023-10-11'),
        description: 'Affitto Sede Centrale',
        details: 'Canone mensile Ottobre',
        amount: -1200,
        categoryId: categories[4].id,
        accountId: accounts[1].id,
        status: 'Confermato',
      },
      {
        date: new Date('2023-10-10'),
        description: 'Pagamento AWS - Hosting',
        details: 'ID: 2394023-AMZ',
        amount: -156.4,
        categoryId: categories[5].id,
        accountId: accounts[1].id,
        status: 'In sospeso',
      },
      {
        date: new Date('2023-10-09'),
        description: 'Rimborso Spese Trasferta',
        details: 'Nota spese: G. Bianchi',
        amount: -45,
        categoryId: categories[3].id,
        accountId: accounts[2].id,
        status: 'Confermato',
      },
      {
        date: new Date('2023-10-08'),
        description: 'Incasso Consulenza Strategy',
        details: 'Cliente: Global Ltd',
        amount: 5000,
        categoryId: categories[1].id,
        accountId: accounts[0].id,
        status: 'Confermato',
      },
    ]

    for (const transaction of transactions) {
      await prisma.transaction.create({
        data: {
          ...transaction,
          type: transaction.amount >= 0 ? 'entrata' : 'uscita',
        },
      })

      // Aggiorna il saldo del conto
      await prisma.account.update({
        where: { id: transaction.accountId },
        data: {
          balance: {
            increment: transaction.amount,
          },
        },
      })
    }

    return NextResponse.json({ message: 'Database seeded successfully' })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}
