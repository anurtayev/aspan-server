import {
  ensureDir,
  lstat,
  readdir,
  readJson,
  writeJson,
  pathExists
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

export default class implements IRepository {
  constructor(
    private readonly options: IRepositoryOptions
  ) { }

  public getEntry = async (id: TEntryId): Promise<IEntry | undefined> => {
    const fsPathString = fsPath(id, this.options)
    if (pathExists(fsPathString)) {
      const stats = await lstat(fsPathString)
      return {
        id: cleanseWindowsPath(id),
        isFile: stats.isFile(),
        name: entryName(id),
        metaData: await this.getMetaData(id),
        parentId: parentId(id)
      }
    } else {
      return undefined
    }
  }

  public getFolderEntries = async (id: TEntryId): Promise<IEntry[]> => {
    return await Promise.all(
      (await readdir(fsPath(id, this.options)))
        .filter(entry => entry !== this.options.metaFolderName)
        .map(entry => normalize(join(id, entry)))
        .map(entry => this.getEntry(entry) as Promise<IEntry>)
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
              .map(fileName => cleanseWindowsPath(fileName.slice(this.options.path.length)))
              .map(async (fileName: string) => this.getEntry(fileName) as Promise<IEntry>)
          )
        )
      })
    })
  }

  public getContentType = (id: TEntryId): TContentType => entryContentType(id)

  public getSize = async (id: TEntryId): Promise<number> => {
    const fsPathString = fsPath(id, this.options)
    const stats = await lstat(fsPathString)
    return stats.size
  }

  public getMetaData = async (id: TEntryId): Promise<IMetaData | undefined> => {
    const metaFileNameString = metaFileName(id, this.options)

    if (await pathExists(metaFileNameString)) {
      const metaData: IMetaData = await readJson(metaFileName(id, this.options))
      if (
        metaData &&
        (
          (metaData.attributes && metaData.attributes.size > 0) ||
          (metaData.tags && metaData.tags.length > 0)
        )
      ) {
        return metaData
      } else {
        return undefined
      }
    } else {
      return undefined
    }
  }

  public setMetaData = async (id: TEntryId, metaData: IMetaData): Promise<void> => {
    if (metaData.tags || metaData.attributes) {
      await ensureDir(metaFolderName(id, this.options))
      await writeJson(metaFileName(id, this.options), metaData)
    }
  }

  public addTag = (metaData: IMetaData, tag: string): IMetaData => {
    if ((metaData.tags as string[]).every(existingTag => tag !== existingTag)) {
      return { ...metaData, tags: [...metaData.tags as string[], tag] }
    }
    return metaData
  }

  public removeTag = (metaData: IMetaData, tag: string): IMetaData => ({
    ...metaData,
    tags: _.without(metaData.tags as string[], tag)
  })

  public addAttribute = (metaData: IMetaData, attribute: string, value: TAttributeType): IMetaData => {
    if (attribute && value) {
      const attributes: Map<string, TAttributeType> = metaData.attributes ? metaData.attributes : new Map()
      attributes.set(attribute, value)
      return { ...metaData, attributes }
    } else {
      return metaData
    }
  }

  public removeAttribute = (metaData: IMetaData, attribute: string): IMetaData => {
    if (metaData.attributes && attribute) {
      const attributes: Map<string, TAttributeType> = new Map(metaData.attributes)
      attributes.delete(attribute)
      return { ...metaData, attributes }
    } else {
      return metaData
    }
  }
}
