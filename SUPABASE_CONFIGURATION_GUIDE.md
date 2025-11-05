# Supabase Configuration Guide for Mobile App

## Issue: Magic Link Redirects to localhost:3000

When you click the magic link in your email, it redirects to `http://localhost:3000` instead of opening your mobile app. This happens because Supabase hasn't been configured to recognize your app's deep link scheme.

## Solution: Configure Redirect URLs in Supabase Dashboard

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `xmddlcgeelbcpzwebmwb`

### Step 2: Configure Authentication URLs
1. In the left sidebar, click on **Authentication**
2. Click on **URL Configuration**
3. Find the **Redirect URLs** section

### Step 3: Add Your App's Deep Link
Add the following URLs to the **Redirect URLs** list:

```
geoclaim://auth/callback
exp://192.168.2.20:8081/--/auth/callback
```

**Important:** 
- The first URL (`geoclaim://`) is for production builds
- The second URL (`exp://`) is for development with Expo Go
- Replace `192.168.2.20:8081` with your actual Expo dev server address if different

### Step 4: Configure Site URL (Optional but Recommended)
In the same URL Configuration section:
- Set **Site URL** to: `geoclaim://`

### Step 5: Save Changes
Click **Save** at the bottom of the page.

## Alternative: For Testing Only

If you can't access the Supabase dashboard right now, you can test with a workaround:

### Temporary Testing Solution
1. When you receive the magic link email, **don't click it directly**
2. Instead, copy the link
3. The link will look like: `http://localhost:3000/#access_token=...&refresh_token=...`
4. You can manually extract the tokens and use them (advanced - not recommended)

## Proper Deep Link Setup

For production, you should also:

1. **Update app.json** - Already configured with `"scheme": "geoclaim"`
2. **Test Deep Linking** - You can test if deep links work with:
   ```bash
   # For iOS
   xcrun simctl openurl booted geoclaim://auth/callback
   
   # For Android
   adb shell am start -W -a android.intent.action.VIEW -d "geoclaim://auth/callback"
   ```

## Email Template Configuration (Advanced)

You can also customize the email template in Supabase:
1. Go to **Authentication** > **Email Templates**
2. Edit the **Magic Link** template
3. Replace `{{ .SiteURL }}` with your app scheme if needed

## Verification

After configuring Supabase:
1. Request a new magic link from the app
2. Click the link in your email
3. It should now open your app instead of redirecting to localhost
4. The app should automatically authenticate you

## Troubleshooting

### Link still goes to localhost
- Clear your browser cache
- Make sure you saved the Supabase configuration
- Try requesting a new magic link (old links may still use old config)

### App doesn't open
- Verify your app scheme is correct in app.json
- Test deep linking manually (see commands above)
- Make sure the app is installed on your device

### Token expired error
- Magic links expire after a certain time (usually 1 hour)
- Request a new link if the old one expired
- Configure expiration time in Supabase dashboard if needed

## Next Steps After Configuration

Once Supabase is properly configured:
1. The magic link will open your app
2. The `AuthContext` will automatically handle the authentication
3. The user will be redirected to the appropriate screen
4. Session will be persisted using AsyncStorage
