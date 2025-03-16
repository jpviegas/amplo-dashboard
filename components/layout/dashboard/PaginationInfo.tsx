interface PaginationInfoProps {
  dataLength: number;
  pagination: {
    page: number;
    total: number;
    limit?: number;
  };
  className?: string;
}

export function PaginationInfo({
  dataLength,
  pagination,
  className = "text-muted-foreground text-sm",
}: PaginationInfoProps) {
  const limit = pagination.limit || 10;

  return (
    <p className={className}>
      {dataLength > 0 ? (
        <>
          Mostrando{" "}
          {pagination.page === 1 ? 1 : (pagination.page - 1) * limit + 1}
          {" a "}
          {pagination.page * limit > pagination.total
            ? pagination.total
            : pagination.page * limit}
          {" de "}
          {pagination.total}
          {" resultados"}
        </>
      ) : (
        "Nenhum resultado encontrado"
      )}
    </p>
  );
}
