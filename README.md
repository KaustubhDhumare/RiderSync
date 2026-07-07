# Rider Platform (Live Ride Tracker)

A full-stack MERN application built for riders to create, join, and track group rides in real-time. 

## 🛠 Tech Stack
* **Frontend:** React.js (Vite), Tailwind CSS, React Router
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas, Mongoose
* **Real-Time:** Socket.io (for live GPS tracking)
* **Security:** JWT Authentication, bcryptjs, express-rate-limit

## 🚀 Core Features
* **Real-Time GPS Tracking:** Uses WebSockets (Socket.io) to broadcast rider locations to a live room.
* **Secure Authentication:** JWT-based auth with HTTP rate-limiting to prevent brute-force attacks.
* **Password Recovery:** Secure email-based reset flow using Nodemailer, hashed temporary tokens, and NoSQL injection protection.
* **Ride Management:** Create scheduled rides, join active rooms, and track ride history.
* **Profile System:** User dashboards with stat tracking (total rides, distance) and profile updates.

## 🤖 A Note on AI Usage
I believe in transparency and utilizing modern engineering workflows. I used AI (LLMs) as a pair programmer while building this project. It was used to scaffold boilerplate, accelerate debugging, and identify security vulnerabilities (like enforcing rate limits and patching NoSQL injection vectors). 

I did not blindly copy-paste; I architected the system, guided the logic, and understand every line of code in this repository. AI is a tool in my stack, just like React or Node.

## 💻 Local Setup

1. Clone the repository
2. Install dependencies for both frontend and backend:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install

## Create a .env file in the backend with:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173

## Create a .env file in the frontend with:
VITE_API_URL=http://localhost:5000

Backend: nodemon server.js

Frontend: npm run dev
