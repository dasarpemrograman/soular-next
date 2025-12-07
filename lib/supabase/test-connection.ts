import { createClient as createBrowserClient } from './client'
import { createClient as createServerClient } from './server'

/**
 * Test Supabase connection (Client-side)
 * Run this in a browser console or React component
 */
export async function testBrowserConnection() {
  try {
    const supabase = createBrowserClient()

    // Test database connection with a simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Browser connection failed:', error.message)
      return false
    }

    console.log('✅ Browser Supabase connection successful!')
    console.log('Connection details:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })

    return true
  } catch (err) {
    console.error('❌ Browser connection error:', err)
    return false
  }
}

/**
 * Test Supabase connection (Server-side)
 * Run this in a Server Component or API Route
 */
export async function testServerConnection() {
  try {
    const supabase = await createServerClient()

    // Test database connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Server connection failed:', error.message)
      return false
    }

    console.log('✅ Server Supabase connection successful!')
    return true
  } catch (err) {
    console.error('❌ Server connection error:', err)
    return false
  }
}

/**
 * Quick connection test that works in any environment
 */
export async function quickTest() {
  const supabase = createBrowserClient()

  try {
    // Just test if we can create a client
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error && error.message !== 'Auth session missing!') {
      throw error
    }

    console.log('✅ Supabase client created successfully')
    console.log('Session exists:', !!session)

    return true
  } catch (err) {
    console.error('❌ Connection test failed:', err)
    return false
  }
}
