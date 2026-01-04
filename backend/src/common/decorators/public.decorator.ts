import { SetMetadata } from '@nestjs/common';

// we mark routes with metadata so the guard knows to skip them
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
