# Netlify Environment Variables Setup

## Required Environment Variables

Go to Netlify Dashboard → Site Settings → Environment Variables and add the following:

### 1. Database Connection
**Variable Name:** `DATABASE_URL`
- Type: **Secret** ✅
- Scopes: All scopes
- Value: Your Neon PostgreSQL connection string

### 2. NextAuth Secret Key
**Variable Name:** `NEXTAUTH_SECRET`
- Type: **Secret** ✅
- Scopes: All scopes
- Value: Generate using `openssl rand -base64 32`

**Variable Name:** `AUTH_SECRET`
- Type: **Secret** ✅
- Scopes: All scopes
- Value: Same value as NEXTAUTH_SECRET

### 3. NextAuth URL
**Variable Name:** `NEXTAUTH_URL`
- Type: Regular (not secret)
- Scopes: All scopes
- Value: `https://your-actual-site-name.netlify.app`
  - Replace `your-actual-site-name` with your real Netlify site name

## Steps to Add Variables

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Navigate to: **Site configuration** → **Environment variables**
4. Click **Add a variable**
5. For each variable:
   - Enter the Key name
   - Select **All scopes**
   - Enter the Value
   - For DATABASE_URL, NEXTAUTH_SECRET, and AUTH_SECRET: Toggle **"Secret"** ON ✅
   - Click **Save**

## After Adding All Variables

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy project without cache**
3. Wait for deployment to complete (~1-2 minutes)
4. Test your `/admin` page

## Troubleshooting

If you still get `ERR_TOO_MANY_REDIRECTS`:
- Clear browser cookies
- Try in incognito/private browsing mode
- Check that all 4 environment variables are properly set
- Verify NEXTAUTH_URL matches your actual Netlify URL (without trailing slash)

## Security Notes

- Never commit actual secret values to Git
- Always use "Secret" type for sensitive data in Netlify
- Rotate secrets periodically for better security
