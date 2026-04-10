import { z } from "zod";

export const ufsBrasil = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export type LoginType = z.infer<typeof loginSchema>;
export const loginSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type CompanyType = z.infer<typeof registerCompanySchema>;
export type CompanyTypeWithId = CompanyType & { _id: string };
export const registerCompanySchema = z.object({
  companyName: z
    .string({ required_error: "O nome é obrigatório" })
    .nonempty("O nome é obrigatório")
    .min(1, "O nome deve conter pelo menos 1 caractere"),
  nickname: z.string().min(1, "O nome fantasia é obrigatório"),
  cnpj: z
    .string({ required_error: "Preencha apenas os 14 números do CNPJ" })
    .length(14, "Preencha apenas os 14 números do CNPJ")
    .nonempty(),
  cep: z
    .string({ required_error: "O número do CEP é obrigatório" })
    .length(8, "Preencha apenas os 8 números do CEP"),
  address: z.string().min(1, "O endereço é obrigatório").optional(),
  addressNumber: z
    .string()
    .min(1, "O número do endereço é obrigatório")
    .optional(),
  district: z.string().min(1, "O bairro é obrigatório").optional(),
  city: z.string().min(1, "A cidade é obrigatória").optional(),
  uf: z.string().min(1, "A UF é obrigatória").optional(),
  // page: z.string().min(1, "O número da folha obrigatório"),
  // registration: z.string().min(1, "A inscrição estadual é obrigatória"),
  // responsibleCpf: z
  //   .string()
  //   .length(11, "O número de CPF do responsável é obrigatório"),
  // responsibleName: z.string().min(1, "O nome do responsável é obrigatório"),
  // responsibleRole: z.string().min(1, "O cargo do responsável é obrigatória"),
  // companyEmail: z.string().email("O email da empresa é obrigatório"),
});

export type EmployeeType = z.infer<typeof registerEmployeeSchema>;
export type EmployeeTypeWithId = EmployeeType & { _id: string };
export const registerEmployeeSchema = z.object({
  name: z
    .string()
    .nonempty("O nome é obrigatório")
    .min(10, "O nome deve conter pelo menos 10 caracteres"),
  email: z
    .string()
    .nonempty("O email é obrigatório")
    .min(1, "O email é obrigatório")
    .email("Email inválido"),
  // pis: z.string().min(1, "O PIS é obrigatório").optional(),
  pis: z.string().optional(),
  cpf: z
    .string()
    .nonempty("O CPF é obrigatório")
    .length(11, "Preencha apenas os 11 números do CPF"),
  // .optional(),
  registration: z
    .string()
    // .min(1, "O número de matrícula é obrigatório")
    .optional(),
  admissionDate: z
    .string({
      required_error: "A data de admissão é obrigatória",
    })
    .nonempty("A data de admissão é obrigatória"),
  companyId: z
    .string({ required_error: "O código da empresa é obrigatório" })
    .nonempty("O código da empresa é obrigatório")
    .min(1, "O código da empresa é obrigatório"),
  workingHours: z
    .string({ required_error: "As horas de trabalho são obrigatórias" })
    .nonempty("As horas de trabalho são obrigatórias"),
  status: z.enum(["active", "inactive"]).optional(),
  departmentId: z.string().optional(),
  costCenter: z.string().optional(),
  position: z.string().optional(),
  sheetNumber: z.string().optional(),
  ctps: z.string().optional(),
  directSuperior: z.string().optional(),
  rg: z
    .string()
    .nonempty("O RG é obrigatório")
    .length(9, "Preencha apenas os 9 números do RG")
    .optional(),
  birthDate: z
    .string({
      required_error: "A data de nascimento é obrigatória",
    })
    .optional(),
  socialName: z.string().optional(),
  cnh: z.string().optional(),
  cnhCategory: z.string().optional(),
  cnhExpiration: z
    .string({
      required_error: "A data de expiração da CNH é obrigatória",
    })
    .optional(),
  cep: z.string().optional(),
  address: z.string().optional(),
  addressNumber: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  extension: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  placeOfBirth: z.string().optional(),
  placeOfBirthUF: z.string().optional(),
  civilStatus: z.string().optional(),
  dependents: z.boolean().optional(),
  dependentsQuantity: z.number().optional(),
  children: z
    .array(
      z.object({
        name: z.string().optional(),
        cpf: z.string().optional(),
        birthDate: z.string().optional(),
      }),
    )
    .optional(),
});

export type DepartmentType = z.infer<typeof registerDepartmentSchema>;
export type DepartmentTypeWithId = DepartmentType & { _id: string };
export const registerDepartmentSchema = z.object({
  departmentName: z.string().min(1, "O nome é obrigarório"),
  // company: z.string().min(1, "A empresa é obrigarória").optional(),
  // approvalFlow: z.string().optional(),
  // sheetNumber: z.string().min(1, "O número da folha é obrigarório").optional(),
});

export type PositionType = z.infer<typeof registerPositionSchema>;
export type PositionTypeWithId = PositionType & { _id: string };
export const registerPositionSchema = z.object({
  positionName: z.string().min(1, "O nome do cargo é obrigarório"),
});

export type WorkingHourType = z.infer<typeof registerWorkingHourSchema>;
export type WorkingHourTypeWithId = WorkingHourType & { _id: string };
export const registerWorkingHourSchema = z.object({
  name: z
    .string({ required_error: "O nome do horário é obrigatório" })
    .nonempty("O nome do horário é obrigatório")
    .min(3, "O nome do horário deve ter pelo menos 3 caracteres"),
  days: z
    .array(
      z.object({
        dayOfWeek: z
          .number({ required_error: "O dia da semana é obrigatório" })
          .int("O dia da semana deve ser um número inteiro")
          .min(0, "O dia da semana deve estar entre 0 e 6")
          .max(6, "O dia da semana deve estar entre 0 e 6"),
        ranges: z.array(
          z
            .object({
              start: z.union([
                z.literal(""),
                z
                  .string()
                  .regex(
                    /^([01]\d|2[0-3]):[0-5]\d$/,
                    "Hora inicial inválida (HH:MM)",
                  ),
              ]),
              end: z.union([
                z.literal(""),
                z
                  .string()
                  .regex(
                    /^([01]\d|2[0-3]):[0-5]\d$/,
                    "Hora final inválida (HH:MM)",
                  ),
              ]),
            })
            .superRefine((value, ctx) => {
              const startFilled = Boolean(value.start);
              const endFilled = Boolean(value.end);

              if (startFilled !== endFilled) {
                ctx.addIssue({
                  code: "custom",
                  message: "Preencha início e fim do intervalo",
                  path: [],
                });
                return;
              }

              if (!startFilled || !endFilled) return;

              const [sh, sm] = String(value.start).split(":").map(Number);
              const [eh, em] = String(value.end).split(":").map(Number);
              const startMinutes = sh * 60 + sm;
              const endMinutes = eh * 60 + em;

              if (
                !Number.isFinite(startMinutes) ||
                !Number.isFinite(endMinutes)
              ) {
                ctx.addIssue({
                  code: "custom",
                  message: "Horário inválido",
                  path: [],
                });
                return;
              }

              if (endMinutes <= startMinutes) {
                ctx.addIssue({
                  code: "custom",
                  message: "A hora final deve ser maior que a inicial",
                  path: [],
                });
              }
            }),
        ),
      }),
    )
    .length(7, "O horário deve conter os 7 dias da semana"),
});

export type DocumentsType = z.infer<typeof registerDocumentSchema>;
export type DocumentsTypeWithId = DocumentsType & { _id: string };
export const registerDocumentSchema = z.object({
  userId: z.string().min(1, "O ID do usuário é obrigatório"),
  signers: z.string().min(1, "O email dos assinantes é obrigatório"),
  type: z.enum([
    "codigo_conduta",
    "contrato",
    "diversos",
    "ficha_epi",
    "ficha_egistro",
    "politica_interna",
    "saude_ocupacional",
    "termos",
    "demais_documentos",
  ]),
  file: z.string().min(1, "O arquivo é obrigatório"),
});

export type ServiceType = z.infer<typeof serviceSchema>;
export type ServiceTypeWithId = ServiceType & { _id: string };
export const serviceSchema = z.object({
  type: z.string().min(1, "O ID do usuário é obrigatório"),
  subject: z.string().min(1, "O assunto do serviço é obrigatório"),
  text: z.string().min(1, "O texto do serviço é obrigatório"),
  status: z.enum(["Pendente", "Aprovado", "Rejeitado"]),
  name: z.string().min(1, "O nome do serviço é obrigatório"),
});

export type CityType = z.infer<typeof citySchema>;
export type CityTypeWithId = CityType & { _id: string };
export const citySchema = z.object({
  city: z.string().nonempty("O nome da cidade é obrigatório"),
  meal: z
    .number({ required_error: "O valor do vale refeição é obrigatório" })
    .nonnegative({ message: "O valor do vale refeição deve ser positivo" })
    .min(1, "O valor do vale refeição é obrigatório"),
  transport: z
    .number({ required_error: "O valor do vale transporte é obrigatório" })
    .nonnegative({ message: "O valor do vale transporte deve ser positivo" })
    .min(1, "O valor do vale transporte é obrigatório"),
});

export type TrainingsType = z.infer<typeof trainingSchema>;
export type TrainingsTypeWithId = TrainingsType & { _id: string };
export const trainingSchema = z.object({
  title: z
    .string()
    .nonempty("O título da treinamento é obrigatório")
    .min(3, "O título da treinamento deve ter pelo menos 3 caracteres"),
  subTitle: z
    .string({ required_error: "O subtítulo é obrigatório" })
    .nonempty("O subtítulo é obrigatório"),
  image: z.string().optional(),
});

export type EPIType = z.infer<typeof epiSchema>;
export type EPITypeWithId = EPIType & { _id: string };
export const epiSchema = z.object({
  name: z
    .string()
    .nonempty("O nome do E.P.I. é obrigatório")
    .min(3, "O nome do E.P.I. deve ter pelo menos 3 caracteres"),
  ca: z.string().optional(),
});

export type ManagementsType = z.infer<typeof managementsSchema>;
export type ManagementsTypeWithId = ManagementsType & { _id: string };
export const managementsSchema = z.object({
  employeeId: z.object({
    name: z.string(),
    email: z.string(),
  }),
  epiId: z.object({
    name: z.string(),
    email: z.string(),
  }),
  quantity: z.number().optional(),
  size: z.string().optional(),
  comment: z.string().optional(),
});

export type ManagementEPIType = z.infer<typeof managementEpiSchema>;
export type ManagementEPITypeWithId = ManagementEPIType & { _id: string };
export const managementEpiSchema = z.object({
  employeeId: z
    .string({ required_error: "O funcionário é obrigatório" })
    .nonempty("O funcionário é obrigatório")
    .min(3, "O funcionário é obrigatório"),
  epiId: z
    .string({ required_error: "O C.A. é obrigatório" })
    .nonempty("O C.A. é obrigatório"),
  quantity: z.number().optional(),
  size: z.string().optional(),
  comment: z.string().optional(),
});

export type HolidayType = z.infer<typeof holidaySchema>;
export type HolidayTypeWithId = HolidayType & { _id: string };
export const holidaySchema = z.object({
  date: z
    .string({ required_error: "A data do feriado é obrigatório" })
    .nonempty("A data do feriado é obrigatório")
    .min(3, "O feriado é obrigatório"),
  comment: z.string().optional(),
});
