# ServiGo Frontend 📱

## 🌟 Project Overview

ServiGo was created out of the need for a transparent, secure, and efficient way to connect local service providers with clients. In a world where finding a reliable tradesperson or caregiver is often challenging, ServiGo offers a centralized, trust-based solution.

### Application Mission:

> Our mission is to empower **local entrepreneurship** and **independent workers** by providing them with a digital platform to post, manage, and grow their services. Simultaneously, we aim to enable users to quickly and confidently find high-quality, verified professionals for all their needs, from one-off repairs to long-term care.

---

### Key Application Features:

* **Advanced Search & Filtering:** Sophisticated search and filtering capabilities, including range selection using UI components like `nouislider`.
* **Authentication Flow:** Secure login, registration, and session management using JWT tokens.
* **Real-Time Chat:** Instant messaging and notifications powered by **Socket.IO**.
* **Media Optimization:** Client-side image compression using `browser-image-compression` to ensure fast uploads.
* **Modern UI:** Utilizes **Bootstrap** and **Bootstrap Icons** for a consistent and responsive design system.

---

## 💻 Frontend Tech Stack

This project is a modern **Vue 3** Single Page Application (SPA) leveraging the following key technologies:

| Category | Technology/Package | Purpose and Note |
| :--- | :--- | :--- |
| **Main Framework** | **Vue 3** | Building the modular and reactive User Interface (UI). |
| **State Management** | **Pinia** | Intuitive and type-safe system for global state management. |
| **Routing** | **vue-router** | Handling application navigation and dynamic routing. |
| **API Communication** | **Axios** | Robust client for asynchronous HTTP requests to the Backend. |
| **Real-Time** | **socket.io-client** | Client library for establishing and managing the persistent chat connection. |
| **UI/Styling** | **Bootstrap, Bootstrap Icons** | Core components and icons for responsive, standardized design. |
| **Optimization** | **browser-image-compression** | Compressing images before upload to improve performance and save bandwidth. |
| **Build Tool** | **Vite** | Fast development server and build tool. |

---

## 🚀 Getting Started

Follow these steps to set up and run the ServiGo Frontend application locally.

### 1. Prerequisites

* [Node.js](https://nodejs.org/en) (LTS recommended)
* The **ServiGo Backend API** must be running (typically on `http://localhost:5000`).

### 2. Installation

1.  Clone the Frontend repository:
    ```bash
    git clone [YOUR_FRONTEND_REPO_URL]
    cd servigo-frontend
    ```
2.  Install all required dependencies:
    ```bash
    npm install
    ```

### 3. Environment Configuration

Create a local environment file (e.g., `.env` or `.env.local`). As this project uses **Vite**, environment variables must be prefixed with `VITE_`.

| Variable | Example Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `"http://localhost:5000/api"` | The base URL for all Axios REST API calls. |
| `VITE_SOCKET_URL` | `"http://localhost:5000"` | The URL for the Socket.IO WebSocket connection. |

### 4. Running the Application

Use the Vite scripts defined in `package.json` to run the application:

* **Development Mode:**
    ```bash
    npm run dev
    ```
* **Production Build:**
    ```bash
    npm run build
    ```

The application will launch in your browser, typically at `http://localhost:5173`.

---

## 💬 Real-Time Chat (Socket.IO) Integration

The chat functionality is integrated using `socket.io-client` and its state is managed globally through **Pinia**. 

### Client-Side Communication Flow:

1.  **Connection Initialization:** The Socket is initialized after successful login, passing the authenticated JWT token for authorization in the handshake.
2.  **State Management:** A dedicated Pinia store handles the Socket instance, manages the connection status, and stores all messages and conversation lists.
3.  **Sending Messages:** The store dispatches actions that emit the `sendMessage` event (e.g., `{ to: userId, content: '...' }`) to the backend.
4.  **Receiving Messages:** The store listens to events like `newMessage` and `messagesRead`, instantly updating the application's state without requiring page reloads.

---

