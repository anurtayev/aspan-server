import { ensureDir, lstat, readdir, readFile, readJson, writeJson } from 'fs-extra'
import { basename, dirname, extname, join, normalize } from 'path'
import * as r from 'ramda'
import {
  IRepositoryOptions,
  IRepository,
  TEntryId,
  IMetaData,
  IEntry,
  TFileSystemPath
} from './types'

export default class implements IRepository {
  constructor(
    private readonly options: IRepositoryOptions
  ) { }

  public getEntry = async (id: TEntryId): Promise<IEntry> => {
    const expId = this.expandedId(id)
    return {
      id: this.cleanseWindowsPath(id),
      isFile: (await lstat(expId)).isFile()
    }
  }

  public getFolderEntries = async (id: TEntryId): Promise<IEntry[]> => {
    return await Promise.all(
      (await readdir(this.expandedId(id)))
        .filter((entry) => entry !== this.options.metaFolderName)
        .map((entry) => normalize(join(id, entry)))
        .map((entry) => this.getEntry(entry))
    )
  }

  public addTag = async (id: TEntryId, tag: string) => {
    const info = await this.getMetaData(id)
    await this.setMetaData(id, { ...info, tags: r.append(tag, info.tags) })
  }

  public removeTag = async (id: TEntryId, tag: string) => {
    const info = await this.getMetaData(id)
    if (!info.tags.includes(tag)) {
      await this.setMetaData(id, { ...info, tags: r.without([tag], info.tags) })

    }
  }

  public changeTitle = async (id: TEntryId, title: string) => {
    const metaData: IMetaData = await this.getMetaData(id)
    await this.setMetaData(
      id,
      title ? { ...metaData, title } : r.omit(['title'], metaData)
    )
  }

  public changeDescription = async (id: TEntryId, description: string) => {
    const info = await this.getMetaData(id)
    await this.setMetaData(
      id,
      description ? { ...info, description } : r.omit(['description'], info)
    )
  }

  public findEntries = async (pattern: string) => {
    const regex = new RegExp(pattern)
    const rootFolder = '/'

    const allId = await this.getAllRepositoryEntries(rootFolder)
    const found = allId.filter((_: IEntry) => _.id.search(regex) >= 0
    )
    return found
  }

  public setMetaData = async (id: TEntryId, metaData: IMetaData) => {
    await ensureDir(this.metaFolder(id))
    await writeJson(this.metaFile(id), metaData)
  }

  public getMetaData = async (id: TEntryId): Promise<IMetaData> => {
    let info
    try {
      info = await readJson(this.metaFile(id))
    } catch (e) {
      info = {}
    }
    return info
  }

  private getAllRepositoryEntries = async (id) => {
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
      .map(this.cleanseWindowsPath)
    return flatAndFilter
  }

  private cleanseWindowsPath = (id: TEntryId): TFileSystemPath => id.replace(/\\/g, '/')

  private expandedId = (id: TEntryId): TFileSystemPath => join(this.path, id)

  private metaFolder = (id: TEntryId): TFileSystemPath => join(
    dirname(this.expandedId(id)),
    this.options.metaFolderName
  )

  private metaFile = (id: TEntryId): TFileSystemPath => join(this.metaFolder(id), `${basename(id)}.json`)
}
