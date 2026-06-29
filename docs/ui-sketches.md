# UI Sketches & Layout Specifications

This document outlines the design structure, wireframe layouts, and user interactions for the twelve core screens of the **DevVerse** platform.

---

## Design System Guidelines (Theme: Dark Modern)
*   **Background:** `#0B0F19` (Deep Obsidian Blue)
*   **Cards/Containers:** `#151D30` (Navy-Obsidian with subtle border)
*   **Accents:** `#00F2FE` (Cyan), `#4FACFE` (Neon Blue)
*   **Typography:** Outfit or Inter Google Fonts

---

## Premium UI Mockup Example (Dashboard + AI Assistant)

![DevVerse Dashboard Mockup](file:///d:/DevVerse/docs/assets/sketches/dashboard.png)

---

## Screen-by-Screen Layout Layouts

### 1. Login Page
*   **Layout:** Centralized card layout with modern gradient glassmorphism effect.
*   **Components:**
    *   Brand Logo: DevVerse icon (glowing infinite loop and terminal).
    *   Form Fields: Email, Password (with eye toggle).
    *   Primary Action: "Sign In" button with hover micro-animations.
    *   Alternative Sign-In: "Connect with GitHub" button (using GitHub brand colors & icon).
    *   Redirect link: "Don't have an account? Register".

### 2. Register Page
*   **Layout:** Split-pane screen. Left side contains branding and value propositions (AI support, build pipelines); right side contains the form.
*   **Components:**
    *   Form Fields: Username, Email, Password, Confirm Password.
    *   Validation Indicator: Real-time strength meter for passwords.
    *   Primary Action: "Create Account" button.
    *   Redirect link: "Already have an account? Sign In".

### 3. Dashboard (Landing Hub)
*   **Layout:** Standard multi-column grid containing cards. Sidebar navigation on the left.
*   **Components:**
    *   **Header:** User greeting and status ticker (Docker connection active, EC2 healthy).
    *   **Stats row (4 Cards):** Total Projects, Images Built, Active Deployments, AI queries today.
    *   **Activity Timeline:** Vertical list showing commits pushed, images built, and deployments completed.
    *   **Quick Actions Panel:** Buttons to "Create Project" or "Scan Docker Registry".

### 4. Projects Page
*   **Layout:** Multi-card grid or list view (toggleable) with search and status filters.
*   **Components:**
    *   **Header:** "Projects" title, search bar, and "+ Create Project" primary action.
    *   **Project Cards:** Shows Project Name, connected GitHub Repo name, active branch, environment status badge (Success / Failed), and last deploy timestamp.
    *   **Quick controls:** View details, rebuild docker image, run deployment.

### 5. Project Details Page
*   **Layout:** Tabbed panel layout.
    *   Tabs: *Overview*, *Git Branch History*, *Docker Images*, *CI/CD Pipelines*, *Deployments*.
*   **Components:**
    *   **Overview Tab:** Statistics on build success rates, active container count, last run details.
    *   **Action bar:** Run manual trigger, change connected branch, edit credentials.

### 6. Docker Images Page
*   **Layout:** Table interface with filters and status headers.
*   **Components:**
    *   **Docker Registry Sync Ticker:** Shows connection string.
    *   **Images Table:** Repository tag name, Image ID/Hash, Size, Build Date, Registry status (Pushed/Local).
    *   **Action buttons:** Build, Pull, Push, and Delete.

### 7. Build History Page
*   **Layout:** Listing page showing chronological list of builds, with expandable sections showing real-time shell stdout/stderr logs.
*   **Components:**
    *   **Build Record Card:** Build Number, target branch, target tag, execution time, result badge (Success/Failure).
    *   **Log Viewer:** Expandable console viewport with terminal styling (monospaced font, black background).
    *   **AI Support Trigger:** "Explain Errors" button next to failed builds.

### 8. Deployment History Page
*   **Layout:** Tabular status screen detailing cloud release logs.
*   **Components:**
    *   **Status Indicators:** Running, Pending, Success, Terminated, Failed.
    *   **Deployment Card:** Release tag, Target EC2 host, deployment duration, Deployer name, Release logs.
    *   **Rollback button:** Instant trigger to revert target VM to previous stable image tag.

### 9. GitHub Repositories Page
*   **Layout:** List interface fetching repos linked to the authenticated GitHub OAuth account.
*   **Components:**
    *   **GitHub Connection Banner:** Account avatar, name, and connection status.
    *   **Repo Cards:** List of repositories with search input. Includes owner, description, star count, and an "Import to DevVerse" button.

### 10. Profile Page
*   **Layout:** Modern profile card layout.
*   **Components:**
    *   Avatar preview, Name, Email, Username.
    *   **Linked Integrations:** GitHub account identifier status, AWS Access Keys configuration panel.

### 11. Settings Page
*   **Layout:** Left-aligned tab navigation for settings categories: *Account*, *Theme*, *Security*, *Docker Configuration*.
*   **Components:**
    *   **Account Settings:** Modify username, password, delete account.
    *   **Theme Switcher:** Dark Mode (default), Light Mode, Cyberpunk (neon).
    *   **API Credentials Setup:** Configuration input fields for Google Gemini API key.

### 12. AI Assistant Page
*   **Layout:** Two-pane split-screen: Left is a terminal log monitor or editor; right is a chat assistant panel.
*   **Components:**
    *   **Prompt Selectors:** Quick buttons for: `/explain-error`, `/generate-dockerfile`, `/generate-workflow`, `/summarize-log`.
    *   **AI Chat Viewport:** Dialogue bubbles separating user requests and markdown-formatted Gemini AI responses.
    *   **Code Action Button:** "Apply changes directly" (creates files or resolves configs).
