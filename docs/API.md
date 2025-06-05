# API Documentation

## Base URL

- **Development**: `http://localhost:8888/.netlify/functions`
- **Production**: `https://your-site.netlify.app/.netlify/functions`

## Authentication

Most endpoints require authentication via Supabase Auth. Include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints

### Grants

#### List All Grants

```http
GET /grants
```

Query Parameters:
- `limit` (number): Maximum number of grants to return (default: 100)
- `offset` (number): Number of grants to skip for pagination
- `organization` (string): Filter by funding organization
- `type` (string): Filter by grant type
- `country` (string): Filter by eligible country

Response:
```json
{
  "grants": [
    {
      "id": "uuid",
      "grant_name": "Democracy Support Grant",
      "grant_name_uk": "Грант на підтримку демократії",
      "funding_organization": "Example Foundation",
      "funding_organization_uk": "Приклад Фонду",
      "description": "Grant description...",
      "description_uk": "Опис гранту...",
      "focus_area": ["Democracy", "Human Rights"],
      "focus_area_uk": ["Демократія", "Права людини"],
      "eligibility_criteria": "NGOs and CSOs",
      "eligibility_criteria_uk": "НУО та ОГС",
      "eligible_countries": ["Ukraine", "Moldova"],
      "eligible_countries_uk": ["Україна", "Молдова"],
      "grant_type": "Project Grant",
      "grant_type_uk": "Проектний грант",
      "grant_size": "$10,000 - $50,000",
      "grant_size_uk": "$10,000 - $50,000",
      "application_deadline": "2025-12-31",
      "application_link": "https://example.org/apply",
      "logo_url": "/images/logos/example-foundation.svg",
      "additional_info": "Additional details...",
      "additional_info_uk": "Додаткові деталі...",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 107,
  "limit": 100,
  "offset": 0
}
```

#### Get Single Grant

```http
GET /grants/:id
```

Response:
```json
{
  "grant": {
    "id": "uuid",
    "grant_name": "Democracy Support Grant",
    // ... all grant fields
  }
}
```

#### Create Grant (Admin Only)

```http
POST /grants
```

Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

Request Body:
```json
{
  "grant_name": "New Grant",
  "grant_name_uk": "Новий грант",
  "funding_organization": "Organization Name",
  "funding_organization_uk": "Назва організації",
  "description": "Grant description",
  "description_uk": "Опис гранту",
  // ... all required fields
}
```

Response:
```json
{
  "grant": {
    "id": "new-uuid",
    // ... all grant fields
  }
}
```

#### Update Grant (Admin Only)

```http
PUT /grants/:id
```

Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

Request Body:
```json
{
  // Only include fields to update
  "grant_name": "Updated Grant Name",
  "description": "Updated description"
}
```

Response:
```json
{
  "grant": {
    // ... updated grant fields
  }
}
```

#### Delete Grant (Admin Only)

```http
DELETE /grants/:id
```

Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

Response:
```json
{
  "message": "Grant deleted successfully"
}
```

### Authentication

#### Login

```http
POST /auth/login
```

Request Body:
```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "expires_in": 3600
  }
}
```

#### Logout

```http
POST /auth/logout
```

Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

Response:
```json
{
  "message": "Logged out successfully"
}
```

#### Get Current User

```http
GET /auth/me
```

Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### AI Chat

#### Send Chat Message

```http
POST /chat
```

Request Body:
```json
{
  "message": "What grants are available for democracy projects?",
  "language": "en",
  "conversationHistory": []
}
```

Response:
```json
{
  "response": "Based on your query, here are relevant grants...",
  "grants": [
    {
      "id": "uuid",
      "grant_name": "Democracy Support Grant",
      "relevance_score": 0.95
    }
  ]
}
```

### Blog

#### List Blog Posts

```http
GET /blog
```

Query Parameters:
- `limit` (number): Maximum posts to return
- `offset` (number): Pagination offset
- `status` (string): Filter by status (published, draft)

Response:
```json
{
  "posts": [
    {
      "id": "uuid",
      "title": "Grant Writing Tips",
      "slug": "grant-writing-tips",
      "excerpt": "Learn how to write winning grant proposals...",
      "author": {
        "id": "uuid",
        "name": "Admin User"
      },
      "status": "published",
      "published_at": "2025-01-01T00:00:00Z",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 10,
  "limit": 10,
  "offset": 0
}
```

#### Get Single Blog Post

```http
GET /blog/:slug
```

Response:
```json
{
  "post": {
    "id": "uuid",
    "title": "Grant Writing Tips",
    "slug": "grant-writing-tips",
    "content": "<p>Full HTML content...</p>",
    "excerpt": "Learn how to write winning grant proposals...",
    "author": {
      "id": "uuid",
      "name": "Admin User"
    },
    "status": "published",
    "published_at": "2025-01-01T00:00:00Z",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

#### Create Blog Post (Admin Only)

```http
POST /blog
```

Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

Request Body:
```json
{
  "title": "New Blog Post",
  "content": "<p>HTML content...</p>",
  "excerpt": "Short description",
  "status": "draft"
}
```

#### Update Blog Post (Admin Only)

```http
PUT /blog/:id
```

Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

Request Body:
```json
{
  "title": "Updated Title",
  "content": "<p>Updated content...</p>",
  "status": "published"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

Common Error Codes:
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `INTERNAL_ERROR`: Server error

## Rate Limiting

- **Anonymous**: 100 requests per hour
- **Authenticated**: 1000 requests per hour

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination via `limit` and `offset`:

```http
GET /grants?limit=20&offset=40
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "total": 107,
  "limit": 20,
  "offset": 40,
  "has_more": true
}
```

## Filtering

Most list endpoints support filtering:

```http
GET /grants?organization=USAID&type=Project%20Grant&country=Ukraine
```

## Sorting

Use the `sort` parameter:

```http
GET /grants?sort=created_at:desc
GET /grants?sort=grant_name:asc
```

## CORS

The API supports CORS for browser-based applications:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Webhooks (Future)

Planned webhook events:
- `grant.created`
- `grant.updated`
- `grant.deleted`
- `blog.published`

---

For implementation examples, see the frontend code in `client/src/`.