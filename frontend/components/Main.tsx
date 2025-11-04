import { View, Text, Button, Alert } from 'react-native'
import { supabase } from '../lib/supabase'
import { insert_new_area } from '../lib/api'  // 导入上面的函数
import { Session } from '@supabase/supabase-js'

export default function Main({ session }: { session: Session }) {
  // 示例数据，你可以更换成页面输入的数据
  const user_email = "test1@example.com"
  const location = {
        "type": "Polygon",
        "coordinates": [
            [ [116.390, 39.920], [116.395, 39.920], [116.395, 39.925], [116.390, 39.925], [116.390, 39.920] ]
        ]
    }
  const message = "Hello"
  const user_name = "张三"

  const handleInsertArea = async () => {
    try {
      const result = await insert_new_area({ user_email, location, message, user_name })
      Alert.alert('结果', String(result))
    } catch (err: any) {
      console.error('插入区域时报错:', err)
      Alert.alert('错误', err.message || String(err))
    }
  }

  return (
    <View style={{ alignItems: 'center' }}>
      <Text>Welcome! Your user id: {session.user.id}</Text>
      <Button title="Logout" onPress={() => supabase.auth.signOut()} />
      <View style={{ marginTop: 20 }}>
        <Button title="插入新占用区域" onPress={handleInsertArea} />
      </View>
    </View>
  )
}