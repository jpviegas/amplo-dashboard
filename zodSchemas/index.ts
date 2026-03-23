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
  companyName: z.string().min(10, "O nome é obrigarório"),
  nickname: z.string().min(1, "O nome fantasia é obrigatório"),
  cnpj: z
    .string()
    .nonempty()
    .length(14, "Preencha apenas os 14 números do CNPJ"),
  cep: z.string().length(7, "O número do CEP é obrigatório"),
  address: z.string().min(1, "O endereço é obrigatório"),
  district: z.string().min(1, "O bairro é obrigatório"),
  city: z.string().min(1, "A cidade é obrigatória"),
  uf: z.string().min(1, "A UF é obrigatória"),
  page: z.string().min(1, "O número da folha obrigatório"),
  registration: z.string().min(1, "A inscrição estadual é obrigatória"),
  responsibleCpf: z
    .string()
    .length(11, "O número de CPF do responsável é obrigatório"),
  responsibleName: z.string().min(1, "O nome do responsável é obrigatório"),
  responsibleRole: z.string().min(1, "O cargo do responsável é obrigatória"),
  companyEmail: z.string().email("O email da empresa é obrigatório"),
});

export type EmployeeType = z.infer<typeof registerEmployeeSchema>;
export type EmployeeTypeWithId = EmployeeType & { _id: string };
export const registerEmployeeSchema = z.object({
  name: z.string().min(10, "O nome é obrigarório"),
  email: z.string().min(1, "O email é obrigatório"),
  pis: z.string().min(1, "O PIS é obrigatório").optional(),
  cpf: z
    .string()
    .nonempty("O CPF é obrigatório")
    .length(11, "Preencha apenas os 11 números do CPF")
    .optional(),
  registration: z
    .string()
    .min(1, "O número de matrícula é obrigatório")
    .optional(),
  admissionDate: z
    .string({
      error: "A data de admissão é obrigatória",
    })
    .optional(),
  company: z.string().min(1, "O código da empresa é obrigatório").optional(),
  workingHours: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  department: z.string().optional(),
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
      error: "A data de nascimento é obrigatória",
    })
    .optional(),
  socialName: z.string().optional(),
  cnh: z.string().optional(),
  cnhCategory: z.string().optional(),
  cnhExpiration: z
    .string({
      error: "A data de expiração da CNH é obrigatória",
    })
    .optional(),
  cep: z.string().optional(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z
    .object({
      city: z.string().optional(),
      meal: z.number().optional(),
      transport: z.number().optional(),
    })
    .optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  extension: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  placeOfBirth: z.string().optional(),
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
  company: z.string().min(1, "A empresa é obrigarória").optional(),
  approvalFlow: z.string().optional(),
  sheetNumber: z.string().min(1, "O número da folha é obrigarório").optional(),
});

export type PositionType = z.infer<typeof registerPositionSchema>;
export type PositionTypeWithId = PositionType & { _id: string };
export const registerPositionSchema = z.object({
  positionName: z.string().min(1, "O nome do cargo é obrigarório"),
});

export type WorkingHourType = z.infer<typeof registerWorkingHourSchema>;
export type WorkingHourTypeWithId = WorkingHourType & { _id: string };
export const registerWorkingHourSchema = z.object({
  hour: z.string().min(1, "O nome é obrigarório"),
  company: z.string().min(1, "O ID da empresa é obrigatório"),
});

export type DocumentsType = z.infer<typeof registerDocumentSchema>;
export type DocumentsTypeWithId = DocumentsType & { _id: string };
export const registerDocumentSchema = z.object({
  userId: z.string().min(1, "O ID do usuário é obrigatório"),
  signers: z.string().min(1, "O email dos assinantes é obrigatório"),
  file: z.string().min(1, "O arquivo é obrigatório"),
});

export type ServiceType = z.infer<typeof servicechema>;
export type ServiceTypeWithId = ServiceType & { _id: string };
export const servicechema = z.object({
  type: z.string().min(1, "O ID do usuário é obrigatório"),
  subject: z.string().min(1, "O email dos assinantes é obrigatório"),
  text: z.string().min(1, "O arquivo é obrigatório"),
  status: z.string().min(1, "O arquivo é obrigatório"),
  name: z.string().min(1, "O arquivo é obrigatório"),
});
