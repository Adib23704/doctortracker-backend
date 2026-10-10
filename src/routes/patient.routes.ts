import { Router } from 'express';
import {
  createPatient,
  deletePatient,
  getConditions,
  getPatient,
  getPatients,
  updatePatient,
} from '../controllers/patient.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/conditions', getConditions);

router.route('/').get(getPatients).post(createPatient);

router.route('/:id').get(getPatient).put(updatePatient).delete(deletePatient);

export default router;
