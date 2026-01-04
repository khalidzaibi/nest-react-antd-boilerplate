import { createSlice } from '@reduxjs/toolkit';
import type { AuthState } from '../lib/models';
// import * as AuthStorage from '@/data_sources/local/AuthStorage';
import { getAuth, setAuth, removeAuth } from '@/lib/authHelpers';
import { setTags, clearTags, setMainLastMenuItem } from '@/lib/storage';
import { AUTH_SLICE_NAME } from '../enums';
import { login, logout, forgotPassword, resetPassword, uploadMyAvatar, verifyLoginOtp } from './AuthThunks';

const initialState: AuthState = {
  loading: false,
  auth: getAuth(),
  error: null,
  twoFactorRequired: false,
  pendingEmail: null,
  otpExpiresInMinutes: null,
  otpExpireAt: null,
};

const authSlice = createSlice({
  name: AUTH_SLICE_NAME,
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setAuthState(state, action) {
      state.auth = action.payload;
      if (action.payload) {
        setAuth(action.payload as any);
      }
    },
    clearTwoFactor(state) {
      state.twoFactorRequired = false;
      state.pendingEmail = null;
      state.otpExpiresInMinutes = null;
      state.otpExpireAt = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.loading = true;
        state.twoFactorRequired = false;
        state.pendingEmail = null;
        state.otpExpiresInMinutes = null;
        state.otpExpireAt = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload ?? {};
        if ((payload as any)?.twoFactorRequired) {
          state.twoFactorRequired = true;
          state.pendingEmail = (payload as any)?.email ?? null;
          state.otpExpiresInMinutes = (payload as any)?.expiresInMinutes ?? null;
          state.otpExpireAt =
            (payload as any)?.expiresInMinutes && typeof (payload as any)?.expiresInMinutes === 'number'
              ? Date.now() + ((payload as any)?.expiresInMinutes || 0) * 60 * 1000
              : null;
          state.error = (payload as any)?.message ?? null;
          return;
        }
        const authPayload = { ...(payload as Record<string, any>) };
        const userPreferences = authPayload?.user?.userPreferences ?? {};

        const preferenceTags = Array.isArray(userPreferences?.tags) ? userPreferences.tags : [];
        const preferenceLastMenu = typeof userPreferences?.lastMenu === 'string' ? userPreferences.lastMenu : undefined;

        if (preferenceTags.length) {
          setTags(preferenceTags);
        } else {
          clearTags();
        }

        if (preferenceLastMenu) {
          setMainLastMenuItem(preferenceLastMenu);
        }

        if (authPayload?.user) {
          delete authPayload.user.userPreferences;
        }

        setAuth(authPayload as any);

        const targetPath = preferenceLastMenu
          ? preferenceLastMenu.startsWith('/')
            ? preferenceLastMenu
            : `/${preferenceLastMenu.replace(/^\/+/, '')}`
          : '/';
        window.location.href = targetPath;
      })
      .addCase(login.rejected, state => {
        state.loading = false;
        state.twoFactorRequired = false;
        state.pendingEmail = null;
        state.otpExpiresInMinutes = null;
        state.otpExpireAt = null;
      })
      .addCase(verifyLoginOtp.pending, state => {
        state.loading = true;
      })
      .addCase(verifyLoginOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.twoFactorRequired = false;
        state.pendingEmail = null;
        state.otpExpiresInMinutes = null;
        state.otpExpireAt = null;
        const payload = action.payload ?? {};
        const authPayload = { ...(payload as Record<string, any>) };
        const userPreferences = authPayload?.user?.userPreferences ?? {};

        const preferenceTags = Array.isArray(userPreferences?.tags) ? userPreferences.tags : [];
        const preferenceLastMenu = typeof userPreferences?.lastMenu === 'string' ? userPreferences.lastMenu : undefined;

        if (preferenceTags.length) {
          setTags(preferenceTags);
        } else {
          clearTags();
        }

        if (preferenceLastMenu) {
          setMainLastMenuItem(preferenceLastMenu);
        }

        if (authPayload?.user) {
          delete authPayload.user.userPreferences;
        }

        setAuth(authPayload as any);

        const targetPath = preferenceLastMenu
          ? preferenceLastMenu.startsWith('/')
            ? preferenceLastMenu
            : `/${preferenceLastMenu.replace(/^\/+/, '')}`
          : '/';
        window.location.href = targetPath;
      })
      .addCase(verifyLoginOtp.rejected, state => {
        state.loading = false;
      })
      .addCase(forgotPassword.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, state => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Unable to process request.';
      })
      .addCase(resetPassword.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, state => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Unable to reset password.';
      })

      .addCase(logout.pending, state => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, state => {
        state.loading = false;
        removeAuth();
        clearTags();
        window.location.href = '/';
      })
      .addCase(logout.rejected, state => {
        state.loading = false;
      })
      .addCase(uploadMyAvatar.pending, state => {
        state.loading = true;
      })
      .addCase(uploadMyAvatar.fulfilled, (state, action) => {
        state.loading = false;
        const payload = (action.payload as any) ?? {};
        const payloadData = payload?.data ?? payload;
        const avatar = payloadData?.avatar;

        if (avatar) {
          const currentAuth = state.auth ?? getAuth();
          const nextAuth = currentAuth
            ? { ...currentAuth, user: { ...(currentAuth.user ?? {}), avatar } }
            : { user: { avatar } };
          state.auth = nextAuth as any;
          setAuth(nextAuth as any);
        }
      })
      .addCase(uploadMyAvatar.rejected, state => {
        state.loading = false;
      });
  },
});

export const { clearError, setAuthState, clearTwoFactor } = authSlice.actions;
export default authSlice.reducer;
