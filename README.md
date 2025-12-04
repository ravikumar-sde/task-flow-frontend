# Trello Frontend - Task Management Application

A modern task management application built with React, inspired by Trello. Features include authentication (OAuth & email), workspaces, boards, and task management.

## 🚀 Features

### ✅ Implemented
- **Authentication System**
  - Email/Password login and signup
  - Google OAuth integration
  - GitHub OAuth integration
  - JWT token-based authentication
  - Automatic token refresh
  - Protected routes

### 🔜 Coming Soon
- Workspaces management
- Boards and lists
- Task cards with drag & drop
- Team collaboration
- Real-time updates

## 🛠️ Tech Stack

- **React 19** - UI library
- **Vite 7** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **TanStack Query** - Data fetching (ready to use)

## 📋 Prerequisites

- **Node.js** v20.19+ or v22.12+ (required by Vite)
- **npm** v8.0+
- Backend API running on `http://localhost:3000` (or configure in `.env`)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   cd TrelloFrontEnd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your backend URL:
   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. **Start the development server**

   If using nvm:
   ```bash
   nvm use 22
   npm run dev
   ```

   Or directly:
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   └── ProtectedRoute.jsx
├── contexts/           # React contexts
│   └── AuthContext.jsx
├── pages/              # Page components
│   ├── Login.jsx
│   ├── Signup.jsx
│   └── Dashboard.jsx
├── services/           # API services
│   ├── api.js
│   └── authService.js
├── styles/             # CSS files
│   ├── Auth.css
│   └── Dashboard.css
├── utils/              # Utility functions
├── hooks/              # Custom hooks
└── assets/             # Static assets
```

## 🔐 Authentication Flow

### Email/Password Authentication

**Signup:**
- POST `/api/v1/auth/signup`
- Body: `{ name, email, password }`
- Returns: `{ token, refreshToken, user }`

**Login:**
- POST `/api/v1/auth/login`
- Body: `{ email, password }`
- Returns: `{ token, refreshToken, user }`

### OAuth Authentication

**Google:**
- Redirect to: `GET /api/v1/auth/google`
- Backend handles OAuth flow and redirects back with token

**GitHub:**
- Redirect to: `GET /api/v1/auth/github`
- Backend handles OAuth flow and redirects back with token

### Token Management

- Access tokens stored in `localStorage`
- Automatic token refresh on 401 responses
- Tokens included in all authenticated requests via interceptor

## 🎨 UI Features

- Modern gradient design
- Responsive layout
- Loading states
- Error handling
- Form validation
- Smooth animations
- Icon integration

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔗 API Integration

The app integrates with the Trello Backend API. See `Trello_Backend.postman_collection.json` for complete API documentation.

**Base URL:** `http://localhost:3000/api/v1`

**Key Endpoints:**
- `/auth/signup` - User registration
- `/auth/login` - User login
- `/auth/me` - Get current user
- `/auth/google` - Google OAuth
- `/auth/github` - GitHub OAuth
- `/auth/logout` - Logout user

## 🚧 Development Notes

- The app uses React Router for navigation
- Authentication state managed via Context API
- Axios interceptors handle token refresh automatically
- Protected routes redirect to login if not authenticated

## 📦 Dependencies

**Production:**
- react & react-dom
- react-router-dom
- axios
- lucide-react
- @tanstack/react-query

**Development:**
- vite
- @vitejs/plugin-react
- eslint & plugins

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is part of a task management system implementation.
