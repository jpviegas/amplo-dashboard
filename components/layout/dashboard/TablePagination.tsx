"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationData {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: null | number;
  prevPage: null | number;
}

interface TablePaginationProps {
  pagination: PaginationData;
  itemsCount: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({
  pagination,
  itemsCount,
  onPageChange,
}: TablePaginationProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <p className="text-muted-foreground text-sm">
        {itemsCount > 0 ? (
          <>
            Mostrando{" "}
            {pagination.page === 1 ? 1 : (pagination.page - 1) * 10 + 1}
            {" a "}
            {pagination.page * 10 > pagination.total
              ? pagination.total
              : pagination.page * 10}
            {" de "}
            {pagination.total}
            {" resultados"}
          </>
        ) : (
          "Nenhum resultado encontrado"
        )}
      </p>

      {pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => {
                  if (pagination.hasPrevPage && pagination.prevPage) {
                    onPageChange(pagination.prevPage);
                  }
                }}
                className={
                  !pagination.hasPrevPage
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              >
                Anterior
              </PaginationPrevious>
            </PaginationItem>

            {Array.from({ length: pagination.totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              const shouldShowPage =
                pageNumber === 1 ||
                pageNumber === pagination.totalPages ||
                Math.abs(pageNumber - pagination.page) <= 1;

              if (!shouldShowPage) {
                if (
                  pageNumber === 2 ||
                  pageNumber === pagination.totalPages - 1
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <span className="px-2">...</span>
                    </PaginationItem>
                  );
                }
                return null;
              }

              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    onClick={() => onPageChange(pageNumber)}
                    isActive={pagination.page === pageNumber}
                    className="cursor-pointer"
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => {
                  if (pagination.hasNextPage && pagination.nextPage) {
                    onPageChange(pagination.nextPage);
                  }
                }}
                className={
                  !pagination.hasNextPage
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              >
                Próximo
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
