import test from 'ava'
import * as sinon from 'sinon'
import { join } from 'path'
import * as shortid from 'shortid'
import * as testRepository from './testRepository'

import BasicFileSystemRepository from './BasicFileSystemRepository'
import { IRepositoryOptions, IEntry, IRepository } from './types'

test.beforeEach(async (t) => {
  const logSpy = sinon.spy()
  console.log = logSpy
  t.context.logSpy = logSpy

  const repositoryOptions: IRepositoryOptions = {
    path: join(process.env.TEMP as string, shortid.generate()),
    metaFolderName: '.metaFolder'
  }
  t.context.repositoryOptions = repositoryOptions

  await testRepository.create(repositoryOptions)
  t.context.repositoryInstance = new BasicFileSystemRepository(repositoryOptions)
})

test.afterEach(async (t) => {
  await testRepository.erase(t.context.repositoryOptions)
})

test('[BasicFileSystemRepository] getEntry must return correct entry data', async (t) => {
  const repository: IRepository = t.context.repositoryInstance

  t.deepEqual(
    await repository.getEntry('/f2'),
    {
      id: '/f2',
      isFile: true
    }
  )

  t.deepEqual(
    await repository.getEntry('/fo1/sf2'),
    {
      id: '/fo1/sf2',
      isFile: true
    }
  )

  await t.throwsAsync(async () => {
    await repository.getEntry('/entryDoesNotExist')
  })
})
