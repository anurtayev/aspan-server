import { fsPath, metaFileName } from './repositoryPath'
import { remove, emptyDir, ensureFile, ensureDir, writeJson } from 'fs-extra'
import { dirname } from 'path'
import { entryLiterals } from './testRepositoryData'
import { IRepositoryOptions, IMetaData } from './types'

const writeMetaData = async (
  options: IRepositoryOptions,
  id: string,
  metaData: IMetaData
) => {
  const metaFile = metaFileName(id, options)
  await ensureDir(dirname(metaFile))
  await writeJson(metaFile, metaData)
}

export const create = async (options: IRepositoryOptions): Promise<void> => {
  await emptyDir(options.path)

  await Promise.all(
    entryLiterals.map(async entryLiteral => {
      if (entryLiteral.tags || entryLiteral.attributes) {
        await writeMetaData(options, entryLiteral.id, {
          tags: entryLiteral.tags,
          attributes: entryLiteral.attributes
        })
      }

      const expandedId = fsPath(entryLiteral.id, options)
      if (entryLiteral.type === 'file') {
        await ensureDir(dirname(expandedId))
        await ensureFile(expandedId)
      } else {
        await ensureDir(expandedId)
      }
    })
  )
}

export const erase = async (options: IRepositoryOptions): Promise<void> =>
  await remove(options.path)
