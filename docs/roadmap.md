# Platform Roadmap

This document outlines the phased roadmap for **DevVerse**.

---

## Phase 1 (Week 1) — MVP Release (Current Scope)
*   **Foundation & Authentication:** Setup workspace, custom JWT mechanism, and GitHub OAuth login integration.
*   **Dashboard & Projects:** Core project workspace and dashboard summarizing environment statuses.
*   **Git Integration:** Repository scanning, branch listings, and commit records display.
*   **Docker Module:** Local building, pushing to registry, and list/management operations.
*   **CI/CD Actions:** Triggering workflow runs, checking statuses, and pipeline feedback.
*   **AWS Deployment:** Provisioning/connecting to EC2 and pulling built Docker images for run actions.
*   **AI Integration:** Gemini API for build log debugging, custom Dockerfile generator, and workflow template writer.
*   **Monitoring:** Metrics collection with Prometheus and interactive charts with Grafana.

---

## Phase 2 — Advanced Integrations
*   **Kubernetes Orchestration:** Add support for deploying Docker images to local Minikube or cloud-managed Amazon EKS.
*   **Multi-Cloud Deployments:** Extend target hosts to Google Cloud Platform (GCE/GKE) and Microsoft Azure.
*   **Collaborative workspaces:** Team management, organizational workspace creation, and shared credential pools.

---

## Phase 3 — Enterprise & Security
*   **Automated Vulnerability Scanner:** Integrate Trivy or Snyk scan logs directly into the image registry views.
*   **Advanced AI Autopilot:** Autonomous AI repair cycles that automatically commit fixes for build errors.
*   **SSO and RBAC:** Enterprise Single Sign-On and granular Role-Based Access Control configuration.
