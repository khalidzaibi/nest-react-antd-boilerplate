export const selectSorting = (sliceName: string) => (state: any) => {
  const slice = state[sliceName] || {};
  return {
    sorting: slice.sorting,
  };
};
