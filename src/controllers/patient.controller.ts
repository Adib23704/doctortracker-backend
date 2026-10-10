import type { Request, Response } from 'express';
import {
  createPatient as createPatientService,
  deletePatient as deletePatientService,
  getDistinctConditionsList,
  getPatientById,
  getPatientsList,
  updatePatient as updatePatientService,
} from '../services/patient.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createPatientSchema, updatePatientSchema } from '../validations/patient.validation.js';

export const getConditions = asyncHandler(async (_req: Request, res: Response) => {
  const conditions = await getDistinctConditionsList();
  res.status(200).json({
    success: true,
    data: conditions,
  });
});

export const getPatients = asyncHandler(async (req: Request, res: Response) => {
  const result = await getPatientsList(req.query);
  res.status(200).json({
    success: true,
    data: result.patients,
    pagination: result.pagination,
  });
});

export const getPatient = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const patient = await getPatientById(id);
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
  const id = req.params.id as string;
  const validated = updatePatientSchema.parse(req.body);
  const patient = await updatePatientService(id, validated);
  res.status(200).json({
    success: true,
    data: patient,
  });
});

export const deletePatient = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await deletePatientService(id);
  res.status(200).json({
    success: true,
    data: result,
  });
});
