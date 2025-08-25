package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"github.com/jackc/pgx/v5/pgxpool"
)

// anomalyThreshold triggers an alert.
const anomalyThreshold = 100

//JSON data from the simulator.
type HealthData struct {
	DeviceID  string `json:"deviceId"`
	HeartRate int    `json:"heartRate"`
	Timestamp int64  `json:"timestamp"`
}

func main() {
	// Connect to the  database.
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}
	dbpool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer dbpool.Close()
	log.Println("Successfully connected to DB.")

	// Set up the Kafka consumer.
	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": "kafka.default.svc.cluster.local:9092",
		"group.id":          "processor-sink-group",
		"auto.offset.reset": "earliest",
	})
	if err != nil {
		log.Fatalf("Failed to create Kafka consumer: %s", err)
	}
	defer consumer.Close()

	consumer.SubscribeTopics([]string{"health_data"}, nil)
	log.Println("Subscribed to 'health_data' topic.")

	// consume and process messages.
	log.Println("Starting message processing loop...")
	for {
		msg, err := consumer.ReadMessage(-1)
		if err != nil {
			log.Printf("Consumer error: %v (%v)\n", err, msg)
			continue
		}

		var data HealthData
		if err := json.Unmarshal(msg.Value, &data); err != nil {
			log.Printf("Error unmarshalling JSON: %v", err)
			continue
		}

		// Process and save the data to the database.
		err = processAndSaveData(dbpool, data)
		if err != nil {
			log.Printf("Failed to process data for device %s: %v", data.DeviceID, err)
		}
	}
}

// processAndSaveData handles writing the data to TimescaleDB within a transaction.
func processAndSaveData(dbpool *pgxpool.Pool, data HealthData) error {
	// Convert Unix timestamp to time.Time for the database.
	recordTime := time.Unix(data.Timestamp, 0)

	// Transaction to ensure data integrity.
	tx, err := dbpool.Begin(context.Background())
	if err != nil {
		return fmt.Errorf("could not begin transaction: %w", err)
	}
	defer tx.Rollback(context.Background()) // Rollback on any error.

	// Insert the raw data into the health_data hypertable.
	_, err = tx.Exec(context.Background(),
		"INSERT INTO health_data (timestamp, device_id, heart_rate) VALUES ($1, $2, $3)",
		recordTime, data.DeviceID, data.HeartRate)
	if err != nil {
		return fmt.Errorf("could not insert into health_data: %w", err)
	}

	// Check for an anomaly and insert into the alerts table if necessary.
	if data.HeartRate > anomalyThreshold {
		_, err = tx.Exec(context.Background(),
			"INSERT INTO alerts (timestamp, device_id, heart_rate) VALUES ($1, $2, $3)",
			recordTime, data.DeviceID, data.HeartRate)
		if err != nil {
			return fmt.Errorf("could not insert into alerts: %w", err)
		}
		log.Printf("ALERT DETECTED: Device %s has heart rate %d", data.DeviceID, data.HeartRate)
	}

	// Commit the transaction.
	return tx.Commit(context.Background())
}
