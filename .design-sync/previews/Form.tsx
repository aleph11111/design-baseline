import * as React from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "design-baseline";

type Values = {
  title: string;
  cuisine: string;
  serves: string;
  tag: string;
};

function useDemoForm(defaults: Values) {
  return useForm<Values>({ defaultValues: defaults });
}

// Minimal stand-ins for the input/select controls this wave doesn't own —
// styled to match Input/SelectTrigger so the field stack reads correctly.
function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    />
  );
}

export function BasicFields() {
  const form = useDemoForm({ title: "Sunday Carbonara", cuisine: "italian", serves: "4", tag: "" });

  return (
    <Form {...form}>
      <form className="w-full max-w-md space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <TextField placeholder="Sunday Carbonara" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cuisine"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuisine</FormLabel>
                <FormControl>
                  <TextField {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="serves"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serves</FormLabel>
                <FormControl>
                  <TextField type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="tag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tag</FormLabel>
              <FormControl>
                <TextField placeholder="weeknight-classic" {...field} />
              </FormControl>
              <FormDescription>A single kebab-case label. Optional.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

export function ValidationError() {
  const form = useDemoForm({ title: "", cuisine: "italian", serves: "-1", tag: "Weeknight Classic" });

  React.useEffect(() => {
    form.setError("title", { message: "Title is required" });
    form.setError("serves", { message: "Must be a positive integer" });
    form.setError("tag", { message: "Lowercase letters, numbers, and dashes only" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form {...form}>
      <form className="w-full max-w-md space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <TextField placeholder="Sunday Carbonara" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="serves"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serves</FormLabel>
              <FormControl>
                <TextField type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tag</FormLabel>
              <FormControl>
                <TextField {...field} />
              </FormControl>
              <FormDescription>A single kebab-case label. Optional.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
