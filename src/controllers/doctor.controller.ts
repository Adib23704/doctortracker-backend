import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getDoctorsList,
  getDoctorById,
  createDoctor as createDoctorService,
  deleteDoctor as deleteDoctorService,
  getPatientsByDoctorId,
  addPatientUnderDoctor,
  deletePatientFromDoctor,
} from '../services/doctor.service.js';
import { createDoctorSchema, createDoctorPatientSchema } from '../validations/doctor.validation.js';

export const getDoctors = asyncHandler(async (req: Request, res: Response) => {
  const result = await getDoctorsList(req.query);
  res.status(200).json({
    success: true,
    data: result.doctors,
    pagination: result.pagination,
  });
});

export const getDoctor = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await getDoctorById(req.params.id);
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
  const result = await deleteDoctorService(req.params.id);
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getDoctorPatients = asyncHandler(async (req: Request, res: Response) => {
  const result = await getPatientsByDoctorId(req.params.id, req.query);
  res.status(200).json({
    success: true,
    data: result.patients,
    pagination: result.pagination,
  });
});

export const addDoctorPatient = asyncHandler(async (req: Request, res: Response) => {
  const validated = createDoctorPatientSchema.parse(req.body);
  const patient = await addPatientUnderDoctor(req.params.id, validated);
  res.status(201).json({
    success: true,
    data: patient,
  });
});

export const deleteDoctorPatient = asyncHandler(async (req: Request, res: Response) => {
  const result = await deletePatientFromDoctor(req.params.id, req.params.patientId);
  res.status(200).json({
    success: true,
    data: result,
  });
});
