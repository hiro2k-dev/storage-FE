export const formatFileSize = (sizeInBytes) => {
  if (!sizeInBytes) return '';
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`; // Bytes
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(2)} KB`; // Kilobytes
  } else if (sizeInBytes < 1024 * 1024 * 1024) {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`; // Megabytes
  } else if (sizeInBytes < 1024 * 1024 * 1024 * 1024) {
    return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`; // Gigabytes
  } else {
    return `${(sizeInBytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB`; // Terabytes
  }
};
