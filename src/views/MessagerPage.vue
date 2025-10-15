<template>
  <div class="messenger-page">
    <div class="chat-container">
      <!-- Conversation list -->
      <div class="conversations">
        <h3>Conversations</h3>
        <div v-if="loadingConversations">Loading...</div>
        <div v-else>
          <div
            v-for="conv in conversations"
            :key="conv._id"
            :class="[
              'conversation-item',
              { 
                active: selectedUser && selectedUser._id === conv._id,
                'unread': conv.unreadCount > 0,
                'highlight': isLastMessageUnread(conv) // highlight if last message is unread
              }
            ]"
            @click="selectConversation(conv)"
          >
            <img :src="conv.avatar ? apiBase + conv.avatar : '/default-avatar.png'" alt="avatar" class="avatar" />
            <div class="conv-info">
              <strong>{{ conv.fullName }}</strong>
            </div>
          </div>
          <div v-if="!conversations.length" class="no-conv">No conversations yet</div>
        </div>
      </div>

      <!-- Chat window -->
      <div class="chat-window" v-if="selectedUser">
        <div class="chat-header">
          <img :src="selectedUser.avatar ? apiBase + selectedUser.avatar : '/default-avatar.png'" alt="avatar" class="avatar" />
          <h3>{{ selectedUser.fullName }}</h3>
        </div>

        <div class="chat-messages" ref="messagesContainer">
          <div
            v-for="msg in messages"
            :key="msg._id || msg.tempId"
            :class="['chat-msg', isOwnMessage(msg) ? 'own-msg' : 'other-msg']"
          >
            <div class="msg-text">{{ msg.content }}</div>
            <div class="msg-time">
              {{ formatDate(msg.createdAt) }}
              <span class="check-icon" v-if="isOwnMessage(msg)">
                <i v-if="!msg.isRead" class="bi bi-check sent"></i>
                <i v-else class="bi bi-check-all read"></i>
              </span>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            placeholder="Type a message..."
          />
          <button @click="sendMessage">Send</button>
        </div>
      </div>

      <div class="chat-placeholder" v-else>
        <p>Select a conversation to start chatting 💬</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { useUserStore } from '../store/user'
import { useRoute } from 'vue-router'
import api from '../services/api'
import { io } from 'socket.io-client'

const apiBase = 'http://localhost:5000'
const userStore = useUserStore()
const route = useRoute()

const conversations = ref([])
const messages = ref([])
const selectedUser = ref(null)
const newMessage = ref('')
const loadingConversations = ref(false)
const messagesContainer = ref(null)

const socket = io(apiBase, {
  auth: { token: localStorage.getItem('token') }
})

// check if the message is sent by the current user
function isOwnMessage(msg) {
  const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender
  return senderId === userStore.user?._id
}

// check if the last message of a conversation is unread
function isLastMessageUnread(conv) {
  if (!conv.lastMessage) return false
  // find the last message in the messages array
  const lastMsg = messages.value.find(m => m._id === conv.lastMessage._id)
  
  if (!lastMsg) return false

  // return true if the message is unread and not sent by the current user
  return !lastMsg.isRead && !isOwnMessage(lastMsg)
}

// get the content of the last message
function getLastMessageContent(conv) {
  if (!conv.lastMessage) return ''
  return conv.lastMessage.content || ''
}

// Socket listener: receive new message
socket.on('newMessage', (msg) => {
  if (selectedUser.value && (msg.sender._id === selectedUser.value._id || msg.receiver === selectedUser.value._id)) {
    messages.value.push(msg)
    scrollToBottom()
    markAsRead(msg.sender._id)
  }
  loadConversations()
})

// Socket listener: messages read
socket.on('messagesRead', ({ readerId }) => {
  if (selectedUser.value && selectedUser.value._id === readerId) {
    messages.value.forEach(msg => {
      if (isOwnMessage(msg)) msg.isRead = true
    })
  }
})

// Load all conversations
async function loadConversations() {
  try {
    loadingConversations.value = true
    const res = await api.get('/messages/conversations')
    // add unread count
    conversations.value = res.data.map(conv => ({
      ...conv,
      unreadCount: conv.lastMessage && !conv.lastMessage.isRead && !isOwnMessage(conv.lastMessage) ? 1 : 0
    }))
  } catch (err) {
    console.error('Error loading conversations', err)
  } finally {
    loadingConversations.value = false
  }
}

// select a conversation and load its messages
async function selectConversation(user) {
  selectedUser.value = user
  try {
    const res = await api.get(`/messages/${user._id}`)
    messages.value = res.data || []
    await nextTick()
    scrollToBottom()
    markAsRead(user._id)
  } catch (err) {
    console.error('Error loading messages', err)
    messages.value = []
  }
}

// mark messages as read
async function markAsRead(otherUserId) {
  try {
    await api.post('/messages/markRead', { conversationWith: otherUserId })
    const conv = conversations.value.find(c => c._id === otherUserId)
    if (conv) conv.unreadCount = 0
  } catch (err) {
    console.error('Error marking as read', err)
  }
}

// scroll messages to bottom
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// send a new message
async function sendMessage() {
  if (!newMessage.value.trim() || !selectedUser.value) return

  const payload = { to: selectedUser.value._id, content: newMessage.value.trim() }
  socket.emit('sendMessage', payload)

  // add message locally for instant update
  messages.value.push({
    tempId: Date.now(),
    sender: { _id: userStore.user._id },
    receiver: selectedUser.value._id,
    content: newMessage.value,
    createdAt: new Date().toISOString(),
    isRead: false
  })

  newMessage.value = ''
  await nextTick()
  scrollToBottom()
}

// format message time
function formatDate(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// watch for user changes and reload conversations
watch(
  () => userStore.user?._id,
  (newVal) => {
    if (newVal) loadConversations()
  },
  { immediate: true }
)
</script>

<style scoped>
.conversation-item.highlight {
  background-color: #f0f0f0; /* highlight last unread message */
}

/* Keep your original styles untouched */
.messenger-page {
  display: flex;
  justify-content: center;
  background: #fafafa;
  min-height: 100vh;
  padding: 1rem;
}

.chat-container {
  display: flex;
  width: 100%;
  max-width: 1200px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Sidebar */
.conversations {
  width: 30%;
  border-right: 1px solid #eee;
  padding: 1rem;
  overflow-y: auto;
}

/* Chat list item */
.conversation-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}
.conversation-item:hover {
  background: #f3f3f3;
}
.conversation-item.active {
  background: #e8f0fe;
}
.conversation-item.unread {
  font-weight: 600;
  background: #fff8e1;
}

/* Chat area */
.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Messages container */
.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
  max-height: 70vh;
}

/* Individual messages */
.chat-msg {
  margin-bottom: 0.8rem;
  max-width: 70%;
  padding: 0.6rem 1rem;
  border-radius: 15px;
  word-wrap: break-word;
}

.chat-msg.own-msg {
  background: #007bff;
  color: #fff;
  align-self: flex-end;
  text-align: right;
}

.chat-msg.other-msg {
  background: #eaeaea;
  color: #000;
  align-self: flex-start;
  text-align: left;
}

/* Time + checkmarks */
.msg-time {
  font-size: 0.7rem;
  margin-top: 0.2rem;
  opacity: 0.85;
  text-align: right;
}
.msg-time i {
  margin-left: 4px;
  font-size: 0.8rem;
}
.msg-time i.sent {
  color: #ccc;
}
.msg-time i.read {
  color: #0d6efd;
}

.chat-msg.own-msg .msg-time {
  color: #fff;
}
.chat-msg.other-msg .msg-time {
  color: #555;
}

/* Input */
.chat-input {
  display: flex;
  border-top: 1px solid #eee;
  padding: 0.75rem;
}
.chat-input input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  outline: none;
}
.chat-input button {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  margin-left: 0.5rem;
  cursor: pointer;
}
.chat-input button:hover {
  background: #0056b3;
}

/* Placeholder */
.chat-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 1.1rem;
}

.check-icon i {
  font-size: 0.8rem;
  margin-left: 4px;
  vertical-align: middle;
}

.check-icon i.text-primary {
  color: #0d6efd; /* blue */
}

</style>
