import {
  CreateBraincellSchema,
  createBraincellSchema,
} from "@/lib/validation/braincell";
import { zodResolver } from "@hookform/resolvers/zod";
import { Braincell } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import LoadingButton from "../ui/loading-button";
import { Textarea } from "../ui/textarea";

interface AddEditBraincellDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  braincellToEdit?: Braincell;
}

export default function AddEditBraincellDialog({
  open,
  setOpen,
  braincellToEdit,
}: AddEditBraincellDialogProps) {
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const router = useRouter();

  const form = useForm<CreateBraincellSchema>({
    resolver: zodResolver(createBraincellSchema),
    defaultValues: {
      title: braincellToEdit?.title || "",
      content: braincellToEdit?.content || "",
    },
  });

  async function onSubmit(input: CreateBraincellSchema) {
    try {
      if (braincellToEdit) {
        const response = await fetch("/api/braincells", {
          method: "PUT",
          body: JSON.stringify({
            id: braincellToEdit.id,
            ...input,
          }),
        });
        if (!response.ok) throw Error("Status code: " + response.status);
      } else {
        const response = await fetch("/api/braincells", {
          method: "POST",
          body: JSON.stringify(input),
        });
        if (!response.ok) throw Error("Status code: " + response.status);
        form.reset();
      }
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }
  }

  async function deleteBraincell() {
    if (!braincellToEdit) return;
    setDeleteInProgress(true);
    try {
      const response = await fetch("/api/braincells", {
        method: "DELETE",
        body: JSON.stringify({
          id: braincellToEdit.id,
        }),
      });
      if (!response.ok) throw Error("Status code: " + response.status);
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setDeleteInProgress(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {braincellToEdit ? "Edit BrainCell" : "Add New BrainCell"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Braincell title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Braincell content"
                      {...field}
                      style={{ height: "150px" }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-1 sm:gap-0">
              {braincellToEdit && (
                <LoadingButton
                  variant="destructive"
                  loading={deleteInProgress}
                  disabled={form.formState.isSubmitting}
                  onClick={deleteBraincell}
                  type="button"
                >
                  Delete BrainCell
                </LoadingButton>
              )}
              <LoadingButton
                type="submit"
                loading={form.formState.isSubmitting}
                disabled={deleteInProgress}
              >
                {braincellToEdit ? "Save Edit" : "Add"}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
