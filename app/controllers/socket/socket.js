/* const { Message, Chat } = require('./../../models');
const Clients = require('./../../models').clients;
const { Op } = require('sequelize');

class ChatController {
  // Get all chats for a user
  async getUserChats(req, res) {
    try {
      const userId = req.user.id;
      const chats = await Chat.findAll({
        include: [
          {
            model: Message,
            as: 'messages',
            where: {
              [Op.or]: [{ sender_id: userId }, { receiver_id: userId }]
            },
            attributes: []
          }
        ],
        attributes: ['id', 'name', 'created_at', 'updated_at'],
        group: ['Chat.id']
      });

      const chatList = await Promise.all(
        chats.map(async (chat) => {
          const participants = chat.name.split('-');
          const otherUserId = participants.find((id) => id != userId);
          const otherUser = await Clients.findByPk(otherUserId);

          return {
            chatId: chat.id,
            chatName: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User',
            receiverId: otherUserId,
            profileImage: otherUser?.profileImage || '/default-avatar.png',
            createdAt: chat.created_at,
            updatedAt: chat.updated_at
          };
        })
      );

      return res.json(chatList);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch chats', error });
    }
  }

  // Get messages for a specific chat
  async getChatMessages(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;

      const messages = await Message.findAll({
        where: {
          chat_id: chatId,
          [Op.or]: [{ sender_id: userId }, { receiver_id: userId }]
        },
        order: [['created_at', 'ASC']]
      });

      return res.json(messages);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  // Search chats
  async searchChats(req, res) {
    try {
      const { query } = req.query;
      const userId = req.user.id;

      const chats = await Chat.findAll({
        where: {
          searchName: { [Op.like]: `%${query}%` }
        },
        include: [
          {
            model: Message,
            as: 'messages',
            where: {
              [Op.or]: [{ sender_id: userId }, { receiver_id: userId }]
            }
          }
        ]
      });

      return res.json(chats);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to search chats' });
    }
  }

  // Delete message
   async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      const { deleteForAll } = req.body;
      const userId = req.user.id;

      const message = await Message.findByPk(messageId);

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      if (message.sender_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized to delete this message' });
      }

      if (deleteForAll) {
        await message.destroy();
      } else {
        message.content = 'Message deleted';
        message.status = 'deleted';
        await message.save();
      }

      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete message' });
    }
  }
}

module.exports = new ChatController();
 */
