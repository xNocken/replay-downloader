declare module 'fortnite-replay-downloader';

interface Checkpoint {
  Id: string,
  Group: string,
  Metadata: string,
  Time1: number,
  Time2: number,
  DownloadLink?: string,
  FileSize: number,
}

interface Event {
  Id: string,
  Group: string,
  Metadata: string,
  Time1: number,
  Time2: number,
  DownloadLink?: string,
  FileSize: number,
}

interface DataChunk {
  Id: string,
  Time1: number,
  Time2: number,
  SizeInBytes: number,
  DownloadLink?: string,
  FileSize: number,
}

interface MetaDataResult {
  ReplayName: string,
  LengthInMS: number,
  NetworkVersion: number,
  Changelist: number,
  FriendlyName: string,
  Timestamp: string,
  bIsLive: boolean,
  bCompressed: boolean,
  DesiredDelayInSeconds: number,
  DownloadLink?: string,
  FileSize: number,
  Checkpoints: Checkpoint[],
  Events: Event[],
  DataChunks: DataChunk[],
}

interface MetaDataOptions {
  matchId: string,
  chunkDownloadLinks: boolean,
}

interface UpdateInfo {
  current: number,
  max: number,
}

interface UpdateObject {
  header: UpdateInfo,
  data: UpdateInfo
  events: UpdateInfo,
  checkpoints: UpdateInfo,
}

interface ReplayOptions {
  matchId: string,
  maxConcurrentDownloads?: number,
  checkpointCount?: number,
  dataCount?: number,
  eventCount?: number,
  updateCallback?: (UpdateInfo: UpdateObject) => void,
}

export function downloadMetadata(options: MetaDataOptions): Promise<MetaDataResult>;

export function downloadReplay(options: ReplayOptions): Promise<Buffer>;
