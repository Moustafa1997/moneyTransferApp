'use strict';
const { Server } = require('socket.io');
const { verifySocketToken } = require('./app/services/jwtSign');
const { Message, Chat } = require('./app/models');
const Clients = require('./app/models').clients;
const { Op } = require('sequelize');

module.exports = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        'https://localhost:3000',
        'http://localhost:3000',
        'https://cnp2152.developer24x7.com'
      ],
      methods: ['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE'],
      allowedHeaders: ['*'],
      credentials: true,
      optionsSuccessStatus: 200,
      exposedHeaders: ['*']
    }
  });

  io.use(verifySocketToken);

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
};

// Helper Functions
async function updateUserStatus(userId, status) {
  await Clients.update({ chatStatus: status, lastSeen: new Date() }, { where: { id: userId } });
}

async function broadcastUserStatuses(io) {
  const onlineUsers = await Clients.findAll({
    where: { chatStatus: 'online' },
    attributes: ['id', 'firstName', 'lastName', 'profileImage', 'lastSeen', 'chatStatus']
  });

  io.emit('updateUserStatuses', onlineUsers.map(formatUserStatus));
}

function formatUserStatus(user) {
  return {
    id: user.id,
    fullName: `${user.firstName} ${user.lastName}`,
    profileImage: user.profileImage || '/default-avatar.png',
    lastSeen: user.lastSeen,
    chatStatus: user.chatStatus
  };
}

async function fetchUserChats(userId) {
  return Chat.findAll({
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
}

async function searchUserChats(query, userId) {
  return Chat.findAll({
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
}

async function formatChatList(chats, userId) {
  return Promise.all(
    chats.map(async (chat) => {
      const participants = chat.name.split('-');
      const otherUserId = participants.find((id) => id != userId);
      const otherUser = await Clients.findByPk(otherUserId);

      return {
        chatId: chat.id,
        chatName: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User',
        receiverId: otherUserId,
        chatStatus: otherUser?.chatStatus || 'offline',
        lastSeen: otherUser?.lastSeen || null,
        profileImage: otherUser?.profileImage || '/default-avatar.png',
        createdAt: chat.created_at,
        updatedAt: chat.updated_at
      };
    })
  );
}

async function getOrCreateChat(senderId, receiverId, roomId) {
  const [user1, user2] = await Promise.all([
    Clients.findOne({ where: { id: senderId } }),
    Clients.findOne({ where: { id: receiverId } })
  ]);

  const searchName = `${user1.firstName} ${user1.lastName} - ${user2.firstName} ${user2.lastName}`;

  let chat = await Chat.findOne({ where: { name: roomId } });
  if (!chat) {
    chat = await Chat.create({ name: roomId, searchName });
  }

  if (!chat?.id) {
    throw new Error('Failed to create or find chat');
  }

  return chat;
}

async function createMessage(senderId, receiverId, content, chatId) {
  return Message.create({
    sender_id: senderId,
    receiver_id: receiverId,
    content,
    chat_id: chatId,
    status: 'sent'
  });
}

async function handleMessageDeletion(message, deleteForAll, roomId, io, userId) {
  if (deleteForAll) {
    await message.destroy();
    io.to(roomId).emit('messageDeleted', {
      messageId: message.id,
      deletedBy: userId,
      deleteForAll
    });
  } else {
    message.content = 'Message deleted';
    message.status = 'deleted';
    await message.save();
    io.to(roomId).emit('messageUpdated', {
      messageId: message.id,
      content: message.content,
      status: message.status
    });
  }
}

function handleError(socket, message, error) {
  console.error(message, error);
  socket.emit('error', { message });
}
