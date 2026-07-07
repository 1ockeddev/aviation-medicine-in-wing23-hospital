# Netlify Environment Variables Setup

## Required Environment Variables

Go to Netlify Dashboard → Site Settings → Environment Variables and add:

### 1. Database
```
DATABASE_URL="postgresql://neondb_owner:npg_0fdQ8ngtXirV@ep-curly-resonance-atnsky0d-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### 2. NextAuth Secret
Generate a random secret:
```bash
openssl rand -base64 32
```

Then add to Netlify:
```
NEXTAUTH_SECRET="<your-generated-secret>"
AUTH_SECRET="<same-secret-as-above>"
```

### 3. NextAuth URL
```
NEXTAUTH_URL="https://your-site-name.netlify.app"
```

## After Adding Variables

1. Go to Netlify Dashboard
2. Navigate to: Deploys → Trigger deploy → Clear cache and deploy site
3. Wait for deployment to complete
4. Test the /admin page

## Important Notes

- `trustHost: true` is already configured in lib/auth.ts for Netlify
- Both NEXTAUTH_SECRET and AUTH_SECRET should have the same value
- Make sure to replace `your-site-name` with your actual Netlify site name
