const express = require('express');
const app = express();
const dotenv = require('dotenv');
const dbConnect = require('./config/dbConnect');
const cors = require('cors');
const taskRouter = require('./router/taskRoutes');
const authRouter = require('./router/authRoutes');
const PORT = process.env.port || 5000;

dotenv.config();
dbConnect();
app.use(express.json());
app.use(cors(
    {
        origin: 'http://localhost:5173  ',
        credentials: true,
    }
));


app.use('/api', taskRouter);
app.use('/api/auth', authRouter);

app.get('/health-check', (req, res)=>{
    return res.send("Server is On");
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));