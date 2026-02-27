import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridComponent } from '../../../grid/grid.component';
import { ColDef, RowClickedEvent, CellClickedEvent } from '../../../grid/grid.types';

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
  selector: 'app-demo-page',
  standalone: true,
  imports: [CommonModule, GridComponent],
  templateUrl: './demo-page.component.html',
  styleUrls: ['./demo-page.component.css'],
})
export class DemoPageComponent implements OnInit {
  readonly rowData = signal<Employee[]>([]);
  renderTime = 0;
  groupingEnabled = true;
  isLoading = false;

  groupBy: (keyof Employee)[] = ['department'];

  columnDefs: ColDef<Employee>[] = [
    { field: 'id', headerName: 'ID', width: 80, sortable: true },
    { field: 'name', headerName: 'Name', width: 200, sortable: true },
    { field: 'department', headerName: 'Department', width: 180, sortable: true },
    { field: 'role', headerName: 'Role', width: 250 },
    {
      field: 'salary',
      headerName: 'Salary',
      width: 120,
      sortable: true,
      valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
    },
    { field: 'location', headerName: 'Location', width: 150 },
    { field: 'startDate', headerName: 'Start Date', width: 130 },
    {
      field: 'performance',
      headerName: 'Performance',
      width: 120,
      cellRenderer: (params) => {
        const value = params.value;
        const color = value >= 80 ? '#22c55e' : value >= 60 ? '#eab308' : '#ef4444';
        return `<span style="color: ${color}; font-weight: bold;">${value}%</span>`;
      },
    },
  ];

  ngOnInit(): void {
    this.loadData(100000);
  }

  loadData(count: number): void {
    this.isLoading = true;
    const startTime = performance.now();

    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Support', 'Product'];
    const roles = [
      'Software Engineer', 'Senior Engineer', 'Staff Engineer', 'Principal Engineer',
      'Engineering Manager', 'Sales Rep', 'Account Executive', 'Marketing Manager',
      'HR Specialist', 'Financial Analyst', 'Operations Manager', 'Support Specialist',
      'Product Manager', 'Senior PM', 'Director',
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

    // Simulate async load for UX
    setTimeout(() => {
      this.rowData.set(data);
      const endTime = performance.now();
      this.renderTime = Math.round(endTime - startTime);
      this.isLoading = false;
      console.log(`Loaded ${count} rows in ${this.renderTime}ms`);
    }, 100);
  }

  toggleGrouping(): void {
    this.groupingEnabled = !this.groupingEnabled;
    this.groupBy = this.groupingEnabled ? ['department'] : [];
  }

  onRowClicked(event: RowClickedEvent<Employee>): void {
    console.log('Row clicked:', event.data);
  }

  onCellClicked(event: CellClickedEvent<Employee>): void {
    console.log('Cell clicked:', { column: event.column.field, value: event.value });
  }

  onGridReady(event: any): void {
    console.log('Grid ready');
  }
}
