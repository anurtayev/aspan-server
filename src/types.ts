import * as _ from 'lodash'

export type TEntryId = string
export type TFileSystemPath = string
export type TAttributeType = string | boolean | number
export type TContentType = 'jpeg' | 'jpg'

export interface IRepositoryOptions {
  /**
   * File system location when repository is located.
   */
  path: string
  metaFolderName: string
}

export interface IMetaData {
  tags?: string[]
  attributes?: Map<string, TAttributeType>
}

/**
 * Basic file system entry interface.
 */
export interface IEntry {
  id: TEntryId
  isFile: boolean
  name: string
  metaData?: IMetaData
  parentId: TEntryId
}

export interface IFile extends IEntry {
  contentType: TContentType
  size: number
}

export interface IFolder extends IEntry {
  children?: IEntry[]
}

export interface IRepository {
  getEntry: (id: TEntryId) => Promise<IEntry | undefined>
  getFolderEntries: (id: TEntryId) => Promise<IEntry[] | undefined>
  findEntries: (pattern: string) => Promise<IEntry[]>

  getContentType: (id: TEntryId) => TContentType
  getSize: (id: TEntryId) => Promise<number>

  setMetaData: (id: TEntryId, metaData: IMetaData) => Promise<void>
  getMetaData: (id: TEntryId) => Promise<IMetaData | undefined>

  addTag: (metaData: IMetaData, tag: string) => IMetaData
  removeTag: (metaData: IMetaData, tag: string) => IMetaData

  addAttribute: (metaData: IMetaData, attribute: string, value: TAttributeType) => IMetaData
  removeAttribute: (metaData: IMetaData, attribute: string) => IMetaData
}
