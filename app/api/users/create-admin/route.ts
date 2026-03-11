import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-client'

// Endpoint per creare l'utente admin iniziale
// Chiama: POST /api/users/create-admin
export async function POST() {
  try {
    const email = 'admin@primanota.it'
    const password = '!Buui8492'
    const name = 'Administrator'

    // Crea l'utente in Supabase Auth
    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (authError) {
      // Se l'utente esiste già, prova a fare login per ottenere l'ID
      if (authError.message.includes('already registered')) {
        const { data: loginData } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (loginData?.user) {
          // Verifica se esiste già nel database
          const existingUser = await prisma.user.findUnique({
            where: { supabaseId: loginData.user.id },
          })

          if (existingUser) {
            // Aggiorna a admin se non lo è già
            if (existingUser.role !== 'admin') {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { role: 'admin' },
              })
            }
            return NextResponse.json({
              message: 'Admin user already exists and has been updated',
              user: existingUser,
            })
          }

          // Crea il record nel database
          const user = await prisma.user.create({
            data: {
              email,
              name,
              supabaseId: loginData.user.id,
              role: 'admin',
            },
          })
          return NextResponse.json({ message: 'Admin user created', user })
        }
      }
      
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Crea il record nel database
    const user = await prisma.user.create({
      data: {
        email,
        name,
        supabaseId: authData.user.id,
        role: 'admin',
      },
    })

    return NextResponse.json({
      message: 'Admin user created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.error('Error creating admin user:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create admin user' },
      { status: 500 }
    )
  }
}
