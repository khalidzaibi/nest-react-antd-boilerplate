const parsePositiveNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getUploadLimits = () => {
  const maxFileSizeMb = parsePositiveNumber(import.meta.env.VITE_MAX_FILE_SIZE_MB, 5);
  const maxTotalFileSizeMb = parsePositiveNumber(import.meta.env.VITE_MAX_TOTAL_FILE_SIZE_MB, 25);

  return {
    maxFileSizeMb,
    maxTotalFileSizeMb,
    maxFileSizeBytes: maxFileSizeMb * 1024 * 1024,
    maxTotalFileSizeBytes: maxTotalFileSizeMb * 1024 * 1024,
  };
};
