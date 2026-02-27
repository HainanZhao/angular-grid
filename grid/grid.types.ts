/**
 * Angular 18 High-Performance Grid - Type Definitions
 * AG Grid Compatible API
 */

// ============================================================================
// Column Definitions
// ============================================================================

export interface ColDef<T = any> {
  field: keyof T | string;
  headerName?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  sortable?: boolean;
  filter?: boolean;
  cellRenderer?: (params: CellRendererParams<T>) => string;
  valueGetter?: (params: ValueGetterParams<T>) => any;
  valueFormatter?: (params: ValueFormatterParams<T>) => string;
  cellClass?: string | ((params: CellClassParams<T>) => string);
  headerClass?: string;
  suppressSizeToFit?: boolean;
  wrapText?: boolean;
  autoHeight?: boolean;
}

export interface CellRendererParams<T> {
  data: T | null;
  value: any;
  column: ColDef<T>;
  api: GridApi<T>;
}

export interface ValueGetterParams<T> {
  data: T;
  node: RowNode<T>;
}

export interface ValueFormatterParams<T> {
  value: any;
  data: T | null;
}

export interface CellClassParams<T> {
  data: T | null;
  value: any;
  column: ColDef<T>;
}

// ============================================================================
// Row Data & Grouping
// ============================================================================

export interface RowNode<T = any> {
  id: string;
  data: T | null;
  parent?: RowNode<T> | null;
  children?: RowNode<T>[];
  level: number;
  field?: string;
  key?: string;
  group: boolean;
  expanded: boolean;
  rowGroupIndex?: number;
  allChildrenCount?: number;
  firstChild?: boolean;
  lastChild?: boolean;
}

export interface TreeRow<T = any> {
  node: RowNode<T>;
  depth: number;
  visible: boolean;
}

// ============================================================================
// Grid API
// ============================================================================

export interface GridApi<T = any> {
  getDisplayedRowAtIndex(index: number): RowNode<T> | null;
  getDisplayedRowCount(): number;
  forEachNode(callback: (node: RowNode<T>) => void): void;
  forEachNodeAfterFilter(callback: (node: RowNode<T>) => void): void;
  forEachNodeAfterFilterAndSort(callback: (node: RowNode<T>) => void): void;
  expandAll(): void;
  collapseAll(): void;
  setGroupOpen(groupKey: string, open: boolean): void;
  refreshRows(rowIds: string[]): void;
  refreshCells(params: RefreshCellsParams<T>): void;
  sizeColumnsToFit(): void;
  getColumn(colId: string): ColDef<T> | null;
  getAllColumns(): ColDef<T>[];
}

export interface RefreshCellsParams<T> {
  rowNodes?: RowNode<T>[];
  columns?: (keyof T | string)[];
  force?: boolean;
}

// ============================================================================
// Events
// ============================================================================

export interface RowClickedEvent<T = any> {
  data: T | null;
  node: RowNode<T>;
  event: MouseEvent;
}

export interface CellClickedEvent<T = any> {
  data: T | null;
  node: RowNode<T>;
  column: ColDef<T>;
  value: any;
  event: MouseEvent;
}

export interface GroupExpandedEvent<T = any> {
  node: RowNode<T>;
  expanded: boolean;
}

export interface GridReadyEvent<T = any> {
  api: GridApi<T>;
  columnApi: ColumnApi<T>;
}

export interface ColumnApi<T = any> {
  getAllColumns(): ColDef<T>[];
  getColumn(colId: string): ColDef<T> | null;
  setColumnWidth(colId: string, width: number): void;
  autoSizeColumns(colIds: string[]): void;
}

// ============================================================================
// Grid Options (AG Grid Compatible)
// ============================================================================

export interface GridOptions<T = any> {
  rowData?: T[];
  columnDefs?: ColDef<T>[];
  groupBy?: (keyof T)[];
  rowHeight?: number;
  headerHeight?: number;
  pagination?: boolean;
  paginationPageSize?: number;
  suppressRowClickSelection?: boolean;
  rowSelection?: 'single' | 'multiple';
  onRowClicked?: (event: RowClickedEvent<T>) => void;
  onCellClicked?: (event: CellClickedEvent<T>) => void;
  onGroupExpanded?: (event: GroupExpandedEvent<T>) => void;
  onGridReady?: (event: GridReadyEvent<T>) => void;
  defaultColDef?: Partial<ColDef<T>>;
}

// ============================================================================
// Utility Types
// ============================================================================

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  colId: string;
  direction: SortDirection;
}

export interface FilterState {
  colId: string;
  filterType: 'text' | 'number' | 'date' | 'boolean';
  filter: any;
}

export interface GridState {
  sort: SortState[];
  filter: FilterState[];
  groupBy: string[];
  expandedGroups: Set<string>;
}
