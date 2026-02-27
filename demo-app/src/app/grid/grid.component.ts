/**
 * Angular 18 High-Performance Grid - Main Component
 * Uses CDK Virtual Scrolling + OnPush Change Detection
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  NgZone,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { GridService } from './grid.service';
import {
  ColDef,
  RowClickedEvent,
  CellClickedEvent,
  GroupExpandedEvent,
  GridApi,
  ColumnApi,
  RowNode,
} from './grid.types';

// Forward declarations for components used in template
@Component({
  selector: 'app-grid-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="grid-cell"
      [style.width.px]="column.width || 150"
      [class]="column.cellClass"
      (click)="onClick($event)"
    >
      @if (column.cellRenderer) {
        <span [innerHTML]="renderedValue"></span>
      } @else {
        <span>{{ displayValue }}</span>
      }
    </div>
  `,
  styles: [`
    .grid-cell {
      display: flex;
      align-items: center;
      padding: 0 12px;
      height: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      border-right: 1px solid #e0e0e0;
    }
  `],
})
export class GridCellComponent<T = any> {
  @Input() data: T | null = null;
  @Input() column: ColDef<T> = {} as ColDef<T>;
  @Input() value: any = null;

  @Output() cellClicked = new EventEmitter<MouseEvent>();

  get displayValue(): string {
    if (this.value === null || this.value === undefined) {
      return '';
    }
    if (this.column.valueFormatter) {
      return this.column.valueFormatter({ value: this.value, data: this.data });
    }
    return String(this.value);
  }

  get renderedValue(): string {
    if (this.column.cellRenderer && this.data) {
      return this.column.cellRenderer({
        data: this.data,
        value: this.value,
        column: this.column,
        api: {} as GridApi<T>,
      });
    }
    return this.displayValue;
  }

  onClick(event: MouseEvent): void {
    this.cellClicked.emit(event);
  }
}

@Component({
  selector: 'app-grid-row',
  standalone: true,
  imports: [CommonModule, GridCellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="grid-row"
      [class.grid-row-group]="row.node.group"
      [class.grid-row-leaf]="!row.node.group"
      [style.height.px]="rowHeight"
      [style.paddingLeft.px]="row.depth * 24"
      (click)="onRowClick($event)"
    >
      @if (row.node.group) {
        <div class="grid-row-group-toggle" (click)="onToggle($event)">
          <span class="toggle-icon">{{ expanded ? '▼' : '▶' }}</span>
        </div>
      } @else {
        <div class="grid-row-indent"></div>
      }

      @for (col of columns; track col.field) {
        <app-grid-cell
          [data]="row.node.data"
          [column]="col"
          [value]="getCellData(row, col)"
          (cellClicked)="onCellClick($event, col)"
        />
      }
    </div>
  `,
  styles: [`
    .grid-row {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #e0e0e0;
      cursor: pointer;
    }
    .grid-row:hover {
      background-color: #f5f5f5;
    }
    .grid-row-group {
      background-color: #fafafa;
      font-weight: 600;
    }
    .grid-row-group-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 100%;
      cursor: pointer;
      user-select: none;
    }
    .toggle-icon {
      font-size: 10px;
      color: #666;
    }
    .grid-row-indent {
      width: 24px;
    }
  `],
})
export class GridRowComponent<T = any> {
  @Input() row: any = null;
  @Input() columns: ColDef<T>[] = [];
  @Input() rowHeight = 50;

  @Output() groupToggle = new EventEmitter<{ groupId: string; node: any }>();
  @Output() rowClick = new EventEmitter<MouseEvent>();
  @Output() cellClick = new EventEmitter<{ event: MouseEvent; column: ColDef<T> }>();

  expanded = false;

  onToggle(event: MouseEvent): void {
    event.stopPropagation();
    this.expanded = !this.expanded;
    if (this.row?.node?.id) {
      this.groupToggle.emit({ groupId: this.row.node.id, node: this.row.node });
    }
  }

  onRowClick(event: MouseEvent): void {
    this.rowClick.emit(event);
  }

  onCellClick(event: MouseEvent, column: ColDef<T>): void {
    event.stopPropagation();
    this.cellClick.emit({ event, column });
  }

  getCellData(row: any, col: ColDef<T>): any {
    if (!row.node.data) {
      return row.node.key;
    }
    return row.node.data[col.field as keyof T];
  }
}

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [CommonModule, ScrollingModule, GridRowComponent, GridCellComponent],
  providers: [GridService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css'],
})
export class GridComponent<T = any> implements OnInit, OnDestroy {
  // ==========================================================================
  // Inputs (AG Grid Compatible API)
  // ==========================================================================

  @Input()
  set rowData(value: T[] | undefined) {
    if (value) {
      this.gridService.setRowData(value);
    }
  }

  @Input()
  set columnDefs(value: ColDef<T>[] | undefined) {
    if (value) {
      this.gridService.setColumnDefs(value);
    }
  }

  @Input()
  set groupBy(value: (keyof T)[] | undefined) {
    if (value) {
      this.gridService.setGroupBy(value);
    }
  }

  @Input() rowHeight = 50;
  @Input() headerHeight = 50;
  @Input() pagination = false;
  @Input() paginationPageSize = 100;

  // ==========================================================================
  // Outputs (Events)
  // ==========================================================================

  @Output() rowClicked = new EventEmitter<RowClickedEvent<T>>();
  @Output() cellClicked = new EventEmitter<CellClickedEvent<T>>();
  @Output() groupExpanded = new EventEmitter<GroupExpandedEvent<T>>();
  @Output() gridReady = new EventEmitter<{ api: GridApi<T>; columnApi: ColumnApi<T> }>();

  // ==========================================================================
  // ViewChild References
  // ==========================================================================

  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  // ==========================================================================
  // Grid API
  // ==========================================================================

  private _api: GridApi<T> | null = null;

  get api(): GridApi<T> | null {
    return this._api;
  }

  // ==========================================================================
  // Constructor
  // ==========================================================================

  constructor(
    public gridService: GridService<T>,
    private ngZone: NgZone
  ) {}

  // ==========================================================================
  // Lifecycle
  // ==========================================================================

  ngOnInit(): void {
    this.gridService.setRowHeight(this.rowHeight);

    // Initialize API outside zone for performance
    this.ngZone.runOutsideAngular(() => {
      this._api = this.gridService.getApi();

      // Emit grid ready event
      setTimeout(() => {
        if (this._api) {
          this.gridReady.emit({
            api: this._api,
            columnApi: this.createColumnApi(),
          });
        }
      }, 0);
    });
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  onGroupToggle(groupId: string, node: any): void {
    this.gridService.toggleGroup(groupId);
    this.groupExpanded.emit({ node, expanded: true });
  }

  onRowClick(event: MouseEvent, row: any): void {
    this.rowClicked.emit({
      data: row.node.data,
      node: row.node,
      event,
    });
  }

  onCellClick(event: MouseEvent, row: any, col: ColDef<T>): void {
    this.cellClicked.emit({
      data: row.node.data,
      node: row.node,
      column: col,
      value: row.node.data ? row.node.data[col.field as keyof T] : null,
      event,
    });
  }

  handleCellClick(eventData: { event: MouseEvent; column: ColDef<T> }, row: any): void {
    this.onCellClick(eventData.event, row, eventData.column);
  }

  // ==========================================================================
  // TrackBy Functions (Critical for Performance)
  // ==========================================================================

  trackByRow(index: number, row: any): string {
    return row.node.id;
  }

  trackByColumn(index: number, col: ColDef<T>): string {
    return col.field as string;
  }

  // ==========================================================================
  // Utility
  // ==========================================================================

  private createColumnApi(): ColumnApi<T> {
    return {
      getAllColumns: () => this.gridService.columnDefs(),
      getColumn: (colId) => this.gridService.columnDefs().find((c) => c.field === colId) ?? null,
      setColumnWidth: (colId, width) => {
        // Implement column width management
      },
      autoSizeColumns: (colIds) => {
        // Implement auto-sizing
      },
    };
  }
}
