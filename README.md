# UniNest

A comprehensive student housing platform designed to streamline the process of finding, listing, and managing rental properties near universities. UniNest connects students with landlords while providing additional features such as roommate matching, community forums, marketplace listings, and AI-powered assistance.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Key Features](#key-features)
4. [System Architecture](#system-architecture)
5. [Technologies Used](#technologies-used)
6. [Installation and Setup](#installation-and-setup)
7. [Configuration](#configuration)
8. [Usage Instructions](#usage-instructions)
9. [API Integration](#api-integration)
10. [Authentication and Authorization](#authentication-and-authorization)
11. [Database Design](#database-design)
12. [Error Handling and Logging](#error-handling-and-logging)
13. [Security Considerations](#security-considerations)
14. [Performance and Scalability](#performance-and-scalability)
15. [Deployment](#deployment)
16. [Limitations and Known Issues](#limitations-and-known-issues)
17. [Future Improvements](#future-improvements)
18. [Contributing Guidelines](#contributing-guidelines)

---

## Project Overview

UniNest is a full-stack web and mobile application that serves as a centralized platform for student housing. The system consists of three main components:

- **Backend API**: A Node.js/Express server providing RESTful endpoints and real-time WebSocket communication
- **Web Frontend**: A React-based single-page application with responsive design
- **Mobile Application**: A React Native/Expo application for iOS and Android devices

The platform supports multiple user roles including Students, Landlords, Admins, and SuperAdmins, each with distinct permissions and capabilities.

---

## Problem Statement

University students face significant challenges when searching for off-campus housing:

- **Fragmented Information**: Housing listings are scattered across multiple platforms with inconsistent quality and reliability
- **Trust and Verification**: Difficulty in verifying landlord legitimacy and property authenticity
- **Communication Barriers**: Lack of streamlined communication channels between students and landlords
- **Roommate Discovery**: Limited tools for finding compatible roommates with similar preferences
- **Market Transparency**: Absence of pricing history and market analytics for informed decision-making

UniNest addresses these challenges by providing a unified, verified, and feature-rich platform tailored specifically for the student housing market.

---

## Key Features

### Property Management
- **Property Listings**: Landlords can create, edit, and manage property listings with multiple images, 360-degree views, and detailed amenity information
- **Advanced Search and Filtering**: Students can search properties by location, price, amenities, proximity to universities, and more
- **Favorites System**: Save and organize preferred listings for later review
- **Property Reviews**: Students can leave ratings and reviews for properties and landlords
- **Price History Tracking**: Historical price data visualization for market analysis

### Communication
- **Real-time Messaging**: WebSocket-powered instant messaging between students and landlords
- **Typing Indicators**: Real-time typing status in conversations
- **Notification System**: In-app notifications for messages, viewing requests, and system announcements

### Roommate Matching
- **Profile Creation**: Detailed roommate profiles with lifestyle preferences, habits, and requirements
- **Compatibility Matching**: Algorithm-based roommate suggestions based on profile compatibility
- **Match Requests**: Send and manage roommate connection requests

### Property Viewings
- **Scheduling System**: Students can request property viewings at available time slots
- **Landlord Availability Management**: Landlords can set and manage their availability calendar
- **Viewing Status Tracking**: Track viewing requests through pending, confirmed, completed, or cancelled states

### Community Features
- **Forum/Community Board**: Discussion platform for students to share experiences and advice
- **Post Categories**: Organized discussions by topics
- **Comments and Likes**: Engagement features for community posts

### Marketplace
- **Item Listings**: Secondary marketplace for students to buy/sell furniture and household items
- **Category Organization**: Items organized by type and condition

### Administration
- **User Management**: Admin tools for managing user accounts and roles
- **Verification System**: Identity verification workflow for landlords
- **Content Moderation**: Report handling and message moderation capabilities
- **Analytics Dashboard**: Platform-wide statistics and insights
- **Announcement System**: Broadcast important updates to users
- **AI-Powered Report Analysis**: Automated analysis of user reports using OpenAI integration

### AI Assistant
- **AI Chat**: OpenAI-powered chatbot for answering housing-related questions

---

## System Architecture

```
+-------------------+     +-------------------+     +-------------------+
|                   |     |                   |     |                   |
|   Web Frontend    |     |  Mobile App       |     |   Admin Panel     |
|   (React + Vite)  |     |  (React Native)   |     |   (React)         |
|                   |     |                   |     |                   |
+--------+----------+     +--------+----------+     +--------+----------+
         |                         |                         |
         |    HTTP/WebSocket       |                         |
         +-------------------------+-------------------------+
                                   |
                                   v
                    +-----------------------------+
                    |                             |
                    |      Backend API Server     |
                    |      (Node.js + Express)    |
                    |                             |
                    |  +----------------------+   |
                    |  |    Socket.io Server  |   |
                    |  +----------------------+   |
                    |                             |
                    +-------------+---------------+
                                  |
                    +-------------+---------------+
                    |                             |
                    v                             v
         +-------------------+         +-------------------+
         |                   |         |                   |
         |    PostgreSQL     |         |    Cloudinary     |
         |    Database       |         |    (Media CDN)    |
         |                   |         |                   |
         +-------------------+         +-------------------+
```

### Component Responsibilities

- **Web Frontend**: User interface for desktop/laptop users, built with React and styled with TailwindCSS
- **Mobile App**: Native mobile experience using Expo/React Native with platform-specific optimizations
- **Backend API**: Business logic, data validation, authentication, and API endpoints
- **Socket.io Server**: Real-time bidirectional communication for messaging and notifications
- **PostgreSQL**: Persistent data storage with relational integrity
- **Cloudinary**: Cloud-based image and media storage with transformation capabilities

---

## Technologies Used

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express.js | 4.18.x | Web application framework |
| Sequelize | 6.35.x | ORM for PostgreSQL |
| PostgreSQL | 16 | Relational database |
| Socket.io | 4.8.x | Real-time communication |
| JSON Web Token | 9.0.x | Authentication tokens |
| bcryptjs | 2.4.x | Password hashing |
| Cloudinary | 2.8.x | Image upload and storage |
| Multer | 2.0.x | File upload handling |
| Nodemailer | 7.0.x | Email services |
| OpenAI | 6.16.x | AI chat integration |
| node-cron | 3.0.x | Scheduled tasks |

### Frontend (Web)
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.x | UI library |
| Vite | 7.2.x | Build tool and dev server |
| React Router | 6.23.x | Client-side routing |
| TailwindCSS | 4.1.x | Utility-first CSS framework |
| Socket.io Client | 4.8.x | Real-time communication |
| Leaflet | 1.9.x | Interactive maps |
| Recharts | 3.6.x | Data visualization |
| Pannellum | 2.5.x | 360-degree image viewer |
| date-fns | 4.1.x | Date manipulation |
| Heroicons | 2.2.x | Icon library |

### Mobile
| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81.x | Mobile framework |
| Expo | 54.x | Development platform |
| React Navigation | 7.x | Navigation library |
| Axios | 1.7.x | HTTP client |
| React Native Maps | 1.20.x | Map integration |
| Expo Location | 19.x | Geolocation services |
| Expo Image Picker | 17.x | Image selection |
| Expo Secure Store | 15.x | Secure storage |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| NGINX | Reverse proxy and static file serving |

---

## Installation and Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- PostgreSQL 16.x
- Docker and Docker Compose (optional, for containerized deployment)
- Cloudinary account (for image uploads)

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd GP1
```

#### 2. Environment Configuration

Copy the example environment file and configure the required variables:

```bash
cp .env.example .env
```

Edit `.env` with your specific configuration values (see [Configuration](#configuration) section).

#### 3. Backend Setup

```bash
cd Backend
npm install
```

#### 4. Frontend Setup

```bash
cd Frontend
npm install
```

#### 5. Mobile Setup

```bash
cd mobile
npm install
```

#### 6. Database Setup

Ensure PostgreSQL is running and the database specified in your `.env` file exists:

```bash
# Connect to PostgreSQL and create the database
psql -U postgres
CREATE DATABASE uninest_db;
\q
```

#### 7. Start Development Servers

**Backend:**
```bash
cd Backend
npm run dev
```

**Frontend:**
```bash
cd Frontend
npm run dev
```

**Mobile:**
```bash
cd mobile
npm start
```

### Docker Deployment

For containerized deployment using Docker Compose:

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## Configuration

### Environment Variables

The application requires the following environment variables. Create a `.env` file in the project root:

#### Database Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_DB` | Database name | `uninest_db` |
| `POSTGRES_USER` | Database username | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `your_secure_password` |
| `POSTGRES_HOST` | Database host | `localhost` or `postgres` (Docker) |
| `POSTGRES_PORT` | Database port | `5432` |
| `POSTGRES_EXTERNAL_PORT` | External port mapping | `5432` |

#### Backend Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `BACKEND_INTERNAL_PORT` | Internal API port | `3000` |
| `BACKEND_EXTERNAL_PORT` | External API port | `8080` |
| `SYNC_DATABASE` | Auto-sync database models | `true` or `false` |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | `your_super_secure_jwt_secret_key` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:80` |

#### Frontend Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| `FRONTEND_PORT` | Frontend server port | `80` |
| `VITE_API_URL` | Backend API URL | `http://localhost:8080` |

#### Cloudinary Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your_api_secret` |

#### Mobile Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| `MOBILE_HOSTNAME` | Mobile dev server hostname | `localhost` |
| `EXPO_DEVTOOLS_PORT` | Expo DevTools port | `19000` |
| `METRO_BUNDLER_PORT` | Metro bundler port | `8081` |

---

## Usage Instructions

### User Roles

#### Student
1. Register with a valid university email address
2. Complete email verification
3. Browse and search property listings
4. Save favorites and contact landlords
5. Create a roommate profile for matching
6. Schedule property viewings
7. Leave reviews for properties and landlords
8. Participate in community forums
9. Use the marketplace for buying/selling items

#### Landlord
1. Register and select the Landlord role
2. Complete identity verification (optional but recommended)
3. Create and manage property listings
4. Upload property images and 360-degree views
5. Set availability for property viewings
6. Respond to student inquiries
7. View analytics for listed properties

#### Admin
1. Access the admin dashboard at `/admin`
2. Manage user accounts and roles
3. Review and process verification requests
4. Handle reported content and messages
5. Create platform announcements
6. View platform analytics

### Common Workflows

#### Creating a Property Listing (Landlord)
1. Navigate to "My Listings"
2. Click "Add New Listing"
3. Fill in property details (address, price, amenities, etc.)
4. Upload property images
5. Set availability status
6. Publish the listing

#### Searching for Properties (Student)
1. Navigate to "Apartments"
2. Use filters to narrow results (price range, location, amenities)
3. View property details and images
4. Contact landlord or schedule a viewing
5. Save to favorites for later reference

---

## API Integration

### Base URL

- **Development**: `http://localhost:8080/api`
- **Production**: Configured via `VITE_API_URL` environment variable

### API Endpoints Overview

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-verification-code` | Send email verification code |
| POST | `/api/auth/verify-code` | Verify email code |
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/signin` | User login |
| POST | `/api/auth/forgot-password` | Initiate password reset |
| POST | `/api/auth/reset-password` | Complete password reset |

#### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update current user profile |
| GET | `/api/users/:id` | Get user by ID |

#### Property Listings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/property-listings` | Get all listings (with filters) |
| GET | `/api/property-listings/:id` | Get listing by ID |
| POST | `/api/property-listings` | Create new listing |
| PUT | `/api/property-listings/:id` | Update listing |
| DELETE | `/api/property-listings/:id` | Delete listing |

#### Conversations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | Get user conversations |
| POST | `/api/conversations` | Create new conversation |
| GET | `/api/conversations/:id/messages` | Get conversation messages |
| POST | `/api/conversations/:id/messages` | Send message |

#### Roommates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roommates/profiles` | Search roommate profiles |
| GET | `/api/roommates/profile` | Get own profile |
| POST | `/api/roommates/profile` | Create/update profile |
| POST | `/api/roommates/match/:targetId` | Send match request |

#### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/listing/:id` | Get listing reviews |
| POST | `/api/reviews` | Create review |
| PUT | `/api/reviews/:id` | Update review |
| DELETE | `/api/reviews/:id` | Delete review |

#### Forum
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/forum/posts` | Get forum posts |
| POST | `/api/forum/posts` | Create post |
| POST | `/api/forum/posts/:id/comments` | Add comment |
| POST | `/api/forum/posts/:id/like` | Like/unlike post |

### Request/Response Format

All API responses follow a standardized format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### WebSocket Events

The application uses Socket.io for real-time features:

#### Client Events (Emit)
| Event | Payload | Description |
|-------|---------|-------------|
| `conversation:join` | `conversationId` | Join a conversation room |
| `conversation:leave` | `conversationId` | Leave a conversation room |
| `typing:start` | `{ conversationId }` | Indicate typing started |
| `typing:stop` | `{ conversationId }` | Indicate typing stopped |
| `forum:join` | - | Join forum updates room |
| `forum:leave` | - | Leave forum updates room |

#### Server Events (Listen)
| Event | Payload | Description |
|-------|---------|-------------|
| `message:new` | Message object | New message received |
| `typing:start` | `{ userId, conversationId }` | User started typing |
| `typing:stop` | `{ userId, conversationId }` | User stopped typing |
| `notification:new` | Notification object | New notification |

---

## Authentication and Authorization

### Authentication Flow

1. **Registration**: User provides email, password, and profile information
2. **Email Verification**: A verification code is sent to the user's email
3. **Code Verification**: User enters the code to verify their email
4. **Login**: User authenticates with email and password
5. **Token Issuance**: Server issues a JWT token upon successful authentication
6. **Token Usage**: Client includes the token in the `Authorization` header for subsequent requests

### JWT Token Structure

```
Authorization: Bearer <token>
```

The JWT payload contains:
- `id`: User UUID
- `email`: User email address
- `iat`: Token issued at timestamp
- `exp`: Token expiration timestamp

### Role-Based Access Control

The system implements four user roles with hierarchical permissions:

| Role | Permissions |
|------|-------------|
| **Student** | Browse listings, create favorites, send messages, create roommate profile, write reviews, forum participation |
| **Landlord** | All Student permissions + create/manage listings, manage viewings, view property analytics |
| **Admin** | All Landlord permissions + user management, verification review, content moderation, announcements |
| **SuperAdmin** | All Admin permissions + admin management, system configuration |

### Protected Routes

Routes are protected using middleware:

```javascript
// Require authentication
router.get('/protected', authenticate, handler);

// Require specific role(s)
router.get('/admin-only', authenticate, authorize(['Admin', 'SuperAdmin']), handler);
```

---

## Database Design

### Entity Relationship Overview

The database uses PostgreSQL with Sequelize ORM. Key entities and relationships:

```
+-------------+       +------------------+       +---------------+
|    User     |------>| PropertyListing  |<------| ListingImage  |
+-------------+       +------------------+       +---------------+
      |                      |
      |                      |
      v                      v
+-------------+       +------------------+
|   Review    |       |  Conversation    |
+-------------+       +------------------+
      |                      |
      v                      v
+-------------+       +------------------+
|ReviewHelpful|       |     Message      |
+-------------+       +------------------+
```

### Core Models

#### User
- Primary identifier: UUID
- Roles: Student, Landlord, Admin, SuperAdmin
- Verification status tracking
- University association

#### PropertyListing
- Property details (address, price, bedrooms, bathrooms)
- Amenities and features
- Location coordinates for map display
- University proximity

#### Listing
- Base listing model for polymorphic associations
- Supports PropertyListing and ItemListing subtypes

#### Conversation / Message
- One-to-many relationship (Conversation has many Messages)
- Tracks student-landlord communication
- Associated with specific properties

#### RoommateProfile / RoommateMatch
- Detailed preference profiles
- Match request tracking with status

#### ForumPost / ForumComment / ForumLike
- Community discussion system
- Nested comments and engagement tracking

### Database Synchronization

In development mode, Sequelize automatically synchronizes models with the database:

```javascript
// Enabled when NODE_ENV=development or SYNC_DATABASE=true
await sequelize.sync({ alter: true });
```

**Note**: In production, use migrations instead of automatic synchronization.

---

## Error Handling and Logging

### Standardized Error Responses

The application uses a centralized error handling utility (`utils/responses.js`):

| Status Code | Constant | Usage |
|-------------|----------|-------|
| 200 | `HTTP_STATUS.OK` | Successful request |
| 201 | `HTTP_STATUS.CREATED` | Resource created |
| 400 | `HTTP_STATUS.BAD_REQUEST` | Invalid request |
| 401 | `HTTP_STATUS.UNAUTHORIZED` | Authentication required |
| 403 | `HTTP_STATUS.FORBIDDEN` | Insufficient permissions |
| 404 | `HTTP_STATUS.NOT_FOUND` | Resource not found |
| 422 | `HTTP_STATUS.UNPROCESSABLE_ENTITY` | Validation error |
| 500 | `HTTP_STATUS.SERVER_ERROR` | Internal server error |

### Error Response Structure

Development environment includes additional debugging information:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 500,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "errorDetails": "Detailed error message",
  "stack": "Error stack trace..."
}
```

Production environment returns minimal information:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 500,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Logging

- Console logging for development
- Structured error logging with timestamps
- Docker container logs with rotation (max 10MB, 3 files)

---

## Security Considerations

### Authentication Security
- **Password Hashing**: bcryptjs with salt rounds for secure password storage
- **JWT Tokens**: Signed tokens with configurable expiration
- **Token Validation**: Server-side verification on every protected request

### Data Protection
- **Input Validation**: Request payload validation before processing
- **SQL Injection Prevention**: Sequelize ORM with parameterized queries
- **XSS Prevention**: React's built-in escaping and sanitization

### Network Security
- **CORS Configuration**: Whitelist-based origin validation
- **HTTPS**: SSL/TLS encryption in production (configured via reverse proxy)
- **Environment Variables**: Sensitive configuration stored outside codebase

### File Upload Security
- **File Type Validation**: Multer configuration for allowed file types
- **Cloud Storage**: Cloudinary handles file storage and transformation
- **Size Limits**: Configurable maximum file size

### Access Control
- **Role-Based Authorization**: Middleware-enforced permission checks
- **Resource Ownership**: Users can only modify their own resources
- **Admin Verification**: Identity verification workflow for landlords

### Recommendations for Production
1. Enable HTTPS with valid SSL certificates
2. Implement rate limiting for API endpoints
3. Enable Redis for session management
4. Configure firewall rules for database access
5. Regular security audits and dependency updates
6. Implement CSRF protection for form submissions

---

## Performance and Scalability

### Current Optimizations

#### Database
- **Connection Pooling**: Sequelize pool configuration (max 5 connections)
- **Indexed Queries**: Primary keys and foreign keys indexed
- **Lazy Loading**: Associations loaded on demand

#### API
- **Response Compression**: NGINX gzip compression
- **Static Asset Caching**: Browser caching for frontend assets
- **WebSocket Efficiency**: Room-based message broadcasting

#### Frontend
- **Code Splitting**: Vite's automatic chunk splitting
- **Lazy Loading**: Route-based component loading
- **Image Optimization**: Cloudinary transformations

### Docker Resource Limits

```yaml
# Backend
limits:
  cpus: '1'
  memory: 1G

# Frontend
limits:
  cpus: '0.5'
  memory: 256M

# PostgreSQL
limits:
  cpus: '1'
  memory: 512M
```

### Scaling Recommendations

1. **Horizontal Scaling**: Deploy multiple backend instances behind a load balancer
2. **Database Scaling**: Implement read replicas for query distribution
3. **Caching Layer**: Add Redis for session storage and query caching
4. **CDN**: Serve static assets through a content delivery network
5. **Message Queue**: Implement job queues for background processing

---

## Deployment

### Docker Compose Deployment

The recommended deployment method uses Docker Compose:

```bash
# Production deployment
docker-compose up -d --build

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=3
```

### Container Health Checks

All services include health checks:

- **PostgreSQL**: `pg_isready` command
- **Backend**: HTTP health endpoint (`/health`)
- **Frontend**: NGINX HTTP check

### Deployment Checklist

1. [ ] Set `NODE_ENV=production`
2. [ ] Configure strong `JWT_SECRET`
3. [ ] Set secure `POSTGRES_PASSWORD`
4. [ ] Configure Cloudinary credentials
5. [ ] Set appropriate CORS origins
6. [ ] Enable SSL/TLS termination
7. [ ] Configure backup strategy
8. [ ] Set up monitoring and alerting

### Backup Strategy

Database backups are mounted to `./Backend/backups`:

```bash
# Manual backup
docker exec uninest-postgres pg_dump -U postgres uninest_db > backup.sql

# Restore from backup
docker exec -i uninest-postgres psql -U postgres uninest_db < backup.sql
```

---

## Limitations and Known Issues

### Current Limitations

1. **No Automated Testing**: Test suites are not yet implemented
2. **Single Database Instance**: No replication or failover configured
3. **Limited Caching**: No Redis integration for caching
4. **Email Dependency**: Email service required for verification
5. **Cloudinary Dependency**: Image uploads require Cloudinary account
6. **No Offline Support**: Mobile app requires network connectivity

### Known Issues

1. **CORS in Development**: All origins allowed in development mode for convenience
2. **Database Sync**: Automatic model synchronization may cause data loss in production
3. **Token Refresh**: No automatic token refresh mechanism implemented
4. **Rate Limiting**: Not implemented; vulnerable to abuse

---

## Future Improvements

### Short-term
- Implement comprehensive test suites
- Add rate limiting middleware
- Implement token refresh mechanism
- Add Redis for caching and sessions
- Implement database migrations

### Medium-term
- Add payment integration for premium listings
- Implement push notifications for mobile
- Add multi-language support (i18n)
- Implement advanced search with Elasticsearch
- Add virtual tour scheduling

### Long-term
- Machine learning-based roommate matching
- Predictive pricing analytics
- Integration with university housing systems
- Blockchain-based lease agreements
- AR property viewing capabilities

---

## Contributing Guidelines

### Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run linting and tests
5. Commit with descriptive messages
6. Push to your fork
7. Create a Pull Request

### Code Standards

- Follow existing code style and conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Update documentation for API changes

### Commit Messages

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Request Process

1. Ensure all tests pass
2. Update README if needed
3. Request review from maintainers
4. Address review feedback
5. Squash commits if requested
