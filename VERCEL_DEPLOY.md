# Deploying to Vercel

This document provides instructions for deploying this application to Vercel.

## Prerequisites

- A Vercel account
- Your Supabase credentials (URL and anonymous key)

## Deployment Steps

### 1. Create a New Project in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **IMPORTANT**: Select the `main` branch, NOT the `gh-pages` branch

### 2. Configure Project Settings

Configure the following settings:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Root Directory**: `./` (default)

### 3. Add Environment Variables

Add the following environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

**Important**: These must be added directly in the Vercel dashboard:

1. Go to your project in the Vercel dashboard
2. Click on "Settings" > "Environment Variables"
3. Add each variable with its corresponding value
4. Make sure to select all environments (Production, Preview, Development)
5. Click "Save" after adding each variable

### 4. Deploy

Click "Deploy" to start the deployment process.

## Troubleshooting

### Missing package.json Error

If you see an error like:

```
npm error code ENOENT
npm error syscall open
npm error path /vercel/path0/package.json
```

It means Vercel is trying to deploy from the wrong branch. Make sure you're deploying from the `main` branch, not the `gh-pages` branch.

### Schema Validation or Environment Variables Errors

If you see errors like:

```
Environment Variable "VITE_SUPABASE_URL" references Secret "vite_supabase_url", which does not exist.
```

or

```
The `vercel.json` schema validation failed with the following message: should NOT have additional property `buildEnv`
```

It means you need to add the environment variables directly in the Vercel dashboard:

1. Go to your project in the Vercel dashboard
2. Click on "Settings" > "Environment Variables"
3. Add each variable with its corresponding value:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
4. Make sure to select all environments (Production, Preview, Development)
5. Click "Save" after adding each variable
6. Redeploy your project

### Manual Deployment

If you're still having issues, you can deploy manually using the Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from the main branch
git checkout main
vercel --prod
```

## Branch Configuration

The `vercel.json` file in this repository is configured to:

- Enable deployments from the `main` branch
- Disable deployments from the `gh-pages` branch

If you need to modify this configuration, update the `git.deploymentEnabled` section in `vercel.json`.
