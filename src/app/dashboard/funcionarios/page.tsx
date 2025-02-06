import { api } from "@/api/fake";
import { Button } from "@/components/ui/button";
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

const data = await api.getEmployees();

export default async function EmployeesTable() {
  return (
    <main className="container mx-auto flex h-full flex-col justify-evenly gap-8">
      <div className="flex items-center justify-between border-b pb-8">
        <h1 className="flex text-2xl font-semibold">Funcionários</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            Busca Avançada
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button asChild className="gap-2">
            <Link href={"funcionarios/adicionar"}>
              <span>+</span>
              Adicionar
            </Link>
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
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

          {/* <div className="flex items-center gap-2">
            <span className="text-sm">Buscar:</span>
            <Input className="w-48" />
          </div> */}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">Nome</TableHead>
              <TableHead className="font-medium">Empresa</TableHead>
              <TableHead className="font-medium">Departamento</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.company}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.status}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Link href={`funcionarios/${employee.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash className="h-4 w-4" />
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
