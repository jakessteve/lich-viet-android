import { Capacitor } from '@capacitor/core';
import type { PermissionState } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import type { SwissNatalChartResult } from './swissNatalChart';
import {
  createWesternNatalExport,
  type WesternNatalExportFormat,
  type WesternNatalExportOptions,
} from './westernNatalExport';

export interface WesternNatalSaveEnvironment {
  native?: boolean;
  platform?: string;
  downloadWeb?: (blob: Blob, filename: string) => void;
  checkPublicStorage?: () => Promise<PermissionState>;
  requestPublicStorage?: () => Promise<PermissionState>;
  writeNative?: (request: WesternNatalNativeWrite) => Promise<{ uri: string }>;
}

export interface WesternNatalNativeWrite {
  data: string;
  path: string;
  recursive: true;
}

export interface WesternNatalSaveOptions extends WesternNatalExportOptions {
  environment?: WesternNatalSaveEnvironment;
}

export interface WesternNatalSaveResult {
  filename: string;
  destination: 'web' | 'documents';
  uri?: string;
}

function webDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    URL.revokeObjectURL(url);
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const chunkSize = 32_768;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

async function writeDocuments(request: WesternNatalNativeWrite): Promise<{ uri: string }> {
  return Filesystem.writeFile({
    path: request.path,
    data: request.data,
    directory: Directory.Documents,
    recursive: request.recursive,
  });
}

async function checkPublicStorage(): Promise<PermissionState> {
  return (await Filesystem.checkPermissions()).publicStorage;
}

async function requestPublicStorage(): Promise<PermissionState> {
  return (await Filesystem.requestPermissions()).publicStorage;
}

async function ensureLegacyAndroidStoragePermission(environment: WesternNatalSaveEnvironment): Promise<void> {
  const platform = environment.platform ?? Capacitor.getPlatform();
  if (platform !== 'android') return;

  let permission = await (environment.checkPublicStorage ?? checkPublicStorage)();
  if (permission !== 'granted') {
    permission = await (environment.requestPublicStorage ?? requestPublicStorage)();
  }
  if (permission !== 'granted') {
    throw new Error('Public storage permission is required to save this chart on Android 10 or older');
  }
}

function filenameFor(result: SwissNatalChartResult, format: WesternNatalExportFormat): string {
  return `western-natal-${result.birth.utc.slice(0, 10)}.${format}`;
}

export async function saveWesternNatalChart(
  result: SwissNatalChartResult,
  format: WesternNatalExportFormat,
  options: WesternNatalSaveOptions = {},
): Promise<WesternNatalSaveResult> {
  const { environment, ...exportOptions } = options;
  const blob = await createWesternNatalExport(result, format, exportOptions);
  const filename = filenameFor(result, format);
  const native = environment?.native ?? Capacitor.isNativePlatform();

  if (native) {
    const nativeEnvironment = environment ?? {};
    await ensureLegacyAndroidStoragePermission(nativeEnvironment);
    const base64 = await blobToBase64(blob);
    const writeResult = await (environment?.writeNative ?? writeDocuments)({
      data: base64,
      path: `LichViet/${filename}`,
      recursive: true,
    });
    return { filename, destination: 'documents', uri: writeResult.uri };
  }

  (environment?.downloadWeb ?? webDownload)(blob, filename);
  return { filename, destination: 'web' };
}
