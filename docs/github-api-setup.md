# R Tests Gallery - GitHub API Authentication Setup

The r-tests-gallery pages use the GitHub API to fetch repository data. To avoid rate limits, you'll need to set up GitHub API authentication.

## Setting Up GitHub Token

### 1. Create a Personal Access Token

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name like "Astro Site API Access"
4. **No special scopes needed** - the default (no checkboxes) is sufficient for public repositories
5. Set expiration as needed (e.g., 90 days or no expiration)
6. Click "Generate token"
7. **Copy the token immediately** - you won't see it again!

### 2. Configure Environment Variables

#### For Local Development
1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Add your token to `.env`:
   ```
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

#### For Production/Deployment
Add the `GITHUB_TOKEN` environment variable to your hosting platform:

- **Vercel**: Dashboard → Project Settings → Environment Variables
- **Netlify**: Dashboard → Site Settings → Environment Variables
- **GitHub Pages**: Repository Settings → Secrets and Variables → Actions

### 3. Verify Setup

Run the build command:
```bash
npm run build
```

You should see the r-tests-gallery pages build successfully without rate limit errors.

## Rate Limits

- **Without token**: 60 requests per hour per IP
- **With token**: 5,000 requests per hour

## Security Notes

- The token only needs access to public repositories
- Never commit the `.env` file to version control
- The token is only used during build time, not exposed to users
- Consider using tokens with shorter expiration times for better security
