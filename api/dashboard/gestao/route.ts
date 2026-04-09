export type AssignEPIToEmployeePayload = {
  employeeId: string;
  epiId: string;
  quantity: number;
  size?: string;
  comment?: string;
};

export type EmployeeEPIAssignmentType = {
  _id: string;
  employeeId: string;
  epiId: string;
  createdAt?: string;
  updatedAt?: string;
};

const getAuthHeader = (userId: string | { email: string }) => {
  return `Bearer ${typeof userId === "string" ? userId : userId.email}`;
};

export async function AssignEPIToEmployee(
  userId: string | { email: string },
  values: AssignEPIToEmployeePayload,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/managements`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: getAuthHeader(userId),
      },
      body: JSON.stringify(values),
    },
  );

  const data = await res.json();
  return data;
}

export async function GetEmployeeEPIAssignments(
  userId: string | { email: string },
  employeeId?: string,
  page?: string,
): Promise<{
  success: boolean;
  count: number;
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: null | number;
    prevPage: null | number;
  };
  assignments: EmployeeEPIAssignmentType[];
}> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/managements`;

  const queryParams = new URLSearchParams();
  if (employeeId) queryParams.append("employeeId", employeeId);
  if (page) queryParams.append("page", page);
  if (queryParams.toString()) url += `?${queryParams.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: getAuthHeader(userId),
    },
  });

  const data = await res.json();
  return data;
}

export async function DeleteEmployeeEPIAssignment(
  userId: string | { email: string },
  assignmentId: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/managements/${assignmentId}`,
    {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        Authorization: getAuthHeader(userId),
      },
    },
  );

  const data = await res.json();
  return data;
}
