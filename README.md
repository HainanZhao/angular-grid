# Angular 18 High-Performance Grid

A stripped-down, high-performance data grid for Angular 18+ with row grouping support.

## Features

- ✅ **Virtual Scrolling** - Handle 100K+ rows with `@angular/cdk/scrolling`
- ✅ **Row Grouping** - Expand/collapse grouped rows
- ✅ **Signals-Based** - Angular 18 reactive state management
- ✅ **OnPush Change Detection** - Optimized for performance
- ✅ **AG Grid Compatible API** - Familiar `rowData`, `columnDefs`, `groupBy`
- ✅ **Standalone Components** - Modern Angular, no NgModules

## Performance Targets

| Metric | Target |
|--------|--------|
| Initial render (100K rows) | < 500ms |
| Scroll FPS | 60fps |
| Group expand/collapse | < 50ms |
| Memory (100K rows) | < 100MB |

## Installation

```bash
npm install @angular/cdk
```

## Quick Start

```typescript
// app.config.ts
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    // ... other providers
  ]
};
```

```typescript
// app.component.ts
import { GridComponent } from './grid/grid.component';

@Component({
  standalone: true,
  imports: [GridComponent],
  template: `
    <app-grid
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [groupBy]="['department']"
      (rowClicked)="onRowClicked($event)"
    />
  `
})
export class AppComponent {
  rowData = signal([/* your data */]);
  columnDefs = [
    { field: 'name', headerName: 'Name' },
    { field: 'department', headerName: 'Department' },
    { field: 'salary', headerName: 'Salary' }
  ];
}
```

## API Reference

### GridComponent Inputs

| Input | Type | Description |
|-------|------|-------------|
| `rowData` | `Signal<T[]>` | Array of row data |
| `columnDefs` | `ColumnDef[]` | Column definitions |
| `groupBy` | `string[]` | Fields to group by |
| `rowHeight` | `number` | Row height in pixels (default: 50) |
| `pagination` | `boolean` | Enable pagination |
| `pageSize` | `number` | Rows per page |

### GridComponent Outputs

| Output | Type | Description |
|--------|------|-------------|
| `rowClicked` | `EventEmitter<RowClickedEvent>` | Row click event |
| `cellClicked` | `EventEmitter<CellClickedEvent>` | Cell click event |
| `groupExpanded` | `EventEmitter<GroupExpandedEvent>` | Group expand/collapse |

## Project Structure

```
angular-grid/
├── grid/
│   ├── grid.component.ts      # Main grid component
│   ├── grid.component.html    # Grid template
│   ├── grid.component.css     # Grid styles
│   ├── grid.service.ts        # Grouping/sorting/filtering logic
│   ├── grid-row.component.ts  # Individual row component
│   ├── grid-cell.component.ts # Individual cell component
│   └── grid.types.ts          # TypeScript interfaces
├── demo/
│   └── demo.component.ts      # Demo with 100K rows
└── README.md
```

## License

MIT - Build from scratch, no AG Grid code included.
