import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerClient } from '@/lib/supabase-server'

// Endpoint per creare l'utente admin iniziale
// Chiama: POST /api/users/create-admin
export async function POST() {
  try {
    const email = 'admin@primanota.it'
    const password = '!Buui8492'
    const name = 'Administrator'

    // Crea l'utente in Supabase Auth
    const supabase = await createServerClient()
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
      // Se l'utente esiste già o c'è un rate limit, prova a fare login
      if (
        authError.message.includes('already registered') ||
        authError.message.includes('rate limit') ||
        authError.message.includes('Email rate limit')
      ) {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (loginError) {
          // Se anche il login fallisce, verifica se esiste nel database
          const existingUserByEmail = await prisma.user.findUnique({
            where: { email },
          })

          if (existingUserByEmail) {
            // Aggiorna a admin se non lo è già
            if (existingUserByEmail.role !== 'admin') {
              await prisma.user.update({
                where: { id: existingUserByEmail.id },
                data: { role: 'admin' },
              })
            }
            return NextResponse.json({
              message: 'Admin user already exists in database and has been updated',
              user: existingUserByEmail,
              note: 'User exists but Supabase Auth may have issues. You may need to login manually or reset password.',
            })
          }

          return NextResponse.json(
            { 
              error: 'Could not create or login user',
              details: loginError.message,
              suggestion: 'Try creating the user manually via /auth/register or disable email confirmation in Supabase settings'
            },
            { status: 400 }
          )
        }

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
        { 
          error: authError.message,
          suggestion: 'If this is a rate limit error, wait a few minutes or disable email confirmation in Supabase Dashboard → Authentication → Settings'
        },
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
