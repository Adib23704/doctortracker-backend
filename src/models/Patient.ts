import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type PatientGender = 'Male' | 'Female' | 'Other';
export type PatientStatus = 'Active' | 'Discharged' | 'Under Observation' | 'Critical';

export interface IPatient extends Document {
  name: string;
  age: number;
  gender: PatientGender;
  phone: string;
  email?: string;
  condition: string;
  status: PatientStatus;
  admissionDate: Date;
  doctor: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative'],
      max: [130, 'Age cannot exceed 130'],
    },
    gender: {
      type: String,
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: '{VALUE} is not a valid gender',
      },
      required: [true, 'Gender is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    condition: {
      type: String,
      required: [true, 'Patient condition/diagnosis is required'],
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Discharged', 'Under Observation', 'Critical'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Active',
      index: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Assigned doctor is required'],
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

patientSchema.index({ doctor: 1, createdAt: -1 });
patientSchema.index({ condition: 1, admissionDate: -1 });
patientSchema.index({ status: 1, admissionDate: -1 });
patientSchema.index({ name: 'text', phone: 'text' });

export const Patient: Model<IPatient> = mongoose.models.Patient || mongoose.model<IPatient>('Patient', patientSchema);
