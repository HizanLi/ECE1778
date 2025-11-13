import { View, Text, Button, Alert } from 'react-native'
import { supabase } from '../lib/supabase'
import {
  insert_new_area,
  update_username_by_user_id,
  fetchUserinfoUserId,
  fetchOccupiedAreas,
  getLeaderboards
} from '../lib/api';
import { Session } from '@supabase/supabase-js'
import { use } from 'react';

export default function Main({ session }: { session: Session }) {
  // 示例数据，你可以更换成页面输入的数据


  const user_id = session.user.id;                     // 当前登录用户id
  const user_email = session.user.email!;              // 当前登录用户email

  console.log(user_id, user_email);

  const handleInsertArea = async () => {
    try {
      const result = await insert_new_area({
      "user_id" : "09c73675-7e12-41f4-ab69-92016727306c",
      "user_email": "l2542293790@gmail.com",
      "location": {
          "type": "Polygon",
          "coordinates": [
              [ [116.390, 39.920], [116.395, 39.920], [116.395, 39.925], [116.390, 39.925], [116.390, 39.920] ]
          ]
      },
      "message": "测试A区"
    })
      Alert.alert('结果', String(result))
    } catch (err: any) {
      console.error('插入区域时报错:', err)
      Alert.alert('错误', err.message || String(err))
    }
  }

  const handleUpdateUsername = async () => {
    try {
      const result = await update_username_by_user_id({ 
        "user_id": "09c73675-7e12-41f4-ab69-92016727306c", 
        "user_name": "HHizan"
      });
      Alert.alert('修改用户名结果', JSON.stringify(result));
      console.log('update_username_by_user_id result:', result);
    } catch (err: any) {
      Alert.alert('错误', err.message || String(err));
    }
  };

  const getUserinfo = async () => {
    try {
      const result = await fetchUserinfoUserId({ 
        "user_id": "09c73675-7e12-41f4-ab69-92016727306c"
      });
      Alert.alert('用户信息', JSON.stringify(result));
      console.log('fetchUserinfoUserId result:', result);
    } catch (err: any) {
      Alert.alert('错误', err.message || String(err));
    }
  };

  const getAreas = async () => {
    try {
      const result = await fetchOccupiedAreas();
      Alert.alert('区域列表', JSON.stringify(result));
      console.log('fetchOccupiedAreas result:', result);
    } catch (err: any) {
      Alert.alert('错误', err.message || String(err));
    }
  };



  const getLeaderboards = async () => {
    try {
      const result = await getLeaderboards();
      Alert.alert('Top Users', JSON.stringify(result));
      console.log('getLeaderboards result:', result);
    } catch (err: any) {
      Alert.alert('错误', err.message || String(err));
    }
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <Text>Welcome! Your user id: {session.user.id}</Text>
      <Button title="Logout" onPress={() => supabase.auth.signOut()} />
      <View style={{ marginTop: 20 }}>
        <Button title="插入区域" onPress={handleInsertArea} />
        <Button title="更新用户名" onPress={handleUpdateUsername} />
        <Button title="获取用户信息" onPress={getUserinfo} />
        <Button title="获取区域" onPress={getAreas} />
        <Button title="排行榜" onPress={getLeaderboards} />
      </View>
    </View>
  )
}