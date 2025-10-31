# American-Sign-Language-Detection-System

## Overview
This project is an **American Sign Language (ASL) Recognition System** integrating **frontend, backend, and a custom ASL model** for real-time gesture recognition. Users can interact via a web interface, while the system processes ASL gestures using a deep learning model and stores necessary data in a PostgreSQL database.

The project demonstrates full-stack development using:

- **Frontend:** Next.js + TypeScript + Chakra UI  
- **Backend:** Spring Boot (Java 21)  
- **Database:** PostgreSQL  
- **ASL Model:** Python-based custom DNN using TensorFlow and MediaPipe  

---

## Architecture
The system has three main layers:

1. **Frontend (Next.js + TypeScript + Chakra UI)**
   - Provides **user authentication** (signup/login) and displays **real-time ASL recognition output**.
   - Uses Chakra UI components for responsive and consistent design.
   - Sends API requests to the backend.

2. **Backend (Spring Boot)**
   - Acts as the **connector** between frontend, database, and ASL model.
   - Exposes REST APIs for:
     - User authentication and management
     - Communication with ASL model via **RestAPI**
     - Data persistence in PostgreSQL
   - **Tech Stack:** Spring Boot 3.5.7, Java 21, Spring Web, Spring Data JPA, PostgreSQL Driver, Lombok, Spring Boot DevTools

3. **ASL Model (Python)**
   - Custom **Deep Neural Network (DNN)** for ASL recognition
   - Uses **TensorFlow** and **MediaPipe** for gesture detection
   - Exposes a **FastAPI endpoint** for the backend to send predictions

---

## Tech Stack
| Layer      | Technology / Framework |
|------------|----------------------|
| Frontend   | Next.js, TypeScript, Chakra UI |
| Backend    | Spring Boot 3.5.7, Java 21, Spring Web, Spring Data JPA, Lombok, PostgreSQL |
| Database   | PostgreSQL |
| ASL Model  | Python, TensorFlow, MediaPipe, Custom DNN, FastAPI |

---

## Features
- **User Authentication:** Signup/Login system  
- **Real-time ASL Recognition:** Detects hand gestures via webcam or uploaded images  
- **Database Integration:** Stores user information and session data  
- **Seamless Integration:** Frontend → Backend → ASL Model communication via REST APIs  and FAST APIs

---

