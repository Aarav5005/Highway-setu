import * as repository from './repository';
import { uploadToStorage, deleteFromStorage } from '../../integrations/storage';
/* global Express */
import { AppError } from '../../errors/app-error';

export const registerMechanic = async (userId: string, data: any) => {
  return repository.createMechanicProfile(userId, data);
};

export const getMechanic = async (id: string) => {
  return repository.getMechanicById(id);
};

export const updateMechanic = async (id: string, updates: any) => {
  return repository.updateMechanicProfile(id, updates);
};

export const addPhotos = async (userId: string, files: Express.Multer.File[]) => {
  const profile = await repository.getMechanicById(userId);
  if (!profile)
    throw new AppError({ statusCode: 404, code: 'NOT_FOUND', message: 'Profile not found' });

  const currentPhotos = profile.photos || [];
  if (currentPhotos.length + files.length > 5) {
    throw new AppError({
      statusCode: 400,
      code: 'BAD_REQUEST',
      message: 'Maximum 5 photos allowed',
    });
  }

  const newPhotos: string[] = [];
  for (const file of files) {
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const url = await uploadToStorage({
      bucket: 'mechanics',
      path: `${userId}/${filename}`,
      body: file.buffer,
      contentType: file.mimetype,
    });
    newPhotos.push(url);
  }

  const updatedPhotos = [...currentPhotos, ...newPhotos];
  return repository.updateMechanicProfile(userId, { photos: JSON.stringify(updatedPhotos) });
};

export const deletePhoto = async (userId: string, photoUrl: string) => {
  const profile = await repository.getMechanicById(userId);
  if (!profile)
    throw new AppError({ statusCode: 404, code: 'NOT_FOUND', message: 'Profile not found' });

  const currentPhotos = profile.photos || [];
  const updatedPhotos = currentPhotos.filter((url: string) => url !== photoUrl);

  try {
    const parts = photoUrl.split('/mechanics/');
    if (parts.length > 1) {
      const path = parts[1] as string;
      await deleteFromStorage('mechanics', path);
    }
  } catch (e) {
    console.error('Failed to delete from storage', e);
  }

  return repository.updateMechanicProfile(userId, { photos: JSON.stringify(updatedPhotos) });
};
