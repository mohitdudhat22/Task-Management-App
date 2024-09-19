# Task Management App

## Description
A role-based task management application that allows admins to assign tasks to users, manage task status, and receive push notifications via Firebase Cloud Messaging (FCM). The app provides full CRUD functionality, enabling users to create, read, update, and delete tasks in real-time.

## Features
- **Role-based access control**: Admin can assign tasks to users.
- **CRUD operations**: Create, read, update, and delete tasks.
- **Firebase Push Notifications**: Notifications for task updates and assignments via FCM tokens.
- **Real-time updates**: Tasks and status updates are instantly reflected.
- **Responsive design**: Optimized for both mobile and desktop use.

## Prerequisites
Before you begin, ensure you have met the following requirements:
- Node.js (v14 or later)
- npm (v6 or later)
- MongoDB (v4 or later)
- Firebase account for push notifications

## Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/task-management-app.git
   cd task-management-app
   \`\`\`

2. Install backend dependencies:
   \`\`\`bash
   cd backend
   npm install
   \`\`\`

3. Install frontend dependencies:
   \`\`\`bash
   cd ../frontend
   
   npm install
   \`\`\`

5. Set up Firebase push notifications:
   - Create a Firebase project and enable Cloud Messaging.
   - Obtain your FCM server key and add it to your environment variables.

6. Create a \`.env\` file in the backend directory and add your MongoDB connection string, FCM keys, and JWT secret:
   \`\`\`bash
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FCM_SERVER_KEY=your_fcm_server_key
   \`\`\`

## Vite Setup

1. For the frontend, ensure that you are using **Vite** for faster builds and development experience.
   \`\`\`bash
   npm init vite@latest
   \`\`\`

2. Choose your project name and select **React** as the framework.

3. Once Vite is set up, install the necessary dependencies for React:
   \`\`\`bash
   npm install
   \`\`\`

4. To start the frontend development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Usage

1. Start the backend server:
   \`\`\`bash
   cd backend
   node index.js
   \`\`\`

2. Start the frontend server (Vite):
   \`\`\`bash
   cd ../frontend
   npm run dev
   \`\`\`

3. Open your browser and navigate to \`http://localhost:5173\` to view the app.

## API Endpoints

- **Tasks**:
  - \`GET /api/tasks\` - Get all tasks
  - \`POST /api/tasks\` - Create a new task
  - \`PUT /api/tasks/:id\` - Update a task
  - \`DELETE /api/tasks/:id\` - Delete a task

- **User Management**:
  - \`POST /api/users/:id/assign\` - Assign a task to a user

- **Firebase Notifications**:
  - Push notifications for task updates via FCM

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
