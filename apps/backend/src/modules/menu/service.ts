import * as repository from './repository';

export const createMenu = async (data: any) => {
  return repository.createMenuItem(data);
};

export const updateMenu = async (id: string, updates: any) => {
  return repository.updateMenuItem(id, updates);
};

export const deleteMenu = async (id: string) => {
  return repository.deleteMenuItem(id);
};

export const getMenuItem = async (id: string) => {
  return repository.getMenuItemById(id);
};
