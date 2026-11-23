# SkillMesh
### AI-Assisted Team Formation and Real-Time Collaboration Platform

SkillMesh is a full-stack platform designed to help individuals discover compatible collaborators, evaluate potential team members through explainable matching scores, build teams, and communicate in real time.

The platform combines profile-based discovery, compatibility scoring, connection management, team formation, and real-time messaging into a unified application.

## Features

- **Authentication & Authorization:** Secure user registration and login using bcrypt password hashing and JWT-based authentication, with protected API routes and socket connections.
- **Profile Management:** Create and manage profiles containing technical skills, interests, availability, roles, and social links, with schema validation using Zod.
- **User Discovery:** Search and filter users based on names, roles, biographies, skills, and interests.
- **Intelligent Matching:** Generate explainable compatibility scores using weighted skill, interest, availability, role-complementarity, and text-similarity metrics.
- **Connection Management:** Send, accept, and decline connection requests with duplicate prevention through compound database indexing.
- **Team Management:** Create teams, invite members, manage membership, and handle team operations with ownership-based authorization.
- **Real-Time Messaging:** Exchange messages using Socket.IO, with unread message counts, read receipts, and cursor-based pagination.
- **Notifications:** Persist notifications in MongoDB and deliver updates through real-time socket events.
- **Analytics Dashboard:** Display platform statistics, activity counters, and trending skills using MongoDB aggregation pipelines.

## Matching Algorithm

SkillMesh uses a weighted compatibility algorithm to identify potential collaborators based on multiple profile attributes.

| Matching Parameter | Weight |
|---|---:|
| Skill Compatibility | 30% |
| Interest Similarity | 25% |
| Text Similarity (TF-IDF + Cosine Similarity) | 20% |
| Availability Compatibility | 15% |
| Role Complementarity | 10% |
| **Total** | **100%** |

The algorithm produces explainable matching scores, allowing users to understand the factors contributing to their compatibility with other members.

*Note: The current matching implementation uses classical information retrieval techniques rather than a trained machine learning model.*

## Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- Fetch API
- Socket.IO Client

**Backend**
- Node.js
- Express.js
- Socket.IO
- RESTful API architecture
- JWT Authentication
- bcrypt
- Zod

**Database**
- MongoDB
- Mongoose
- MongoDB Aggregation Framework

**Testing**
- Automated end-to-end API tests
- MongoDB test database

## Project Structure

```text
skillmesh-fullstack/
├── client/                 # React + Vite frontend
│
├── server/                 # Express backend
│   ├── seed/               # Demo data and seed scripts
│   └── tests/              # End-to-end tests
│
└── docs/                   # MongoDB learning documentation
    └── 00-START-HERE.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- MongoDB Community Server or MongoDB Atlas

### 1. Clone the Repository

```bash
git clone <repository-url>
cd skillmesh-fullstack
```

### 2. Configure the Backend

```bash
cd server
npm install
```

Create an environment file:

```bash
cp .env.example .env
```

Configure the required environment variables, including your MongoDB connection URI and JWT secret.

### 3. Seed the Database

```bash
npm run seed
```

This populates the database with eight demo users.

### 4. Start the Backend

```bash
npm run dev
```

The API server will run at:

`http://localhost:5000`

### 5. Start the Frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

The frontend will be available at:

`http://localhost:5173`

## Demo Credentials

Use the following credentials to explore the application:

| Field | Value |
|---|---|
| Email | aarav@demo.skillmesh.dev |
| Password | demo12345 |

The demo environment includes scripted users that automatically accept connection requests after a short delay and generate predefined chat responses, allowing the application's core workflows to be explored without requiring multiple active users.

## API Overview

| Module | Endpoints |
|---|---|
| Authentication | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Users | `GET /api/users`, `GET /api/users/meta`, `PUT /api/users/me` |
| Matching | `GET /api/matches` |
| Connections | `POST /api/connections`, `PATCH /api/connections/:id` |
| Teams | `GET /api/teams`, `POST /api/teams`, `GET /api/teams/:id` |
| Team Members | `POST /api/teams/:id/members`, `DELETE /api/teams/:id/members/:userId` |
| Messaging | `GET /api/messages/conversations`, `GET /api/messages/:userId`, `POST /api/messages/:userId` |
| Notifications | `GET /api/notifications`, `PATCH /api/notifications/read` |
| Analytics | `GET /api/stats` |

## Running Tests

The backend includes eight end-to-end tests that run against a dedicated MongoDB test database (`skillmesh_test`).

```bash
cd server
npm test
```

Ensure MongoDB is running and the test database connection is configured before executing the tests.

## Current Limitations

- The matching engine uses TF-IDF and cosine similarity rather than a trained machine learning model.
- Email verification and password reset functionality are not implemented.
- API rate limiting has not yet been implemented.
- Demo accounts use scripted interactions for connection requests and chat responses.

## Future Improvements

- Integrate semantic embeddings for more context-aware collaborator recommendations.
- Introduce email verification and password recovery workflows.
- Implement API rate limiting and additional security controls.
- Expand automated test coverage.
- Improve recommendation quality using user feedback and interaction history.

---

**SkillMesh** | Built with React, Node.js, Express, MongoDB, and Socket.IO.