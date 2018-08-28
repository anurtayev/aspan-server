import {
  ensureDir,
  lstat,
  readdir,
  readJson,
  writeJson
} from 'fs-extra'
import { join, normalize } from 'path'
import * as r from 'ramda'
import {
  IRepositoryOptions,
  IRepository,
  TEntryId,
  IMetaData,
  IEntry,
  TAttributeType
} from './types'
import * as glob from 'glob'
import { cleanseWindowsPath, fsPath, metaFileName, metaFolderName } from './repositoryPath'

export default class implements IRepository {
  constructor(
    private readonly options: IRepositoryOptions
  ) { }

  public getEntry = async (id: TEntryId): Promise<IEntry> => ({
    id: cleanseWindowsPath(id),
    isFile: (await lstat(fsPath(id, this.options))).isFile()
  })

  public getFolderEntries = async (id: TEntryId): Promise<IEntry[]> => {
    return await Promise.all(
      (await readdir(fsPath(id, this.options)))
        .filter((entry) => entry !== this.options.metaFolderName)
        .map((entry) => normalize(join(id, entry)))
        .map((entry) => this.getEntry(entry))
    )
  }

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
              .map((fileName) => cleanseWindowsPath(fileName.slice(this.options.path.length)))
              .map(async (fileName: string) => this.getEntry(fileName))
          )
        )
      })
    })
  }

  public getMetaData = async (id: TEntryId): Promise<IMetaData> =>
    await readJson(metaFileName(id, this.options))

  public setMetaData = async (id: TEntryId, metaData: IMetaData) => {
    await ensureDir(metaFolderName(id, this.options))
    await writeJson(metaFileName(id, this.options), metaData)
  }

  public addTag = (metaData: IMetaData, tag: string): IMetaData => {
    if ((metaData.tags as string[]).every((existingTag) => tag !== existingTag)) {
      return { ...metaData, tags: [...metaData.tags as string[], tag] }
    }
    return metaData
  }

  public removeTag = (metaData: IMetaData, tag: string): IMetaData => {
    const position = (metaData.tags as string[]).findIndex((existingTag) => existingTag === tag)
    if (position) {
      return { ...metaData, tags: r.remove(position, 1, metaData.tags as string[]) }
    }
    return metaData
  }

  public addAttribute = (metaData: IMetaData, attribute: string, value: TAttributeType): IMetaData => {
    const existingAttributes = metaData.attributes ? metaData.attributes : {}
    existingAttributes[attribute] = value
    return { ...metaData, attributes: existingAttributes }
  }

  public removeAttribute = (metaData: IMetaData, attribute: string): IMetaData => {
    return { ...metaData, attributes: r.omit([attribute], metaData.attributes) }
  }
}
