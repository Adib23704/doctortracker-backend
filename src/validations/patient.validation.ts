import { z } from 'zod';

export const createPatientSchema = z.object({
  name: z.string({ required_error: 'Patient name is required' }).min(2, 'Name must be at least 2 characters').trim(),
  age: z.coerce.number({ required_error: 'Age is required' }).min(0, 'Age cannot be negative').max(130, 'Age cannot exceed 130'),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Gender is required' }),
  phone: z.string({ required_error: 'Phone number is required' }).min(6, 'Valid phone number is required').trim(),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  condition: z.string({ required_error: 'Medical condition is required' }).min(2, 'Condition is required').trim(),
  status: z.enum(['Active', 'Discharged', 'Under Observation', 'Critical']).default('Active'),
  admissionDate: z.coerce.date().optional(),
  doctor: z.string({ required_error: 'Assigned doctor is required' }),
  notes: z.string().optional(),
});

export const updatePatientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim().optional(),
  age: z.coerce.number().min(0, 'Age cannot be negative').max(130, 'Age cannot exceed 130').optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  phone: z.string().min(6, 'Valid phone number is required').trim().optional(),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  condition: z.string().min(2, 'Condition is required').trim().optional(),
  status: z.enum(['Active', 'Discharged', 'Under Observation', 'Critical']).optional(),
  admissionDate: z.coerce.date().optional(),
  doctor: z.string().optional(),
  notes: z.string().optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
