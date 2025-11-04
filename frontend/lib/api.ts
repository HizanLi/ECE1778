import { supabase } from './supabase'

export async function insert_new_area({
  user_email,
  location,
  message,
  user_name,
}: {
  user_email: string,
  location: any,
  message?: string,
  user_name?: string,
}) {
  // 获取 access_token
  const { data: { session } } = await supabase.auth.getSession()
  const accessToken = session?.access_token
  const URL = "https://sguujchuqsbempxbdjif.supabase.co/functions/v1/upsert-occupied-area"
  
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        user_email,
        location,
        message,
        user_name,
      }),
    })

    let data
    
    try {
      data = await res.json()
    } catch (e) {
      throw new Error('服务端返回的不是有效的 JSON')
    }
    
    if (!res.ok) {
      throw new Error(data?.error || "无法增加新的占用区域")
    }
    console.log('插入新占用区域结果:', data)

    return data.result

  } catch (err: any) {
    throw new Error(err.message || '网络请求失败')
  }
}

/**
 * 调用 Supabase Edge Function 更新用户名
 * @param user_id 用户UUID
 * @param user_email 新用户邮箱
 * @param user_name 新用户名
 * @returns Promise<any>
 * @throws Error
 */
export async function update_username_by_email({
  user_id,
  user_email,
  user_name,
}: {
  user_id : string,
  user_email: string,
  user_name: string,
}) {
  // 获取 access_token
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  const URL = "https://sguujchuqsbempxbdjif.supabase.co/functions/v1/update-username-by-email";
  
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        user_id,
        user_email,
        user_name,
      }),
    });

    let data;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error('服务端返回的不是有效的 JSON');
    }
    if (!res.ok) {
      throw new Error(data?.error || "无法更新用户名");
    }
    console.log('更新用户名结果:', data);
    return data.result ?? data; // 如果服务端有具体 result 字段可返回，否则返回 data
  } catch (err: any) {
    throw new Error(err.message || '网络请求失败');
  }
}