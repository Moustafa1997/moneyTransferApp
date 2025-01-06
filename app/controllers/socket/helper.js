'use strict';

const { Message, Chat } = require('./../../models');
const Clients = require('./../../models').clients;
const { Op } = require('sequelize');

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

module.exports = {
  updateUserStatus,
  broadcastUserStatuses,
  fetchUserChats,
  searchUserChats,
  formatChatList,
  getOrCreateChat,
  createMessage,
  handleMessageDeletion,
  handleError
};
