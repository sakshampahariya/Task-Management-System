# 🚀 Ethara Task Management System

Welcome to the **Ethara Task Management System** – a sleek, highly-responsive platform designed to bring clarity, efficiency, and beauty to team collaboration. Built with a modern tech stack, this application empowers administrators to effortlessly orchestrate projects while giving team members a delightful, frictionless experience for tracking their daily work.

## ✨ Why This Project Exists
Managing tasks shouldn't feel like a chore. This project was born out of the need for a **fast, intuitive, and visually stunning** tool that cuts out the noise. Whether you are leading a team or checking off your daily to-dos, the interface stays out of your way and lets you focus on what actually matters: **getting things done**.

## 🎨 Key Features & Concepts
- **Elegant User Interface**: A meticulously crafted UI using Tailwind CSS, featuring smooth transitions, beautiful gradients, and a fully supported Dark Mode.
- **Role-Based Access Control**: 
  - 👑 **Admins** have full control to create projects, assign tasks, manage priorities, and oversee team members.
  - 👤 **Members** enjoy a streamlined dashboard focused purely on their assigned tasks, with easy status updates.
- **Robust Security**: Secure authentication handling using HTTP-only session cookies to protect user data without the overhead of JWTs.
- **Project-Centric Organization**: Tasks aren't just floating in the void; they are neatly grouped under projects, giving complete context to the work being done.

## 🛠️ Technology Stack
We chose a stack that balances rapid development with production-grade reliability:
- **Frontend**: React (Vite) + Tailwind CSS + Axios
- **Backend**: Flask (Python) + SQLAlchemy
- **Database**: PostgreSQL
- **Deployment**: Configured for seamless deployment on Railway (`Procfile` included)

## 📋 Requirements & Setup

Getting the project running locally is quick and painless.

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up your environment variables (create a `.env` file or export them):
   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/team_task_manager
   SECRET_KEY=your_super_secret_key
   ```
4. Start the Flask server:
   ```bash
   python app.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Node modules:
   ```bash
   npm install
   ```
3. Configure your environment (optional, defaults to localhost:5000):
   ```bash
   VITE_API_URL=http://localhost:5000/api
   ```
4. Spin up the Vite development server:
   ```bash
   npm run dev
   ```

## 🧪 Demo Access
Want to take it for a spin quickly? The login page features **one-click demo credentials** so you can instantly explore both the Admin and Member experiences without creating an account manually! Just click the **Admin Demo** or **Member Demo** buttons on the login screen to auto-fill the forms.
