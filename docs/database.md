# Database Schema

This document details the PostgreSQL schema designed for **DevVerse**.

## Entity Relationship Summary

*   A **User** can own multiple **Projects**.
*   A **Project** belongs to a **User** and can have multiple **DockerImages**, **Workflows**, and **Deployments**.
*   A **Deployment** references a specific **Project** and **DockerImage** (via tag/hash).

---

## 1. Tables Definition

### `users`
Stores user profile information and credentials.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL if logged in via GitHub
    github_id VARCHAR(50) UNIQUE,
    github_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### `projects`
Stores information on developer projects synced to DevVerse.

```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    repository_url VARCHAR(255) NOT NULL,
    branch_default VARCHAR(50) DEFAULT 'main',
    status VARCHAR(20) DEFAULT 'Active', -- Active, Paused, Error
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### `docker_images`
Tracks metadata for Docker images built or pulled through DevVerse.

```sql
CREATE TABLE docker_images (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    image_hash VARCHAR(255) NOT NULL,
    tag VARCHAR(50) NOT NULL,
    size VARCHAR(20),
    status VARCHAR(20) DEFAULT 'Built', -- Built, Pushed, Deleted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### `workflows`
Syncs the CI/CD execution pipeline (GitHub Actions workflow runs) history.

```sql
CREATE TABLE workflows (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    github_run_id BIGINT UNIQUE NOT NULL,
    run_number INTEGER NOT NULL,
    name VARCHAR(100),
    status VARCHAR(50), -- queued, in_progress, completed
    conclusion VARCHAR(50), -- success, failure, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### `deployments`
Tracks execution logs and statuses for AWS EC2 deployments.

```sql
CREATE TABLE deployments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    environment VARCHAR(50) DEFAULT 'Production',
    docker_image_tag VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL, -- Pending, Running, Success, Failed
    duration_seconds INTEGER,
    logs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. Indices for Optimization

To optimize standard queries:

```sql
-- Fast index scanning for user dashboard loads
CREATE INDEX idx_projects_user_id ON projects(user_id);

-- Speed up fetching images and runs for specific projects
CREATE INDEX idx_docker_images_project_id ON docker_images(project_id);
CREATE INDEX idx_workflows_project_id ON workflows(project_id);
CREATE INDEX idx_deployments_project_id ON deployments(project_id);
```
