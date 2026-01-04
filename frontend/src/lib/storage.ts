const APP_NAME = import.meta.env.VITE_APP_NAME;
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0';
import { TAGS_LOCAL_STORAGE_KEY } from './authHelpers';
const LAST_MAIN_MENU_LOCAL_STORAGE_KEY = `${APP_NAME}-last-main-menu-v${APP_VERSION}`;
const DEFAULT_HOME_PATH = '/crm/users';

/**
 * Low-level localStorage helpers
 */
const getData = (key: string): unknown | undefined => {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Read from local storage', error);
  }
};

const setData = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Save in local storage', error);
  }
};

/**
 * Tags Helpers
 */
const getTags = (): any[] => {
  try {
    return (getData(TAGS_LOCAL_STORAGE_KEY) as any[]) || [];
  } catch (error) {
    console.error('TAGS LOCAL STORAGE PARSE ERROR', error);
    return [];
  }
};

const setTags = (tags: any[]) => {
  setData(TAGS_LOCAL_STORAGE_KEY, tags);
};

const addTagToStorage = (newTag: any): any[] => {
  const tags = getTags();

  // Prevent duplicates by path
  const exists = tags.some((t) => t.path === newTag.path);
  if (!exists) {
    const updated = [...tags, newTag];
    setTags(updated);
    return updated;
  }
  return tags;
};

const removeTagFromStorage = (path: string): any[] => {
  const tags = getTags();
  const updated = tags.filter((t) => t.path !== path);
  setTags(updated);
  return updated;
};

const clearTags = () => {
  try {
    localStorage.removeItem(TAGS_LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error('TAGS LOCAL STORAGE REMOVE ERROR', error);
  }
};

const setMainLastMenuItem = (lastMenuItem: string) => {
  setData(LAST_MAIN_MENU_LOCAL_STORAGE_KEY, lastMenuItem);
};

export {
  getData,
  setData,
  getTags,
  setTags,
  addTagToStorage,
  removeTagFromStorage,
  clearTags,
  setMainLastMenuItem,
  DEFAULT_HOME_PATH,
  LAST_MAIN_MENU_LOCAL_STORAGE_KEY,
};
