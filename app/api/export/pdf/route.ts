import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { startDate, endDate, period } = body

    // Calcola le date in base al periodo
    const now = new Date()
    let start: Date
    let end: Date = now

    if (period === 'Mensile') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (period === 'Trimestrale') {
      const quarter = Math.floor(now.getMonth() / 3)
      start = new Date(now.getFullYear(), quarter * 3, 1)
    } else {
      start = new Date(now.getFullYear(), 0, 1)
    }

    if (startDate) start = new Date(startDate)
    if (endDate) end = new Date(endDate)

    // Recupera le statistiche
    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        category: true,
        account: true,
      },
      orderBy: {
        date: 'desc',
      },
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

    // Genera HTML per il PDF (in produzione usa una libreria come puppeteer o jsPDF)
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Conto Economico - ${period}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #FF6B35; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .positive { color: green; }
            .negative { color: red; }
          </style>
        </head>
        <body>
          <h1>Conto Economico - ${period}</h1>
          <p>Periodo: ${start.toLocaleDateString('it-IT')} - ${end.toLocaleDateString('it-IT')}</p>
          
          <h2>Riepilogo</h2>
          <table>
            <tr>
              <th>Voce</th>
              <th>Importo</th>
            </tr>
            <tr>
              <td>Totale Ricavi</td>
              <td class="positive">€ ${totalRevenue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td>Totale Costi</td>
              <td class="negative">€ ${totalCosts.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td>Utile Netto</td>
              <td class="positive">€ ${netProfit.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td>Margine di Profitto</td>
              <td>${profitMargin.toFixed(2)}%</td>
            </tr>
          </table>

          <h2>Dettaglio Transazioni</h2>
          <table>
            <tr>
              <th>Data</th>
              <th>Descrizione</th>
              <th>Categoria</th>
              <th>Conto</th>
              <th>Importo</th>
            </tr>
            ${transactions.map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleDateString('it-IT')}</td>
                <td>${t.description}</td>
                <td>${t.category.name}</td>
                <td>${t.account.name}</td>
                <td class="${t.amount > 0 ? 'positive' : 'negative'}">
                  ${t.amount > 0 ? '+' : ''}€ ${Math.abs(t.amount).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `

    return NextResponse.json({ html, success: true })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
