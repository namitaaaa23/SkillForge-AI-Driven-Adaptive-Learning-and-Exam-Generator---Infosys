# SkillForge AI – Backend

The **SkillForge AI Backend** is a Spring Boot–based RESTful service that powers the core functionality of the SkillForge AI Adaptive Learning Platform.  
It handles authentication, role-based access control, assessments, and secure API communication between the frontend and future AI/database layers.

---

## 🚀 Key Responsibilities
- Secure user authentication using JWT
- Role-based access for Learner, Admin, and Guardian
- Assessment and exam-related APIs
- Backend foundation for AI-based exam generation
- Scalable and modular architecture

---

## 🏗️ Architecture
The backend follows a **layered Spring Boot architecture**:

Controller → Service → Repository → Database (Planned)
↓
Security (JWT)


This ensures clean separation of concerns and easy future expansion.

---

## 👥 Supported Roles
- **Learner/User** – Assessments, progress APIs
- **Admin/Instructor** – User & test management
- **Guardian** – Ward monitoring and analytics

Role access is enforced using **Spring Security + JWT**.

---

## 🛠️ Tech Stack
| Layer | Technology |
|-----|-----------|
| Language | Java |
| Framework | Spring Boot |
| Security | Spring Security, JWT |
| Build Tool | Maven |
| API Type | REST |
| Database | Planned (MongoDB / MySQL) |
| AI Layer | Planned |

---

## 📂 Project Structure
backend/
├── src/main/java/com/skillforge
│ ├── controller
│ ├── service
│ ├── repository
│ ├── model
│ ├── dto
│ ├── security
│ └── exception
│
├── src/main/resources
│ └── application.properties
│
├── API_DOCUMENTATION.md
├── pom.xml
├── mvnw.cmd
├── run-maven.bat
└── README.md


---

## 🔐 Security
- JWT-based authentication
- Stateless session handling
- Custom authentication filter
- Role-based endpoint protection

Main security files:
- `JwtUtil.java`
- `JwtAuthFilter.java`
- `SecurityConfig.java`

---

## 🌐 APIs
- Authentication APIs
- Test & assessment APIs
- User management endpoints
- Health check endpoint

📄 Full API list available in **API_DOCUMENTATION.md**

---

## ▶️ Running the Backend

### Prerequisites
- Java 17+
- Maven

### Run using Maven
```bash
cd backend
mvn spring-boot:run

###Windows Shortcut
run-maven.bat


###Server runs at:

http://localhost:8080
