import { configureStore } from '@reduxjs/toolkit';
import globalReducer from './global.store';
import tagsViewReducer from './tags-view.store';
import userReducer from './user.store';
import authReducer from '@/pages/auth/slices/AuthSlice';
import optionReducer from '@/pages/options/slices/optionSlice';
import permissionReducer from '@/pages/rbac/slices/permissionSlice';
import roleReducer from '@/pages/rbac/slices/roleSlice';
import usersReducer from '@/pages/users/slices/userSlice';

export const store = configureStore({
  reducer: {
    // reducer: rootReducer,
    user: userReducer,
    tagsView: tagsViewReducer,
    global: globalReducer,
    auth: authReducer,
    options: optionReducer,
    permissions: permissionReducer,
    roles: roleReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
