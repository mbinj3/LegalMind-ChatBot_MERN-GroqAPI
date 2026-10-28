const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const userQueryRoute = require('./routes/query');

const server = express();

server.use(cors());
server.use(express.json());

server.use('/user-query', userQueryRoute);

server.use(express.static(path.resolve(__dirname, 'client', 'build')));

server.get('*', (res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

module.exports = server;
