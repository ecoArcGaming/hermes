// src/app/api.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HealthServiceClient } from './proto/HealthServiceClientPb';
import { GetAlertsRequest, Alert } from './proto/health_pb';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  client: HealthServiceClient | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Only initialize the client when running in the browser
    if (isPlatformBrowser(this.platformId)) {
      // The client points to the Envoy proxy
      this.client = new HealthServiceClient('http://localhost:8080');
    }
  }

  getAlerts(): Promise<Alert.AsObject[]> {
    return new Promise((resolve, reject) => {
      // If running on server, return empty array
      if (!this.client) {
        resolve([]);
        return;
      }

      const request = new GetAlertsRequest();
      this.client.getAlerts(request, {}, (err, response) => {
        if (err) {
          return reject(err);
        }
        if (response) {
            resolve(response.toObject().alertsList);
        } else {
            reject(new Error("No response received"));
        }
      });
    });
  }
}