import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@/lib/supabase-server'
import { createSupabaseAdmin } from '@/lib/supabase-admin'

/**
 * POST /api/users/create
 * Crea un nuovo utente con tutte le credenziali (solo admin).
 * Body: { email, password, name?, role? }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const currentUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    })

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Solo gli amministratori possono creare utenti' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, password, name, role } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password sono obbligatori' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utente con questa email esiste già' },
        { status: 400 }
      )
    }

    let supabaseAuthId: string

    try {
      const supabaseAdmin = createSupabaseAdmin()
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email.trim(),
        password,
        email_confirm: true,
        user_metadata: { full_name: name?.trim() || '' },
      })

      if (authError) {
        return NextResponse.json(
          { error: authError.message },
          { status: 400 }
        )
      }

      if (!authData.user) {
        return NextResponse.json(
          { error: 'Creazione utente Supabase fallita' },
          { status: 500 }
        )
      }

      supabaseAuthId = authData.user.id
    } catch (err: unknown) {
      const message = err instanceof Error && 'message' in err
        ? (err as Error).message
        : 'Configura SUPABASE_SERVICE_ROLE_KEY in .env.local per creare utenti.'
      return NextResponse.json(
        { error: message },
        { status: 500 }
      )
    }

    const newUser = await prisma.user.create({
      data: {
        email: email.trim(),
        name: name?.trim() || null,
        supabaseId: supabaseAuthId,
        role: role === 'admin' ? 'admin' : 'user',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        user: newUser,
        message: 'Utente creato. Salva le credenziali per consegnarle all\'utente.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Errore durante la creazione dell\'utente' },
      { status: 500 }
    )
  }
}
