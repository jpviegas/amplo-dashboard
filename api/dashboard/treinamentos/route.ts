// import { TrainingsType, TrainingsTypeWithId } from "@/zodSchemas";

// export async function GetAllTrainings(
//   userId: string | { email: string },
//   search?: string,
//   page?: string,
// ): Promise<{
//   success: boolean;
//   count: number;
//   pagination: {
//     total: number;
//     page: number;
//     totalPages: number;
//     limit: number;
//     hasNextPage: boolean;
//     hasPrevPage: boolean;
//     nextPage: null | number;
//     prevPage: null | number;
//   };
//   trainings: TrainingsTypeWithId[];
// }> {
//   let url = `${process.env.NEXT_PUBLIC_API_URL}/api/trainings/`;

//   const queryParams = new URLSearchParams();

//   if (search) {
//     queryParams.append("search", search);
//   }
//   if (page) {
//     queryParams.append("page", page);
//   }

//   if (queryParams.toString()) {
//     url += `?${queryParams.toString()}`;
//   }

//   const res = await fetch(url, {
//     method: "GET",
//     headers: {
//       "content-type": "application/json",
//       Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
//     },
//   });

//   const data = await res.json();
//   return data;
// }

// export async function GetTrainingById(
//   userId: string | { email: string },
//   trainingId: string,
// ): Promise<{
//   success: boolean;
//   training: TrainingsTypeWithId | null;
// }> {
//   const url = `${process.env.NEXT_PUBLIC_API_URL}/api/trainings/${trainingId}`;

//   const res = await fetch(url, {
//     method: "GET",
//     headers: {
//       "content-type": "application/json",
//       Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
//     },
//   });

//   const data = await res.json();
//   const normalizedTraining: TrainingsTypeWithId | null =
//     data?.training ??
//     (Array.isArray(data?.trainings) ? data.trainings[0] : data?.trainings) ??
//     null;

//   return {
//     ...data,
//     training: normalizedTraining,
//   };
// }

// export async function CreateTraining(
//   userId: string | { email: string },
//   values: TrainingsType,
// ): Promise<{ success: boolean; message: string }> {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trainings`, {
//     method: "POST",
//     headers: {
//       "content-type": "application/json",
//       Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
//     },
//     body: JSON.stringify(values),
//   });

//   if (!res) {
//     throw new Error("Erro ao cadastrar o treinamento");
//   }

//   const data = await res.json();
//   return data;
// }

// export async function UpdateTraining(
//   userId: string | { email: string },
//   trainingId: string,
//   values: TrainingsType,
// ): Promise<{ success: boolean; message: string }> {
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_API_URL}/api/trainings/${trainingId}`,
//     {
//       method: "PATCH",
//       headers: {
//         "content-type": "application/json",
//         Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
//       },
//       body: JSON.stringify(values),
//     },
//   );

//   if (!res) {
//     throw new Error("Erro ao atualizar o treinamento");
//   }

//   const data = await res.json();
//   return data;
// }

// export async function DeleteTraining(
//   userId: string | { email: string },
//   trainingId: string,
// ): Promise<{ success: boolean; message: string }> {
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_API_URL}/api/trainings/${trainingId}`,
//     {
//       method: "DELETE",
//       headers: {
//         "content-type": "application/json",
//         Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
//       },
//     },
//   );

//   const data = await res.json();
//   return data;
// }
