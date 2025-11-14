import { supabase } from './supabase';

/**
 * Insert/update a new occupied area
 * The backend will handle intersections and deletions automatically
 */
export async function insertOccupiedArea({
  user_id,
  user_email,
  location,
  message,
}: {
  user_id: string;
  user_email: string;
  location: any; // GeoJSON Polygon
  message?: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  const URL = "https://sguujchuqsbempxbdjif.supabase.co/functions/v1/upsert-occupied-area";
  
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
    });

    let data;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error('Invalid JSON response from server');
    }
    
    if (!res.ok) {
      throw new Error(data?.error || "Failed to insert occupied area");
    }

    return data.result;
  } catch (err: any) {
    throw new Error(err.message || 'Network request failed');
  }
}

/**
 * Update username
 */
export async function updateUsername({
  user_id,
  user_name,
}: {
  user_id: string;
  user_name: string;
}) {
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
    try {
      data = await res.json();
    } catch (e) {
      throw new Error('Invalid JSON response from server');
    }
    
    if (!res.ok) {
      throw new Error(data?.error || "Failed to update username");
    }

    return data.result ?? data;
  } catch (err: any) {
    throw new Error(err.message || 'Network request failed');
  }
}

/**
 * Fetch user info by user_id
 */
export async function fetchUserInfo({
  user_id,
}: {
  user_id: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  
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
  
  return data.data;
}

/**
 * Fetch all occupied areas
 */
export async function fetchOccupiedAreas() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    
    const res = await fetch('https://sguujchuqsbempxbdjif.supabase.co/functions/v1/occupied_area_list', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error || `API error, status ${res.status}`);
    }

    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Error fetching occupied areas:', err);
    throw err;
  }
}

/**
 * Get leaderboard (top users by total area)
 */
export async function getLeaderboard() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    
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
    return data as { user_name: string; total_area: number }[];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
}
