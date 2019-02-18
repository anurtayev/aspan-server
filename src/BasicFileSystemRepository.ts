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
  emptyDir
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
  TContentType
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
    await Promise.all(
      (await readdir(this.fsPath(id)))
        .filter(entryId => entryId !== this.options.metaFolder)
        .map(entryId => normalize(join(id, entryId)))
        .map(async entryId => await this.getEntry(entryId))
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
      await ensureDir(this.metaFolder(id))
      await writeJson(this.metaFile(id), metaData)
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

  public makeThumb = async (id: TEntryId) => {
    await ensureDir(this.metaFolder(id))
    sharp(this.fsPath(id))
      .resize(200, 200)
      .toFile(this.thumbFile(id))
  }

  public makeAllThumbs = async () => {
    try {
      await Promise.all(
        (await this.getAllFolderIds()).map(id => this.makeThumb(id))
      )
    } catch (e) {
      console.error(e)
    }
  }

  public getAllFolderIds = async (path: TEntryId = '/'): Promise<any> => {
    console.log('1')
    console.log(this.fsPath(path))
    console.log(JSON.stringify(await readdir(this.fsPath(path)), null, 2))

    const files = (await readdir(this.fsPath(path))).map(f =>
      join(this.options.path, f)
    )
    console.log(JSON.stringify(files, null, 2))

    const stats = await Promise.all(files.map(f => this.stats(f)))

    const expanded = await Promise.all(
      files.map(async (entry, index) =>
        stats[index].isDirectory() ? await this.getAllFolderIds(entry) : entry
      )
    )

    /**
     * 
     const flatAndFilter = r
     .flatten(expanded)
     .filter(f => ctx.repoExtensions.some(_ => _ === extname(f).toLowerCase()))
     .filter(f => !basename(f).startsWith('thumb_'))
     .map(cleanseWindowsPath)
     return flatAndFilter
     */

    return expanded
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
}
