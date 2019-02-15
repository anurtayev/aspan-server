import { fsPath, metaFile } from './repositoryPath'
import { remove, emptyDir, ensureFile, ensureDir, writeJson } from 'fs-extra'
import { dirname } from 'path'
import { entryLiterals, TChildren } from './testRepositoryData'
import { IRepositoryOptions, IMetaData } from './types'
import { options } from '../src/util'

const writeMetaData = async (
  options: IRepositoryOptions,
  id: string,
  metaData: IMetaData
) => {
  const metaFileStr = metaFile(id, options)
  await ensureDir(dirname(metaFileStr))
  await writeJson(metaFileStr, metaData)
}

const createChildren = (children: TChildren) => {}

export const create = async (options: IRepositoryOptions): Promise<void> => {
  await emptyDir(options.path)

  await Promise.all(
    entryLiterals.map(async entryLiteral => {
      if (
        entryLiteral.meta &&
        (entryLiteral.meta.tags || entryLiteral.meta.attributes)
      ) {
        await writeMetaData(options, entryLiteral.id, {
          tags: entryLiteral.meta.tags,
          attributes: entryLiteral.meta.attributes
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

// ******************* Create test repository
remove(options.path)
create(options)
