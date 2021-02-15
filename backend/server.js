const express = require('express');
const cors = require ('cors');
const app = express();
const connectToDatabase = require ('./config/connectToDatabase');

app.use(cors());

connectToDatabase();

app.use(express.json({ extendad : false }));


let PORT = process.env.PORT || 5000;

app.use('/api/users', require('./routes/users'));

app.listen(PORT,() => console.log(`Server is running on port: ${PORT}`))