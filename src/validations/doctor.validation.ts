import { z } from 'zod';

export const createDoctorSchema = z.object({
  name: z.string({ required_error: 'Doctor name is required' }).min(2, 'Name must be at least 2 characters').trim(),
  specialization: z.string({ required_error: 'Specialization is required' }).min(2, 'Specialization is required').trim(),
  hospital: z.string({ required_error: 'Hospital name is required' }).min(2, 'Hospital is required').trim(),
  phone: z.string({ required_error: 'Phone number is required' }).min(6, 'Valid phone number is required').trim(),
  email: z.string({ required_error: 'Email is required' }).email('Valid email is required').toLowerCase().trim(),
});

export const createDoctorPatientSchema = z.object({
  name: z.string({ required_error: 'Patient name is required' }).min(2, 'Name must be at least 2 characters').trim(),
  age: z.coerce.number({ required_error: 'Age is required' }).min(0, 'Age cannot be negative').max(130, 'Age cannot exceed 130'),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Gender is required' }),
  phone: z.string({ required_error: 'Phone number is required' }).min(6, 'Valid phone number is required').trim(),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  condition: z.string({ required_error: 'Medical condition is required' }).min(2, 'Condition is required').trim(),
  status: z.enum(['Active', 'Discharged', 'Under Observation', 'Critical']).default('Active'),
  admissionDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type CreateDoctorPatientInput = z.infer<typeof createDoctorPatientSchema>;
