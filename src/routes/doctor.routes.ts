import { Router } from 'express';
import {
  getDoctors,
  getDoctor,
  createDoctor,
  deleteDoctor,
  getDoctorPatients,
  addDoctorPatient,
  deleteDoctorPatient,
} from '../controllers/doctor.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getDoctors)
  .post(createDoctor);

router.route('/:id')
  .get(getDoctor)
  .delete(deleteDoctor);

router.route('/:id/patients')
  .get(getDoctorPatients)
  .post(addDoctorPatient);

router.route('/:id/patients/:patientId')
  .delete(deleteDoctorPatient);

export default router;
