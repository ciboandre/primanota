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
      // Genera HTML per PDF (ottimizzato per stampa)
      const totalEntrate = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
      const totalUscite = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))
      const saldo = totalEntrate - totalUscite

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Elenco Movimenti - ${new Date().toLocaleDateString('it-IT')}</title>
            <style>
              @page {
                margin: 1cm;
                size: A4;
              }
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                margin: 0;
                color: #333;
              }
              h1 { 
                color: #FF6B35; 
                margin-bottom: 10px;
                font-size: 24px;
              }
              .header-info {
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #ddd;
              }
              .header-info p {
                margin: 5px 0;
                font-size: 12px;
                color: #666;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 20px 0; 
                font-size: 11px;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 6px; 
                text-align: left; 
              }
              th { 
                background-color: #f2f2f2; 
                font-weight: bold; 
                font-size: 10px;
              }
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              .positive { color: #059669; font-weight: bold; }
              .negative { color: #dc2626; font-weight: bold; }
              .summary {
                margin-top: 20px;
                padding: 15px;
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 5px;
              }
              .summary p {
                margin: 8px 0;
                font-size: 12px;
              }
              .summary strong {
                font-size: 13px;
              }
              @media print {
                body { padding: 0; margin: 0; }
                .no-print { display: none; }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
                thead { display: table-header-group; }
                tfoot { display: table-footer-group; }
              }
            </style>
          </head>
          <body>
            <h1>Elenco Movimenti</h1>
            <div class="header-info">
              <p><strong>Periodo:</strong> ${startDate ? new Date(startDate).toLocaleDateString('it-IT') : 'Tutti'} - ${endDate ? new Date(endDate).toLocaleDateString('it-IT') : 'Oggi'}</p>
              <p><strong>Totale movimenti:</strong> ${transactions.length}</p>
              <p><strong>Data esportazione:</strong> ${new Date().toLocaleDateString('it-IT')} ${new Date().toLocaleTimeString('it-IT')}</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrizione</th>
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
                    <td>${t.description}${t.details ? '<br><small style="color:#666;">' + t.details + '</small>' : ''}</td>
                    <td>${t.category.name}</td>
                    <td>${t.account.name}</td>
                    <td class="${t.amount > 0 ? 'positive' : 'negative'}">
                      ${t.amount > 0 ? '+' : ''}€ ${Math.abs(t.amount).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td>${t.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="summary">
              <p><strong>Totale Entrate:</strong> € ${totalEntrate.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p><strong>Totale Uscite:</strong> € ${totalUscite.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p><strong>Saldo:</strong> € ${saldo.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            
            <div class="no-print" style="margin-top: 20px; text-align: center;">
              <p style="font-size: 11px; color: #666;">
                Per salvare come PDF: File → Stampa → Salva come PDF (o Ctrl+P → Salva come PDF)
              </p>
            </div>
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
