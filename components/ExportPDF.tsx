'use client'

import { useState } from 'react'
import { Download, Loader } from 'lucide-react'

interface ExportPDFProps {
  period: string
  startDate?: string
  endDate?: string
}

export default function ExportPDF({ period, startDate, endDate }: ExportPDFProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period,
          startDate,
          endDate,
        }),
      })

      const data = await res.json()

      if (data.success) {
        // Crea una nuova finestra con l'HTML e stampa
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(data.html)
          printWindow.document.close()
          printWindow.onload = () => {
            printWindow.print()
          }
        }
      } else {
        alert('Errore nella generazione del PDF')
      }
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Errore nella generazione del PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center space-x-2 disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          <span>Generazione...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span>Esporta PDF</span>
        </>
      )}
    </button>
  )
}
