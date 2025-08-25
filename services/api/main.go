// services/api/main.go
package main

import (
	"context"
	"log"
	"net"
	"os"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/protobuf/types/known/timestamppb"

	"github.com/jackc/pgx/v5/pgxpool"
	"hermes/services/api/health" // Import the generated code
)

// gRPC HealthService server.
type server struct {
	health.UnimplementedHealthServiceServer
	dbpool *pgxpool.Pool
}

// the most recent alerts query
func (s *server) GetAlerts(ctx context.Context, req *health.GetAlertsRequest) (*health.GetAlertsResponse, error) {
	rows, err := s.dbpool.Query(ctx, "SELECT device_id, heart_rate, timestamp FROM alerts ORDER BY timestamp DESC LIMIT 20")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var alerts []*health.Alert
	for rows.Next() {
		var a health.Alert
		var t time.Time
		if err := rows.Scan(&a.DeviceId, &a.HeartRate, &t); err != nil {
			return nil, err
		}
		a.Timestamp = timestamppb.New(t)
		alerts = append(alerts, &a)
	}

	return &health.GetAlertsResponse{Alerts: alerts}, nil
}

// historical data for a specific device.
func (s *server) GetDeviceHistory(ctx context.Context, req *health.GetDeviceHistoryRequest) (*health.GetDeviceHistoryResponse, error) {
	rows, err := s.dbpool.Query(ctx, "SELECT heart_rate, timestamp FROM health_data WHERE device_id = $1 ORDER BY timestamp DESC LIMIT 100", req.DeviceId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dataPoints []*health.HealthDataPoint
	for rows.Next() {
		var dp health.HealthDataPoint
		var t time.Time
		if err := rows.Scan(&dp.HeartRate, &t); err != nil {
			return nil, err
		}
		dp.Timestamp = timestamppb.New(t)
		dataPoints = append(dataPoints, &dp)
	}

	return &health.GetDeviceHistoryResponse{DataPoints: dataPoints}, nil
}

func main() {
	// Connect to db
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}
	dbpool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer dbpool.Close()
	log.Println("Successfully connected to TimescaleDB.")

	// Set up and start the gRPC server
	lis, err := net.Listen("tcp", ":9090")
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()
	health.RegisterHealthServiceServer(grpcServer, &server{dbpool: dbpool})

	log.Printf("gRPC server listening at %v", lis.Addr())
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}