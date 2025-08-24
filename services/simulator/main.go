// services/simulator/main.go
package main

import (
	"fmt"
	"math/rand"
	"sync"
	"time"

	// using this kafka client for go for now
	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

const (
	numDevices       = 1000 // num_dvices
	bootstrapServers = "kafka.default.svc.cluster.local:9092"
	topic            = "health_data"
)

// a single IoT device.
func simulateDevice(deviceID string, p *kafka.Producer, wg *sync.WaitGroup) {
	defer wg.Done()

	for {
		// fake health data
		heartRate := 60 + rand.Intn(40)
		if rand.Float32() < 0.05 {
			heartRate = 100 + rand.Intn(40) // simulate an anomaly
		}

		// message payload
		message := fmt.Sprintf(`{"deviceId": "%s", "heartRate": %d, "timestamp": %d}`,
			deviceID, heartRate, time.Now().Unix())

		// to the Kafka topic
		topicName := topic 
		p.Produce(&kafka.Message{
			TopicPartition: kafka.TopicPartition{Topic: &topicName, Partition: kafka.PartitionAny},
			Value:          []byte(message),
		}, nil)

		// Wait a random duration before sending the next message
		time.Sleep(time.Duration(500+rand.Intn(1000)) * time.Millisecond)
	}
}

func main() {
	p, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": bootstrapServers})
	if err != nil {
		panic(err)
	}
	defer p.Close()

	// wait for all goroutines to start
	var wg sync.WaitGroup

	fmt.Printf("Starting %d IoT device simulators...\n", numDevices)

	//  one goroutine for each device
	for i := 0; i < numDevices; i++ {
		wg.Add(1)
		deviceID := fmt.Sprintf("device-%03d", i)
		go simulateDevice(deviceID, p, &wg)
	}

	// wait forever, keeping the main program alive
	// while the goroutines run in the background.
	select {}
}
