import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { login, logout, forgotPassword, resetPassword, uploadMyAvatar, verifyLoginOtp } from '../slices/AuthThunks';
import { getTags, getData, LAST_MAIN_MENU_LOCAL_STORAGE_KEY } from '@/lib/storage';
import { clearError, setAuthState, clearTwoFactor } from '../slices/AuthSlice';

export const useAuthHook = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(s => s.auth);

  return {
    ...state,
    setAuthState: (payload: any) => dispatch(setAuthState(payload)),
    login: (email: string, password: string) => dispatch(login({ email, password })),
    verifyLoginOtp: (email: string, code: string) => dispatch(verifyLoginOtp({ email, code })),
    forgotPassword: (email: string) => dispatch(forgotPassword({ email })).unwrap(),
    resetPassword: (payload: { email: string; token: string; newPassword: string }) =>
      dispatch(resetPassword(payload)).unwrap(),
    uploadAvatar: (formData: FormData) => dispatch(uploadMyAvatar(formData)),
    clearTwoFactor: () => dispatch(clearTwoFactor()),
    logout: () => {
      const tags = getTags();
      const lastMenuRaw = getData(LAST_MAIN_MENU_LOCAL_STORAGE_KEY);
      const lastMenu = typeof lastMenuRaw === 'string' ? lastMenuRaw : null;

      return dispatch(logout({ tags, lastMenu }));
    },
    clearError: () => dispatch(clearError()),
  };
};
