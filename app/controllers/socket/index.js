'use strict';
const { Message } = require('./../../models');
const Clients = require('./../../models').clients;
const { Op } = require('sequelize');
const {
  updateUserStatus,
  broadcastUserStatuses,
  fetchUserChats,
  searchUserChats,
  formatChatList,
  getOrCreateChat,
  createMessage,
  handleMessageDeletion,
  handleError
} = require('./helper');

function setupSocketHandlers(io) {
  io.on('connection', async (socket) => {
    const userId = socket.user.id;

    await updateUserStatus(userId, 'online');
    await broadcastUserStatuses(io);

    socket.on('joinRoom', async ({ receiverId }) => {
      const roomId = [userId, receiverId].sort().join('-');
      socket.join(roomId);

      const receiverStatus = await Clients.findByPk(receiverId, {
        attributes: ['chatStatus', 'lastSeen']
      });

      socket.emit('userStatus', {
        userId: receiverId,
        chatStatus: receiverStatus?.chatStatus || 'offline',
        lastSeen: receiverStatus?.lastSeen || null
      });
    });

    socket.on('fetchChats', async () => {
      try {
        const chats = await fetchUserChats(userId);
        const chatList = await formatChatList(chats, userId);
        socket.emit('chatsList', chatList);
      } catch (err) {
        handleError(socket, 'Failed to load chat list.', err);
      }
    });

    socket.on('searchChats', async ({ query }) => {
      try {
        const chats = await searchUserChats(query, userId);
        const searchResults = await formatChatList(chats, userId);
        socket.emit('chatsSearchResult', searchResults);
      } catch (err) {
        handleError(socket, 'Failed to search chats.', err);
      }
    });

    socket.on('fetchChatMessages', async ({ chatId }) => {
      try {
        const messages = await Message.findAll({
          where: {
            chat_id: chatId,
            [Op.or]: [{ sender_id: userId }, { receiver_id: userId }]
          },
          order: [['created_at', 'ASC']]
        });
        socket.emit('chatMessages', messages);
      } catch (err) {
        handleError(socket, 'Failed to load chat messages.', err);
      }
    });

    socket.on('typing', ({ receiverId, isTyping }) => {
      const roomId = [userId, receiverId].sort().join('-');
      socket.to(roomId).emit('typing', {
        senderId: userId,
        senderName: `${socket.user.firstName} ${socket.user.lastName}`,
        isTyping
      });
    });

    socket.on('sendMessage', async ({ receiverId, content }) => {
      try {
        const roomId = [userId, receiverId].sort().join('-');
        const chat = await getOrCreateChat(userId, receiverId, roomId);
        const newMessage = await createMessage(userId, receiverId, content, chat.id);

        const messageData = {
          ...newMessage.toJSON(),
          senderName: `${socket.user.firstName} ${socket.user.lastName}`,
          senderProfileImage: socket.user.profileImage || '/default-avatar.png'
        };

        io.to(roomId).emit('newMessage', messageData);
      } catch (err) {
        handleError(socket, 'Error sending message.', err);
      }
    });

    socket.on('deleteMessage', async ({ messageId, deleteForAll }) => {
      try {
        const message = await Message.findByPk(messageId);
        if (!message) {
          return socket.emit('error', { message: 'Message not found.' });
        }
        if (message.sender_id !== userId) {
          return socket.emit('error', { message: 'You can only delete your own messages.' });
        }

        const roomId = [userId, message.receiver_id].sort().join('-');
        await handleMessageDeletion(message, deleteForAll, roomId, io, userId);
      } catch (err) {
        handleError(socket, 'Error deleting message.', err);
      }
    });

    socket.on('disconnect', async () => {
      await updateUserStatus(userId, 'offline');
      await broadcastUserStatuses(io);
    });
  });
}

module.exports = setupSocketHandlers;
