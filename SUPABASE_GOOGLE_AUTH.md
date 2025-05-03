# Configuring Google OAuth for Supabase

This guide will help you set up Google OAuth authentication for your Supabase project.

## Prerequisites

1. A Supabase project
2. A Google Cloud Platform account
3. Access to the Google Cloud Console

## Step 1: Create OAuth Credentials in Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" and select "OAuth client ID"
5. Select "Web application" as the application type
6. Add a name for your OAuth client
7. Add authorized JavaScript origins:
   - Add your Supabase project URL (e.g., `https://idxensypfzyaoisxhezs.supabase.co`)
   - Add your application URL (e.g., `https://kaienv.vercel.app`)
8. Add authorized redirect URIs:
   - Add `https://idxensypfzyaoisxhezs.supabase.co/auth/v1/callback`
   - Add any additional redirect URIs for your application
9. Click "Create"
10. Note the Client ID and Client Secret

## Step 2: Configure Google OAuth in Supabase

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Google" in the list of providers
4. Enable the Google provider
5. Enter the Client ID and Client Secret from Google Cloud Console
6. Save the changes

## Step 3: Configure Redirect URLs

1. In your Supabase project dashboard, go to "Authentication" > "URL Configuration"
2. Set the Site URL to your application's URL (e.g., `https://kaienv.vercel.app`)
3. Add any additional redirect URLs if needed
4. Save the changes

## Step 4: Test the Authentication

1. In your application, try to sign in with Google
2. You should be redirected to Google's authentication page
3. After authenticating, you should be redirected back to your application

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**: Ensure that the redirect URI in Google Cloud Console matches the one used by Supabase
2. **Missing Scopes**: Make sure you've requested the necessary scopes (email, profile)
3. **CORS Issues**: Check that your application's domain is added to the authorized JavaScript origins

### Debugging

1. Check the browser console for any errors
2. Look at the network requests to see if there are any issues with the authentication flow
3. Verify that the redirect URL in the authentication request matches one of the authorized redirect URIs

## Using the Debug Component

Our application includes a debug component that can help diagnose authentication issues:

1. Go to the login page
2. Click "Show Debug Info" at the bottom of the page
3. Check the environment variables and window location information
4. Look for any issues with the Supabase URL or redirect URL

## Fallback Authentication

If you're having trouble with Google OAuth, you can use the simulated Google login:

1. Try to sign in with Google
2. If there's an error, you'll see an option to "Use Simulated Google Login"
3. Click this button to use a simulated Google authentication flow

This is useful for development and testing purposes, but should be replaced with real Google authentication in production.
