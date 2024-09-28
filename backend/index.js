const express = require('express');
const dotenv = require('dotenv');
const dbConnect = require('./config/dbConnect');
const cors = require('cors');
const taskRouter = require('./router/taskRoutes');
const authRouter = require('./router/authRoutes');
const teamRoute = require('./router/teamRoutes');
const authRoute = require('./router/authRoutes');
const { initSocket } = require('./socket');
const http = require('http');
const cronJobs = require('./cronJobs');
const notificationRoutes = require('./router/notificationRoutes');
const bodyParser = require('body-parser');
dotenv.config();

const app = express();
const server = http.createServer(app);

dbConnect();
cronJobs();
initSocket(server);

app.use(express.json());

const allowedOrigins = [
    "https://task-management-app-xi-six.vercel.app",
    "https://task-management-app-navy-three.vercel.app",
    "http://localhost:5173",
    process.env.FRONTEND_URL
  ];

  
  const corsOptions = {
    origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'Set-Cookie'],
  };
  
  app.use(cors(corsOptions));
  app.use(bodyParser.json());

app.use('/api/notifications', notificationRoutes);  
app.use('/api', taskRouter);
app.use('/api/auth', authRouter);
app.use('/team',teamRoute );


app.get('/health-check', (req, res) => {
    return res.send("Server is On");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


