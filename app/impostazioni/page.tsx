import Layout from '@/components/Layout'
import Link from 'next/link'
import { Settings, FolderTree, CreditCard, User, Users } from 'lucide-react'

export default function ImpostazioniPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Impostazioni</h1>
          <p className="text-gray-600 mt-2">
            Configurazione dell&apos;applicazione
          </p>
        </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/impostazioni/profilo">
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Il Mio Profilo</h3>
                      <p className="text-sm text-gray-500">Gestisci le informazioni del tuo account</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/impostazioni/categorie">
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FolderTree className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Categorie</h3>
                      <p className="text-sm text-gray-500">Gestisci le categorie delle transazioni</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/impostazioni/conti">
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Conti</h3>
                      <p className="text-sm text-gray-500">Gestisci i conti bancari e contanti</p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/impostazioni/utenti">
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Utenti</h3>
                      <p className="text-sm text-gray-500">Gestisci gli utenti del sistema (solo admin)</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
      </div>
    </Layout>
  )
}
