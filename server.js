const express = require('express');
const connectDB =require('./config/db')
const app = express();
const PORT = process.env.PORT || 5000;
// connect database
connectDB();

app.get('/', (req, res) => res.send("api running"));

app.listen(PORT, () => console.log('server running at ${PORT}'));

