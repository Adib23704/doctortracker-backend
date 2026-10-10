import mongoose from 'mongoose';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { AppError } from '../utils/AppError.js';
import type {
  CreateDoctorInput,
  CreateDoctorPatientInput,
} from '../validations/doctor.validation.js';

export interface DoctorQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  hospital?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getDoctorsList = async (params: DoctorQueryParams) => {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};

  if (params.search?.trim()) {
    const searchRegex = new RegExp(params.search.trim(), 'i');
    filter.$or = [
      { name: searchRegex },
      { specialization: searchRegex },
      { hospital: searchRegex },
    ];
  }

  if (params.specialization && params.specialization !== 'all') {
    filter.specialization = params.specialization;
  }

  if (params.hospital && params.hospital !== 'all') {
    filter.hospital = params.hospital;
  }

  if (params.startDate || params.endDate) {
    filter.createdAt = {};
    if (params.startDate) {
      filter.createdAt.$gte = new Date(params.startDate);
    }
    if (params.endDate) {
      const end = new Date(params.endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder === 'asc' ? 1 : -1;
  const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortOrder };

  const [doctors, total] = await Promise.all([
    Doctor.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
    Doctor.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    doctors,
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

export const getDoctorById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid Doctor ID format', 400);
  }

  const doctor = await Doctor.findById(id).lean();
  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  return doctor;
};

export const createDoctor = async (input: CreateDoctorInput) => {
  const existing = await Doctor.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw new AppError('A doctor with this email address already exists.', 409);
  }

  const doctor = await Doctor.create({
    ...input,
    email: input.email.toLowerCase(),
    patientCount: 0,
  });

  return doctor;
};

export const deleteDoctor = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid Doctor ID format', 400);
  }

  const doctor = await Doctor.findById(id);
  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  const patientCount = await Patient.countDocuments({ doctor: id });
  if (patientCount > 0) {
    throw new AppError(
      `Cannot delete doctor who has ${patientCount} active patient(s). Please reassign or remove patients first.`,
      400
    );
  }

  await Doctor.findByIdAndDelete(id);
  return { message: 'Doctor deleted successfully' };
};

export const getPatientsByDoctorId = async (
  doctorId: string,
  params: { page?: number; limit?: number; search?: string }
) => {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw new AppError('Invalid Doctor ID format', 400);
  }

  const doctorExists = await Doctor.exists({ _id: doctorId });
  if (!doctorExists) {
    throw new AppError('Doctor not found', 404);
  }

  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = { doctor: doctorId };

  if (params.search?.trim()) {
    const searchRegex = new RegExp(params.search.trim(), 'i');
    filter.$or = [{ name: searchRegex }, { phone: searchRegex }, { condition: searchRegex }];
  }

  const [patients, total] = await Promise.all([
    Patient.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
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

export const addPatientUnderDoctor = async (doctorId: string, input: CreateDoctorPatientInput) => {
  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    throw new AppError('Invalid Doctor ID format', 400);
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  const patient = await Patient.create({
    ...input,
    doctor: doctor._id,
    admissionDate: input.admissionDate || new Date(),
  });

  await Doctor.findByIdAndUpdate(doctorId, { $inc: { patientCount: 1 } });

  return patient;
};

export const deletePatientFromDoctor = async (doctorId: string, patientId: string) => {
  if (!mongoose.Types.ObjectId.isValid(doctorId) || !mongoose.Types.ObjectId.isValid(patientId)) {
    throw new AppError('Invalid ID format', 400);
  }

  const patient = await Patient.findOne({ _id: patientId, doctor: doctorId });
  if (!patient) {
    throw new AppError('Patient not found under this doctor', 404);
  }

  await Patient.findByIdAndDelete(patientId);

  await Doctor.findByIdAndUpdate(doctorId, { $inc: { patientCount: -1 } });

  return { message: 'Patient removed successfully from doctor record' };
};
