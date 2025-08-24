
FROM golang:1.25-bookworm AS builder

RUN apt-get update && apt-get install -y --no-install-recommends build-essential librdkafka-dev

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download


COPY . .

RUN CGO_ENABLED=1 go build -o /simulator


FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates librdkafka1 && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /simulator /simulator

CMD ["/simulator"]