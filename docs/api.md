# API Specification

This document details the REST API endpoints exposed by the **DevVerse** backend.

All requests and responses use the JSON payload format. Authentication is performed via `Authorization: Bearer <JWT_TOKEN>`.

---

## 1. Authentication (`/api/auth`)

### Register User
*   **Method / Path:** `POST /api/auth/register`
*   **Request Body:**
    ```json
    {
      "username": "johndoe",
      "email": "john@example.com",
      "password": "strongpassword123"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": { "id": "1", "username": "johndoe", "email": "john@example.com" }
    }
    ```

### Login User
*   **Method / Path:** `POST /api/auth/login`
*   **Request Body:**
    ```json
    {
      "email": "john@example.com",
      "password": "strongpassword123"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": { "id": "1", "username": "johndoe", "email": "john@example.com" }
    }
    ```

### GitHub OAuth Initiative
*   **Method / Path:** `GET /api/auth/github`
*   **Description:** Redirects user to GitHub for OAuth sign-in.

### GitHub OAuth Callback
*   **Method / Path:** `GET /api/auth/github/callback`
*   **Description:** Internal callback handler to exchange code for access tokens, then signs JWT for user.

### Current User Context
*   **Method / Path:** `GET /api/auth/me`
*   **Headers:** `Authorization: Bearer <token>`
*   **Response (200 OK):**
    ```json
    {
      "id": "1",
      "username": "johndoe",
      "email": "john@example.com",
      "githubConnected": true
    }
    ```

---

## 2. Projects (`/api/projects`)

### List Projects
*   **Method / Path:** `GET /api/projects`
*   **Response (200 OK):**
    ```json
    [
      {
        "id": "proj_101",
        "name": "DevVerse Client",
        "repositoryUrl": "https://github.com/user/devverse-client",
        "status": "Active",
        "createdAt": "2026-06-29T12:00:00Z"
      }
    ]
    ```

### Create Project
*   **Method / Path:** `POST /api/projects`
*   **Request Body:**
    ```json
    {
      "name": "DevVerse Client",
      "repositoryUrl": "https://github.com/user/devverse-client"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "id": "proj_101",
      "name": "DevVerse Client",
      "repositoryUrl": "https://github.com/user/devverse-client",
      "status": "Active"
    }
    ```

### View Project
*   **Method / Path:** `GET /api/projects/:id`
*   **Response (200 OK):**
    ```json
    {
      "id": "proj_101",
      "name": "DevVerse Client",
      "repositoryUrl": "https://github.com/user/devverse-client",
      "status": "Active",
      "dockerImages": [],
      "deployments": []
    }
    ```

### Update Project
*   **Method / Path:** `PUT /api/projects/:id`
*   **Request Body:**
    ```json
    {
      "name": "DevVerse Client UI"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "id": "proj_101",
      "name": "DevVerse Client UI",
      "repositoryUrl": "https://github.com/user/devverse-client"
    }
    ```

### Delete Project
*   **Method / Path:** `DELETE /api/projects/:id`
*   **Response (204 No Content):** (Success)

---

## 3. GitHub Integration (`/api/github`)

### List Connected Repositories
*   **Method / Path:** `GET /api/github/repos`
*   **Response (200 OK):**
    ```json
    [
      { "name": "my-react-app", "fullName": "johndoe/my-react-app", "url": "..." },
      { "name": "express-server", "fullName": "johndoe/express-server", "url": "..." }
    ]
    ```

### List Repo Branches
*   **Method / Path:** `GET /api/github/repos/:owner/:repo/branches`
*   **Response (200 OK):**
    ```json
    [ "main", "develop", "feature/auth" ]
    ```

### List Branch Commits
*   **Method / Path:** `GET /api/github/repos/:owner/:repo/commits?branch=main`
*   **Response (200 OK):**
    ```json
    [
      { "sha": "abc1234", "message": "Initial structure setup", "author": "John Doe", "date": "2026-06-29T12:00:00Z" }
    ]
    ```

---

## 4. Docker Management (`/api/docker`)

### List Images
*   **Method / Path:** `GET /api/docker/images`
*   **Response (200 OK):**
    ```json
    [
      { "id": "sha256:1234abcd...", "repository": "devverse-client", "tag": "latest", "size": "150MB" }
    ]
    ```

### Build Image
*   **Method / Path:** `POST /api/docker/build`
*   **Request Body:**
    ```json
    {
      "projectId": "proj_101",
      "tag": "v1.0.0",
      "dockerfilePath": "./Dockerfile"
    }
    ```
*   **Response (202 Accepted):**
    ```json
    {
      "jobId": "job_docker_901",
      "status": "Building"
    }
    ```

### Push Image
*   **Method / Path:** `POST /api/docker/push`
*   **Request Body:**
    ```json
    {
      "imageId": "sha256:1234abcd...",
      "registry": "docker.io/johndoe/devverse-client"
    }
    ```
*   **Response (202 Accepted):**
    ```json
    {
      "jobId": "job_docker_push_902",
      "status": "Pushing"
    }
    ```

### Delete Image
*   **Method / Path:** `DELETE /api/docker/images/:id`
*   **Response (200 OK):**
    ```json
    {
      "message": "Image deleted successfully"
    }
    ```

---

## 5. CI/CD & GitHub Actions (`/api/cicd`)

### Get Workflow History
*   **Method / Path:** `GET /api/cicd/workflows/:owner/:repo`
*   **Response (200 OK):**
    ```json
    [
      { "id": 1234567, "name": "Build & Deploy", "status": "completed", "conclusion": "success", "runNumber": 42 }
    ]
    ```

---

## 6. Deployments (`/api/deployments`)

### Deploy to AWS EC2
*   **Method / Path:** `POST /api/deployments`
*   **Request Body:**
    ```json
    {
      "projectId": "proj_101",
      "environment": "Production",
      "dockerImage": "devverse-client:latest"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "deploymentId": "dep_303",
      "status": "In Progress"
    }
    ```

### Deployment History
*   **Method / Path:** `GET /api/deployments/history?projectId=proj_101`
*   **Response (200 OK):**
    ```json
    [
      { "id": "dep_303", "status": "Success", "duration": "45s", "createdAt": "2026-06-29T12:05:00Z" }
    ]
    ```

---

## 7. AI Assistant (`/api/ai`)

### Explain Errors
*   **Method / Path:** `POST /api/ai/explain-error`
*   **Request Body:**
    ```json
    {
      "logs": "npm ERR! code ELIFECYCLE\nnpm ERR! errno 1\nnpm ERR! myapp@1.0.0 start: `node app.js`..."
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "explanation": "The error suggests that node failed to find or run the start entrypoint...",
      "solution": "1. Ensure app.js exists. 2. Verify dependencies..."
    }
    ```

### Generate Dockerfile
*   **Method / Path:** `POST /api/ai/generate-dockerfile`
*   **Request Body:**
    ```json
    {
      "projectType": "Node.js (Vite)",
      "nodeVersion": "18-alpine",
      "port": 3000
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "dockerfile": "FROM node:18-alpine\nWORKDIR /app\n..."
    }
    ```

---

## 8. Monitoring (`/api/monitoring`)

### Get Health & Metrics Summary
*   **Method / Path:** `GET /api/monitoring/metrics`
*   **Response (200 OK):**
    ```json
    {
      "cpuUsage": 42.5,
      "ramUsage": 68.2,
      "networkIn": "1.2 MB/s",
      "networkOut": "4.5 MB/s",
      "activeContainers": 4
    }
    ```
