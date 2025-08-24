# --- Build Stage ---
# Use an official Go image to build our application
FROM golang:1.22-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the Go module files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application source code
COPY . .

# Build the Go application, creating a static binary
# CGO_ENABLED=0 is important for creating a static binary that works in a minimal image
# -o /app/server creates the output file named "server" in the /app directory
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server ./...

# --- Final Stage ---
# Use a minimal, non-root base image for the final container
FROM gcr.io/distroless/static-debian12

# Set the working directory
WORKDIR /app

# Copy only the compiled binary from the builder stage
COPY --from=builder /app/server .

# Set the command to run when the container starts
CMD ["/app/server"]