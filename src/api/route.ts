// import { NextResponse } from "next/server";
// import { z } from "zod"; // For input validation

// // Validation schema
// const loginSchema = z.object({
//   email: z.string().email("Email inválido"),
//   password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
// });

// export async function POST(request: Request) {
//   try {
//     console.log(request.body);

//     // Parse and validate request body
//     const body = await request.json();
//     const { email, password } = loginSchema.parse(body);

//     // Here you would typically:
//     // 1. Validate credentials against your database
//     // 2. Create a session or JWT token
//     // For example:
//     const isValid = await validateCredentials(email, password);

//     if (!isValid) {
//       return NextResponse.json(
//         { error: "Credenciais inválidas" },
//         { status: 401 },
//       );
//     }

//     // Create session or token
//     const session = await createSession(email);

//     // Set session cookie
//     // cookies().set("session", session, {
//     //   httpOnly: true,
//     //   secure: process.env.NODE_ENV === "production",
//     //   sameSite: "lax",
//     //   maxAge: 60 * 60 * 24 * 7, // 1 week
//     // });

//     return NextResponse.json(
//       { message: "Login realizado com sucesso" },
//       { status: 200 },
//     );
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         { error: "Dados de entrada inválidos" },
//         { status: 400 },
//       );
//     }

//     return NextResponse.json(
//       { error: "Erro interno do servidor" },
//       { status: 500 },
//     );
//   }
// }

// // These functions would need to be implemented based on your authentication system
// async function validateCredentials(email: string, password: string) {
//   // Implement your credential validation logic
//   return true; // Placeholder
// }

// async function createSession(email: string) {
//   // Implement your session creation logic
//   return "session-token"; // Placeholder
// }
