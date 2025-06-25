const express = require('express');
const router = express.Router();
const chatNodeController = require('../controllers/chatNodeController');
const ChatNode = require('../models/ChatNode');


// Get all chat nodes (public)
// router.get('/', chatNodeController.getAllChatNodes);

// Create new chat node (admin only)
router.post('/', chatNodeController.createChatNode);

// Update chat node (admin only)
router.put('/:id', chatNodeController.updateChatNode);

// Delete chat node (admin only)
router.delete('/:id', chatNodeController.deleteChatNode);

router.get('/',chatNodeController.getAllChatNodes)

router.get('/:id', async (req, res) => {
    const node = await ChatNode.findById(req.params.id);
    if (!node) return res.status(404).send('Not found');
    res.json(node);
});
  
//   router.get('/', async (req, res) => {
//     const root = await ChatNode.findOne({ isInitial: true });
//     if (!root) return res.status(404).send('Root node not found');
//     res.json(root);
// });

module.exports = router;



