"use client";
import useClaimsData from "@/hooks/useClaimsData";
import { Claim } from "@/app/api/claims/route";
import {
  Button,
  Checkbox,
  Flex,
  IconButton,
  Pagination,
  ScrollArea,
  Skeleton,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  colors,
} from "@hdfclife-insurance/one-x-ui";
import { ArrowDown, ArrowUp, ArrowsDownUp } from "@phosphor-icons/react";
import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import {
  Column,
  FilterFn,
  PaginationState,
  type Table as ReactTable,
  SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { CSSProperties } from "react";

declare module "@tanstack/react-table" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

const fuzzyFilter: FilterFn<Claim> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({
    itemRank,
  });

  return itemRank.passed;
};

const getCommonPinningStyles = (column: Column<Claim>): CSSProperties => {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right");
  return {
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    opacity: isPinned ? 0.95 : 1,
    position: isPinned ? "sticky" : "relative",
    width: column.getSize(),
    boxShadow: isLastLeftPinnedColumn
      ? `-4px 0 4px -4px ${colors.neutral.grey[200]}  inset`
      : isFirstRightPinnedColumn
      ? `-4px 0px 4px 0px ${colors.neutral.grey[200]}`
      : undefined,
    background: "white",
    zIndex: isPinned ? 1 : 0,
  };
};

export default function ClaimsTable() {
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const {
    data: tableData,
    loading,
    error,
    page,
    setPage,
    setStatus,
  } = useClaimsData();
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const columnHelper = createColumnHelper<Claim>();

  const columns = [
    // columnHelper.display({
    //   id: "select",
    //   header: ({ table }: { table: ReactTable<Claim> }) => (
    //     <Checkbox
    //       checked={
    //         table.getIsAllRowsSelected()
    //           ? true
    //           : table.getIsSomeRowsSelected()
    //           ? "indeterminate"
    //           : false
    //       }
    //       onChange={table.getToggleAllRowsSelectedHandler()}
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox
    //       checked={row.getIsSelected()}
    //       onChange={row.getToggleSelectedHandler()}
    //     />
    //   ),
    // }),

    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.accessor("policyNumber", {
      header: "Policy Number",
      cell: (info) => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.accessor("claimantName", {
      header: "Claimant Name",
      cell: (info) => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.accessor("claimAmount", {
      header: "Claim Amount",
      cell: (info) => Number(info.getValue()),
      enableSorting: true,
    }),
    columnHelper.accessor("fraudStatus", {
      header: "Fraud Status",
      cell: (info) => info.getValue(),
      enableSorting: true,
      filterFn: "fuzzy",
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => info.getValue(),
      enableSorting: true,
      filterFn: "fuzzy",
    }),
    columnHelper.accessor("createdDate", {
      header: "Created Date",
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      enableSorting: true,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: () => (
        <Flex gap={2}>
          <Button size="xs" variant="link">
            Reject
          </Button>
          <Button size="xs" variant="link">
            Approve
          </Button>
        </Flex>
      ),
    }),
  ];

  const table = useReactTable({
    data: tableData?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),

    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,

    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,

    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,

    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination,
      columnPinning: {
        right: ["action"],
      },
      sorting,
      rowSelection,
    },
  });

  const changeActiveTab = (e: React.MouseEvent<HTMLButtonElement>) => {
    const value = (e.target as HTMLButtonElement).getAttribute("data-value");
    if (value) {
      setActiveTab(value);
      setStatus(value);
    }
    setPage(1);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    // custom properties for the layout
    <div className="min-h-dvh flex flex-col bg-gray-100 [--left-sidebar-width:240px] [--right-sidebar-width:60px] [--gutter:24px] [--header-height:68px]">
      <main>
        <div>
          <div className="mt-7 space-y-3">
            <Text fontWeight="semibold" size="xl" className="text-primary-blue">
              Claims Records
            </Text>
            <Tabs size="sm" value={activeTab} variant="underline">
              <ScrollArea>
                <TabsList>
                  <TabsTrigger onClick={(e) => changeActiveTab(e)} value="all">
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    onClick={(e) => changeActiveTab(e)}
                    value="Pending"
                  >
                    Pending
                  </TabsTrigger>
                  <TabsTrigger
                    onClick={(e) => changeActiveTab(e)}
                    value="Approved"
                  >
                    Approved
                  </TabsTrigger>
                  <TabsTrigger
                    onClick={(e) => changeActiveTab(e)}
                    value="Rejected"
                  >
                    Rejected
                  </TabsTrigger>
                </TabsList>
              </ScrollArea>

              <TabsContent value={activeTab}>
                <Table.ScrollContainer type="always">
                  <Table withTableBorder>
                    <Table.Head>
                      {table.getHeaderGroups().map((headerGroup, i) => (
                        <Table.Row key={i}>
                          {headerGroup.headers.map((header, i) => (
                            <Table.Th
                              key={i}
                              className="py-4! bg-indigo-50"
                              style={{
                                ...getCommonPinningStyles(header.column),
                              }}
                            >
                              {header.isPlaceholder ? null : (
                                <Flex gap={1} align="center">
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                                  {header.column.getCanSort() && (
                                    <IconButton
                                      variant="link"
                                      color="gray"
                                      size="xs"
                                      onClick={header.column.getToggleSortingHandler()}
                                    >
                                      {header.column.getIsSorted() === "asc" ? (
                                        <ArrowUp />
                                      ) : header.column.getIsSorted() ===
                                        "desc" ? (
                                        <ArrowDown />
                                      ) : (
                                        <ArrowsDownUp />
                                      )}
                                    </IconButton>
                                  )}
                                </Flex>
                              )}
                            </Table.Th>
                          ))}
                        </Table.Row>
                      ))}
                    </Table.Head>
                    {!loading ? (
                      <Table.Body>
                        {table.getRowModel().rows.map((row, i) => (
                          <Table.Row key={i}>
                            {row.getVisibleCells().map((cell) => (
                              <Table.Cell
                                key={cell.id}
                                className="py-4!"
                                style={{
                                  ...getCommonPinningStyles(cell.column),
                                }}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </Table.Cell>
                            ))}
                          </Table.Row>
                        ))}
                      </Table.Body>
                    ) : (
                      <>
                        <Table.Body>
                          {table.getRowModel().rows.map((row, i) => (
                            <Table.Row key={i}>
                              {row.getVisibleCells().map((cell) => (
                                <Table.Cell key={cell.id}>
                                  <Skeleton height={"20px"} width={"auto"} />
                                </Table.Cell>
                              ))}
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </>
                    )}
                  </Table>
                </Table.ScrollContainer>

                <Flex justify="flex-end" className="mt-3">
                  <Pagination
                    page={page}
                    count={tableData?.totalRecords || 0}
                    onPrevious={() => setPage(Math.max(page - 1, 1))}
                    onNext={() =>
                      setPage(Math.min(page + 1, tableData?.totalPages || 1))
                    }
                    pageSize={tableData?.pageSize || 10}
                    onPageChange={(details: { page: number }) =>
                      setPage(details.page)
                    }
                  />
                </Flex>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
