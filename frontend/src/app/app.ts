// src/app/app.component.ts
import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from './api'; 
import { Alert } from './proto/health_pb';
import { TimestampPipe } from './timestamp-pipe';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Chart.js imports
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    TimestampPipe,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    BaseChartDirective
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, AfterViewInit {
  title = 'Hermes Dashboard';
  alerts: Alert.AsObject[] = [];
  isLoading = true;

  // Chart-related properties
  deviceIds: string[] = [];
  selectedDeviceId: string = '';
  filteredDeviceIds: string[] = [];
  chartData: ChartConfiguration<'line'>['data'] | null = null;
  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Heart Rate Over Time'
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Heart Rate (BPM)'
        },
        min: 0
      }
    }
  };
  isLoadingChart = false;

  // Inject the ApiService and platform ID
  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // On server, just set loading to false with empty alerts
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading = false;
    }
  }

  ngAfterViewInit() {
    // Only fetch data when running in the browser and after view initialization
    if (isPlatformBrowser(this.platformId)) {
      // Add a small delay to allow hydration to complete
      setTimeout(() => {
        this.loadData();
      }, 100);
    }
  }

  private async loadData() {
    try {
      // Load alerts and device IDs in parallel
      const [alerts, deviceIds] = await Promise.all([
        this.apiService.getAlerts(),
        this.apiService.getUniqueDeviceIds()
      ]);
      
      this.alerts = alerts;
      this.deviceIds = deviceIds;
      this.filteredDeviceIds = [...deviceIds];
      this.isLoading = false;
      
      console.log('Fetched alerts:', this.alerts);
      console.log('Available devices:', this.deviceIds);
    } catch (err) {
      console.error('Error fetching data:', err);
      this.isLoading = false;
    }
  }

  // TrackBy function for better performance with *ngFor
  trackByDeviceId(index: number, alert: Alert.AsObject): string {
    return alert.deviceId || index.toString();
  }

  // Filter device IDs for autocomplete
  filterDeviceIds(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredDeviceIds = this.deviceIds.filter(id => 
      id.toLowerCase().includes(filterValue)
    );
  }

  // Load chart data for selected device
  async loadChartData(deviceId: string) {
    if (!deviceId) return;
    
    this.isLoadingChart = true;
    this.selectedDeviceId = deviceId;
    
    try {
      const dataPoints = await this.apiService.getDeviceHistory(deviceId);
      
      // Sort data points by timestamp
      const sortedData = dataPoints.sort((a, b) => {
        const timeA = a.timestamp ? a.timestamp.seconds || 0 : 0;
        const timeB = b.timestamp ? b.timestamp.seconds || 0 : 0;
        return timeA - timeB;
      });

      // Prepare chart data
      const labels = sortedData.map(point => {
        if (point.timestamp) {
          const date = new Date(point.timestamp.seconds * 1000);
          return date.toLocaleTimeString();
        }
        return '';
      });

      const heartRateData = sortedData.map(point => point.heartRate || 0);

      this.chartData = {
        labels: labels,
        datasets: [
          {
            label: `Heart Rate - ${deviceId}`,
            data: heartRateData,
            borderColor: '#f44336',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#f44336',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4
          }
        ]
      };

      console.log('Chart data loaded for device:', deviceId, this.chartData);
    } catch (err) {
      console.error('Error loading chart data:', err);
    } finally {
      this.isLoadingChart = false;
    }
  }

  // Handle device selection from autocomplete
  onDeviceSelected(deviceId: string) {
    this.loadChartData(deviceId);
  }
}