const express = require('express');
const chatController=require("../controllers/chatController")
const router = express.Router();

router.post('/',chatController.createMessage);

router.get('/', chatController.returnMessage);

router.post('/api/messages',chatController.returnAutoMessage );

module.exports = router;
