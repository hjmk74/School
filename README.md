# School Dashboard 

A full-stack school management system designed to simplify academic and administrative operations through a centralized dashboard.

The application provides an organized platform for managing students, teachers, classes, lectures, exams, and academic results, supported by a REST API.

## Features

- **Student Management** – Manage student information and records.
- **Teacher Management** – Organize teacher information.
- **Classes & Lectures** – Manage classes and lecture details.
- **Exams & Results** – Handle exams and academic results.
- **Dashboard Analytics** – Present academic and administrative data in a dashboard.
- **REST API Integration** – Connect the frontend with the backend for data management.

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS

**Backend**
- Node.js
- Express.js

**Database**
- MySQL

## Project Structure

```text
School/
└── school-dashboard/
    ├── frontend/
    ├── backend/
    └── .gitignore
```

## Getting Started

### Prerequisites
- Node.js and npm
- MySQL

### Backend Setup

```bash
cd school-dashboard/backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd school-dashboard/frontend
npm install
npm run dev
```

Configure the required environment variables in a `.env` file before running the application. The `.env` file is not included in the repository.

## Architecture

The frontend communicates with a REST API built with Express.js, while MySQL is used for database management.

## Project Goal

To build a practical full-stack application demonstrating frontend development, backend integration, database management, and school management workflows.
