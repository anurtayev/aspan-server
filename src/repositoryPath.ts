import { TEntryId, TFileSystemPath, IRepositoryOptions } from './types'
import { join, dirname, basename } from 'path'

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
