# ServiGo Frontend 📱

## 🌟 Project Overview

The **ServiGo Frontend** provides the user interface for the ServiGo platform. It is designed to be highly intuitive, allowing users to easily search for, offer, and manage services, while maintaining real-time communication with other users.

### Key Application Features:

* **Intuitive Service Search:** Filtering and browsing services by category, location, and keywords.
* **User Authentication Flow:** Secure login, registration, and persistent user sessions using JWT tokens stored locally.
* **Detailed User Profiles:** Functionality to view and manage professional profiles (for providers) and client profiles.
* **Real-Time Chat:** Instant messaging using **Socket.IO** for direct user-to-user communication.
* **Service & Ad Creation:** Forms for posting new service offerings or job requests/ads.
* **Review Management:** Displaying existing ratings and submitting new reviews for service providers.

---

## 💻 Tech Stack (Assumed)

The Frontend is typically built as a Single Page Application (SPA) using a modern JavaScript framework to interact with the ServiGo Backend API.

| Component | Assumed Technology | Purpose |
| :--- | :--- | :--- |
| **Main Framework** | **React / Vue / Angular** | Building the modular and reactive User Interface (UI). |
| **State Management** | **Context API / Redux / Zustand** | Centralized handling of application state (e.g., authenticated user, global data). |
| **API Calls** | **Axios / Fetch** | Handling asynchronous requests to the Backend REST API. |
| **Real-Time** | **Socket.IO-client** | Establishing and managing the persistent connection for chat. |
| **Styling** | **Tailwind CSS / Styled Components** | Responsible for application aesthetics and responsive design. |

---

## 🚀 Getting Started

Follow these steps to set up and run the ServiGo Frontend application locally.

### 1. Prerequisites

* [Node.js](https://nodejs.org/en)
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

Create a local environment file (e.g., `.env` or `.env.local` depending on your framework) and define the backend connection points:

| Variable | Example Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `"http://localhost:5000/api"` | Base URL for all standard REST API calls (login, services, reviews). |
| `VITE_SOCKET_URL` | `"http://localhost:5000"` | URL for the Socket.IO WebSocket connection. |

### 4. Running the Application

Start the application using the designated development script:

```bash
npm run dev
```