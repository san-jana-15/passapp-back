# 🔐 Password Reset & Authentication API (Node.js + Express + MongoDB)

A simple authentication backend built with **Node.js**, **Express**, and **MongoDB Atlas**.  
It supports **User Registration**, **Login**, **Forgot Password (email-based reset)**, and **Password Reset** functionalities using **Nodemailer**.

---

## 🚀 Features

- 🧾 Register new users with hashed passwords
- 🔑 Secure user login using bcrypt
- ✉️ Send password reset links via email
- 🔁 Reset passwords with secure, time-limited tokens
- ☁️ Fully deployable on **Render** (Backend) and **MongoDB Atlas**

---

## 🏗️ Tech Stack

- **Node.js** + **Express**
- **MongoDB Atlas** (Database)
- **Mongoose**
- **Nodemailer**
- **dotenv** for environment variables
- **bcryptjs** for password hashing
- **crypto** for secure token generation

---

## ⚙️ Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/password-reset-backend.git
   cd password-reset-backend

Create a .env file in the root directory:

PORT=5000
MONGO_URI=your-mongodb-atlas-uri
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
TOKEN_EXPIRE_MINUTES=15

⚠️ Important:

Use a Gmail App Password (not your regular Gmail password).
Follow this guide → https://myaccount.google.com/apppasswords

Your MongoDB URI should look like:

mongodb+srv://<username>:<password>@cluster0.mongodb.net/?appName=Cluster0

Start the server:

npm run dev

API Endpoints
1️⃣ Register User

POST /api/register

Request Body:

{
  "username": "sana",
  "email": "sanjanabaskar05@gmail.com",
  "password": "mypassword123"
}


Response:

{
  "message": "User registered successfully"
}

2️⃣ Login User

POST /api/login

Request Body:

{
  "email": "sanjanabaskar05@gmail.com",
  "password": "mypassword123"
}


Response (Success):

{
  "message": "Login successful"
}


Response (Invalid Password or Email):

{
  "message": "Invalid credentials"
}

3️⃣ Forgot Password

POST /api/forgot-password

Request Body:

{
  "email": "sanjanabaskar05@gmail.com"
}


Response (Success):

{
  "message": "Password reset link sent to your email."
}


If the email doesn’t exist:

{
  "message": "Email not found"
}


Email Example:

Subject: Password Reset Request
You requested to reset your password.
Click below to reset it (valid for 15 minutes):
http://localhost:5173/reset-password/<token>

4️⃣ Reset Password

POST /api/reset-password/:token

Request Body:

{
  "password": "newpassword123"
}


Response (Success):

{
  "message": "Password has been reset successfully"
}


If token is invalid or expired:

{
  "message": "Invalid or expired token"
}

🗄️ Folder Structure
backend/
├── controllers/
│   ├── authController.js
│   ├── forgotPasswordController.js
│   └── resetPasswordController.js
├── models/
│   └── User.js
├── routes/
│   └── authRoutes.js
├── server.js
├── package.json
└── .env

🧩 Deployment (Render)

Push your code to GitHub

Go to https://render.com
 → New Web Service

Connect your repository

Set environment variables under Settings → Environment

Deploy 🎉

Your backend will run at:

https://your-backend-app.onrender.com


Then update your frontend’s API URL in:

// frontend/src/config.js
export const API_BASE_URL = "https://your-backend-app.onrender.com/api";
