# DMS (Document Management System) Project

This repository contains the frontend and backend for the DMS project. Follow these instructions to set up and run the application easily on any new laptop or computer.

## Prerequisites

Before you begin, ensure you have the following installed on your laptop:
- **Node.js** (v14 or higher recommended) - [Download here](https://nodejs.org/)
- **Git** (optional, for cloning the repository) - [Download here](https://git-scm.com/)

## Project Structure

- `dms-backend/`: The Express.js backend API and server.
- `dms-frontend/`: The React.js frontend user interface.

---

## Step 1: Setting up the Backend

1. **Navigate to the backend folder:**
   Open a terminal and go into the backend directory:
   ```bash
   cd dms-backend
   ```

2. **Install dependencies:**
   Run the following command to download all required packages:
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - In the `dms-backend` folder, create a new file named `.env`
   - Copy the contents from `.env.example` into your new `.env` file.
   - Fill in your actual credentials:
     - `MONGO_URI`: Your MongoDB connection string.
     - `EMAIL_USER` & `EMAIL_PASS`: Your Gmail address and an App Password (required for sending emails).
     - `OPENAI_API_KEY`: Your OpenAI API key for AI-related features.
     - `PORT`: Usually `5000` (or another port if 5000 is occupied).

4. **Run the backend server:**
   Start the Node server:
   ```bash
   npm start
   ```

   The backend should now be running on `http://localhost:5000` (or your configured port).

---

## Step 2: Setting up the Frontend

1. **Open a NEW terminal window** (keep the backend running in the first one).
2. **Navigate to the frontend folder:**
   ```bash
   cd dms-frontend
   ```

3. **Install dependencies:**
   Run the following command to install the frontend packages:
   ```bash
   npm install
   ```
   *Note: This might take a few minutes as it downloads React and its libraries.*

4. **Configure Environment Variables:**
   - In the `dms-frontend` folder, create a new file named `.env`
   - Copy the contents from `.env.example` into your new `.env` file.
   - It usually looks like this:
     ```env
     REACT_APP_API_URL=http://localhost:5000
     ```
     Make sure the port matches your backend's port.

5. **Run the frontend app:**
   Start the React application:
   ```bash
   npm start
   ```

   This should automatically open your default web browser and take you to `http://localhost:3000`. If it doesn't, manually go to that URL in your browser.

---

## Troubleshooting

- **MongoDB connection errors:** Make sure your current IP address is whitelisted in your MongoDB Atlas cluster network settings.
- **Port already in use:** If port 5000 or 3000 is used by another app, you can change the `PORT` variable in the backend `.env` file and update `REACT_APP_API_URL` in the frontend `.env` to match the new port.
- **Missing dependencies:** If you get an error like "Module not found", try deleting the `node_modules` folder and `package-lock.json` file in that respective directory and run `npm install` again.
