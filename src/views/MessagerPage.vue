<template>
  <div class="messenger-page">
    <div class="chat-container">
      <!-- Sidebar -->
      <div class="conversations">
        <h3>Conversations</h3>
        <div v-if="loadingConversations">Loading...</div>
        <div v-else>
          <div
            v-for="conv in conversations"
            :key="conv._id"
            :class="['conversation-item', { active: selectedUser && selectedUser._id === (conv.userData?._id || conv._id), unread: conv.unreadCount > 0 }]"
            @click="selectConversation(conv)"
          >
            <img :src="conv.userData?.avatar ? conv.userData.avatar : '/default-avatar.png'" class="avatar" />
            <div class="conv-info">
              <strong>{{ conv.userData?.fullName || 'Unknown User' }}</strong>
            </div>
            <!-- crveni znak ako ima nepročitanih poruka -->
            <span v-if="conv.unreadCount > 0" class="unread-cross">°</span>
          </div>
          <div v-if="!conversations.length" class="no-conv">No conversations yet</div>
        </div>
      </div>

      <!-- Chat -->
      <div class="chat-window" v-if="selectedUser">
        <div class="chat-header">
          <img :src="selectedUser.avatar ? selectedUser.avatar : '/default-avatar.png'" class="avatar" />
          <h3>{{ selectedUser.fullName }}</h3>
        </div>

        <div class="chat-messages" ref="messagesContainer" @scroll="handleScroll">
          <div
            v-for="msg in messages"
            :key="msg._id || msg.tempId"
            :class="['chat-msg', isOwnMessage(msg) ? 'own-msg' : 'other-msg']"
          >
            <div v-if="isImageMessage(msg)" class="msg-text">
              <img :src="msg.content" alt="sent image" class="sent-image" />
            </div>
            <div v-else class="msg-text">
              <span v-html="formatMessage(msg.content)"></span>
            </div>
            <div class="msg-time">
              {{ formatDate(msg.createdAt) }}
              <span class="check-icon" v-if="isOwnMessage(msg)">
                <i v-if="!msg.isRead" class="bi bi-check sent"></i>
                <i v-else class="bi bi-check-all read"></i>
              </span>
            </div>
          </div>
          <div v-if="loadingMore" class="loading-more">Loading older messages...</div>
        </div>

        <!-- Input -->
        <div class="chat-input-wrapper" ref="chatInputWrapper">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            placeholder="Type a message..."
          />
          <input type="file" @change="handleImageUpload" ref="imageInput" style="display:none" />
          <button @click="triggerImageUpload">📎</button>
          <button @click="sendMessage">Send</button>
          <button @click="toggleEmojiPicker">😊</button>

          <div v-if="showEmojiPicker" class="emoji-dropdown">
            <emoji-picker @emoji-click="addEmoji" />
          </div>
        </div>
      </div>

      <div class="chat-placeholder" v-else>
        <p>Select a conversation to start chatting 💬</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'
import { useUserStore } from '../store/user'
import { useRoute } from 'vue-router'
import api from '../services/api'
import { io } from 'socket.io-client'
import 'emoji-picker-element'

const route = useRoute()
const apiBase = 'http://localhost:5000'
const userStore = useUserStore()

const conversations = ref([])
const messages = ref([])
const selectedUser = ref(null)
const newMessage = ref('')
const loadingConversations = ref(false)
const messagesContainer = ref(null)
const showEmojiPicker = ref(false)
const chatInputWrapper = ref(null)
const loadingMore = ref(false)

const skip = ref(0)
const limit = ref(20)
const totalMessages = ref(0)

const socket = io(apiBase, { auth: { token: localStorage.getItem('token') } })

const isOwnMessage = (msg) => {
  if (!msg || !userStore.user) return false
  const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender
  return senderId === userStore.user._id
}

const isImageMessage = (msg) => {
  if (!msg) return false
  return msg.type === 'image' || (typeof msg.content === 'string' && msg.content.startsWith('data:image/'))
}

const scrollToBottom = () => nextTick(() => {
  if (messagesContainer.value)
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
})

const formatDate = (date) => {
  if (!date) return ''
  const msgDate = new Date(date)
  const now = new Date()

  const isToday =
    msgDate.getDate() === now.getDate() &&
    msgDate.getMonth() === now.getMonth() &&
    msgDate.getFullYear() === now.getFullYear()

  const isYesterday =
    msgDate.getDate() === now.getDate() - 1 &&
    msgDate.getMonth() === now.getMonth() &&
    msgDate.getFullYear() === now.getFullYear()

  if (isToday) {
    return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (isYesterday) {
    return `Jučer u ${msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return msgDate.toLocaleString([], {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

const formatMessage = (text) => {
  const escaped = text.replace(/</g, "&lt;").replace(/>/g, "&gt;")
  return escaped
}

async function loadConversations() {
  try {
    loadingConversations.value = true
    const res = await api.get('/messages/conversations')
    const convs = res.data

    const populated = await Promise.all(convs.map(async conv => {
      const userId = conv.user || conv._id
      try {
        const userRes = await api.get(`/users/${userId}`)
        const user = userRes.data

        // ✅ Pretvori Buffer u Base64 ako postoji avatar
        if (user.avatar && user.avatar.data) {
          const base64 = btoa(
            new Uint8Array(user.avatar.data.data)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          )
          user.avatar = `data:image/jpeg;base64,${base64}`
        } else if (typeof user.avatar === 'string') {
          user.avatar = apiBase + user.avatar
        }

        return {
          ...conv,
          userData: user,
          unreadCount: conv.lastMessage && !isOwnMessage(conv.lastMessage) && !conv.lastMessage.isRead ? 1 : 0
        }
      } catch {
        return { ...conv, userData: null }
      }
    }))

    conversations.value = populated
  } catch (err) {
    console.error(err)
  } finally {
    loadingConversations.value = false
  }
}

async function selectConversation(conv) {
  const user = conv.userData
  if (!user) return
  selectedUser.value = user
  skip.value = 0
  messages.value = []
  await loadMessages()
  await nextTick()
  scrollToBottom()
  markAsRead(user._id)
}

async function loadMessages(loadMore = false) {
  if (!selectedUser.value) return
  try {
    const res = await api.get(`/messages/${selectedUser.value._id}?skip=${skip.value}&limit=${limit.value}`)
    const { messages: fetchedMessages, total } = res.data
    totalMessages.value = total

    if (loadMore) {
      messages.value = [...fetchedMessages, ...messages.value]
    } else {
      messages.value = fetchedMessages
    }
  } catch (err) {
    console.error('Error loading messages:', err)
  }
}

function handleScroll() {
  const container = messagesContainer.value
  if (!container || loadingMore.value || messages.value.length >= totalMessages.value) return

  if (container.scrollTop < 100) {
    loadOlderMessages()
  }
}

async function loadOlderMessages() {
  if (messages.value.length >= totalMessages.value) return
  loadingMore.value = true
  const oldScrollHeight = messagesContainer.value.scrollHeight

  skip.value += limit.value
  await loadMessages(true)
  await nextTick()
  messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight - oldScrollHeight
  loadingMore.value = false
}

function markAsRead(otherUserId) {
  socket.emit('markRead', { conversationWith: otherUserId })
  const conv = conversations.value.find(c => c.userData?._id === otherUserId)
  if (conv) conv.unreadCount = 0
}

function sendMessage() {
  if (!newMessage.value.trim() || !selectedUser.value) return
  const temp = {
    tempId: Date.now(),
    sender: { _id: userStore.user._id },
    receiver: selectedUser.value._id,
    content: newMessage.value,
    type: 'text',
    createdAt: new Date().toISOString(),
    isRead: false
  }
  messages.value.push(temp)
  scrollToBottom()
  socket.emit('sendMessage', { to: selectedUser.value._id, content: temp.content, type: 'text' })
  newMessage.value = ''
}

function triggerImageUpload() {
  document.querySelector('input[type="file"]').click()
}

function handleImageUpload(e) {
  const file = e.target.files[0]
  if (!file || !selectedUser.value) return
  const reader = new FileReader()
  reader.onload = () => {
    const base64 = reader.result
    const temp = {
      tempId: Date.now(),
      sender: { _id: userStore.user._id },
      receiver: selectedUser.value._id,
      content: base64,
      type: 'image',
      createdAt: new Date().toISOString(),
      isRead: false
    }
    messages.value.push(temp)
    scrollToBottom()
    socket.emit('sendMessage', { to: selectedUser.value._id, content: base64, type: 'image' })
  }
  reader.readAsDataURL(file)
}

function toggleEmojiPicker() {
  showEmojiPicker.value = !showEmojiPicker.value
}

function addEmoji(event) {
  newMessage.value += event.detail.unicode
  showEmojiPicker.value = false
}

function handleClickOutside(event) {
  if (chatInputWrapper.value && !chatInputWrapper.value.contains(event.target)) {
    showEmojiPicker.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await loadConversations()

  const targetUserId = route.query.userId
  if (targetUserId) {
    const foundConv = conversations.value.find(c => c.userData?._id === targetUserId)
    if (foundConv) {
      await selectConversation(foundConv)
    } else {
      try {
        const res = await api.get(`/users/${targetUserId}`)
        if (res.data) {
          const user = res.data
          if (user.avatar && user.avatar.data) {
            const base64 = btoa(
              new Uint8Array(user.avatar.data.data)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
            )
            user.avatar = `data:image/jpeg;base64,${base64}`
          } else if (typeof user.avatar === 'string') {
            user.avatar = apiBase + user.avatar
          }
          selectedUser.value = user
        }
      } catch (err) {
        console.error('❌ Greška pri otvaranju chata:', err)
      }
    }
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

socket.on('newMessage', (msg) => {
  if (selectedUser.value && (msg.sender._id === selectedUser.value._id || msg.receiver._id === selectedUser.value._id)) {
    messages.value.push(msg)
    scrollToBottom()
    markAsRead(msg.sender._id)
  }
  loadConversations()
})

socket.on('messagesRead', ({ readerId }) => {
  if (selectedUser.value && selectedUser.value._id === readerId) {
    messages.value.forEach(msg => { if (isOwnMessage(msg)) msg.isRead = true })
  }
})

watch(() => userStore.user?._id, (newVal) => { if (newVal) loadConversations() }, { immediate: true })
</script>

<style scoped>
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

.conversations {
  width: 30%;
  border-right: 1px solid #eee;
  padding: 1rem;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
  position: relative;
}

/* 💡 Siva pozadina za nepročitane poruke */
.conversation-item.unread {
  background: #e0e0e0;
}

.conversation-item:hover {
  background: #f3f3f3;
}
.conversation-item.active {
  background: #e8f0fe;
}

.avatar {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50px;
}

.conv-info {
  flex: 1;
}

/* 🔴 Crveni znak "×" za nepročitane poruke */
.unread-cross {
  color: red;
  font-weight: bold;
  font-size: 1.2rem;
  margin-left: 0.5rem;
}

.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 🔹 Ostatak stila ostaje isti */
.chat-header { padding: 1rem; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 1rem; }
.chat-messages { flex: 1; padding: 1rem; overflow-y: auto; background: #f9fafb; display: flex; flex-direction: column; max-height: 500px; scroll-behavior: smooth; }
.chat-msg { margin-bottom: 0.8rem; max-width: 70%; padding: 0.6rem 1rem; border-radius: 15px; word-wrap: break-word; }
.chat-msg.own-msg { background: #007bff; color: #fff; align-self: flex-end; text-align: right; }
.chat-msg.other-msg { background: #eaeaea; color: #000; align-self: flex-start; text-align: left; }
.msg-time { font-size: 0.7rem; margin-top: 0.2rem; opacity: 0.85; text-align: right; }
.chat-input-wrapper { position: relative; display: flex; border-top: 1px solid #eee; padding: 0.75rem; align-items: center; }
.chat-input-wrapper input { flex: 1; padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid #ccc; outline: none; }
.chat-input-wrapper button { background: #007bff; color: white; border: none; border-radius: 6px; padding: 0.5rem 1rem; margin-left: 0.5rem; cursor: pointer; }
.chat-input-wrapper button:hover { background: #0056b3; }
.emoji-dropdown { position: absolute; bottom: 50px; right: 0; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border-radius: 8px; overflow: hidden; }
.chat-placeholder { flex: 1; display: flex; align-items: center; justify-content: center; color: #666; font-size: 1.1rem; }
.sent-image { max-width: 200px; border-radius: 12px; }
.loading-more { text-align: center; color: #666; padding: 0.5rem; font-size: 0.9rem; }
</style>
