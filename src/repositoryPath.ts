import { TEntryId, TFileSystemPath, IRepositoryOptions, TContentType } from './types'
import { join, dirname, basename, extname } from 'path'

export const cleanseWindowsPath =
    (id: TEntryId): TFileSystemPath => id.replace(/\\/g, '/')

export const fsPath =
    (id: TEntryId, options: IRepositoryOptions): TFileSystemPath => join(options.path, id)

export const metaFolderName =
    (id: TEntryId, options: IRepositoryOptions): TFileSystemPath => join(
        dirname(this.fsPath(id, options)),
        options.metaFolderName
    )

export const metaFileName =
    (id: TEntryId, options: IRepositoryOptions): TFileSystemPath =>
        join(metaFolderName(id, options), `${basename(id)}.json`)

export const entryName =
    (id: TEntryId): string =>
        basename(id, extname(id))

export const entryContentType =
    (id: TEntryId): TContentType =>
        extname(id).slice(1) as TContentType

export const parentId =
    (id: TEntryId): string =>
        dirname(id)
