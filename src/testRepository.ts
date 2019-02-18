import { ensureFile, ensureDir } from 'fs-extra'
import { TChildren } from './testRepositoryData'
import { TEntryId, IRepository } from './types'

export const createChildren = async (
  repo: IRepository,
  folder: TEntryId,
  entries: TChildren
): Promise<void> => {
  await Promise.all(
    entries.map(async entry => {
      const entryId = `${folder === '/' ? '' : folder}/${entry.name}${
        entry.type === 'file' ? entry.contentType : ''
      }`
      console.log(`entryId: ${entryId}`)

      if (entry.meta && (entry.meta.tags || entry.meta.attributes)) {
        await repo.setMetaData(entryId, {
          tags: entry.meta.tags,
          attributes: entry.meta.attributes
        })
      }

      const expandedId = repo.fsPath(entryId)
      if (entry.type === 'file') {
        await ensureFile(expandedId)
      } else {
        await ensureDir(expandedId)
        if (entry.children) {
          await createChildren(repo, entryId, entry.children)
        }
      }
    })
  )
}
