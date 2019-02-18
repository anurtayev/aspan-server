import BasicFileSystemRepository from '../src/BasicFileSystemRepository'
import * as testRepository from '../src/testRepository'
import { tstEntries } from '../src/testRepositoryData'
import { options } from '../src/util'

const repo = new BasicFileSystemRepository(options)
repo.empty()
testRepository.createChildren(repo, '/', tstEntries)
