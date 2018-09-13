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

export type TAttribute = [string, TAttributeType]

export interface IMetaData {
  tags?: string[]
  attributes?: TAttribute[]
}

/**
 * Basic file system entry interface.
 */
export interface IEntry {
  id: TEntryId
  isFile: boolean
  name: string
  parentId: TEntryId
}

export interface IFile extends IEntry {
  contentType: TContentType
  size: number
}

export interface IFolder extends IEntry {
  children?: IEntry[]
}

/**
 * All routines return undefined in case if entry doens't exist or error.
 */
export interface IRepository {
  getEntry: (id: TEntryId) => Promise<IEntry>
  getFolderEntries: (id: TEntryId) => Promise<IEntry[]>
  findEntries: (pattern: string) => Promise<IEntry[]>

  getContentType: (id: TEntryId) => TContentType
  getSize: (id: TEntryId) => Promise<number>

  getMetaData: (id: TEntryId) => Promise<IMetaData>
  setMetaData: (id: TEntryId, metaData: IMetaData) => Promise<IMetaData>

  addTag: (id: TEntryId, tags: string) => Promise<IMetaData>
  removeTag: (id: TEntryId, tag: string) => Promise<IMetaData>

  addAttribute: (id: TEntryId, attribute: TAttribute) => Promise<IMetaData>
  removeAttribute: (id: TEntryId, attributeKey: string) => Promise<IMetaData>
}
