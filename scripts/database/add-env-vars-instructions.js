console.log(`
🚨 IMPORTANT: Netlify Environment Variables Missing!

The blog post has been successfully added to the Supabase database, but it's not showing on the website because the Netlify deployment is missing the required environment variables.

To fix this, you need to add these environment variables in Netlify:

1. Go to: https://app.netlify.com/sites/civil-society-grants-database/settings/env
2. Add these variables:

   SUPABASE_URL=https://adpddtbsstunjotxaldb.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM

3. After adding these variables, trigger a redeploy:
   - Go to the "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"

Once the environment variables are added and the site is redeployed, your blog post will be visible at:
https://civil-society-grants-database.netlify.app/blog/ukraine-civil-society-pulse-may-june-2025

The blog post includes all 7 infographics:
✅ Key Statistics Visualization
✅ Focus Areas Chart
✅ Timeline of Events
✅ Regional Impact Map
✅ International Support Graph
✅ Future Priorities Diagram
✅ Call to Action

Alternative: If you want to see the blog post immediately without waiting for deployment, you can run the site locally with:
cd client && netlify dev
`);
