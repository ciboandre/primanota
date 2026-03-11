'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, Bell, User, Menu, X, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  // Chiudi il menu mobile quando cambia la route
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Chiudi il menu quando si clicca fuori (opzionale)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeof window !== 'undefined') {
        const target = event.target as HTMLElement
        if (mobileMenuOpen && !target.closest('header')) {
          setMobileMenuOpen(false)
        }
        if (userMenuOpen && !target.closest('.relative')) {
          setUserMenuOpen(false)
        }
      }
    }

    if (mobileMenuOpen || userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [mobileMenuOpen, userMenuOpen])

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/movimenti', label: 'Movimenti' },
    { href: '/conto-economico', label: 'Conto Economico' },
    { href: '/bilancio', label: 'Bilancio' },
    { href: '/impostazioni', label: 'Impostazioni' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo e Mobile Menu Button */}
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                  <span className="text-white font-bold text-lg">PN</span>
                </div>
                <span className="text-xl font-semibold text-gray-900 hidden sm:inline">Prima Nota</span>
              </div>
            </div>

            {/* Search Bar - Hidden on mobile, visible on tablet+ */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cerca voci..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && typeof window !== 'undefined') {
                      if (pathname === '/movimenti') {
                        sessionStorage.setItem('searchQuery', searchQuery)
                        window.dispatchEvent(new Event('searchUpdate'))
                      } else {
                        sessionStorage.setItem('searchQuery', searchQuery)
                        router.push('/movimenti')
                      }
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* User Section - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                    <div className="py-1">
                      <a
                        href="/impostazioni/profilo"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 inline mr-2" />
                        Il Mio Profilo
                      </a>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar - Visible when menu is closed */}
          {!mobileMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cerca voci..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && typeof window !== 'undefined') {
                      if (pathname === '/movimenti') {
                        sessionStorage.setItem('searchQuery', searchQuery)
                        window.dispatchEvent(new Event('searchUpdate'))
                      } else {
                        sessionStorage.setItem('searchQuery', searchQuery)
                        router.push('/movimenti')
                      }
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200">
              <nav className="px-2 pt-2 pb-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {children}
      </main>
    </div>
  )
}
