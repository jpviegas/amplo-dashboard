import { api } from "@/api/fake";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, MoreHorizontal, Pencil, Trash } from "lucide-react";
import Link from "next/link";

const data = await api.getDepartments();

export default async function DepartmentPage() {
  return (
    <main className="container mx-auto flex h-full flex-col justify-evenly gap-8">
      <div className="flex items-center justify-between border-b pb-8">
        <h1 className="flex text-2xl font-semibold">Departamentos</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            Busca Avançada
            <ChevronDown className="size-4" />
          </Button>
          <Button asChild className="gap-2">
            <Link href={"funcionarios/cadastrar"}>
              <span>+</span>
              Adicionar
            </Link>
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Mostrar</span>
          <Select defaultValue="10">
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm">registros</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm">Filtrar por funcionários:</span>
          <RadioGroup defaultValue="ativos" className="flex gap-4">
            <div className="flex items-center gap-1">
              <RadioGroupItem value="ativos" id="ativos" />
              <label htmlFor="ativos" className="text-sm">
                Ativos
              </label>
            </div>
            <div className="flex items-center gap-1">
              <RadioGroupItem value="inativos" id="inativos" />
              <label htmlFor="inativos" className="text-sm">
                Inativos
              </label>
            </div>
            <div className="flex items-center gap-1">
              <RadioGroupItem value="todos" id="todos" />
              <label htmlFor="todos" className="text-sm">
                Todos
              </label>
            </div>
          </RadioGroup>

          <div className="flex items-center gap-2">
            <span className="text-sm">Buscar:</span>
            <Input className="w-48" />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">Nome</TableHead>
              <TableHead className="font-medium">
                Número de Funcionários
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((department) => (
              <TableRow key={department.id}>
                <TableCell>{department.department}</TableCell>
                <TableCell className="flex items-center justify-between">
                  8
                  {/* <Dialog>
                    <DialogTrigger asChild>
                      <Pencil className="size-4" />
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Editar departamento</DialogTitle>
                        <DialogDescription>
                          Crie um novo cargo e selecione a empresa.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="department" className="text-right">
                            Nome
                          </Label>
                          <Input
                            id="department"
                            placeholder="Nome do departamento"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="company" className="text-right">
                            Empresa
                          </Label>
                          <Input
                            id="company"
                            placeholder="Nome da empresa"
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">
                            Fechar
                          </Button>
                        </DialogClose>
                        <Button type="submit">Salvar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog> */}
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Link href={`departamentos/${department.id}`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">1 a 10 de 88</div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">4</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">5</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">9</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </main>
  );
}
