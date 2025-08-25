# Hermes

Hermes is a real-time IoT health monitoring platform that simulates, processes, and visualizes health data from a large scale of sensors. The system is a modern microservices architecture with event streaming and time-series data management.

## Architecture Overview

The platform consists of four main components orchestrated through Kubernetes:

**Frontend** serves a responsive web dashboard built with Angular and Angular Material. The application uses Server-Side Rendering (SSR) and communicates with backend services through gRPC-Web via an Envoy proxy.

**API Service** provides a gRPC server in Go that exposes health data endpoints for retrieving recent alerts and historical device data. It connects directly to the Postgres database and serves Protocol Buffer-defined schemas.

**Simulator Service** generates realistic IoT device data by running concurrent goroutines, each simulating a unique health monitoring device. The service supplies Kafka topics.

**Process Sink**  a Kafka consumer that reads health data streams and persists them to the database. This is a Go microservice. 

## Technology Stack

**Backend Services**: Go 1.25 with gRPC, Protocol Buffers, and Kafka integration
**Frontend**: Angular 20 with TypeScript, Angular Material, and Chart.js
**Database**: PostgreSQL on RDS 
**Message Streaming**: Apache Kafka for event-driven architecture
**API Gateway**: Envoy Proxy for gRPC-Web translation
**Infrastructure**: Kubernetes for container orchestration
**Cloud Platform**: AWS with Terraform for infrastructure as code
**Container Registry**: Amazon ECR for Docker image management

## Project Structure

The repository follows a clean separation of concerns with dedicated directories for each service and infrastructure component:

```
services/          # Backend microservices (api, simulator, process-sink)
frontend/          # Angular web application with SSR support
k8s/              # Kubernetes deployment manifests and configurations
infra/            # Terraform infrastructure definitions for AWS EKS
```

Each service maintains its own Dockerfile and dependency management. The Kubernetes manifests define production environments.


