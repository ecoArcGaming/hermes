FROM golang:1.25-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends build-essential

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o /app/api-server .

EXPOSE 9090

CMD ["/app/api-server"]