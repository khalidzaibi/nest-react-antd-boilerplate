import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/lib/helpers';
export const selectPagination = (sliceName: string) => (state: any) => {
  const slice = state[sliceName] || {};
  return {
    page: slice.tablePagination.page ?? DEFAULT_PAGE,
    perPage: slice.tablePagination.perPage ?? DEFAULT_PER_PAGE,
  };
};
