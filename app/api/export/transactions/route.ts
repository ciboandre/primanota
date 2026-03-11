import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { startDate, endDate, categoryId, accountId, format = 'csv' } = body

    const where: any = {}
    
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }
    
    if (categoryId) where.categoryId = categoryId
    if (accountId) where.accountId = accountId

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

    if (format === 'csv') {
      // Genera CSV
      const headers = ['Data', 'Descrizione', 'Dettagli', 'Categoria', 'Conto', 'Importo', 'Stato', 'Tipo']
      const rows = transactions.map(t => [
        new Date(t.date).toLocaleDateString('it-IT'),
        t.description,
        t.details || '',
        t.category.name,
        t.account.name,
        t.amount.toString().replace('.', ','),
        t.status,
        t.type,
      ])

      const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="movimenti_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } else {
      // Genera HTML per stampa/PDF
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Elenco Movimenti</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #FF6B35; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .positive { color: green; }
              .negative { color: red; }
              @media print {
                body { padding: 0; }
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>Elenco Movimenti</h1>
            <p>Periodo: ${startDate ? new Date(startDate).toLocaleDateString('it-IT') : 'Tutti'} - ${endDate ? new Date(endDate).toLocaleDateString('it-IT') : 'Oggi'}</p>
            <p>Totale movimenti: ${transactions.length}</p>
            
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrizione</th>
                  <th>Dettagli</th>
                  <th>Categoria</th>
                  <th>Conto</th>
                  <th>Importo</th>
                  <th>Stato</th>
                </tr>
              </thead>
              <tbody>
                ${transactions.map(t => `
                  <tr>
                    <td>${new Date(t.date).toLocaleDateString('it-IT')}</td>
                    <td>${t.description}</td>
                    <td>${t.details || ''}</td>
                    <td>${t.category.name}</td>
                    <td>${t.account.name}</td>
                    <td class="${t.amount > 0 ? 'positive' : 'negative'}">
                      ${t.amount > 0 ? '+' : ''}€ ${Math.abs(t.amount).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                    <td>${t.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div style="margin-top: 20px;">
              <p><strong>Totale Entrate:</strong> € ${transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
              <p><strong>Totale Uscite:</strong> € ${Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
              <p><strong>Saldo:</strong> € ${(transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0) - Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
            </div>
            
            <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #FF6B35; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Stampa / Salva come PDF
            </button>
          </body>
        </html>
      `

      return NextResponse.json({ html, success: true })
    }
  } catch (error) {
    console.error('Error exporting transactions:', error)
    return NextResponse.json(
      { error: 'Failed to export transactions' },
      { status: 500 }
    )
  }
}
