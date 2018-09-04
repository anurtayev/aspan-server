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
  isDerivedAttribute,
  derivedAttributes,
  EDerivedAttributes
} from './types'
import * as glob from 'glob'
import {
  cleanseWindowsPath,
  fsPath,
  metaFileName,
  metaFolderName,
  entryContentType,
  entryName
} from './repositoryPath'

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
        .filter(entry => entry !== this.options.metaFolderName)
        .map(entry => normalize(join(id, entry)))
        .map(entry => this.getEntry(entry))
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
              .map(async (fileName: string) => this.getEntry(fileName))
          )
        )
      })
    })
  }

  public getMetaData = async (id: TEntryId): Promise<IMetaData> => {
    if (!await pathExists(fsPath(id, this.options))) {
      throw new Error('entry does not exist')
    }

    const metaFile = metaFileName(id, this.options)
    const metaData: IMetaData = await pathExists(metaFile) ?
      await readJson(metaFileName(id, this.options)) :
      { attributes: {} }
    metaData.attributes[EDerivedAttributes.name] = entryName(id)
    metaData.attributes[EDerivedAttributes.contentType] = entryContentType(id)

    return metaData
  }

  public setMetaData = async (id: TEntryId, metaData: IMetaData): Promise<void> => {
    if (metaData.tags || Object.keys(metaData.attributes).length > 2) {
      await ensureDir(metaFolderName(id, this.options))
      await writeJson(metaFileName(id, this.options), {
        ...metaData,
        attributes: {
          ..._.omit(metaData.attributes, derivedAttributes)
        }
      })
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
    if (!isDerivedAttribute(attribute)) {
      const newAttribute = {}
      newAttribute[attribute] = value
      return { ...metaData, attributes: { ...metaData.attributes, ...newAttribute } }
    }

    return metaData
  }

  public removeAttribute = (metaData: IMetaData, attribute: string): IMetaData => {
    if (!isDerivedAttribute(attribute)) {
      return {
        ...metaData,
        attributes: {
          contentType: metaData.attributes.contentType,
          name: metaData.attributes.name,
          ..._.omit(metaData.attributes, [attribute])
        }
      }
    }

    return metaData
  }
}
