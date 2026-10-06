import { z } from 'zod';

export const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').optional().nullable(),
  age: z.coerce.number().min(10).max(100).optional().nullable(),
  state: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  course: z.string().optional().nullable(),
  branch: z.string().optional().nullable(),
  year: z.string().optional().nullable(),
  college_name: z.string().optional().nullable(),
  college_type: z.string().optional().nullable(),
  cgpa: z.coerce.number().min(0).max(10).optional().nullable(),
  percentage: z.coerce.number().min(0).max(100).optional().nullable(),
  annual_family_income: z.coerce.number().min(0).optional().nullable(),
  category: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  disability_status: z.boolean().optional().nullable(),
  minority_status: z.boolean().optional().nullable(),
  rural_urban: z.string().optional().nullable(),
  previous_scholarship: z.boolean().optional().nullable(),
  achievements: z.string().optional().nullable(),
});
