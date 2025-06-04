# Serverless Database Solutions for Civil Society Grants

## 🎯 **Recommended Serverless Database Options**

### **Option 1: PlanetScale (MySQL-compatible)**
```javascript
// Install: npm install @planetscale/database
import { connect } from '@planetscale/database'

const config = {
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
}

const conn = connect(config)
const results = await conn.execute('SELECT * FROM grants WHERE country_region = ?', [country])
```

**Pros:**
- ✅ True serverless (pay per query)
- ✅ MySQL-compatible 
- ✅ Built-in branching for development
- ✅ Auto-scaling
- ✅ Generous free tier

### **Option 2: Supabase (PostgreSQL)**
```javascript
// Install: npm install @supabase/supabase-js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const { data, error } = await supabase
  .from('grants')
  .select('*')
  .eq('country_region', country)
```

**Pros:**
- ✅ PostgreSQL with real-time features
- ✅ Built-in auth and storage
- ✅ GraphQL API auto-generated
- ✅ Good free tier

### **Option 3: Turso (LibSQL - SQLite-compatible)**
```javascript
// Install: npm install @libsql/client
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const result = await client.execute({
  sql: "SELECT * FROM grants WHERE country_region = ?",
  args: [country]
});
```

**Pros:**
- ✅ SQLite-compatible syntax
- ✅ Serverless-first design
- ✅ Edge replication
- ✅ Your existing SQLite schema works!

### **Option 4: Neon (PostgreSQL)**
```javascript
// Install: npm install @neondatabase/serverless
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const grants = await sql('SELECT * FROM grants WHERE country_region = $1', [country]);
```

**Pros:**
- ✅ True serverless PostgreSQL
- ✅ Instant branching
- ✅ Scale to zero
- ✅ Very fast cold starts

## 🔄 **Migration Strategy: SQLite → Serverless**

### **1. Schema Migration**
Your current SQLite schema can be easily migrated:

```sql
-- Current SQLite schema works with most serverless DBs
CREATE TABLE grants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grant_name TEXT NOT NULL,
  funding_organization TEXT NOT NULL,
  country_region TEXT,
  eligibility_criteria TEXT,
  focus_areas TEXT,
  grant_amount TEXT,
  application_deadline TEXT,
  duration TEXT,
  website_link TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **2. Data Migration Script**
```javascript
// migrate-to-serverless.js
const sqlite3 = require('sqlite3');
const { createClient } = require('@supabase/supabase-js'); // or your chosen DB

async function migrateData() {
  // Read from SQLite
  const db = new sqlite3.Database('./server/database/grants.db');
  const grants = await new Promise((resolve, reject) => {
    db.all("SELECT * FROM grants", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Write to serverless DB
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  
  for (const grant of grants) {
    await supabase.from('grants').insert(grant);
  }
  
  console.log(`Migrated ${grants.length} grants successfully!`);
}
```

## 🚀 **Implementation Example: Turso (Recommended)**

Turso is perfect because it's SQLite-compatible, so minimal code changes needed:

### **Setup Steps:**

1. **Install Turso CLI:**
```bash
npm install -g @turso/cli
turso auth signup
```

2. **Create Database:**
```bash
turso db create civil-society-grants
turso db show civil-society-grants
```

3. **Update Netlify Functions:**
```javascript
// netlify/functions/grants.js
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const handler = async (event, context) => {
  try {
    const result = await client.execute("SELECT * FROM grants ORDER BY application_deadline ASC");
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

4. **Update Environment Variables:**
```bash
# Add to Netlify environment variables
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

## 💰 **Cost Comparison**

| Solution | Free Tier | Paid Plans |
|----------|-----------|------------|
| **Turso** | 500 DBs, 9GB storage | $5/month unlimited |
| **PlanetScale** | 1 DB, 5GB storage, 1B reads | $29/month |
| **Supabase** | 2 projects, 500MB DB | $25/month |
| **Neon** | 1 project, 3GB storage | $19/month |

## 🎯 **Quick Migration Plan**

**For your grants website, I recommend:**

1. **Immediate**: Keep current static JSON setup (it's working!)
2. **Phase 1**: Migrate to Turso (SQLite-compatible, minimal changes)
3. **Phase 2**: Add real-time admin features using serverless functions
4. **Phase 3**: Consider Supabase if you need real-time subscriptions

## 🔧 **Why Not Edge Databases?**

You could also consider:
- **Cloudflare D1**: SQLite at the edge, but limited features
- **Upstash**: Redis-based, good for caching
- **Deta Base**: NoSQL, very simple

## 🎪 **Conclusion**

SQLite + Serverless = ❌ Fundamental incompatibility
SQLite-compatible serverless DBs = ✅ Perfect solution!

**Turso is your best bet** - it maintains SQLite compatibility while being truly serverless.