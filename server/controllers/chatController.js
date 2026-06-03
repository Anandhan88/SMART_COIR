const Chat = require('../models/Chat');
const Message = require('../models/Message');

// @desc    Get user's chats
// @route   GET /api/chat
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true,
    })
      .populate('participants', 'name email avatar role')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: chats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get or create chat with user
// @route   POST /api/chat
exports.createChat = async (req, res) => {
  try {
    const { participantId } = req.body;

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, participantId] },
      type: 'direct',
    }).populate('participants', 'name email avatar role');

    if (chat) {
      return res.json({ success: true, data: chat });
    }

    chat = await Chat.create({
      participants: [req.user.id, participantId],
      type: 'direct',
    });

    chat = await Chat.findById(chat._id).populate('participants', 'name email avatar role');
    res.status(201).json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get messages for a chat
// @route   GET /api/chat/:chatId/messages
exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        chat: req.params.chatId,
        sender: { $ne: req.user.id },
        'readBy.user': { $ne: req.user.id },
      },
      {
        $push: { readBy: { user: req.user.id } },
      }
    );

    res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Send message
// @route   POST /api/chat/:chatId/messages
exports.sendMessage = async (req, res) => {
  try {
    const { content, type = 'text', fileUrl, fileName } = req.body;

    const message = await Message.create({
      chat: req.params.chatId,
      sender: req.user.id,
      content,
      type,
      fileUrl,
      fileName,
      readBy: [{ user: req.user.id }],
    });

    // Update chat's last message
    await Chat.findByIdAndUpdate(req.params.chatId, {
      lastMessage: {
        content,
        sender: req.user.id,
        timestamp: new Date(),
      },
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar role');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
