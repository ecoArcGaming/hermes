# Single-stage Dockerfile for testing
FROM golang:1.25-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends build-essential librdkafka-dev

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=1 go build -o /process-sink

CMD ["/process-sink"]