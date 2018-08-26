import test from 'ava'
import * as sinon from 'sinon'
import { join } from 'path'
import * as shortid from 'shortid'
import * as testData from './createTestRepository'

import BasicFileSystemRepository from './BasicFileSystemRepository'
import { IRepositoryOptions, IEntry, IRepository } from './types'

test.beforeEach((t) => {
  const logSpy = sinon.spy()
  console.log = logSpy
  t.context.logSpy = logSpy

  const repositoryOptions: IRepositoryOptions = {
    path: join(process.env.TEMP as string, shortid.generate()),
    metaFolderName: '.metaFolder'
  }

  t.context.repositoryOptions = repositoryOptions
  t.context.repositoryInstance = new BasicFileSystemRepository(repositoryOptions)
})

test.afterEach((t) => {
  testData.erase(t.context.repositoryOptions)
})

test('[BasicFileSystemRepository] getEntry must return correct data', async (t) => {
  const repository: IRepository = t.context.repositoryInstance
  const entry: IEntry = await repository.getEntry('/')

  t.deepEqual(
    entry,
    {
      id: '/',
      isFile: false
    }
  )
})
