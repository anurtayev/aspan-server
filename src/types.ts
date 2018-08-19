export type TEntryId = string
export type TFileSystemPath = string
export type TAsyncResultEntry = Promise<IEntry>
export type TAsyncResultEntries = Promise<IEntry[]>
export type TAsyncResultMetaData = Promise<IMetaData>

export enum EContentType {
  jpeg = 'jpeg',
  jpg = 'jpg'
}

export interface IEntry {
  id: string
  isFile: boolean
  entries?: Promise<IEntry[]>

  metaData?: Promise<IMetaData>

  // below attributes are derived from <id>
  name: string
  contentType: EContentType
}

export interface IMetaData {
  tags: string[]
  description: string
  title: string
}

/**
 * All id's are relative to repository
 */
export interface IRepository {
  path: string

  getEntry(id: TEntryId): TAsyncResultEntry
  getFolderEntries(folder: TEntryId): TAsyncResultEntries

  addTag(id: TEntryId, tag: string): TAsyncResultEntry
  removeTag(id: TEntryId, tag: string): TAsyncResultEntry
  changeTitle(id: TEntryId, title: string): TAsyncResultEntry
  changeDescription(id: TEntryId, description: string): TAsyncResultEntry

  findEntries(pattern: string, folders?: string): TAsyncResultEntries

  setMetaData(id: TEntryId, metaData: IMetaData): TAsyncResultEntry
  getMetaData(id: TEntryId): TAsyncResultMetaData
}

export interface IOptions {
  metaFolder: string
}
