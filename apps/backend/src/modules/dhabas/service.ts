import * as repository from './repository';
import { uploadToStorage, deleteFromStorage } from '../../integrations/storage';
/* global Express */
import { AppError } from '../../errors/app-error';

export const registerDhaba = async (userId: string, data: any) => {
  return repository.createDhabaProfile(userId, data);
};

export const getDhaba = async (id: string) => {
  const profile = await repository.getDhabaById(id);
  return profile;
};

export const updateDhaba = async (id: string, updates: any) => {
  return repository.updateDhabaProfile(id, updates);
};

export const toggleOpenStatus = async (id: string) => {
  return repository.toggleDhabaOpen(id);
};

export const getMenu = async (id: string) => {
  return repository.getDhabaMenu(id);
};

export const addPhotos = async (userId: string, files: Express.Multer.File[]) => {
  const profile = await repository.getDhabaById(userId);
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
      bucket: 'dhabas',
      path: `${userId}/${filename}`,
      body: file.buffer,
      contentType: file.mimetype,
    });
    newPhotos.push(url);
  }

  const updatedPhotos = [...currentPhotos, ...newPhotos];
  return repository.updateDhabaProfile(userId, { photos: JSON.stringify(updatedPhotos) });
};

export const deletePhoto = async (userId: string, photoUrl: string) => {
  const profile = await repository.getDhabaById(userId);
  if (!profile)
    throw new AppError({ statusCode: 404, code: 'NOT_FOUND', message: 'Profile not found' });

  const currentPhotos = profile.photos || [];
  const updatedPhotos = currentPhotos.filter((url: string) => url !== photoUrl);

  try {
    const parts = photoUrl.split('/dhabas/');
    if (parts.length > 1) {
      const path = parts[1] as string;
      await deleteFromStorage('dhabas', path);
    }
  } catch (e) {
    console.error('Failed to delete from storage', e);
  }

  return repository.updateDhabaProfile(userId, { photos: JSON.stringify(updatedPhotos) });
};
