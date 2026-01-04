import { getData, setData, LAST_MAIN_MENU_LOCAL_STORAGE_KEY } from '@/lib/storage';
import { AuthModel } from '@/pages/auth/lib/models';

const APP_NAME = import.meta.env.VITE_APP_NAME;
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0';

// --- Keys ---
const AUTH_LOCAL_STORAGE_KEY = `${APP_NAME}-auth-v${APP_VERSION}`;
const TAGS_LOCAL_STORAGE_KEY = `${APP_NAME}-tags-v${APP_VERSION}`;

/**
 * Get stored auth information from local storage
 */
const getAuth = (): AuthModel | undefined => {
  try {
    const auth = getData(AUTH_LOCAL_STORAGE_KEY) as AuthModel | undefined;
    return auth;
  } catch (error) {
    console.error('AUTH LOCAL STORAGE PARSE ERROR', error);
  }
};

/**
 * Save auth information to local storage
 */
const setAuth = (auth: AuthModel) => {
  setData(AUTH_LOCAL_STORAGE_KEY, auth);
};

/**
 * Remove auth (and tags) from local storage
 */
const removeAuth = () => {
  if (!localStorage) return;

  try {
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
    localStorage.removeItem(TAGS_LOCAL_STORAGE_KEY);
    localStorage.removeItem(LAST_MAIN_MENU_LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error('LOCAL STORAGE REMOVE ERROR', error);
  }
};

/**
 * Get only user basic info
 */
const getUserOnly = (): { id: string; email: string; name: string; avatar: string } | undefined => {
  const auth = getAuth();
  if (!auth) return undefined;

  const { id, email, name, avatar } = auth.user;
  return { id, email, name, avatar };
};

export {
  APP_NAME,
  APP_VERSION,
  AUTH_LOCAL_STORAGE_KEY,
  TAGS_LOCAL_STORAGE_KEY,
  getAuth,
  setAuth,
  removeAuth,
  getUserOnly,
};
