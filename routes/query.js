const express = require('express');
const {userQuery} = require('../controller/query');


const router = express.Router();

router.post('/case-details', userQuery);

module.exports = router;