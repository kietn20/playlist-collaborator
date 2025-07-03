# Playlist Collaborator

**Playlist Collaborator** is a full-stack, real-time web application that allows users to create collaborative, synchronized YouTube music video playlists. Users can create a shared room, invite others via a unique ID, and collectively build a queue of songs. The application features a sophisticated DJ/Leader model for synchronized playback, ensuring all participants experience the music together.

This project was developed as a deep dive into modern software engineering principles, covering everything from backend API design and real-time WebSocket communication to complex frontend state management, full-stack containerization with Docker, and a complete CI/CD pipeline for automated deployment to AWS.

![Demo Image](https://github.com/kietn20/playlist-collaborator/blob/main/demo.png)  

## Table of Contents
- [Key Features](#key-features)
- [System Design: Synchronized Playback](#system-design-synchronized-playback)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Local Development Setup](#local-development-setup)
- [CI/CD Pipeline](#cicd-pipeline)
- [Future Work](#future-work)

## Key Features

- **Real-time Collaborative Rooms**: Create a private room and share the unique ID for others to join.
- **Synchronized Playback**: A DJ/Leader model ensures all users' video players are synchronized. When the leader plays, pauses, or seeks, all followers' players react in real-time.
- **Dynamic Queue Management**: Collaboratively add YouTube videos to the queue, remove songs, and have the playlist automatically advance to the next song for everyone when one finishes. The leader also has a "skip" function.
- **YouTube API Integration**: The application automatically fetches video titles and channel names from the YouTube Data API v3 when a song is added, providing a polished user experience.
- **Live Deployment**: Fully containerized and deployed to a live AWS EC2 instance with an automated CI/CD pipeline.

## System Design: Synchronized Playback

The most significant technical challenge was synchronizing video playback across multiple clients with varying network latencies. To solve this, a **Leader/Follower (DJ) model** was implemented:

1.  **Leader Role**: The user who creates a room is designated the Leader. Only their player controls are active. The Leader is the sole source of truth for playback state (e.g., `isPlaying`, `currentTime`, current `videoId`).
2.  **State Broadcasting**: The Leader's client broadcasts two types of messages to the backend via WebSockets:
    - **Event Messages**: Sent immediately upon a key action (e.g., `play`, `pause`, `seek`).
    - **Sync Messages**: Sent periodically (every 3 seconds) to provide a complete state snapshot, correcting any drift that accumulates in followers' players.
3.  **Follower Role**: All other users are Followers. Their player controls are disabled, and their player is controlled programmatically. They listen for state broadcasts from the Leader and force their local player to match the Leader's state, seeking to the correct timestamp if they have drifted beyond a set threshold.
4.  **Backend's Role**: The Spring Boot backend acts as a simple, efficient message broker for these real-time messages, relaying them to the appropriate room-specific topic without needing to store or validate the transient playback state.

## Technology Stack

### Backend
- **Framework**: Spring Boot 3 (Java 17)
- **Real-time**: Spring WebSockets with STOMP for messaging and heart-beating.
- **API**: Spring Web for RESTful endpoints.
- **Data**: Spring Data JPA with PostgreSQL for data persistence.
- **Security**: Spring Security for CORS configuration and request authorization.
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite for a fast development experience.
- **Styling**: Tailwind CSS with a custom dark theme.
- **Components**: `shadcn/ui` for accessible and composable UI components.
- **Real-time**: `@stomp/stompjs` and `sockjs-client` to communicate with the backend.
- **State Management**: React Hooks (`useState`, `useEffect`, `useCallback`) for managing component and application-level state.

### DevOps & Infrastructure
- **Containerization**: Docker. The entire application stack (Frontend, Backend, Database) is fully containerized.
- **Orchestration**: Docker Compose for managing the multi-container environment locally and in production.
- **Cloud Provider**: Amazon Web Services (AWS), using an EC2 `t2.micro` instance to stay within the Free Tier.
- **CI/CD**: GitHub Actions for automated testing, Docker image building, and pushing to Docker Hub, followed by automated deployment to the EC2 server via SSH.

## Project Architecture

The application is structured as a monorepo containing two primary services: `backend` and `frontend`.

-   **`backend`**: A self-contained Spring Boot application. It exposes a REST API for room management and a WebSocket endpoint for all real-time playlist and playback synchronization events. It connects to a PostgreSQL database for data persistence.
-   **`frontend`**: A single-page application built with React and Vite. In production, it is built into static assets and served by a lightweight **Nginx** web server. The Nginx server also acts as a **reverse proxy**, forwarding all API (`/api/**`) and WebSocket (`/ws-playlist/**`) requests to the backend service, creating a unified entry point for the browser.

![Architecture Diagram](https://github.com/kietn20/playlist-collaborator/blob/main/diagram.png)  

## Local Development Setup

To run this project locally, you will need Docker and Docker Compose installed.

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/playlist-collaborator.git
    cd playlist-collaborator
    ```

2.  **Configure Environment Variables**:
    - Create a `.env` file in the project root (`PLAYLIST-COLLABORATOR/.env`).
    - Add the necessary secrets. You will need a PostgreSQL password and a YouTube Data API v3 key.
      ```env
      # PLAYLIST-COLLABORATOR/.env
      POSTGRES_USER=playlist_user
      POSTGRES_PASSWORD=your_super_secret_password
      POSTGRES_DB=playlist_db
      YOUTUBE_API_KEY=your_youtube_api_key_here
      ```

3.  **Run Backend Services**:
    - Use Docker Compose to start the Spring Boot backend and PostgreSQL database.
    ```bash
    # From the project root
    docker compose up -d backend-app postgres-db
    ```

4.  **Run Frontend Dev Server**:
    - Navigate to the frontend directory in a separate terminal and start the Vite dev server.
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

5.  **Access the Application**:
    - Open your browser and navigate to `http://localhost:5173`.

## CI/CD Pipeline

This project is configured with a complete CI/CD pipeline using GitHub Actions, located at `.github/workflows/build-and-push-docker-images.yml`.

The pipeline consists of three jobs:

1.  **`build-and-test-backend`**:
    - Spins up a temporary PostgreSQL service container for integration testing.
    - Compiles and tests the Spring Boot application using Maven.
    - If successful, builds a Docker image and pushes it to Docker Hub.
2.  **`build-and-test-frontend`**:
    - Installs dependencies and runs frontend tests using Vitest.
    - If successful, builds a production-ready Docker image with Nginx and pushes it to Docker Hub.
3.  **`deploy`**:
    - This job only runs if both build/test jobs succeed.
    - It securely SSH's into the AWS EC2 server using a key stored in GitHub Secrets.
    - It pulls the newly built images from Docker Hub and restarts the application using `docker compose`.

## Future Work

-   **User Accounts & Authentication**: Implement a full JWT-based authentication system to allow users to have persistent profiles and saved playlists.
-   **Enhanced Permissions**: Create a more robust role system (DJ, listeners) to control who can add/remove/skip songs.
-   **Spotify Integration**: Allow songs to be added from Spotify in addition to YouTube.
-   **UI/UX Polish**: Add more animations, a mobile-responsive layout, and a more polished player UI.