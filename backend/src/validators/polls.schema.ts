import { z } from 'zod';

export const createPollSchema = z.object({
  question: z.string().trim().min(5).max(240),
  options: z
    .array(z.string().trim().min(1).max(120))
    .min(2)
    .max(5)
    .superRefine((options, ctx) => {
      const normalized = options.map((option) => option.toLowerCase());

      if (new Set(normalized).size !== normalized.length) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Options must be unique' });
      }
    })
});

export const voteSchema = z.object({
  optionId: z.string().uuid()
});
