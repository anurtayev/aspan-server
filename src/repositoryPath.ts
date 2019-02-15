import {
  TEntryId,
  TFileSystemPath,
  IRepositoryOptions,
  TContentType
} from './types'
import { join, dirname, basename, extname, normalize } from 'path'

export const cleanseWindowsPath = (id: TEntryId): TFileSystemPath =>
  id.replace(/\\/g, '/')

export const fsPath = (
  id: TEntryId,
  options: IRepositoryOptions
): TFileSystemPath => normalize(join(options.path, id))

export const metaFolder = (
  id: TEntryId,
  options: IRepositoryOptions
): TFileSystemPath => cleanseWindowsPath(join(dirname(id), options.metaFolder))

export const metaFile = (
  id: TEntryId,
  options: IRepositoryOptions
): TFileSystemPath =>
  cleanseWindowsPath(join(metaFolder(id, options), `${basename(id)}.json`))

export const entryName = (id: TEntryId): string => basename(id, extname(id))

export const entryContentType = (id: TEntryId): TContentType =>
  extname(id).slice(1) as TContentType

export const parentId = (id: TEntryId): string =>
  cleanseWindowsPath(dirname(id))

export const thumbFile = (
  id: TEntryId,
  options: IRepositoryOptions
): TEntryId =>
  `${metaFolder(id, options)}/${options.thumbsPrefix}${entryName(
    id
  )}.${entryContentType(id)}`
