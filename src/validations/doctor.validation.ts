import { z } from 'zod';

export const createDoctorSchema = z.object({
  name: z.string().min(2, 'Doctor name must be at least 2 characters').trim(),
  specialization: z.string().min(2, 'Specialization is required').trim(),
  hospital: z.string().min(2, 'Hospital is required').trim(),
  phone: z.string().min(6, 'Valid phone number is required').trim(),
  email: z.string().email('Valid email is required').toLowerCase().trim(),
});

export const createDoctorPatientSchema = z.object({
  name: z.string().min(2, 'Patient name must be at least 2 characters').trim(),
  age: z.coerce.number().min(0, 'Age cannot be negative').max(130, 'Age cannot exceed 130'),
  gender: z.enum(['Male', 'Female', 'Other'] as const),
  phone: z.string().min(6, 'Valid phone number is required').trim(),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  condition: z.string().min(2, 'Medical condition is required').trim(),
  status: z
    .enum(['Active', 'Discharged', 'Under Observation', 'Critical'] as const)
    .default('Active'),
  admissionDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type CreateDoctorPatientInput = z.infer<typeof createDoctorPatientSchema>;
