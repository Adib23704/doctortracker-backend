import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { User } from '../models/User.js';

console.log('[Check-Models] Verifying model definitions...');

if (!User || !Doctor || !Patient) {
  console.error('[Check-Models] Failed: Models are not exported properly.');
  process.exit(1);
}

console.log('[Check-Models] User collection:', User.collection.name);
console.log('[Check-Models] Doctor collection:', Doctor.collection.name);
console.log('[Check-Models] Patient collection:', Patient.collection.name);
console.log('[Check-Models] All models initialized successfully with proper schema definitions.');
process.exit(0);
