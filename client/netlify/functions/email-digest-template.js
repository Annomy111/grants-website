// Email Digest Function Template
// This is a template/guide for implementing automated email digests
// To implement: 
// 1. Add email service credentials to environment variables
// 2. Create email_subscriptions table in Supabase
// 3. Install email service SDK (e.g., @sendgrid/mail or aws-sdk for SES)

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
  // This function can be triggered:
  // 1. Via scheduled Netlify function (requires Netlify Pro)
  // 2. Via external cron service (e.g., GitHub Actions, Zapier)
  // 3. Via admin dashboard button for manual sending

  try {
    // 1. Fetch active email subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('email_subscriptions')
      .select('*')
      .eq('is_active', true);

    if (subError) throw subError;

    // 2. Fetch grants data based on digest type
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // New grants this week
    const { data: newGrants } = await supabase
      .from('grants')
      .select('*')
      .gte('created_at', oneWeekAgo.toISOString())
      .order('created_at', { ascending: false });

    // Upcoming deadlines
    const { data: upcomingDeadlines } = await supabase
      .from('grants')
      .select('*')
      .gte('deadline', today.toISOString())
      .lte('deadline', thirtyDaysFromNow.toISOString())
      .order('deadline', { ascending: true })
      .limit(10);

    // 3. Process each subscription
    const emailPromises = subscriptions.map(async (subscription) => {
      // Filter grants based on user preferences
      let filteredNewGrants = newGrants;
      let filteredDeadlines = upcomingDeadlines;

      if (subscription.preferences?.geographic_focus) {
        filteredNewGrants = newGrants.filter(g => 
          g.geographic_focus === subscription.preferences.geographic_focus
        );
        filteredDeadlines = upcomingDeadlines.filter(g => 
          g.geographic_focus === subscription.preferences.geographic_focus
        );
      }

      // 4. Generate email content
      const emailContent = generateEmailContent({
        recipientName: subscription.name,
        newGrants: filteredNewGrants,
        upcomingDeadlines: filteredDeadlines,
        frequency: subscription.frequency
      });

      // 5. Send email (example with SendGrid)
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      // const msg = {
      //   to: subscription.email,
      //   from: 'noreply@civilsocietygrants.com',
      //   subject: emailContent.subject,
      //   html: emailContent.html,
      // };
      
      // await sgMail.send(msg);

      // 6. Log email sent
      await supabase
        .from('email_digest_logs')
        .insert({
          subscription_id: subscription.id,
          sent_at: new Date().toISOString(),
          grants_included: filteredNewGrants.length + filteredDeadlines.length
        });
    });

    await Promise.all(emailPromises);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        emailsSent: subscriptions.length
      })
    };

  } catch (error) {
    console.error('Email digest error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

function generateEmailContent({ recipientName, newGrants, upcomingDeadlines, frequency }) {
  const totalFunding = newGrants.reduce((sum, grant) => 
    sum + (grant.grant_size_max || 0), 0
  );

  const subject = `Your ${frequency} Grants Digest - ${newGrants.length} New Opportunities`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .section { margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .grant-item { margin: 15px 0; padding: 15px; background: white; border-radius: 4px; }
        .deadline { color: #dc2626; font-weight: bold; }
        .amount { color: #059669; font-weight: bold; }
        .button { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Civil Society Grants Database</h1>
          <p>Your ${frequency} Grant Opportunities Digest</p>
        </div>
        
        <p>Hello ${recipientName},</p>
        
        <div class="section">
          <h2>📊 This Week's Summary</h2>
          <ul>
            <li><strong>${newGrants.length}</strong> new grants added</li>
            <li><strong>€${totalFunding.toLocaleString()}</strong> in total funding available</li>
            <li><strong>${upcomingDeadlines.length}</strong> deadlines approaching</li>
          </ul>
        </div>

        ${newGrants.length > 0 ? `
          <div class="section">
            <h2>🆕 New Grant Opportunities</h2>
            ${newGrants.slice(0, 5).map(grant => `
              <div class="grant-item">
                <h3>${grant.name}</h3>
                <p><strong>Organization:</strong> ${grant.organization}</p>
                <p><strong>Amount:</strong> <span class="amount">€${grant.grant_size_min?.toLocaleString() || '0'} - €${grant.grant_size_max?.toLocaleString() || '0'}</span></p>
                <p><strong>Focus:</strong> ${grant.focus_areas_en}</p>
                <a href="https://yourdomain.com/grants/${encodeURIComponent(grant.name)}" class="button">View Details</a>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${upcomingDeadlines.length > 0 ? `
          <div class="section">
            <h2>⏰ Upcoming Deadlines</h2>
            ${upcomingDeadlines.slice(0, 5).map(grant => `
              <div class="grant-item">
                <h3>${grant.name}</h3>
                <p><strong>Deadline:</strong> <span class="deadline">${new Date(grant.deadline).toLocaleDateString()}</span></p>
                <p><strong>Organization:</strong> ${grant.organization}</p>
                <a href="https://yourdomain.com/grants/${encodeURIComponent(grant.name)}" class="button">Apply Now</a>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div style="text-align: center; margin-top: 30px;">
          <a href="https://yourdomain.com/grants" class="button">Browse All Grants</a>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        
        <p style="text-align: center; color: #666; font-size: 14px;">
          You're receiving this because you subscribed to grant updates.<br>
          <a href="https://yourdomain.com/unsubscribe?token=${recipientName}">Unsubscribe</a> | 
          <a href="https://yourdomain.com/preferences?token=${recipientName}">Update Preferences</a>
        </p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

/* SQL Schema for email subscriptions table:

CREATE TABLE email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  frequency VARCHAR(50) DEFAULT 'weekly', -- weekly, daily, monthly
  preferences JSONB DEFAULT '{}', -- { geographic_focus, grant_types, min_amount, etc }
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE email_digest_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES email_subscriptions(id),
  sent_at TIMESTAMP DEFAULT NOW(),
  grants_included INTEGER,
  status VARCHAR(50) DEFAULT 'sent'
);

*/