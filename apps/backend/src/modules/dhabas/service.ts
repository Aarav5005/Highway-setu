import * as repository from './repository';

export const registerDhaba = async (userId: string, data: any) => {
  return repository.createDhabaProfile(userId, data);
};

export const getDhaba = async (id: string) => {
  const profile = await repository.getDhabaById(id);
  if (!profile) return null;
  const photos = await repository.getDhabaPhotos(id);
  return { ...profile, photos };
};

export const updateDhaba = async (id: string, updates: any) => {
  const { photos, ...restUpdates } = updates;
  const updatedProfile = await repository.updateDhabaProfile(id, restUpdates);
  if (photos) {
    await repository.updateDhabaPhotos(id, photos);
  }
  const allPhotos = await repository.getDhabaPhotos(id);
  return { ...updatedProfile, photos: allPhotos };
};

export const toggleOpenStatus = async (id: string) => {
  return repository.toggleDhabaOpen(id);
};

export const getMenu = async (id: string) => {
  return repository.getDhabaMenu(id);
};
