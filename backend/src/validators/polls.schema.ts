import { z } from 'zod';

export const createPollSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, 'Question cannot be empty.')
    .min(5, 'Question is too short — add a bit more detail.')
    .max(240, 'Question is too long — keep it under 240 characters.')
    .regex(/[a-zA-Z]/, 'Question must contain actual words, not just numbers or symbols.'),

  options: z
    .array(
      z.string().trim()
        .min(1, 'Option cannot be empty.')
        .max(120, 'Option is too long — keep it under 120 characters.')
    )
    .min(2, 'Add at least 2 options so people have a choice.')
    .max(5, 'Maximum 5 options allowed.')
    .superRefine((options, ctx) => {
      const normalized = options.map((o) => o.toLowerCase());
      const seen = new Set<string>();
      normalized.forEach((o, i) => {
        if (seen.has(o)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Option ${i + 1} is a duplicate — all options must be unique.`,
            path: [i],
          });
        }
        seen.add(o);
      });
    }),
});

export const voteSchema = z.object({
  optionId: z.string().uuid('Invalid option selected.'),
});
