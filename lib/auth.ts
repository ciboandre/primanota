// Simple authentication utility
// In produzione, usa NextAuth.js o un sistema di autenticazione più robusto

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
}

// Mock user per sviluppo
export const mockUser: User = {
  id: '1',
  email: 'admin@primanota.it',
  name: 'Mario Rossi',
  role: 'admin',
}

export function getCurrentUser(): User | null {
  // In produzione, recupera l'utente dalla sessione
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : mockUser
  }
  return mockUser
}

export function setCurrentUser(user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user))
  }
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
  }
}
