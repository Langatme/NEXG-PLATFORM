// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Promoted from vendor/ahmedbna-ui-components (registry/src/components/ui/table.tsx).
// Adaptations: NexG tokens via useTheme (surface/border/text/accent/status); vendor
// Button pagination replaced with themed icon buttons (NexGButton is label-based);
// sort/page presses keep haptics via use-haptics. NexGSectionHeader not used — it is
// a title+action block, not a column header. Behavior preserved: column-def API,
// search filter, asc->desc->none sort cycling, pagination, a11y sort labels.
import { NexGText } from '@/components/ui/NexGText';
import { useHaptics } from '@/hooks/use-haptics';
import { useTheme } from '@/theme';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Search,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

// Types
export interface NexGTableColumn<T = unknown> {
  id: string;
  header: string;
  accessorKey: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  minWidth?: number;
  cell?: (value: unknown, row: T) => React.ReactNode;
  headerCell?: () => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface NexGTableProps<T = unknown> {
  data: T[];
  columns: NexGTableColumn<T>[];
  pagination?: boolean;
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  loading?: boolean;
  emptyMessage?: string;
  style?: ViewStyle;
  headerStyle?: ViewStyle;
  rowStyle?: ViewStyle;
  cellStyle?: ViewStyle;
  onRowPress?: (row: T, index: number) => void;
  sortable?: boolean;
  filterable?: boolean;
}

type NexGSortDirection = 'asc' | 'desc' | null;

interface NexGSortState {
  column: string | null;
  direction: NexGSortDirection;
}

const PAGE_BUTTON_SIZE = 36;

export function NexGTable<T = unknown>({
  data,
  columns,
  pagination = true,
  pageSize = 10,
  searchable = true,
  searchPlaceholder = 'Search...',
  loading = false,
  emptyMessage = 'No data available',
  style,
  headerStyle,
  rowStyle,
  cellStyle,
  onRowPress,
  sortable = true,
  filterable = true,
}: NexGTableProps<T>) {
  // Theme colors
  const { colors, radii, spacing } = useTheme();
  const feedback = useHaptics(true);
  const borderStrong = colors.border.strong;
  const borderSubtle = colors.border.subtle;
  const textColor = colors.text.primary;
  const mutedColor = colors.text.muted;
  const cardColor = colors.surface.primary;
  const primaryColor = colors.accent.primary;

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortState, setSortState] = useState<NexGSortState>({
    column: null,
    direction: null,
  });

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let processedData = [...data];

    // Apply search filter
    if (searchQuery && filterable) {
      processedData = processedData.filter((row) =>
        columns.some((column) => {
          if (!column.filterable) return false;
          const value = (row as Record<string, unknown>)[column.accessorKey];
          return String(value || '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        })
      );
    }

    // Apply sorting
    if (sortState.column && sortState.direction && sortable) {
      const sortColumn = sortState.column;
      const sortDirection = sortState.direction;
      processedData.sort((a, b) => {
        const aValue = (a as Record<string, unknown>)[sortColumn];
        const bValue = (b as Record<string, unknown>)[sortColumn];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortDirection === 'asc' ? comparison : -comparison;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return processedData;
  }, [data, searchQuery, sortState, columns, filterable, sortable]);

  // Pagination
  const totalPages = pagination
    ? Math.ceil(filteredAndSortedData.length / pageSize)
    : 1;
  const startIndex = pagination ? (currentPage - 1) * pageSize : 0;
  const endIndex = pagination
    ? startIndex + pageSize
    : filteredAndSortedData.length;
  const paginatedData = filteredAndSortedData.slice(startIndex, endIndex);

  // Handlers
  const handleSort = (columnId: string) => {
    if (!sortable) return;

    const column = columns.find((col) => col.id === columnId);
    if (!column?.sortable) return;

    feedback('impact-light');
    setSortState((prev) => {
      if (prev.column === columnId) {
        // Cycle through: asc -> desc -> null
        const newDirection: NexGSortDirection =
          prev.direction === 'asc'
            ? 'desc'
            : prev.direction === 'desc'
              ? null
              : 'asc';

        return {
          column: newDirection ? columnId : null,
          direction: newDirection,
        };
      } else {
        return { column: columnId, direction: 'asc' };
      }
    });
  };

  const handlePageChange = (page: number) => {
    feedback('impact-light');
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const renderPageButton = (
    label: string,
    icon: React.ReactNode,
    onPress: () => void,
    disabled: boolean
  ) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        width: PAGE_BUTTON_SIZE,
        height: PAGE_BUTTON_SIZE,
        borderRadius: radii.small,
        borderWidth: 1,
        borderColor: borderStrong,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: disabled ? 0.5 : 1,
      }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      {icon}
    </TouchableOpacity>
  );

  const renderSortIcon = (columnId: string) => {
    if (!sortable) return null;

    const column = columns.find((col) => col.id === columnId);
    if (!column?.sortable) return null;

    if (sortState.column !== columnId) {
      return (
        <ChevronUp size={16} color={mutedColor} style={{ opacity: 0.3 }} />
      );
    }

    return sortState.direction === 'asc' ? (
      <ChevronUp size={16} color={primaryColor} />
    ) : (
      <ChevronDown size={16} color={primaryColor} />
    );
  };

  const renderCell = (column: NexGTableColumn<T>, row: T, _rowIndex: number) => {
    const value = (row as Record<string, unknown>)[column.accessorKey];
    const cellContent = column.cell
      ? column.cell(value, row)
      : String(value || '');

    const alignStyle: TextStyle = {
      textAlign: column.align || 'left',
    };

    return (
      <View
        key={column.id}
        style={[
          {
            flex: column.width ? 0 : 1,
            width: column.width as ViewStyle['width'],
            minWidth: column.minWidth || 100,
            paddingHorizontal: 18,
            paddingVertical: spacing.lg,
            justifyContent: 'center',
          },
          cellStyle,
        ]}
      >
        {typeof cellContent === 'string' ? (
          <NexGText variant="body" style={alignStyle}>
            {cellContent}
          </NexGText>
        ) : (
          cellContent
        )}
      </View>
    );
  };

  const renderHeader = () => (
    <View
      style={[
        {
          flexDirection: 'row',
          backgroundColor: cardColor,
          borderBottomWidth: 1,
          borderBottomColor: borderSubtle,
        },
        headerStyle,
      ]}
    >
      {columns.map((column) => (
        <TouchableOpacity
          key={column.id}
          style={{
            flex: column.width ? 0 : 1,
            width: column.width as ViewStyle['width'],
            minWidth: column.minWidth || 100,
            paddingHorizontal: 18,
            paddingVertical: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent:
              column.align === 'center'
                ? 'center'
                : column.align === 'right'
                  ? 'flex-end'
                  : 'flex-start',
          }}
          onPress={() => handleSort(column.id)}
          disabled={!column.sortable || !sortable}
          accessibilityRole={column.sortable && sortable ? 'button' : undefined}
          accessibilityLabel={
            column.sortable && sortable
              ? `${column.header}, ${
                  sortState.column === column.id
                    ? sortState.direction === 'asc'
                      ? 'sorted ascending'
                      : 'sorted descending'
                    : 'not sorted'
                }`
              : column.header
          }
        >
          {column.headerCell ? (
            column.headerCell()
          ) : (
            <>
              <NexGText
                variant="bodyStrong"
                style={{
                  marginRight: column.sortable && sortable ? spacing.xs : 0,
                  textAlign: column.align || 'left',
                }}
              >
                {column.header}
              </NexGText>
              {renderSortIcon(column.id)}
            </>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderRow = (row: T, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        {
          flexDirection: 'row',
          backgroundColor: cardColor,
          borderBottomWidth: 1,
          borderBottomColor: borderSubtle,
        },
        rowStyle,
      ]}
      onPress={() => onRowPress?.(row, index)}
      disabled={!onRowPress}
      activeOpacity={onRowPress ? 0.7 : 1}
    >
      {columns.map((column) => renderCell(column, row, index))}
    </TouchableOpacity>
  );

  const renderPagination = () => {
    if (!pagination || totalPages <= 1) return null;

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          paddingVertical: 18,
          backgroundColor: cardColor,
          borderTopWidth: 1,
          borderTopColor: borderSubtle,
        }}
      >
        <NexGText variant="body" color="muted" style={{ fontVariant: ['tabular-nums'] }}>
          Page {currentPage} of {totalPages} ({filteredAndSortedData.length}{' '}
          total)
        </NexGText>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {renderPageButton(
            'Go to first page',
            <ChevronsLeft
              size={16}
              color={currentPage === 1 ? mutedColor : textColor}
            />,
            () => handlePageChange(1),
            currentPage === 1
          )}

          {renderPageButton(
            'Go to previous page',
            <ChevronLeft
              size={16}
              color={currentPage === 1 ? mutedColor : textColor}
            />,
            () => handlePageChange(currentPage - 1),
            currentPage === 1
          )}

          {renderPageButton(
            'Go to next page',
            <ChevronRight
              size={16}
              color={currentPage === totalPages ? mutedColor : textColor}
            />,
            () => handlePageChange(currentPage + 1),
            currentPage === totalPages
          )}

          {renderPageButton(
            'Go to last page',
            <ChevronsRight
              size={16}
              color={currentPage === totalPages ? mutedColor : textColor}
            />,
            () => handlePageChange(totalPages),
            currentPage === totalPages
          )}
        </View>
      </View>
    );
  };

  const renderSearchBar = () => {
    if (!searchable || !filterable) return null;

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: cardColor,
          borderBottomWidth: 1,
          borderColor: borderSubtle,
          paddingHorizontal: 18,
          height: 48,
          marginVertical: 2,
        }}
      >
        <Search size={16} color={mutedColor} style={{ marginRight: spacing.sm }} />

        <TextInput
          style={{
            flex: 1,
            fontSize: 16,
            color: textColor,
            paddingVertical: spacing.sm,
          }}
          placeholder={searchPlaceholder}
          placeholderTextColor={mutedColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityRole="search"
          accessibilityLabel={searchPlaceholder}
        />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View
      accessibilityLiveRegion="polite"
      style={{
        padding: spacing.xxl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: cardColor,
      }}
    >
      <NexGText variant="body" color="muted">
        {emptyMessage}
      </NexGText>
    </View>
  );

  const renderLoadingState = () => (
    <View
      accessibilityLiveRegion="polite"
      style={{
        padding: spacing.xxl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: cardColor,
      }}
    >
      <NexGText variant="body" color="muted">
        Loading...
      </NexGText>
    </View>
  );

  return (
    <View
      style={[
        {
          width: '100%',
          borderRadius: radii.large,
          borderWidth: 1,
          borderColor: borderStrong,
          backgroundColor: cardColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {renderSearchBar()}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth: '100%' }}>
          {renderHeader()}

          {loading ? (
            renderLoadingState()
          ) : paginatedData.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={paginatedData}
              keyExtractor={(_, index) => String(index)}
              renderItem={({ item, index }) => renderRow(item, index)}
              showsVerticalScrollIndicator={false}
              // Rows aren't bounded by pageSize when pagination={false} —
              // without virtualization this was the only size guard missing
              // from an otherwise generic, potentially large data table.
            />
          )}
        </View>
      </ScrollView>

      {renderPagination()}
    </View>
  );
}
