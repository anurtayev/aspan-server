import {
  ensureDir,
  lstat,
  readdir,
  readJson,
  writeJson,
  Stats
} from 'fs-extra'
import { join, normalize } from 'path'
import * as _ from 'lodash'
import {
  IRepositoryOptions,
  IRepository,
  TEntryId,
  IMetaData,
  IEntry,
  TAttributeType,
  TContentType
} from './types'
import * as glob from 'glob'
import {
  cleanseWindowsPath,
  fsPath,
  metaFileName,
  metaFolderName,
  entryContentType,
  entryName,
  parentId
} from './repositoryPath'
import { addTag, removeTag, addAttribute, removeAttribute } from './metaDataHelper'

export default class implements IRepository {
  constructor(
    private readonly options: IRepositoryOptions
  ) { }

  public getEntry = async (id: TEntryId): Promise<IEntry> => ({
    id: cleanseWindowsPath(id),
    isFile: (await this.stats(id)).isFile(),
    name: entryName(id),
    parentId: parentId(id)
  })

  public getFolderEntries = async (id: TEntryId): Promise<IEntry[]> => await Promise.all(
    (await readdir(fsPath(id, this.options)))
      .filter(entry => entry !== this.options.metaFolderName)
      .map(entry => normalize(join(id, entry)))
      .map(entry => this.getEntry(entry) as Promise<IEntry>)
  )

  public findEntries = async (pattern: string): Promise<IEntry[]> => {
    const options = {
      cwd: this.options.path,
      root: this.options.path
    }

    return new Promise<IEntry[]>((resolve, reject) => {
      glob(pattern, options, (error, files) => {
        if (error) {
          return reject(error)
        }

        return resolve(
          Promise.all(
            files
              .map(fileName => cleanseWindowsPath(fileName.slice(this.options.path.length)))
              .map(async (fileName: string) => this.getEntry(fileName) as Promise<IEntry>)
          )
        )
      })
    })
  }

  public getContentType = (id: TEntryId): TContentType => entryContentType(id)

  public getSize = async (id: TEntryId): Promise<number> => {
    return (await lstat(fsPath(id, this.options))).size
  }

  public getMetaData = async (id: TEntryId): Promise<IMetaData> => await readJson(metaFileName(id, this.options))

  public setMetaData = async (id: TEntryId, metaData: IMetaData): Promise<IMetaData> => {
    if (!metaData) {
      throw new Error('setMetaData: metaData can not be null or undefined.')
    }
    await ensureDir(metaFolderName(id, this.options))
    await writeJson(metaFileName(id, this.options), metaData)
    return metaData
  }

  public addTag = async (id: TEntryId, tag: string): Promise<IMetaData> =>
    await this.setMetaData(id, addTag(await this.getMetaData(id), tag))

  public removeTag = async (id: TEntryId, tag: string): Promise<IMetaData> =>
    await this.setMetaData(id, removeTag(await this.getMetaData(id), tag))

  public addAttribute = async (id: TEntryId, attribute: [string, TAttributeType]): Promise<IMetaData> =>
    await this.setMetaData(id, addAttribute(await this.getMetaData(id), attribute))

  public removeAttribute = async (id: TEntryId, attribute: string): Promise<IMetaData> =>
    await this.setMetaData(id, removeAttribute(await this.getMetaData(id), attribute))

  public stats = async (id: TEntryId): Promise<Stats> => await lstat(fsPath(id, this.options))
}
