# AI Notes Vault – Backend 🧠

AI Notes Vault is a backend service built with Flask that allows users to create, manage, and organize notes while automatically generating AI-powered summaries and key points. The backend also supports uploading PDF files and extracting their content for AI-based summarization.

This project demonstrates the integration of Flask APIs, MongoDB, and AI models to build an intelligent note management system.

---

## Features

- User authentication (register and login)
- Secure password hashing
- Create and store notes
- AI-generated summaries
- AI-generated key points extraction
- Upload PDF files and extract text
- Automatic summarization of PDF content
- Tag notes for better organization
- Star important notes
- Delete notes
- REST API based backend

---

## AI Capabilities

The backend integrates with Groq's LLaMA-3.1-8B model to perform natural language processing tasks such as:

- Generating concise summaries from long text
- Extracting important key points
- Processing text extracted from uploaded PDFs

---

## Tech Stack

Backend
- Python
- Flask
- Flask-CORS

Database
- MongoDB Atlas
- PyMongo

AI Integration
- Groq API (LLaMA-3.1-8B model)

File Processing
- PyPDF2
- PyMuPDF (fitz)

Security
- Werkzeug password hashing
- Environment variables for secret management


---

## Environment Variables

Sensitive credentials are stored using environment variables like Groq_api_key and mongo_url.



These values are excluded from version control using `.gitignore`.

---

## API Endpoints

Authentication

| Method | Endpoint | Description |
|------|------|------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login a user |

Notes

| Method | Endpoint | Description |
|------|------|------|
| POST | /api/notes | Create a new note |
| GET | /api/notes | Retrieve notes for a user |
| DELETE | /api/notes/<note_id> | Delete a note |
| POST | /api/notes/<note_id>/toggle-star | Toggle star status |

PDF Processing

| Method | Endpoint | Description |
|------|------|------|
| POST | /api/notes/upload-pdf | Upload and summarize PDF |

Health Check

| Method | Endpoint | Description |
|------|------|------|
| GET | /api/health | Verify backend is running |

---

## Workflow

User registers or logs in through the authentication API.  
Notes can be created manually or generated from uploaded PDFs.  
The backend extracts text and sends it to the AI model for summarization and key point extraction.  
Processed notes are stored in MongoDB and can later be retrieved, starred, or deleted.

---





