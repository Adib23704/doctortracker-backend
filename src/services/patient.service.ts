import mongoose from 'mongoose';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { AppError } from '../utils/AppError.js';
import type { CreatePatientInput, UpdatePatientInput } from '../validations/patient.validation.js';

export interface PatientQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  condition?: string;
  status?: string;
  doctorId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getPatientsList = async (params: PatientQueryParams) => {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};

  if (params.search?.trim()) {
    const searchRegex = new RegExp(params.search.trim(), 'i');
    filter.$or = [{ name: searchRegex }, { phone: searchRegex }, { condition: searchRegex }];
  }

  if (params.condition && params.condition !== 'all') {
    filter.condition = params.condition;
  }

  if (params.status && params.status !== 'all') {
    filter.status = params.status;
  }

  if (params.doctorId && params.doctorId !== 'all') {
    if (mongoose.Types.ObjectId.isValid(params.doctorId)) {
      filter.doctor = new mongoose.Types.ObjectId(params.doctorId);
    }
  }

  if (params.startDate || params.endDate) {
    filter.admissionDate = {};
    if (params.startDate) {
      filter.admissionDate.$gte = new Date(params.startDate);
    }
    if (params.endDate) {
      const end = new Date(params.endDate);
      end.setHours(23, 59, 59, 999);
      filter.admissionDate.$lte = end;
    }
  }

  const sortBy = params.sortBy || 'admissionDate';
  const sortOrder = params.sortOrder === 'asc' ? 1 : -1;
  const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortOrder };

  const [patients, total] = await Promise.all([
    Patient.find(filter)
      .populate('doctor', 'name specialization hospital')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
    Patient.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    patients,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const getPatientById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid Patient ID format', 400);
  }

  const patient = await Patient.findById(id)
    .populate('doctor', 'name specialization hospital phone email')
    .lean();
  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  return patient;
};

export const createPatient = async (input: CreatePatientInput) => {
  if (!mongoose.Types.ObjectId.isValid(input.doctor)) {
    throw new AppError('Invalid assigned doctor ID', 400);
  }

  const doctor = await Doctor.findById(input.doctor);
  if (!doctor) {
    throw new AppError('Assigned doctor does not exist', 404);
  }

  const patient = await Patient.create({
    ...input,
    doctor: doctor._id,
    admissionDate: input.admissionDate || new Date(),
  });

  await Doctor.findByIdAndUpdate(input.doctor, { $inc: { patientCount: 1 } });

  return patient;
};

export const updatePatient = async (id: string, input: UpdatePatientInput) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid Patient ID format', 400);
  }

  const patient = await Patient.findById(id);
  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  if (input.doctor && input.doctor !== patient.doctor.toString()) {
    if (!mongoose.Types.ObjectId.isValid(input.doctor)) {
      throw new AppError('Invalid assigned doctor ID', 400);
    }

    const newDoctorExists = await Doctor.exists({ _id: input.doctor });
    if (!newDoctorExists) {
      throw new AppError('New assigned doctor does not exist', 404);
    }

    const oldDoctorId = patient.doctor;
    const newDoctorId = input.doctor;

    patient.doctor = new mongoose.Types.ObjectId(newDoctorId);

    await Promise.all([
      Doctor.findByIdAndUpdate(oldDoctorId, { $inc: { patientCount: -1 } }),
      Doctor.findByIdAndUpdate(newDoctorId, { $inc: { patientCount: 1 } }),
    ]);
  }

  if (input.name !== undefined) patient.name = input.name;
  if (input.age !== undefined) patient.age = input.age;
  if (input.gender !== undefined) patient.gender = input.gender;
  if (input.phone !== undefined) patient.phone = input.phone;
  if (input.email !== undefined) patient.email = input.email;
  if (input.condition !== undefined) patient.condition = input.condition;
  if (input.status !== undefined) patient.status = input.status;
  if (input.admissionDate !== undefined) patient.admissionDate = input.admissionDate;
  if (input.notes !== undefined) patient.notes = input.notes;

  await patient.save();

  const updatedWithDoctor = await Patient.findById(patient._id)
    .populate('doctor', 'name specialization hospital')
    .lean();

  return updatedWithDoctor;
};

export const deletePatient = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid Patient ID format', 400);
  }

  const patient = await Patient.findById(id);
  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  const doctorId = patient.doctor;
  await Patient.findByIdAndDelete(id);

  if (doctorId) {
    await Doctor.findByIdAndUpdate(doctorId, { $inc: { patientCount: -1 } });
  }

  return { message: 'Patient deleted successfully' };
};

export const getDistinctConditionsList = async (): Promise<string[]> => {
  const conditions = await Patient.distinct('condition');
  return conditions
    .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
    .sort((a, b) => a.localeCompare(b));
};
