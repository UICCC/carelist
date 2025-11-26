# Assignment 1: Modular Express.js Backend (Phase 2)

**Course:** Modern Web Development  
**Student:** Yash Kumar  
**Submission Deadline:** October 15, 2025  

---

## 📄 Objective

Phase 2 focuses on building a **modular Express.js backend** for our project.  
- Design the data structure for all entities.  
- Implement modular architecture with CRUD logic.  
- Use middlewares and validation for a well-structured API.  

---

## 🗂 Project Structure



---

## 🛠 Implemented Features

### 1. CRUD Operations for Patients

| Method | Endpoint | Description | Status Code |
|--------|----------|-------------|-------------|
| GET    | /patients | Fetch all patients | 200 |
| GET    | /patients/:id | Fetch patient by ID | 200 / 404 |
| POST   | /patients | Add new patient (auto-increment ID) | 201 / 400 |
| PUT    | /patients/:id | Update existing patient | 200 / 400 / 404 |
| DELETE | /patients/:id | Delete patient | 200 / 404 |

> All CRUD operations are implemented in **`patient-model.js`**, routes only call model functions.

---

### 2. Validation

- Implemented using **express-validator**.  
- **POST** and **PUT** routes validate:
  - Name is required  
  - Age must be a positive integer  
  - Gender must be Male, Female, or Other  
  - BloodType is required  
- Returns **400 Bad Request** for invalid input.

---

### 3. Application-Level Middlewares

- `express.json()` and `express.urlencoded()` for request parsing.  
- 404 handler for unknown routes.  
- Error-handling middleware returns **500 Internal Server Error** with logs.

---

### 4. Modular Architecture

- Each feature/entity has its own module folder:  
  - `models` → Handles business logic and CRUD  
  - `routes` → Independent Express Router endpoints  
  - `middlewares` → Validation rules for that entity  

---

### 5. Testing

- All routes tested using **Postman**:
  - GET all, GET by ID, POST, PUT, DELETE  
  - Validation and error handling confirmed  
- Auto-increment ID works correctly for new patients.

---

## 📋 How to Run

1. Install dependencies:

```bash
npm install

