IMPORTANT VERCEL DEPLOYMENT INSTRUCTIONS

This project should be deployed from the 'main' branch, not the 'gh-pages' branch.

When setting up the project in Vercel:

1. Connect to your GitHub repository
2. Select the 'main' branch for production deployments
3. Configure the following settings:
   - Framework Preset: Vite
   - Build Command: npm run build
   - Output Directory: dist
   - Install Command: npm install

4. Add the following environment variables:
   - VITE_SUPABASE_URL: Your Supabase project URL
   - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key

5. Disable automatic deployments from the 'gh-pages' branch

If you're seeing deployment errors related to missing package.json, it's likely
because Vercel is trying to deploy from the 'gh-pages' branch instead of 'main'.
