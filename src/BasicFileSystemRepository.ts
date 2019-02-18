import { join, dirname, basename, extname, normalize } from 'path'
import {
  ensureDir,
  lstat,
  readdir,
  readJson,
  writeJson,
  Stats,
  pathExists,
  remove,
  emptyDir,
  readFile
} from 'fs-extra'
import * as _ from 'lodash'
import {
  IRepositoryOptions,
  IRepository,
  TEntryId,
  IMetaData,
  TEntry,
  TAttributeType,
  TFileSystemPath,
  TContentType,
  TAsyncEntryAction
} from './types'
import * as glob from 'glob'
import {
  addTag,
  removeTag,
  addAttribute,
  removeAttribute
} from './metaDataHelpers'
import * as sharp from 'sharp'

export default class implements IRepository {
  constructor(private readonly options: IRepositoryOptions) {}

  public getEntry = async (id: TEntryId): Promise<TEntry> => {
    const stats = await this.stats(id)

    return stats.isFile()
      ? {
          id: id,
          type: 'file',
          name: this.entryName(id),
          parentId: this.parentId(id),
          contentType: this.entryContentType(id),
          size: stats.size
        }
      : {
          id: id,
          type: 'folder',
          name: this.entryName(id),
          parentId: this.parentId(id)
        }
  }

  public getFolderEntries = async (id: TEntryId): Promise<TEntry[]> =>
    (await Promise.all(
      (await readdir(this.fsPath(id)))
        .filter(
          entryId =>
            entryId !== this.options.metaFolder &&
            !basename(entryId).startsWith('.')
        )
        .map(entryId => this.cleanseWindowsPath(normalize(join(id, entryId))))
        .map(entryId => this.getEntry(entryId))
    )).filter(
      (entry: TEntry) =>
        entry.type === 'folder' ||
        (entry.type === 'file' && this.options.exts.includes(entry.contentType))
    )

  public findEntries = async (pattern: string): Promise<TEntry[]> => {
    const options = {
      cwd: this.options.path,
      root: this.options.path
    }

    return new Promise<TEntry[]>((resolve, reject) => {
      glob(pattern, options, (error, files) => {
        if (error) {
          return reject(error)
        }

        return resolve(
          Promise.all(
            files
              .map(fileName =>
                this.cleanseWindowsPath(
                  fileName.slice(this.options.path.length)
                )
              )
              .map(
                async (fileName: string) =>
                  this.getEntry(fileName) as Promise<TEntry>
              )
          )
        )
      })
    })
  }

  public getMetaData = async (id: TEntryId): Promise<IMetaData | null> => {
    const metaFileFSPath = this.fsPath(this.metaFile(id))
    if (await pathExists(metaFileFSPath)) {
      return await readJson(metaFileFSPath)
    } else {
      return null
    }
  }

  public setMetaData = async (
    id: TEntryId,
    metaData: IMetaData
  ): Promise<IMetaData> => {
    if (metaData && (metaData.attributes || metaData.tags)) {
      await ensureDir(this.fsPath(this.metaFolder(id)))
      await writeJson(this.fsPath(this.metaFile(id)), metaData)
    }
    return metaData
  }

  public addTag = async (id: TEntryId, tag: string): Promise<IMetaData> =>
    await this.setMetaData(id, addTag(await this.getMetaData(id), tag))

  public removeTag = async (id: TEntryId, tag: string): Promise<IMetaData> =>
    await this.setMetaData(id, removeTag(await this.getMetaData(id), tag))

  public addAttribute = async (
    id: TEntryId,
    attribute: [string, TAttributeType]
  ): Promise<IMetaData> =>
    await this.setMetaData(
      id,
      addAttribute(await this.getMetaData(id), attribute)
    )

  public removeAttribute = async (
    id: TEntryId,
    attribute: string
  ): Promise<IMetaData> =>
    await this.setMetaData(
      id,
      removeAttribute(await this.getMetaData(id), attribute)
    )

  private stats = async (id: TEntryId): Promise<Stats> => lstat(this.fsPath(id))

  public walkChildren = async (
    folder: TEntryId,
    callBack: TAsyncEntryAction
  ) => {
    await Promise.all(
      (await this.getFolderEntries(folder)).map(async entry => {
        await callBack(entry)
        if (entry.type === 'folder') {
          return this.walkChildren(entry.id, callBack)
        }
      })
    )
  }

  public makeThumb = async (id: TEntryId) => {
    await ensureDir(this.fsPath(this.metaFolder(id)))
    await sharp(this.fsPath(id))
      .resize(200, 200)
      .toFile(this.fsPath(this.thumbFile(id)))
  }

  public cleanseWindowsPath = (id: TEntryId): TFileSystemPath =>
    id.replace(/\\/g, '/')

  public fsPath = (id: TEntryId): TFileSystemPath => {
    const path = normalize(join(this.options.path, id))
    const cleansedPath = this.cleanseWindowsPath(path)
    return cleansedPath.endsWith('/') ? path.slice(0, -1) : path
  }

  public metaFolder = (id: TEntryId): TFileSystemPath =>
    this.cleanseWindowsPath(join(dirname(id), this.options.metaFolder))

  public metaFile = (id: TEntryId): TFileSystemPath =>
    this.cleanseWindowsPath(join(this.metaFolder(id), `${basename(id)}.json`))

  public entryName = (id: TEntryId): string => basename(id, extname(id))

  public entryContentType = (id: TEntryId): TContentType =>
    extname(id).slice(1) as TContentType

  public parentId = (id: TEntryId): string =>
    this.cleanseWindowsPath(dirname(id))

  public thumbFile = (id: TEntryId): TEntryId =>
    `${this.metaFolder(id)}/${this.options.thumbsPrefix}${this.entryName(
      id
    )}.${this.entryContentType(id)}`

  public empty = async () => {
    await remove(this.options.path)
    await emptyDir(this.options.path)
  }

  public getBase64ImageString = async (id: TEntryId) => {
    return new Buffer(await readFile(this.fsPath(id))).toString('base64')
  }

  public getBase64ThumbString = async (id: TEntryId) => {
    if (pathExists(id)) {
      return this.getBase64ImageString(this.thumbFile(id))
    }
    return null
  }
}
