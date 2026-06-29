# Local Developer Setup Guide

This document describes the prerequisites and steps to run **DevVerse** locally on your workstation.

## Prerequisites

Ensure you have the following installed:
1.  **Node.js** (v18.x or v20.x Recommended)
2.  **npm** (v9.x+)
3.  **PostgreSQL** (v14+)
4.  **Docker Desktop** (running and socket sharing enabled)
5.  **Git**

---

## 1. Database Configuration

1.  Start your local PostgreSQL instance.
2.  Create a database called `devverse`:
    ```sql
    CREATE DATABASE devverse;
    ```

---

## 2. Server Setup

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file from the sample config:
    ```env
    PORT=5000
    DATABASE_URL=postgresql://<user>:<password>@localhost:5432/devverse
    JWT_SECRET=supersecretjwtsigningkeychangeinproduction
    GITHUB_CLIENT_ID=your_github_client_id
    GITHUB_CLIENT_SECRET=your_github_client_secret
    GEMINI_API_KEY=your_gemini_api_key
    DOCKER_SOCKET=/var/run/docker.sock
    ```
4.  Start development server:
    ```bash
    npm run dev
    ```

---

## 3. Client Setup

1.  Navigate to the client directory:
    ```bash
    cd ../client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file:
    ```env
    VITE_API_URL=http://localhost:5000/api
    VITE_GITHUB_CLIENT_ID=your_github_client_id
    ```
4.  Start client development server:
    ```bash
    npm run dev
    ```

---

## 4. Run with Docker Compose (Alternative)

To spin up the entire application stack (Frontend, Backend, PostgreSQL, Prometheus, Grafana) locally:

1.  From the project root directory, verify your environment configurations.
2.  Execute:
    ```bash
    docker-compose up --build
    ```
3.  Access the web interface at `http://localhost:3000`.
