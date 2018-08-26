import { ensureDir, lstat, readdir, pathExists, readJson, writeJson } from 'fs-extra'
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
import { AspanError } from './AspanError'

export default class implements IRepository {
  constructor(
    private readonly options: IRepositoryOptions
  ) { }

  public getEntry = async (id: TEntryId): Promise<IEntry> => {
    const fsPath = this.fsPath(id)

    return {
      id: this.cleanseWindowsPath(id),
      isFile: (await lstat(fsPath)).isFile()
    }
  }

  public getFolderEntries = async (id: TEntryId): Promise<IEntry[]> => {
    return await Promise.all(
      (await readdir(this.fsPath(id)))
        .filter((entry) => entry !== this.options.metaFolderName)
        .map((entry) => normalize(join(id, entry)))
        .map((entry) => this.getEntry(entry))
    )
  }

  public findEntries = async (pattern: string): Promise<IEntry[]> => {
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

  public addTag = (metaData: IMetaData, tag: string): IMetaData => {
    return { ...metaData, tags: r.append(tag, metaData.tags as string[]) }
  }

  public removeTag = (metaData: IMetaData, tag: string): IMetaData => {
    return { ...metaData, tags: r.append(tag, metaData.tags as string[]) }
  }

  public addAttribute = (metaData: IMetaData, tag: string): IMetaData => {
    return { ...metaData, tags: r.append(tag, metaData.tags as string[]) }
  }

  public removeAttribute = (metaData: IMetaData, tag: string): IMetaData => {
    return { ...metaData, tags: r.append(tag, metaData.tags as string[]) }
  }

  private getAllRepositoryEntries = async (id) => {
    const files = await this.getFolderEntries(id)
    const stats = await Promise.all(files.map((f) => lstat(this.fsPath(f.id))))
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

  private fsPath = (id: TEntryId): TFileSystemPath => join(this.options.path, id)

  private metaFolder = (id: TEntryId): TFileSystemPath => join(
    dirname(this.fsPath(id)),
    this.options.metaFolderName
  )

  private metaFile = (id: TEntryId): TFileSystemPath => join(this.metaFolder(id), `${basename(id)}.json`)
}
