# AI Notes Vault 🧠📚

AI Notes Vault is a full-stack AI-powered note management application that allows users to create, organize, and manage notes while automatically generating summaries and key points using AI. Users can also upload PDF files and extract summarized information from them.

The project integrates a **React frontend**, **Flask backend**, **MongoDB database**, and **Groq AI models** to build an intelligent note-taking system.

---

## Features

- User authentication (register and login)
- Secure password hashing
- Create and store notes
- AI-generated summaries
- AI-generated key points extraction
- Upload PDF files and extract text
- Automatic summarization of PDF content
- Tag notes for organization
- Star important notes
- Delete notes
- Full-stack architecture

---

## AI Capabilities

The system uses **Groq's LLaMA-3.1-8B model** to perform natural language processing tasks:

- Generate concise summaries from long text
- Extract key points
- Process text extracted from PDFs

---

## Tech Stack

### Frontend
- React
- JavaScript
- Tailwind CSS
- PostCSS

### Backend
- Python
- Flask
- Flask-CORS

### Database
- MongoDB Atlas
- PyMongo

### AI Integration
- Groq API (LLaMA-3.1-8B)

### File Processing
- PyPDF2
- PyMuPDF (fitz)

### Security
- Werkzeug password hashing
- Environment variables for secrets

---
## Environment Variables

Sensitive credentials are stored using environment variables.



## API Endpoints

### Authentication

| Method | Endpoint | Description |
|------|------|------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login a user |

### Notes

| Method | Endpoint | Description |
|------|------|------|
| POST | /api/notes | Create a note |
| GET | /api/notes | Retrieve notes |
| DELETE | /api/notes/<note_id> | Delete note |
| POST | /api/notes/<note_id>/toggle-star | Toggle star |

### PDF Processing

| Method | Endpoint | Description |
|------|------|------|
| POST | /api/notes/upload-pdf | Upload and summarize PDF |

### Health Check

| Method | Endpoint | Description |
|------|------|------|
| GET | /api/health | Check backend status |

---

## Application Workflow

Users interact with the React frontend to create notes or upload PDF files.  
The frontend sends requests to the Flask backend through REST APIs.  
The backend processes text, sends it to the Groq AI model for summarization and key point extraction, and stores the processed notes in MongoDB.  
Users can then view, organize, star, or delete their notes.

---
