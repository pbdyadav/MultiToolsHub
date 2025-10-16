// File conversion utilities

export interface FileFormat {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  category: string;
}

export interface ConversionCategory {
  id: string;
  name: string;
  formats: FileFormat[];
}

const imageFormats: FileFormat[] = [
  { id: 'jpg', name: 'JPEG', extension: 'jpg', mimeType: 'image/jpeg', category: 'image' },
  { id: 'png', name: 'PNG', extension: 'png', mimeType: 'image/png', category: 'image' },
  { id: 'bmp', name: 'BMP', extension: 'bmp', mimeType: 'image/bmp', category: 'image' },
  { id: 'webp', name: 'WebP', extension: 'webp', mimeType: 'image/webp', category: 'image' },
  { id: 'gif', name: 'GIF', extension: 'gif', mimeType: 'image/gif', category: 'image' }
];

const documentFormats: FileFormat[] = [
  { id: 'pdf', name: 'PDF', extension: 'pdf', mimeType: 'application/pdf', category: 'document' },
  { id: 'docx', name: 'Word Document', extension: 'docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'document' },
  { id: 'txt', name: 'Text File', extension: 'txt', mimeType: 'text/plain', category: 'document' }
];

const audioFormats: FileFormat[] = [
  { id: 'mp3', name: 'MP3', extension: 'mp3', mimeType: 'audio/mpeg', category: 'audio' },
  { id: 'wav', name: 'WAV', extension: 'wav', mimeType: 'audio/wav', category: 'audio' },
  { id: 'ogg', name: 'OGG', extension: 'ogg', mimeType: 'audio/ogg', category: 'audio' }
];

const videoFormats: FileFormat[] = [
  { id: 'mp4', name: 'MP4', extension: 'mp4', mimeType: 'video/mp4', category: 'video' },
  { id: 'webm', name: 'WebM', extension: 'webm', mimeType: 'video/webm', category: 'video' },
  { id: 'avi', name: 'AVI', extension: 'avi', mimeType: 'video/x-msvideo', category: 'video' }
];

export const conversionCategories: ConversionCategory[] = [
  { id: 'image', name: 'Images', formats: imageFormats },
  { id: 'document', name: 'Documents', formats: documentFormats },
  { id: 'audio', name: 'Audio', formats: audioFormats },
  { id: 'video', name: 'Video', formats: videoFormats }
];

export const getAllFormats = (): FileFormat[] => {
  return conversionCategories.flatMap(category => category.formats);
};

export const getFormatById = (id: string): FileFormat | undefined => {
  return getAllFormats().find(format => format.id === id);
};

export const canConvertClientSide = (fromFormat: string, toFormat: string): boolean => {
  const clientSideFormats = ['jpg', 'png', 'bmp', 'webp', 'gif', 'txt'];
  return clientSideFormats.includes(fromFormat) && clientSideFormats.includes(toFormat);
};

export const convertImageFile = async (
  file: File,
  targetFormat: string,
  quality: number = 0.9
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      if (ctx) {
        // For JPG conversion, fill with white background
        if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert image'));
            }
          },
          `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`,
          quality
        );
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};