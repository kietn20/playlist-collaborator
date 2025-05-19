# File: playlist-collaborator/Dockerfile
# Purpose: Defines the Docker image for the Spring Boot backend application.
# Location: Root of the Spring Boot backend project.

# --- Stage 1: Build ---
# Use an official OpenJDK runtime as a parent image.
# Choose a version that matches your project's Java version (e.g., 17, 21).
# eclipse-temurin is a good choice for a general-purpose OpenJDK build.
FROM eclipse-temurin:17-jdk-jammy as builder

# Set the working directory in the container
WORKDIR /app

# Copy the Maven wrapper and pom.xml to leverage Docker cache layers
# Copy .mvn directory first if it exists (for Maven wrapper specifics)
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Download dependencies (this layer will be cached if pom.xml doesn't change often)
RUN ./mvnw dependency:go-offline -B

# Copy the rest of the application source code
COPY src ./src

# Package the application (build the JAR)
# -DskipTests can be used to speed up image builds if tests are run elsewhere (e.g., CI pipeline)
RUN ./mvnw package -DskipTests

# --- Stage 2: Run ---
# Use a smaller base image for the final application image (JRE is sufficient)
FROM eclipse-temurin:17-jre-jammy

# Set the working directory
WORKDIR /app

# Argument to specify the JAR file path (can be overridden at build time)
ARG JAR_FILE=/app/target/*.jar

# Copy the JAR from the builder stage
COPY --from=builder ${JAR_FILE} application.jar

# Expose the port the application runs on (as defined in application.properties or default 8080)
EXPOSE 8080

# Environment variable for Spring Profiles (optional, can be set at runtime)
# ENV SPRING_PROFILES_ACTIVE=docker

# Entrypoint: command to run when the container starts
ENTRYPOINT ["java", "-jar", "application.jar"]

# Optional: Add a healthcheck (Spring Boot Actuator can be used for this)
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:8080/actuator/health || exit 1