/**
 * Angular 18 High-Performance Grid - Demo Component
 * Demonstrates 100K+ row performance
 */

import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridComponent } from '../grid/grid.component';
import { ColDef, RowClickedEvent, CellClickedEvent } from '../grid/grid.types';

interface Employee {
  id: number;
  name: string;
  department: string;
  role: string;
  salary: number;
  location: string;
  startDate: string;
  performance: number;
}

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [CommonModule, GridComponent],
  template: `
    <div class="demo-container">
      <header class="demo-header">
        <h1>Angular 18 High-Performance Grid Demo</h1>
        <div class="demo-stats">
          <span class="stat">
            <strong>{{ rowData().length | number }}</strong> rows
          </span>
          <span class="stat">
            <strong>{{ renderTime }}ms</strong> render time
          </span>
          <button class="btn" (click)="loadData(100000)">Load 100K</button>
          <button class="btn" (click)="loadData(500000)">Load 500K</button>
          <button class="btn" (click)="toggleGrouping()">
            {{ groupingEnabled ? 'Disable' : 'Enable' }} Grouping
          </button>
        </div>
      </header>

      <app-grid
        [rowData]="rowData()"
        [columnDefs]="columnDefs"
        [groupBy]="groupBy"
        [rowHeight]="50"
        (rowClicked)="onRowClicked($event)"
        (cellClicked)="onCellClicked($event)"
        (gridReady)="onGridReady($event)"
      />
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 20px;
      max-width: 1600px;
      margin: 0 auto;
    }
    .demo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }
    .demo-header h1 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }
    .demo-stats {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .stat {
      padding: 8px 16px;
      background: #f0f0f0;
      border-radius: 4px;
      font-size: 14px;
    }
    .stat strong {
      color: #0066cc;
    }
    .btn {
      padding: 8px 16px;
      background: #0066cc;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #0052a3;
    }
  `],
})
export class DemoComponent implements OnInit {
  // ==========================================================================
  // State
  // ==========================================================================

  readonly rowData = signal<Employee[]>([]);
  renderTime = 0;
  groupingEnabled = true;

  groupBy: (keyof Employee)[] = ['department'];

  columnDefs: ColDef<Employee>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      sortable: true,
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      sortable: true,
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 180,
      sortable: true,
      filter: true,
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 200,
      sortable: true,
    },
    {
      field: 'salary',
      headerName: 'Salary',
      width: 120,
      sortable: true,
      valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 150,
      sortable: true,
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 130,
      sortable: true,
    },
    {
      field: 'performance',
      headerName: 'Performance',
      width: 120,
      sortable: true,
      cellRenderer: (params) => {
        const value = params.value;
        const color = value >= 80 ? '#22c55e' : value >= 60 ? '#eab308' : '#ef4444';
        return `<span style="color: ${color}; font-weight: bold;">${value}%</span>`;
      },
    },
  ];

  // ==========================================================================
  // Lifecycle
  // ==========================================================================

  ngOnInit(): void {
    this.loadData(100000);
  }

  // ==========================================================================
  // Data Generation (Simulate Large Dataset)
  // ==========================================================================

  loadData(count: number): void {
    const startTime = performance.now();

    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Support', 'Product'];
    const roles = [
      'Software Engineer',
      'Senior Engineer',
      'Staff Engineer',
      'Principal Engineer',
      'Engineering Manager',
      'Sales Rep',
      'Account Executive',
      'Marketing Manager',
      'HR Specialist',
      'Financial Analyst',
      'Operations Manager',
      'Support Specialist',
      'Product Manager',
      'Senior PM',
      'Director',
    ];
    const locations = ['New York', 'San Francisco', 'London', 'Singapore', 'Tokyo', 'Berlin', 'Remote'];

    const data: Employee[] = [];

    for (let i = 0; i < count; i++) {
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];

      data.push({
        id: i + 1,
        name: `Employee ${i + 1}`,
        department: dept,
        role: `${dept} - ${role}`,
        salary: Math.floor(Math.random() * 150000) + 50000,
        location,
        startDate: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        performance: Math.floor(Math.random() * 40) + 60,
      });
    }

    this.rowData.set(data);

    const endTime = performance.now();
    this.renderTime = Math.round(endTime - startTime);

    console.log(`Loaded ${count} rows in ${this.renderTime}ms`);
  }

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  toggleGrouping(): void {
    this.groupingEnabled = !this.groupingEnabled;
    this.groupBy = this.groupingEnabled ? ['department'] : [];
  }

  onRowClicked(event: RowClickedEvent<Employee>): void {
    console.log('Row clicked:', event.data);
  }

  onCellClicked(event: CellClickedEvent<Employee>): void {
    console.log('Cell clicked:', {
      column: event.column.field,
      value: event.value,
    });
  }

  onGridReady(event: any): void {
    console.log('Grid ready:', event.api);
  }
}
