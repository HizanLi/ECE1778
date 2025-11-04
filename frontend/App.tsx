import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Main from './components/Main' // 你的主页面组件
import { View } from 'react-native'
import { Session } from '@supabase/supabase-js'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24, // 可选，让内容不顶边
    }}>
      {session && session.user
        ? <Main session={session} />
        : <Auth />
      }
    </View>
  )
}