import * as r from 'ramda'

export type TEntryId = string
export type TFileSystemPath = string
export type TAttributeType = string | boolean | number
export type TContentType = 'jpeg' | 'jpg'

export enum EDerivedAttributes {
  name = 'name',
  contentType = 'contentType'
}

export const derivedAttributes: string[] = Object.keys(EDerivedAttributes)
export const isDerivedAttribute = (attributeName: string): boolean => r.contains(attributeName, derivedAttributes)

/**
 * Basic file system entry interface.
 */
export interface IEntry {
  /**
   * Entry id. Files system path relative to repository root.
   */
  id: string
  isFile: boolean
}

export interface IMetaData {
  tags?: string[]
  attributes: {
    contentType: string,
    name: string,
    [key: string]: TAttributeType
  }
}

export interface IRepositoryOptions {
  /**
   * File system location when repository is located.
   */
  path: string
  metaFolderName: string
}

export interface IRepository {
  getEntry: (id: TEntryId) => Promise<IEntry>
  getFolderEntries: (id: TEntryId) => Promise<IEntry[]>
  findEntries: (pattern: string) => Promise<IEntry[]>

  setMetaData: (id: TEntryId, metaData: IMetaData) => Promise<void>
  getMetaData: (id: TEntryId) => Promise<IMetaData>

  addTag: (metaData: IMetaData, tag: string) => IMetaData
  removeTag: (metaData: IMetaData, tag: string) => IMetaData

  addAttribute: (metaData: IMetaData, attribute: string, value: TAttributeType) => IMetaData
  removeAttribute: (metaData: IMetaData, attribute: string) => IMetaData
}
