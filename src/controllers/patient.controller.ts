import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getPatientsList,
  getPatientById,
  createPatient as createPatientService,
  updatePatient as updatePatientService,
  deletePatient as deletePatientService,
} from '../services/patient.service.js';
import { createPatientSchema, updatePatientSchema } from '../validations/patient.validation.js';

export const getPatients = asyncHandler(async (req: Request, res: Response) => {
  const result = await getPatientsList(req.query);
  res.status(200).json({
    success: true,
    data: result.patients,
    pagination: result.pagination,
  });
});

export const getPatient = asyncHandler(async (req: Request, res: Response) => {
  const patient = await getPatientById(req.params.id);
  res.status(200).json({
    success: true,
    data: patient,
  });
});

export const createPatient = asyncHandler(async (req: Request, res: Response) => {
  const validated = createPatientSchema.parse(req.body);
  const patient = await createPatientService(validated);
  res.status(201).json({
    success: true,
    data: patient,
  });
});

export const updatePatient = asyncHandler(async (req: Request, res: Response) => {
  const validated = updatePatientSchema.parse(req.body);
  const patient = await updatePatientService(req.params.id, validated);
  res.status(200).json({
    success: true,
    data: patient,
  });
});

export const deletePatient = asyncHandler(async (req: Request, res: Response) => {
  const result = await deletePatientService(req.params.id);
  res.status(200).json({
    success: true,
    data: result,
  });
});
