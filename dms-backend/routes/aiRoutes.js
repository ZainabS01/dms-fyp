const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const aiController = require('../controller/AiController');

// All AI Routes are protected by verifyToken middleware
router.get('/conversations', verifyToken, aiController.getConversations);
router.post('/conversations', verifyToken, aiController.createConversation);
router.post('/conversations/:id/messages', verifyToken, aiController.addMessage);
router.put('/conversations/:id/messages/:messageId', verifyToken, aiController.editMessage);
router.delete('/conversations/:id', verifyToken, aiController.deleteConversation);

module.exports = router;
