# Code Editor Application

A real-time collaborative code editor that allows multiple users to join the same room and write code together. Changes in code and programming language are synchronized between users using Socket.IO.

## Features

* Real-time collaborative code editing
* Create/join rooms using a room ID
* Multiple users can work in the same room
* Live code synchronization
* Programming language selection
* Displays users currently in the room
* Prevents duplicate usernames within a room
* Monaco Editor for a VS Code-like editing experience
* Real-time typing indicator
* Session persistence using `sessionStorage`
* Form validation using Zod
* Toast notifications for user feedback

## Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* Monaco Editor
* Socket.IO Client
* Zod
* React Hot Toast
* React Icons
* CSS

### Backend

* Node.js
* Express.js
* Socket.IO
* CORS
* dotenv

## How It Works

1. A user enters their name and room ID.
2. The client connects to the Socket.IO server.
3. The user joins the requested room.
4. The server maintains the room's users, code, and selected language.
5. When a user changes the code, the update is sent to other users in the same room.
6. When the programming language changes, the updated language is synchronized with everyone in the room.
7. Users joining or leaving the room are reflected in the user list.

## Project Structure

```text
Code-Editor-Application/
│
├── Backend/
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
├── Frontend/
│   ├── src/
│   │   ├── assets/
│   │   │   └── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Nandinigoyal01/Code-Editor-Application.git
cd Code-Editor-Application
```

### 2. Setup the Backend

```bash
cd Backend
npm install
```

Create a `.env` file inside the `Backend` folder:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm start
```

For development with Nodemon:

```bash
npm run dev
```

### 3. Setup the Frontend

Open another terminal:

```bash
cd Frontend
npm install
```

Create a `.env` file inside the `Frontend` folder:

```env
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

## Environment Variables

### Frontend

```env
VITE_SOCKET_URL=http://localhost:5000
```

### Backend

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
```

> `.env` files are not included in the repository for security reasons.

## Future Improvements

* Add user authentication
* Store rooms and code in a database
* Add more programming languages
* Add code execution
* Add file/folder support
* Improve conflict handling for simultaneous edits
* Deploy frontend and backend
* Add persistent room history

## Author

**Nandini Goyal**

B.Tech Computer Science & Engineering

GitHub: [Nandinigoyal01](https://github.com/Nandinigoyal01)
