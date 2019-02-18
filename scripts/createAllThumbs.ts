import BasicFileSystemRepository from '../src/BasicFileSystemRepository'
import { options } from '../src/util'
import { TEntry } from '../src/types'

const repo = new BasicFileSystemRepository(options)

repo.walkChildren('/', async (entry: TEntry) => {
  if (entry.type === 'file') {
    await repo.makeThumb(entry.id)
  }
})
