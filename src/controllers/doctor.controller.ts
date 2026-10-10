import type { Request, Response } from 'express';
import {
  addPatientUnderDoctor,
  createDoctor as createDoctorService,
  deleteDoctor as deleteDoctorService,
  deletePatientFromDoctor,
  getDoctorById,
  getDoctorsList,
  getPatientsByDoctorId,
} from '../services/doctor.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createDoctorPatientSchema, createDoctorSchema } from '../validations/doctor.validation.js';

export const getDoctors = asyncHandler(async (req: Request, res: Response) => {
  const result = await getDoctorsList(req.query);
  res.status(200).json({
    success: true,
    data: result.doctors,
    pagination: result.pagination,
  });
});

export const getDoctor = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const doctor = await getDoctorById(id);
  res.status(200).json({
    success: true,
    data: doctor,
  });
});

export const createDoctor = asyncHandler(async (req: Request, res: Response) => {
  const validated = createDoctorSchema.parse(req.body);
  const doctor = await createDoctorService(validated);
  res.status(201).json({
    success: true,
    data: doctor,
  });
});

export const deleteDoctor = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await deleteDoctorService(id);
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getDoctorPatients = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await getPatientsByDoctorId(id, req.query);
  res.status(200).json({
    success: true,
    data: result.patients,
    pagination: result.pagination,
  });
});

export const addDoctorPatient = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const validated = createDoctorPatientSchema.parse(req.body);
  const patient = await addPatientUnderDoctor(id, validated);
  res.status(201).json({
    success: true,
    data: patient,
  });
});

export const deleteDoctorPatient = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const patientId = req.params.patientId as string;
  const result = await deletePatientFromDoctor(id, patientId);
  res.status(200).json({
    success: true,
    data: result,
  });
});
