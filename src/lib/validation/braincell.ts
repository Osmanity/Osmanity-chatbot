import { z } from "zod";

export const createBraincellSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().optional(),
});

export type CreateBraincellSchema = z.infer<typeof createBraincellSchema>;

export const updateBraincellSchema = createBraincellSchema.extend({
  id: z.string().min(1),
});

export const deleteBraincellSchema = z.object({
  id: z.string().min(1),
});
