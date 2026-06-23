import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth';
import { validateDriverProfile, validateDriverTruck } from './validator';
import { createDriverProfileRepository } from './repository';
import { createDriverProfileService } from './service';
import { createDriverProfileController } from './controller';

const repository = createDriverProfileRepository();
const service = createDriverProfileService(repository);
const controller = createDriverProfileController(service);

export const driverProfileRouter = Router();

driverProfileRouter.use(requireAuth(['driver']));
driverProfileRouter.get('/me', controller.getMe);
driverProfileRouter.put('/me', validateDriverProfile, controller.updateMe);
driverProfileRouter.patch('/me/truck', validateDriverTruck, controller.updateTruck);
