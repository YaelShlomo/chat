const ChatNode = require('../models/ChatNode');

// Get all chat nodes
const getAllChatNodes = async (req, res) => {
  try {
    const nodes = await ChatNode.find();
    res.json(nodes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch chat nodes' });
  }
};

// Get single chat node by ID
const getChatNodeById = async (req, res) => {
  try {
    const node = await ChatNode.findById(req.params.id);
    if (!node) return res.status(404).json({ error: 'Chat node not found' });
    res.json(node);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving chat node' });
  }
};

// Create a new chat node
const createChatNode = async (req, res) => {
  try {
    const { text, answer, options, relatedKeywords, isInitial } = req.body;

    const newNode = new ChatNode({
      text,
      answer,
      options,
      relatedKeywords,
      isInitial
    });

    await newNode.save();
    res.status(201).json(newNode);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create chat node' });
  }
};

// Update an existing chat node
const updateChatNode = async (req, res) => {
  try {
    const { text, answer, options, relatedKeywords, isInitial } = req.body;

    const updatedNode = await ChatNode.findByIdAndUpdate(
      req.params.id,
      { text, answer, options, relatedKeywords, isInitial },
      { new: true }
    );

    if (!updatedNode)
      return res.status(404).json({ error: 'Chat node not found for update' });

    res.json(updatedNode);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update chat node' });
  }
};

// Delete a chat node
const deleteChatNode = async (req, res) => {
  try {
    const deletedNode = await ChatNode.findByIdAndDelete(req.params.id);
    if (!deletedNode)
      return res.status(404).json({ error: 'Chat node not found for deletion' });

    res.json({ message: 'Chat node deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete chat node' });
  }
};

module.exports = {
  getAllChatNodes,
  getChatNodeById,
  createChatNode,
  updateChatNode,
  deleteChatNode
};
