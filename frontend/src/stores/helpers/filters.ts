export const selectFilters = (sliceName: string) => (state: any) => {
  const slice = state[sliceName] || {};
  return {
    filters: slice.filters,
  };
};
