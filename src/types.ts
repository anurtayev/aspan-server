export type TEntryId = string
export type TContentType = string
export type TFileSystemPath = string
export type TAttributeType = string | boolean | number
export type TAsyncEntryAction = (entry: TEntry) => Promise<any>

export interface IRepositoryOptions {
  /**
   * File system location when repository is located.
   */
  path: string
  metaFolder: string
  thumbsPrefix: string
  thumbsLength: number
  thumbsWidth: number
  exts: string[]
}

export type TAttribute = [string, TAttributeType]

export interface IMetaData {
  tags?: string[]
  attributes?: TAttribute[]
  title?: string
  description?: string
}

/**
 * Basic file system entry interface.
 */
interface IBasicEntry {
  id: TEntryId
  name: string
  parentId: TEntryId
}

export interface IFile extends IBasicEntry {
  type: 'file'
  contentType: string
  size: number
}

export interface IFolder extends IBasicEntry {
  type: 'folder'
  children?: TEntry[]
}

export type TEntry = IFile | IFolder

/**
 * All routines return undefined in case if entry doens't exist or error.
 */
export interface IRepository {
  getEntry: (id: TEntryId) => Promise<TEntry>
  getFolderEntries: (id: TEntryId) => Promise<TEntry[]>
  findEntries: (pattern: string) => Promise<TEntry[]>

  getMetaData: (id: TEntryId) => Promise<IMetaData | null>
  setMetaData: (id: TEntryId, metaData: IMetaData) => Promise<IMetaData>

  addTag: (id: TEntryId, tags: string) => Promise<IMetaData>
  removeTag: (id: TEntryId, tag: string) => Promise<IMetaData>

  addAttribute: (id: TEntryId, attribute: TAttribute) => Promise<IMetaData>
  removeAttribute: (id: TEntryId, attributeKey: string) => Promise<IMetaData>

  walkChildren: (folder: TEntryId, callBack: TAsyncEntryAction) => Promise<void>
  makeThumb: (id: TEntryId) => Promise<void>

  empty: () => Promise<void>

  fsPath: (id: TEntryId) => TFileSystemPath
  cleanseWindowsPath: (id: TEntryId) => TEntryId
  metaFolder: (id: TEntryId) => TEntryId
  metaFile: (id: TEntryId) => TEntryId
  entryName: (id: TEntryId) => string
  entryContentType: (id: TEntryId) => TContentType
  parentId: (id: TEntryId) => string
  thumbFile: (id: TEntryId) => TEntryId

  getBase64ImageString: (id: TEntryId) => Promise<string>
  getBase64ThumbString: (id: TEntryId) => Promise<string | null>
}

export interface IContext {
  repository: IRepository
}
