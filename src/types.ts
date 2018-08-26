export type TEntryId = string
export type TFileSystemPath = string
export type TAttributeType = string | boolean | number
export type TContentType = 'jpeg' | 'jpg'

export enum EDerivedAttributes {
  name = 'name',
  contentType = 'contentType'
}

export interface IEntry {
  id: string
  isFile: boolean
}

export interface IMetaData {
  tags?: string[]
  attributes?: {
    [key: string]: TAttributeType
  }
}

export interface IRepositoryOptions {
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
