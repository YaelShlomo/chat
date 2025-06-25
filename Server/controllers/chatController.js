const Chat = require('../models/Chat');
const ChatNode = require('../models/ChatNode');
const mongoose = require('mongoose');

const createMessage = async (req, res) => {
  const { message, selectedOptionText, currentChatNodeId } = req.body;

  try {
    const userName = req.user?.name || 'משתמש';

    // התחלה – שליחת שאלה ראשונית
    if (!selectedOptionText && !currentChatNodeId && message) {
      const initialChatNode = await ChatNode.findOne({ isInitial: true });

      const reply = `הי ${userName}`;

      if (initialChatNode) {
        return await saveAndReply({
          req,
          res,
          message,
          reply: initialChatNode.text,
          chatNodeId: initialChatNode._id,
          options: initialChatNode.options
        });
      } else {
        const allNodes = await ChatNode.find();
        return await saveAndReply({
          req,
          res,
          message,
          reply: `${reply}, איך אפשר לעזור?`,
          options: allNodes
        });
      }
    }

    // המשך – בחירה באופציה קיימת
    if (selectedOptionText && currentChatNodeId) {
      const currentChatNode = await ChatNode.findById(currentChatNodeId);
      const selectedOption = currentChatNode?.options.find(opt => opt.text === selectedOptionText);

      if (!selectedOption)
        return res.status(400).json({ reply: 'אפשרות לא נמצאה' });

      // תשובה סופית
      if (selectedOption.finalAnswerId) {
        const finalAnswer = await ChatNode.findById(selectedOption.finalAnswerId);
        if (!finalAnswer)
          return res.status(404).json({ reply: 'תשובה סופית לא נמצאה' });

        return await saveAndReply({
          req,
          res,
          message,
          reply: finalAnswer.answer
        });
      }

      // מעבר לשאלה הבאה
      if (selectedOption.nextChatNodeId) {
        const nextChatNode = await ChatNode.findById(selectedOption.nextChatNodeId);
        if (!nextChatNode)
          return res.status(404).json({ reply: 'שאלה הבאה לא נמצאה' });

        return await saveAndReply({
          req,
          res,
          message,
          selectedOptionText,
          currentChatNodeId,
          reply: nextChatNode.text,
          chatNodeId: nextChatNode._id,
          options: nextChatNode.options
        });
      }

      return res.status(400).json({ reply: 'לא נמצאה תשובה מתאימה' });
    }

    // חיפוש לפי מילת מפתח
    const keywordChatNodes = await ChatNode.find({ answer: null });
    const matchedChatNode = keywordChatNodes.find(q =>
      q.relatedKeywords?.some(k => message.includes(k))
    );

    if (matchedChatNode) {
      return await saveAndReply({
        req,
        res,
        message,
        selectedOptionText: null,
        currentChatNodeId: null,
        reply: matchedChatNode.text,
        chatNodeId: matchedChatNode._id,
        options: matchedChatNode.options
      });
    }

    return await saveAndReply({
      req,
      res,
      message,
      selectedOptionText: null,
      currentChatNodeId: null,
      reply: 'לא מצאתי שאלה מתאימה.'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ reply: 'שגיאה פנימית בשרת.' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { message, chatNodeId } = req.body;

    if (!message) {
      const firstChatNode = await ChatNode.findOne({ answer: null });
      if (!firstChatNode) {
        return res.json({ reply: 'לא נמצאה שאלה ראשונה' });
      }

      return res.json({
        text: firstChatNode.text,
        options: firstChatNode.options,
        chatNodeId: firstChatNode._id
      });
    }

    const currentChatNode = await ChatNode.findById(chatNodeId);
    if (!currentChatNode) {
      return res.status(404).json({ reply: 'שאלה לא נמצאה' });
    }

    const selectedOption = currentChatNode.options.find(opt => opt.text === message);
    if (!selectedOption) {
      return res.status(400).json({ reply: 'לא הבנתי את הבחירה שלך' });
    }

    const nextChatNode = await ChatNode.findById(selectedOption.nextChatNodeId);
    if (!nextChatNode) {
      return res.status(404).json({ reply: 'לא נמצאה שאלה להמשיך אליה' });
    }

    return res.json({
      text: nextChatNode.text,
      options: nextChatNode.options,
      chatNodeId: nextChatNode._id
    });
  } catch (err) {
    console.error('שגיאה בשרת:', err.message);
    return res.status(500).json({ reply: 'אירעה שגיאה בשרת' });
  }
};

const saveAndReply = async ({ req, res, message, reply }) => {
  try {
    await Chat.findOneAndUpdate(
      { userId: req.user._id },
      {
        $push: {
          messages: [
            {
              role: 'user',
              content: message,
              timestamp: new Date()
            },
            {
              role: 'bot',
              content: reply,
              timestamp: new Date()
            }
          ]
        }
      },
      { upsert: true, new: true }
    );

    return res.json({ reply });
  } catch (err) {
    console.error('שגיאה בשמירת ההודעות למסד:', err);
    return res.status(500).json({ reply: 'שגיאה בשמירת השיחה למסד' });
  }
};

const returnMessage = async (req, res) => {
  const chat = await Chat.findOne({ userId: req.user.id });
  res.json(chat?.messages || []);
};

const returnAutoMessage = async (req, res) => {
  const { content, role } = req.body;
  const userMessage = new Message({ content, role });
  await userMessage.save();

  const botContent = `הבוט ענה: קיבלתי "${content}"`;
  const botMessage = new Message({ content: botContent, role: 'bot' });
  await botMessage.save();

  res.status(201).json({ userMessage, botMessage });
};

module.exports = {
  createMessage,
  returnMessage,
  returnAutoMessage,
  sendMessage
};
