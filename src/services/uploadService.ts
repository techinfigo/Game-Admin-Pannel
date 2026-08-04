/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;
const COMPRESSION_SIZE_THRESHOLD = 350 * 1024;
const SKIP_COMPRESSION_TYPES = new Set(['image/svg+xml', 'image/gif']);

function sanitizeFileName(name: string): string {
  const lastDot = name.lastIndexOf('.');
  const base = lastDot > 0 ? name.slice(0, lastDot) : name;
  const ext = lastDot > 0 ? name.slice(lastDot) : '';
  const sanitizedBase = base.replace(/[^a-zA-Z0-9-_]+/g, '-').toLowerCase();
  const sanitizedExt = ext.replace(/[^a-zA-Z0-9.]/g, '').toLowerCase();
  return `${sanitizedBase || 'image'}${sanitizedExt}`;
}

function shouldCompress(file: File): boolean {
  return !SKIP_COMPRESSION_TYPES.has(file.type) && file.size > COMPRESSION_SIZE_THRESHOLD;
}

function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = objectUrl;
  });
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  try {
    const uploadFile = shouldCompress(file) ? await compressImage(file) : file;

    const timestamp = Date.now();
    const path = `images/${folder}/${timestamp}-${sanitizeFileName(file.name)}`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, uploadFile);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Failed to upload image', error);
    throw error;
  }
}
