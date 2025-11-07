# 📚 Code Snippet Library

A modern, full-stack web application for storing, managing, and executing code snippets across 40+ programming languages. Built with the MERN stack and featuring real-time code execution, gamification, and social features.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.1.1-blue.svg)

## ✨ Features

### 🔐 Authentication & User Management
- Secure JWT-based authentication
- User registration and login
- Protected routes and role-based access control
- Admin dashboard for user management

### 💻 Code Snippet Management
- Create, read, update, and delete code snippets
- Support for 40+ programming languages
- Syntax highlighting with react-syntax-highlighter
- Tag-based organization and categorization
- Search and filter functionality
- Favorites system

### 🚀 Interactive Code Playground
- Execute code in 40+ languages (powered by Piston API)
- Built-in code editor with syntax highlighting
- Pre-loaded language templates
- Smart tips for language-specific requirements
- Input/output terminal interface
- Support for stdin input

### 💻 Standalone Code Editor
- **Public access** - No authentication required
- **40+ programming languages** supported
- **Practice challenges** - Built-in coding problems (Easy, Medium, Hard)
- **Auto-save** - Code persists across sessions
- **Theme support** - Dark and light modes
- **Download code** - Export to local files
- **Execution tracking** - View execution time and stats
- **Code templates** - Pre-loaded boilerplate for every language
- **Local storage** - Per-language code persistence

### 🎮 Gamification System
- Points and XP system
- User levels and achievements
- Global leaderboard
- Activity tracking
- Streak system

### 🔀 Fork & Collaboration
- Fork existing snippets
- Track fork history
- View original and forked versions
- Collaborative learning

### 📊 Analytics Dashboard
- User activity heatmap (GitHub-style)
- Language usage statistics
- Snippet creation trends
- Interactive charts with Chart.js

### 🤖 AI Assistant
- Code explanation and analysis
- Syntax checking
- Performance optimization suggestions
- Best practice recommendations

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - UI library
- **Vite 7.1.7** - Build tool and dev server
- **React Router 7.9.5** - Client-side routing
- **Axios 1.13.1** - HTTP client
- **Chart.js 4.5.1** - Data visualization
- **React Syntax Highlighter 16.1.0** - Code syntax highlighting
- **React Toastify 11.0.5** - Toast notifications

### Backend
- **Node.js** - Runtime environment
- **Express 5.1.0** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 8.19.2** - MongoDB ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Express Validator 7.3.0** - Input validation

### External APIs
- **Piston API** - Code execution engine (free, unlimited)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18.0.0 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)
- Git

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/code-snippet-library.git
cd code-snippet-library
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your configuration:
# - MongoDB connection string
# - JWT secret
# - Port number
# - Admin credentials
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create .env file (if needed for custom API URL)
# The default API URL is http://localhost:5000/api
```

### 4. Database Setup
If using local MongoDB:
```bash
# Start MongoDB service
mongod
```

If using MongoDB Atlas:
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist your IP address
4. Copy the connection string to your `.env` file

### 5. Start the Application

**Development Mode:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Snippet Endpoints

#### Get All Snippets
```http
GET /api/snippets?page=1&limit=10&search=react&language=JavaScript&tags=frontend
Authorization: Bearer <token>
```

#### Create Snippet
```http
POST /api/snippets
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "React useState Hook Example",
  "description": "Basic example of React useState",
  "code": "const [count, setCount] = useState(0);",
  "language": "JavaScript",
  "tags": ["react", "hooks", "frontend"]
}
```

#### Get Single Snippet
```http
GET /api/snippets/:id
Authorization: Bearer <token>
```

#### Update Snippet
```http
PUT /api/snippets/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "code": "updated code here"
}
```

#### Delete Snippet
```http
DELETE /api/snippets/:id
Authorization: Bearer <token>
```

### Code Playground Endpoints

#### Execute Code
```http
POST /api/playground/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "language": "python",
  "code": "print('Hello, World!')",
  "input": ""
}
```

### Gamification Endpoints

#### Get Leaderboard
```http
GET /api/gamification/leaderboard?limit=10
Authorization: Bearer <token>
```

#### Get User Stats
```http
GET /api/gamification/stats/:userId
Authorization: Bearer <token>
```

### Analytics Endpoints

#### Get User Activity
```http
GET /api/analytics/activity/:userId?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

#### Get Language Stats
```http
GET /api/analytics/languages/:userId
Authorization: Bearer <token>
```

## 🌐 Deployment

### Deploy to Vercel (Frontend)
1. Push your code to GitHub
2. Import project in Vercel
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables (if needed)
5. Deploy

### Deploy to Render (Backend)
1. Push your code to GitHub
2. Create new Web Service in Render
3. Configure settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables from `.env.example`
5. Deploy

### MongoDB Atlas (Database)
1. Create a free cluster
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for all)
4. Copy connection string to environment variables

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Aadit** - *Initial work*

## 🙏 Acknowledgments

- [Piston API](https://github.com/engineer-man/piston) for free code execution
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for inspiration
- React and Express communities for excellent documentation

## 📞 Support

For support, email your-email@example.com or open an issue in the GitHub repository.

## 🗺️ Roadmap

- [ ] Real-time collaboration
- [ ] WebSocket-based live code execution
- [ ] Code snippet sharing via unique URLs
- [ ] Dark/Light theme toggle
- [ ] Mobile responsive improvements
- [ ] Code snippet export (PDF, Markdown)
- [ ] Integration with GitHub Gists
- [ ] Advanced code analysis with AI
- [ ] Team workspaces

---

Made with ❤️ by the Code Snippet Library Team
