// src/app/app.component.ts
import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
// Removed unused RouterOutlet import
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from './api'; 
import { Alert } from './proto/health_pb';
import { TimestampPipe } from './timestamp-pipe';

// Angular Material imports - only what we actually use
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

// Chart data interface
export interface ChartDataPoint {
  timestamp?: { seconds: number };
  heartRate?: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
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
  chartDataPoints: ChartDataPoint[] = [];
  isLoadingChart = false;
  showChart = false;
  private chartInstance: any = null;

  @ViewChild('chartCanvas', { static: false }) chartCanvas?: ElementRef<HTMLCanvasElement>;

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
    this.showChart = true;
    
    try {
      this.chartDataPoints = await this.apiService.getDeviceHistory(deviceId);
      console.log('Chart data loaded for device:', deviceId, this.chartDataPoints.length, 'points');
      
      // Only load Chart.js when we actually need it
      if (this.chartDataPoints.length > 0) {
        setTimeout(() => this.initializeChart(), 100);
      }
    } catch (err) {
      console.error('Error loading chart data:', err);
      this.chartDataPoints = [];
    } finally {
      this.isLoadingChart = false;
    }
  }

  // Dynamically load and initialize Chart.js
  private async initializeChart() {
    if (!isPlatformBrowser(this.platformId) || !this.chartCanvas) {
      return;
    }

    try {
      // Dynamic import of Chart.js - this creates a separate chunk
      const { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler } = await import('chart.js');
      
      // Register only the components we need
      Chart.register(
        LineController,
        LineElement,
        PointElement,
        LinearScale,
        CategoryScale,
        Title,
        Tooltip,
        Legend,
        Filler
      );

      // Destroy existing chart if any
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      // Sort data points by timestamp
      const sortedData = this.chartDataPoints.sort((a, b) => {
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

      // Create the chart
      this.chartInstance = new Chart(this.chartCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: `Heart Rate - ${this.selectedDeviceId}`,
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
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top' as const
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
        }
      });

      console.log('Chart initialized for device:', this.selectedDeviceId);
    } catch (err) {
      console.error('Error loading Chart.js:', err);
    }
  }

  // Handle device selection from autocomplete
  onDeviceSelected(deviceId: string) {
    this.loadChartData(deviceId);
  }
}