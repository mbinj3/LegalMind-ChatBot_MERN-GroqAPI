const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const userQueryRoute = require('./routes/query');

const server = express();
const PORT = process.env.PORT;

server.use(cors());
server.use(express.json());

server.use('/user-query', userQueryRoute);

server.get('/', (req, res) => {
    server.use(express.static(path.resolve(__dirname, "client", "build")));
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});