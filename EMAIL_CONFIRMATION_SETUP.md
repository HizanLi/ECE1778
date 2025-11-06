# Email Confirmation Setup Guide

## Issue Fixed in Code
Added the missing `emailRedirectTo` option to the `signUpWithEmail` function in `AuthContext.tsx`.

## Supabase Dashboard Settings to Check

### 1. Enable Email Confirmations
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/sguujchuqsbempxbdjif
2. Navigate to **Authentication** → **Providers** → **Email**
3. Check these settings:
   - ✅ **Enable email provider** should be ON
   - ✅ **Confirm email** should be **ENABLED** (this is likely your issue if it's disabled)
   - **Secure email change** - recommended to enable
   - **Enable sign ups** - should be enabled

### 2. Email Templates Configuration
1. Go to **Authentication** → **Email Templates**
2. Configure the **Confirm signup** template:
   - Verify the template contains the `{{ .ConfirmationURL }}` variable
   - The default template should work, but you can customize it
   - Make sure it's enabled

### 3. SMTP Settings (If Using Custom Email)
If you want to use a custom email provider instead of Supabase's default:
1. Go to **Project Settings** → **Authentication**
2. Scroll to **SMTP Settings**
3. Configure your SMTP provider (Gmail, SendGrid, etc.)

**Note:** For development/testing, Supabase's default email service should work fine.

### 4. Check Email Rate Limits
During development, Supabase may have rate limits on emails:
- Check **Authentication** → **Rate Limits**
- Default is usually 3-4 emails per hour per email address
- If you're testing frequently, you might hit this limit

## Testing Steps

1. **Clear previous attempts:**
   - Go to **Authentication** → **Users**
   - Delete any test users you created
   
2. **Try signing up again:**
   - Use a fresh email address
   - Wait a few minutes for the email to arrive
   - Check your spam/junk folder

3. **Check email logs:**
   - Some Supabase plans show email delivery logs
   - Go to **Authentication** → look for email logs or delivery status

## Troubleshooting

### Email Not Received?
1. ✅ Check spam/junk folder
2. ✅ Verify "Confirm email" is enabled in Supabase
3. ✅ Check you haven't exceeded rate limits
4. ✅ Try a different email address
5. ✅ Wait 5-10 minutes (sometimes there's a delay)

### Email Received but Link Doesn't Work?
1. Make sure the redirect URL is configured correctly in Supabase
2. Go to **Authentication** → **URL Configuration**
3. Add `geoclaim://auth/callback` to the **Redirect URLs** list

### Development Mode Settings
For development/testing, you can temporarily:
1. **Disable email confirmation** in Supabase (not recommended for production)
   - This allows users to sign up without verifying email
   - Go to **Authentication** → **Providers** → **Email**
   - Set **Confirm email** to **DISABLED**
2. After testing, re-enable it for production

## Quick Fix for Testing
If you need to test immediately and emails aren't working:
1. Go to Supabase Dashboard → **Authentication** → **Providers** → **Email**
2. Temporarily disable **Confirm email**
3. Sign up with your app
4. User will be created immediately without email verification
5. Re-enable **Confirm email** when you're ready for production

## Production Checklist
Before deploying:
- [ ] Email confirmation is **ENABLED**
- [ ] Email templates are configured and tested
- [ ] Redirect URLs are properly configured
- [ ] SMTP is set up (if using custom email provider)
- [ ] Test the full signup flow with a real email
- [ ] Verify emails aren't going to spam
