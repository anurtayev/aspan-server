import {
  ensureDir,
  lstat,
  readdir,
  readJson,
  writeJson,
  Stats,
  pathExists
} from 'fs-extra'
import { join, normalize } from 'path'
import * as _ from 'lodash'
import {
  IRepositoryOptions,
  IRepository,
  TEntryId,
  IMetaData,
  TEntry,
  TAttributeType
} from './types'
import * as glob from 'glob'
import {
  cleanseWindowsPath,
  fsPath,
  metaFile,
  metaFolder,
  entryContentType,
  entryName,
  parentId,
  thumbFile
} from './repositoryPath'
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
    const cleansedId = cleanseWindowsPath(id)
    const cleansedParentId = cleanseWindowsPath(parentId(id))

    return stats.isFile()
      ? {
          id: cleansedId,
          type: 'file',
          name: entryName(id),
          parentId: cleansedParentId,
          contentType: entryContentType(id),
          size: stats.size
        }
      : {
          id: cleansedId,
          type: 'folder',
          name: entryName(id),
          parentId: cleansedParentId
        }
  }

  public getFolderEntries = async (id: TEntryId): Promise<TEntry[]> =>
    await Promise.all(
      (await readdir(fsPath(id, this.options)))
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
                cleanseWindowsPath(fileName.slice(this.options.path.length))
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
    const metaFileFSPath = fsPath(metaFile(id, this.options), this.options)
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
      await ensureDir(metaFolder(id, this.options))
      await writeJson(metaFile(id, this.options), metaData)
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

  private stats = async (id: TEntryId): Promise<Stats> =>
    lstat(fsPath(id, this.options))

  public makeThumb = async (id: TEntryId) => {
    await ensureDir(metaFolder(id, this.options))
    sharp(fsPath(id, this.options))
      .resize(200, 200)
      .toFile(thumbFile(id, this.options))
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
    console.log(fsPath(path, this.options))
    console.log(
      JSON.stringify(await readdir(fsPath(path, this.options)), null, 2)
    )

    const files = (await readdir(fsPath(path, this.options))).map(f =>
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
}
