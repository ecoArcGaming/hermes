// src/app/app.component.ts
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from './api'; // Import the service
import { Alert } from './proto/health_pb';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'Health Monitoring Dashboard';
  alerts: Alert.AsObject[] = [];
  isLoading = true;

  // Inject the ApiService and platform ID
  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Only fetch data when running in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.apiService.getAlerts()
        .then(alerts => {
          this.alerts = alerts;
          this.isLoading = false;
          console.log('Fetched alerts:', this.alerts);
        })
        .catch(err => {
          console.error('Error fetching alerts:', err);
          this.isLoading = false;
        });
    } else {
      // On server, just set loading to false with empty alerts
      this.isLoading = false;
    }
  }
}