import * as jspb from 'google-protobuf'

import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb'; // proto import: "google/protobuf/timestamp.proto"


export class Alert extends jspb.Message {
  getDeviceId(): string;
  setDeviceId(value: string): Alert;

  getHeartRate(): number;
  setHeartRate(value: number): Alert;

  getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): Alert;
  hasTimestamp(): boolean;
  clearTimestamp(): Alert;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Alert.AsObject;
  static toObject(includeInstance: boolean, msg: Alert): Alert.AsObject;
  static serializeBinaryToWriter(message: Alert, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Alert;
  static deserializeBinaryFromReader(message: Alert, reader: jspb.BinaryReader): Alert;
}

export namespace Alert {
  export type AsObject = {
    deviceId: string,
    heartRate: number,
    timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class HealthDataPoint extends jspb.Message {
  getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): HealthDataPoint;
  hasTimestamp(): boolean;
  clearTimestamp(): HealthDataPoint;

  getHeartRate(): number;
  setHeartRate(value: number): HealthDataPoint;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HealthDataPoint.AsObject;
  static toObject(includeInstance: boolean, msg: HealthDataPoint): HealthDataPoint.AsObject;
  static serializeBinaryToWriter(message: HealthDataPoint, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HealthDataPoint;
  static deserializeBinaryFromReader(message: HealthDataPoint, reader: jspb.BinaryReader): HealthDataPoint;
}

export namespace HealthDataPoint {
  export type AsObject = {
    timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    heartRate: number,
  }
}

export class GetAlertsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAlertsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetAlertsRequest): GetAlertsRequest.AsObject;
  static serializeBinaryToWriter(message: GetAlertsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetAlertsRequest;
  static deserializeBinaryFromReader(message: GetAlertsRequest, reader: jspb.BinaryReader): GetAlertsRequest;
}

export namespace GetAlertsRequest {
  export type AsObject = {
  }
}

export class GetAlertsResponse extends jspb.Message {
  getAlertsList(): Array<Alert>;
  setAlertsList(value: Array<Alert>): GetAlertsResponse;
  clearAlertsList(): GetAlertsResponse;
  addAlerts(value?: Alert, index?: number): Alert;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAlertsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetAlertsResponse): GetAlertsResponse.AsObject;
  static serializeBinaryToWriter(message: GetAlertsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetAlertsResponse;
  static deserializeBinaryFromReader(message: GetAlertsResponse, reader: jspb.BinaryReader): GetAlertsResponse;
}

export namespace GetAlertsResponse {
  export type AsObject = {
    alertsList: Array<Alert.AsObject>,
  }
}

export class GetDeviceHistoryRequest extends jspb.Message {
  getDeviceId(): string;
  setDeviceId(value: string): GetDeviceHistoryRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetDeviceHistoryRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetDeviceHistoryRequest): GetDeviceHistoryRequest.AsObject;
  static serializeBinaryToWriter(message: GetDeviceHistoryRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetDeviceHistoryRequest;
  static deserializeBinaryFromReader(message: GetDeviceHistoryRequest, reader: jspb.BinaryReader): GetDeviceHistoryRequest;
}

export namespace GetDeviceHistoryRequest {
  export type AsObject = {
    deviceId: string,
  }
}

export class GetDeviceHistoryResponse extends jspb.Message {
  getDataPointsList(): Array<HealthDataPoint>;
  setDataPointsList(value: Array<HealthDataPoint>): GetDeviceHistoryResponse;
  clearDataPointsList(): GetDeviceHistoryResponse;
  addDataPoints(value?: HealthDataPoint, index?: number): HealthDataPoint;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetDeviceHistoryResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetDeviceHistoryResponse): GetDeviceHistoryResponse.AsObject;
  static serializeBinaryToWriter(message: GetDeviceHistoryResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetDeviceHistoryResponse;
  static deserializeBinaryFromReader(message: GetDeviceHistoryResponse, reader: jspb.BinaryReader): GetDeviceHistoryResponse;
}

export namespace GetDeviceHistoryResponse {
  export type AsObject = {
    dataPointsList: Array<HealthDataPoint.AsObject>,
  }
}

