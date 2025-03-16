import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash/debounce";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const SearchFormSchema = z.object({
  search: z.string().optional(),
});

interface SearchFormProps {
  onSearch: (values: z.infer<typeof SearchFormSchema>) => void;
  placeholder?: string;
  defaultValue?: string;
  label?: string;
  debounceTime?: number;
}

export function SearchForm({
  onSearch,
  placeholder = "buscar",
  defaultValue = "",
  label = "Buscar:",
  debounceTime = 500,
}: SearchFormProps) {
  const form = useForm<z.infer<typeof SearchFormSchema>>({
    resolver: zodResolver(SearchFormSchema),
    defaultValues: {
      search: defaultValue,
    },
  });

  // Criar uma versão com debounce da função onSearch
  const debouncedSearch = useCallback(
    debounce((values: z.infer<typeof SearchFormSchema>) => {
      onSearch(values);
    }, debounceTime),
    [onSearch, debounceTime],
  );

  // Observar mudanças no campo de busca
  useEffect(() => {
    const subscription = form.watch((values) => {
      debouncedSearch(values as z.infer<typeof SearchFormSchema>);
    });

    return () => {
      subscription.unsubscribe();
      debouncedSearch.cancel();
    };
  }, [form, debouncedSearch]);

  return (
    <Form {...form}>
      <form
        className="flex items-center justify-between"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(form.getValues());
        }}
      >
        <FormField
          control={form.control}
          name="search"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4">
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <Input placeholder={placeholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

// Exportar o schema para ser usado nos componentes que utilizam o SearchForm
export { SearchFormSchema };
