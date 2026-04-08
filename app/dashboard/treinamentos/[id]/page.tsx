// "use client";

// import {
//   GetTrainingById,
//   UpdateTraining,
// } from "@/api/dashboard/treinamentos/route";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { useUser } from "@/context/UserContext";
// import { TrainingsTypeWithId, trainingSchema } from "@/zodSchemas";
// import { zodResolver } from "@hookform/resolvers/zod";
// import Cookies from "js-cookie";
// import { ArrowLeft } from "lucide-react";
// import Link from "next/link";
// import { useParams, useRouter } from "next/navigation";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import { FieldErrors, useForm } from "react-hook-form";
// import { toast } from "sonner";
// import { z } from "zod";

// export default function TrainingEditPage() {
//   type FormValues = z.infer<typeof trainingSchema>;

//   const { user } = useUser();
//   const userId = user?._id || Cookies.get("user");
//   const params = useParams<{ id: string }>();
//   const rawTrainingId = params?.id;
//   const trainingId = useMemo(() => {
//     const raw = String(rawTrainingId ?? "");
//     const match = raw.match(/[a-f0-9]{24}$/i);
//     return match?.[0] ?? rawTrainingId;
//   }, [rawTrainingId]);
//   const [training, setTraining] = useState<TrainingsTypeWithId>();
//   const router = useRouter();
//   const [isReturning, setIsReturning] = useState(false);

//   const form = useForm<FormValues>({
//     resolver: zodResolver(trainingSchema),
//     defaultValues: {
//       title: "",
//       subTitle: "",
//       image: "",
//     },
//   });

//   const fetchTraining = useCallback(async () => {
//     try {
//       if (!userId) {
//         return;
//       }
//       if (!trainingId) {
//         return;
//       }

//       const { success, training } = await GetTrainingById(userId, trainingId);

//       if (!success) {
//         toast.error("Não foi possível carregar o treinamento.");
//         return;
//       }

//       if (!training) {
//         toast.error("Treinamento não encontrado.");
//         return;
//       }

//       setTraining(training);
//       form.reset({
//         title: training.title ?? "",
//         subTitle: training.subTitle ?? "",
//         image: training.image ?? "",
//       });
//     } catch (error) {
//       console.error("Erro ao carregar treinamento:", error);
//       toast.error("Não foi possível carregar o treinamento.");
//     } finally {
//     }
//   }, [trainingId, form, userId]);

//   useEffect(() => {
//     fetchTraining();
//   }, [fetchTraining]);

//   async function onSubmit(values: FormValues) {
//     try {
//       if (!userId) {
//         toast.error("Usuário não identificado.");
//         return;
//       }
//       if (!trainingId) {
//         toast.error("Treinamento inválido.");
//         return;
//       }

//       const { success, message } = await UpdateTraining(userId, trainingId, {
//         title: values.title,
//         subTitle: values.subTitle,
//         image: values.image ? values.image : undefined,
//       });

//       if (!success) {
//         toast.warning(message);
//         return;
//       }

//       toast.success(message);
//       await fetchTraining();
//       setIsReturning(true);
//       setTimeout(() => {
//         router.push("/dashboard/treinamentos");
//       }, 1000);
//     } catch (error) {
//       console.error("Erro ao editar treinamento:", error);
//       toast.error("Erro ao editar o treinamento.");
//     }
//   }

//   function onInvalid(errors: FieldErrors<FormValues>) {
//     const messages = Object.values(errors)
//       .map((error) => error?.message)
//       .filter((message): message is string => Boolean(message));

//     const uniqueMessages = Array.from(new Set(messages));
//     for (const message of uniqueMessages) {
//       toast.error(message);
//     }
//   }

//   return (
//     <main className="container mx-auto h-full w-11/12 pt-8">
//       <div className="mb-8 flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <Button variant="outline" size="icon" asChild>
//             <Link href="/dashboard/treinamentos">
//               <ArrowLeft className="h-4 w-4" />
//             </Link>
//           </Button>
//           <h1 className="text-3xl font-bold">
//             Editar Treinamento {training?.title}
//           </h1>
//         </div>
//       </div>

//       <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr,300px]">
//         <Card>
//           <CardContent className="p-6">
//             <Form {...form}>
//               <form
//                 className="space-y-8"
//                 onSubmit={form.handleSubmit(onSubmit, onInvalid)}
//               >
//                 <div className="grid gap-4 md:grid-cols-3">
//                   <FormField
//                     control={form.control}
//                     name="title"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Título</FormLabel>
//                         <FormControl>
//                           <Input
//                             placeholder="Título do treinamento"
//                             {...field}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="subTitle"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Subtítulo</FormLabel>
//                         <FormControl>
//                           <Input
//                             placeholder="Subtítulo do treinamento"
//                             {...field}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="image"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Imagem (URL)</FormLabel>
//                         <FormControl>
//                           <Input placeholder="https://..." {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>

//                 <div className="flex gap-4">
//                   <Button
//                     type="submit"
//                     disabled={form.formState.isSubmitting || isReturning}
//                   >
//                     {isReturning
//                       ? "Voltando..."
//                       : form.formState.isSubmitting
//                         ? "Enviando..."
//                         : "Salvar"}
//                   </Button>
//                   <Button
//                     asChild
//                     variant="outline"
//                     type="reset"
//                     disabled={form.formState.isSubmitting || isReturning}
//                   >
//                     <Link href="./">Cancelar</Link>
//                   </Button>
//                 </div>
//               </form>
//             </Form>
//           </CardContent>
//         </Card>
//       </div>
//     </main>
//   );
// }
