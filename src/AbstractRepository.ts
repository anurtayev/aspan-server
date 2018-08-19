import { ensureDir, lstat, readdir, readFile, readJson, writeJson } from 'fs-extra'
import { basename, dirname, extname, join, normalize } from 'path'
import r from 'ramda'
import { cleanseWindowsPath } from './server/util/cleanseWindowsPath'
import {
  IOptions,
  IRepository,
  TAsyncResultEntry,
  TEntryId,
  TFileSystemPath,
  TAsyncResultEntries,
  IMetaData,
  IEntry,
  EContentType
} from './types'

export abstract class AbstractRepository implements IRepository {
  constructor(
    public readonly path: TEntryId,
    private readonly options: IOptions
  ) { }

  public getEntry = async (id): TAsyncResultEntry => {
    const expId = this.expandedId(id)
    let stat
    try {
      stat = await lstat(expId)
    } catch (e) {
      console.log(e)
    }
    return {
      id: cleanseWindowsPath(id),
      name: basename(expId),
      contentType: extname(id) as EContentType,
      isFile: stat.isFile(),
      metaData: await this.getMetaData(id)
    }
  }

  public getFolderEntries = async (folder) => {
    return await Promise.all(
      (await readdir(this.expandedId(folder)))
        .filter((_) => _ !== this.options.metaFolder)
        .map((entry) => normalize(join(folder, entry)))
        .map((entry) => this.getEntry(entry))
    )
  }

  public addTag = async (id: TEntryId, tag: string) => {
    const info = await this.getMetaData(id)
    return await this.setMetaData(id, { ...info, tags: r.append(tag, info.tags) })
  }

  public removeTag = async (id: TEntryId, tag: string) => {
    const info = await this.getMetaData(id)
    return info.tags.includes(tag)
      ? await this.setMetaData(id, { ...info, tags: r.without([tag], info.tags) })
      : await this.getEntry(id)
  }

  public changeTitle = async (id: TEntryId, title: string) => {
    const info = await this.getMetaData(id)
    return await this.setMetaData(
      id,
      title ? { ...info, title } : r.omit(['title'], info)
    )
  }

  public changeDescription = async (id: TEntryId, description: string) => {
    const info = await this.getMetaData(id)
    return await this.setMetaData(
      id,
      description ? { ...info, description } : r.omit(['description'], info)
    )
  }

  public findEntries = async (pattern: string): TAsyncResultEntries => {
    const regex = new RegExp(pattern)
    const rootFolder = '/'

    const allId = await this.getAllRepositoryEntries(rootFolder)
    const found = allId.filter((_: IEntry) =>
      `${_.id}${_.metaData.title}${_.metaData.description}${_.metaData.tags ? _.metaData.tags.join() : ''}`
        .search(regex) >= 0
    )
    return found
  }

  public setMetaData = async (id: TEntryId, metaData: IMetaData) => {
    await ensureDir(this.metaFolder(id))
    await writeJson(this.metaFile(id), metaData)
    return await this.getEntry(id)
  }

  public getMetaData = async (id) => {
    let info
    try {
      info = await readJson(this.metaFile(id))
    } catch (e) {
      info = {}
    }
    return info
  }

  private expandedId = (id: TEntryId): TFileSystemPath => join(this.path, id)

  private metaFolder = (id: TEntryId): TFileSystemPath => join(
    dirname(this.expandedId(id)),
    this.options.metaFolder
  )

  private metaFile = (id: TEntryId): TFileSystemPath => join(this.metaFolder(id), `${basename(id)}.json`)

  private getAllRepositoryEntries = async (id): TAsyncResultEntries => {
    const files = await this.getFolderEntries(id)
    const stats = await Promise.all(files.map((f) => lstat(this.expandedId(f.id))))
    const expanded = await Promise.all(
      files.map(
        async (entry: IEntry, index) => stats[index].isDirectory()
          ? await this.getAllRepositoryEntries(entry.id)
          : entry
      )
    )
    const flatAndFilter = r.flatten(expanded)
      .map(cleanseWindowsPath)
    return flatAndFilter
  }
}
