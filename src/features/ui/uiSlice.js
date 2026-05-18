import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isCreateOpen: false,
    isMobileMenuOpen: false,
  },
  reducers: {
    openCreatePost: (state) => {
      state.isCreateOpen = true;
    },
    closeCreatePost: (state) => {
      state.isCreateOpen = false;
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },
  },
});

export const {
  closeCreatePost,
  closeMobileMenu,
  openCreatePost,
  toggleMobileMenu,
} = uiSlice.actions;

export default uiSlice.reducer;
