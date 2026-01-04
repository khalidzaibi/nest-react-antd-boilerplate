// import type { Role } from '@/interface/user/login';
// import type { Locale, UserState } from '@/interface/user/user';
import type { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from '@reduxjs/toolkit';

import { getGlobalState } from '@/utils/getGloabal';

const initialState: any = {
  ...getGlobalState(),
  noticeCount: 0,
  locale: (localStorage.getItem('locale')! || 'en_US') as any,
  newUser: false, //JSON.parse(localStorage.getItem('newUser')!) ?? true,
  // logged: localStorage.getItem('t') ? true : false,
  menuList: [],
  // username: localStorage.getItem('username') || '',
  // role: (localStorage.getItem('username') || '') as Role,
  collapsed: true,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserItem(state, action: PayloadAction<Partial<any>>) {
      // const { username } = action.payload;

      // if (username !== state.username) {
      //   localStorage.setItem('username', action.payload.username || '');
      // }

      Object.assign(state, action.payload);
    },
  },
});

export const { setUserItem } = userSlice.actions;

export default userSlice.reducer;
