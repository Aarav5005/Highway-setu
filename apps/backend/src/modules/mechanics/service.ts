import * as repository from './repository';

export const registerMechanic = async (userId: string, data: any) => {
  return repository.createMechanicProfile(userId, data);
};

export const getMechanic = async (id: string) => {
  return repository.getMechanicById(id);
};

export const updateMechanic = async (id: string, updates: any) => {
  return repository.updateMechanicProfile(id, updates);
};
