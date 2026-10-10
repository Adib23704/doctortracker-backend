import { Router } from 'express';
import {
  addDoctorPatient,
  createDoctor,
  deleteDoctor,
  deleteDoctorPatient,
  getDoctor,
  getDoctorPatients,
  getDoctors,
} from '../controllers/doctor.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.route('/').get(getDoctors).post(createDoctor);

router.route('/:id').get(getDoctor).delete(deleteDoctor);

router.route('/:id/patients').get(getDoctorPatients).post(addDoctorPatient);

router.route('/:id/patients/:patientId').delete(deleteDoctorPatient);

export default router;
