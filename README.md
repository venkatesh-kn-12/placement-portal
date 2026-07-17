# Placement Portal

A comprehensive placement management platform connecting students, faculty, and administrators.

## Getting Started

### Prerequisites
- Docker
- Java (JDK 17+) & Maven
- Node.js & npm

### Running the Application

Follow these steps to get the application up and running locally:

**1. Start the PostgreSQL Database**
Make sure Docker is running on your machine, then open your terminal and run:
```powershell
docker start placement_postgres
```
*(If you haven't created the container yet, you might need to use `docker-compose up -d` with the provided `docker-compose.yml` file)*

**2. Start the Backend Server**
Open a terminal window, navigate to the backend directory, and run the Maven command to start Spring Boot (runs on port 8081):
```powershell
cd placement-backend
mvn spring-boot:run
```

**3. Start the Frontend Server**
Open a new separate terminal window, navigate to the frontend directory, and start the React dev server:
```powershell
cd placement-frontend
npm run dev
```

Once both backend and frontend servers are active, open the app in your browser:
👉 **http://localhost:5173/**

---

## Test Credentials

Use the following credentials to experience the different interfaces and features:

| Role | Email | Password | Features to Test |
| :--- | :--- | :--- | :--- |
| **Student** | `student@portal.com` | `student123` | Test the onboarding assessment lockdown and floating AI Coach! |
| **Faculty** | `faculty@portal.com` | `faculty123` | Track students and review project/certificate metrics! |
| **Admin** | `admin@portal.com` | `admin123` | Manage user roles and view cohort analytics charts! |

---

## Navigation & Security

### Switching Roles
To access a different role's dashboard (e.g., to access the **Admin page** when logged in as a student), follow these simple steps:

1. **Sign Out**: Click the **Sign Out** button at the very bottom of your sidebar to log out of the current profile.
2. **Access Login Page**: You will be redirected to the login screen.
3. **Enter Credentials**: Enter the credentials for the role you wish to assume (e.g., `admin@portal.com` / `admin123`).
4. **Dashboard Access**: Click **Access Dashboard**. The system will authenticate your role and automatically redirect you to the appropriate dashboard (e.g., `/admin`).

*Note: Role-based security is strictly enforced. If you attempt to directly type an unauthorized URL (like `/admin`) in the browser URL bar while logged in as a student, the security router will block you and redirect you back to `/dashboard`.*
