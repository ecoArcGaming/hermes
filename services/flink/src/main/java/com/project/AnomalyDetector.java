package com.project;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.connector.kafka.source.KafkaSource;
import org.apache.flink.connector.kafka.sink.KafkaSink;
import org.apache.flink.connector.kafka.sink.KafkaRecordSerializationSchema;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;

public class AnomalyDetector {

    public static void main(String[] args) throws Exception {
        // Set up the Flink execution environment
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        // Kafka connection details
        String bootstrapServers = "kafka.default.svc.cluster.local:9092";
        String inputTopic = "health_data";
        String outputTopic = "alerts";

        // Create a Kafka source to read from the health_data topic
        KafkaSource<String> source = KafkaSource.<String>builder()
            .setBootstrapServers(bootstrapServers)
            .setTopics(inputTopic)
            .setGroupId("flink-anomaly-detector-group")
            .setValueOnlyDeserializer(new SimpleStringSchema())
            .build();

        // Create a Kafka sink to write alerts to the alerts topic
        KafkaSink<String> sink = KafkaSink.<String>builder()
            .setBootstrapServers(bootstrapServers)
            .setRecordSerializer(KafkaRecordSerializationSchema.builder()
                .setTopic(outputTopic)
                .setValueSerializationSchema(new SimpleStringSchema())
                .build())
            .build();

        // Create a data stream from the Kafka source
        DataStream<String> healthDataStream = env.fromSource(source, WatermarkStrategy.noWatermarks(), "Kafka Source");

        // The main logic: parse, filter for anomalies, and format for output
        DataStream<String> alertStream = healthDataStream
            // 1. Parse the JSON string
            .map(value -> {
                ObjectMapper jsonParser = new ObjectMapper();
                return jsonParser.readTree(value);
            })
            // 2. Filter for events where heartRate is greater than 100
            .filter(node -> node.get("heartRate").asInt() > 100)
            // 3. Format the anomaly into a new JSON string for the alert
            .map(node -> {
                String deviceId = node.get("deviceId").asText();
                int heartRate = node.get("heartRate").asInt();
                return String.format("{\"alertType\": \"HIGH_HEART_RATE\", \"deviceId\": \"%s\", \"value\": %d}", deviceId, heartRate);
            });

        // Send the resulting alert stream to the Kafka sink
        alertStream.sinkTo(sink);

        // Execute the Flink job
        env.execute("Real-time Health Anomaly Detector");
    }
}
