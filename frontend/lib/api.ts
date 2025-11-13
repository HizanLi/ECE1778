import { supabase } from './supabase'

/**
 * 调用 Supabase Edge Function 插入新的占用区域
 * @param user_id 用户UUID
 * @param user_email 用户邮箱
 * @param location 占用区域位置数据
 * @param message 可选的备注信息
 * @returns Promise<any>
 * @throws Error
 */ 

/** Sample Request Body:
  {
      "user_id" : "09c73675-7e12-41f4-ab69-92016727306c",
      "user_email": "l2542293790@gmail.com",
      "location": {
          "type": "Polygon",
          "coordinates": [
              [ [116.390, 39.920], [116.395, 39.920], [116.395, 39.925], [116.390, 39.925], [116.390, 39.920] ]
          ]
      },
      "message": "测试A区"
  }
*/

/** Sample Response Body:   
  {
  "result": {
    "deleted_user_emails": [
      "l2542293790@gmail.com"
    ],
    "intersected_user_emails": []
  }
}
*/
export async function insert_new_area({
  user_id, 
  user_email,
  location,
  message,
}: {
  user_id: string,
  user_email: string,
  location: any,
  message?: string,
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
        user_id,
        user_email,
        location,
        message,
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
 * @param user_name 新用户名
 * @returns Promise<any>
 * @throws Error
 */

/** Sample Request Body:
{ 
  "user_id": "09c73675-7e12-41f4-ab69-92016727306c", 
  "user_name": "HHizan"
}
*/

/** Sample Response Body:   
  {
    "data": [
      {
        "user_id": "09c73675-7e12-41f4-ab69-92016727306c",
        "user_email": "l2542293790@gmail.com",
        "user_name": "HHizan",
        "total_area": 237306.46869421
      }
    ]
  }
*/
export async function update_username_by_user_id({
  user_id,
  user_name,
}: {
  user_id : string,
  user_name: string,
}) {
  // 获取 access_token
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  const URL = "https://sguujchuqsbempxbdjif.supabase.co/functions/v1/update-username";
  
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({
        user_id,
        user_name,
      }),
    });

    let data;
    console.log(data);
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

/** Sample Request Body:
  {
    "user_id": "09c73675-7e12-41f4-ab69-92016727306c"
  }
*/

/** Sample Response Body:   
  {
    "data": {
      "user_id": "09c73675-7e12-41f4-ab69-92016727306c",
      "user_email": "l2542293790@gmail.com",
      "user_name": "HHizan",
      "total_area": 237306.46869421
    }
  }
*/
export async function fetchUserinfoUserId({
  user_id,
}: {
  user_id : string,
}) {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token
  const response = await fetch('https://sguujchuqsbempxbdjif.supabase.co/functions/v1/fetch-username', {
    method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ user_id })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Server error');
  // success
  return data;
}

/** Sample Request Body:
  No request body required, this is a GET request.
*/

/** Sample Response Body:   
{
  "data": [
    {
      "user_id": "09c73675-7e12-41f4-ab69-92016727306c",
      "user_email": "l2542293790@gmail.com",
      "message": "测试A区",
      "location": {
        "type": "Polygon",
        "crs": {
          "type": "name",
          "properties": {
            "name": "EPSG:4326"
          }
        },
        "coordinates": [
          [
            [
              116.39,
              39.92
            ],
            [
              116.395,
              39.92
            ],
            [
              116.395,
              39.925
            ],
            [
              116.39,
              39.925
            ],
            [
              116.39,
              39.92
            ]
          ]
        ]
      },
      "status": "New",
      "user_name": "sample 1",
      "total_area": 237306.46869421
    }
  ]
}
*/
export async function fetchOccupiedAreas() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token
    const res = await fetch('https://sguujchuqsbempxbdjif.supabase.co/functions/v1/occupied_area_list', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

    if (!res.ok) {
      // Parse and throw error message from body if available
      const body = await res.json().catch(() => null);
      throw new Error(body?.error || `API error, status ${res.status}`);
    }

    const json = await res.json();
    // json.data contains the database records
    return json.data;
  } catch (err) {
    // You might want to handle this differently elsewhere
    console.error('Error fetching uncovered areas:', err);
    throw err;
  }
}


/** Sample Request Body:
  No request body required, this is a GET request.
*/

/** Sample Response Body:   

*/
export async function getLeaderboards() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token
    const res = await fetch('https://sguujchuqsbempxbdjif.supabase.co/functions/v1/top_users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      throw new Error(errorBody?.error || `Request failed with status ${res.status}`);
    }

    const data = await res.json();
    // data should be an array of { user_name, total_area }
    return data as { user_name: string; total_area: number }[];
  } catch (error) {
    try {
      console.error(
        error instanceof Error
          ? error.message
          : JSON.stringify(error, null, 2)
      );
    } catch (logError) {
      // Fallback in case even this fails
      console.error('Could not log error');
    }
    throw error;
  }
}