"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, MapPin, Phone, Search, User } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  rg: z.string(),
  birthDate: z.string(),
  socialName: z.string(),
  cnh: z.string(),
  cnhCategory: z.string(),
  cnhExpiration: z.string(),
  cep: z.string(),
  address: z.string(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  phone: z.string(),
  extension: z.string(),
  fatherName: z.string(),
  motherName: z.string(),
  gender: z.string(),
  nationality: z.string(),
  placeOfBirth: z.string(),
  civilStatus: z.string(),
});

// interface PersonalDataFormProps {
//     form: UseFormReturn<FormValues>;
//   }

export default function PersonalDataForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rg: "",
      birthDate: "",
      socialName: "",
      cnh: "",
      cnhCategory: "",
      cnhExpiration: "",
      cep: "",
      address: "",
      neighborhood: "",
      city: "",
      state: "",
      phone: "",
      extension: "",
      fatherName: "",
      motherName: "",
      gender: "",
      nationality: "",
      placeOfBirth: "",
      civilStatus: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* First Row */}
          <FormField
            control={form.control}
            name="rg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RG</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="RG" {...field} />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de nascimento</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="mm/dd/yyyy" {...field} />
                    <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="socialName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Social</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Nome Social" {...field} />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Second Row */}
          <FormField
            control={form.control}
            name="cnh"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNH</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="CNH" {...field} />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cnhCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria da CNH</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="a">A</SelectItem>
                    <SelectItem value="b">B</SelectItem>
                    <SelectItem value="ab">AB</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cnhExpiration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de vencimento da CNH</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="mm/dd/yyyy" {...field} />
                    <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Third Row */}
          <FormField
            control={form.control}
            name="cep"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="CEP" {...field} />
                    <MapPin className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Endereço" {...field} />
                    <MapPin className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fourth Row */}
          <FormField
            control={form.control}
            name="neighborhood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Bairro" {...field} />
                    <MapPin className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Cidade" {...field} />
                    <MapPin className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>UF</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sp">SP</SelectItem>
                    <SelectItem value="rj">RJ</SelectItem>
                    <SelectItem value="mg">MG</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fifth Row */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Telefone" {...field} />
                    <Phone className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="extension"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ramal</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Ramal" {...field} />
                    <Phone className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sixth Row */}
          <FormField
            control={form.control}
            name="fatherName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do pai</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Nome do pai" {...field} />
                    <User className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="motherName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da mãe</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Nome da mãe" {...field} />
                    <User className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gênero</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Seventh Row */}
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nacionalidade</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Nacionalidade" {...field} />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="placeOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Naturalidade</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Naturalidade" {...field} />
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="civilStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado Civil</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                    <SelectItem value="casado">Casado(a)</SelectItem>
                    <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                    <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
