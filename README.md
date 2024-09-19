# Task Management App

## Description

A powerful, role-based task management application built with modern web technologies. This app allows admins to assign tasks to users, manage task statuses, and receive real-time push notifications via Firebase Cloud Messaging (FCM). It provides full CRUD functionality, enabling users to create, read, update, and delete tasks in real-time.

## Key Features

- **Role-Based Access Control**: Admins can assign and manage tasks for users.
- **Full CRUD Operations**: Create, read, update, and delete tasks with ease.
- **Firebase Push Notifications**: Instant updates for task assignments and changes.
- **Real-Time Updates**: All changes are reflected instantly across the system.
- **Responsive Design**: Optimized for both mobile and desktop use.
- **Secure Authentication**: JWT-based user authentication and authorization.

## Technical Prerequisites

Ensure you have the following installed:

- Node.js (v16 or later)
- npm (v7 or later)
- MongoDB (v5 or later)
- Firebase account (for push notifications)

## Installation Guide

1. Clone the repository:
   \`\`\`sh
   git clone https://github.com/yourusername/task-management-app.git
   cd task-management-app
   \`\`\`

2. Set up the backend:
   \`\`\`sh
   cd backend
   npm install
   \`\`\`

3. Configure the frontend:
   \`\`\`sh
   cd ../frontend
   npm install
   \`\`\`

4. Firebase Configuration:
   - Create a new Firebase project and enable Cloud Messaging.
   - Obtain your FCM server key and save it for later use.

5. Environment Setup:
   Create a \`.env\` file in the backend directory with the following:
   \`\`\`
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret
   FCM_SERVER_KEY=your_firebase_cloud_messaging_server_key
   \`\`\`

## Vite Frontend Setup

1. Initialize a new Vite project for the frontend:
   \`\`\`sh
   npm create vite@latest frontend -- --template react
   cd frontend
   \`\`\`

2. Install additional dependencies:
   \`\`\`sh
   npm install axios react-router-dom @mui/material @emotion/react @emotion/styled
   \`\`\`

3. Start the Vite development server:
   \`\`\`sh
   npm run dev
   \`\`\`

## Running the Application

1. Start the backend server:
   \`\`\`sh
   cd backend
   npm start
   \`\`\`

2. In a new terminal, start the frontend:
   \`\`\`sh
   cd frontend
   npm run dev
   \`\`\`

3. Access the application at \`http://localhost:5173\`

## API Endpoints

### Tasks
- \`GET /api/tasks\` - Retrieve all tasks
- \`POST /api/tasks\` - Create a new task
- \`GET /api/tasks/:id\` - Retrieve a specific task
- \`PUT /api/tasks/:id\` - Update a task
- \`DELETE /api/tasks/:id\` - Delete a task

### User Management
- \`POST /api/users\` - Create a new user
- \`GET /api/users\` - Retrieve all users
- \`POST /api/users/:id/assign\` - Assign a task to a user

### Authentication
- \`POST /api/auth/login\` - User login
- \`POST /api/auth/register\` - User registration

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Firebase team for their excellent documentation
- MongoDB for their robust database solution
- The open-source community for invaluable tools and libraries
