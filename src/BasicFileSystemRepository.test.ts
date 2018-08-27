import anyTest, { TestInterface } from 'ava'
import * as sinon from 'sinon'
import { join } from 'path'
import * as shortid from 'shortid'
import * as testRepository from './testRepository'

import BasicFileSystemRepository from './BasicFileSystemRepository'
import { IRepositoryOptions, IEntry, IRepository } from './types'

const test = anyTest as TestInterface<{
  logSpy: sinon.SinonSpy,
  repositoryOptions: IRepositoryOptions,
  repositoryInstance: IRepository
}>

test.beforeEach(async (t) => {
  const logSpy = sinon.spy()
  console.log = logSpy
  t.context.logSpy = logSpy

  t.context.repositoryOptions = {
    path: join(process.env.TEMP as string, shortid.generate()),
    metaFolderName: '.metaFolder'
  }

  await testRepository.create(t.context.repositoryOptions)
  t.context.repositoryInstance = new BasicFileSystemRepository(t.context.repositoryOptions)
})

test.afterEach(async (t) => {
  await testRepository.erase(t.context.repositoryOptions)
})

test('[getEntry] It must return correct entry data', async (t) => {
  t.deepEqual(
    await t.context.repositoryInstance.getEntry('/f2'),
    {
      id: '/f2',
      isFile: true
    }
  )

  t.deepEqual(
    await t.context.repositoryInstance.getEntry('/fo1/sf2'),
    {
      id: '/fo1/sf2',
      isFile: true
    }
  )
})

test('[getEntry] It must throw when entry id does not exist', async (t) => {
  await t.throwsAsync(async () => {
    await t.context.repositoryInstance.getEntry('/doesnotexits')
  })
})

test('[getFolderEntries] It must return correct entries data', async (t) => {
  const foundEntries1 = await t.context.repositoryInstance.getFolderEntries('/fo1')
  const expectedEntries1: IEntry[] = [
    {
      id: '/fo1/sf1',
      isFile: true
    },
    {
      id: '/fo1/sf2',
      isFile: true
    },
    {
      id: '/fo1/sfo1',
      isFile: false
    },
    {
      id: '/fo1/subFolder34',
      isFile: false
    }
  ]

  t.true(
    foundEntries1.every(
      (foundEntry: IEntry) => {
        return Boolean(expectedEntries1.find(
          (expectedEntry) => expectedEntry.id === foundEntry.id && expectedEntry.isFile === foundEntry.isFile)
        )
      }
    )
  )

  const foundEntries2 = await t.context.repositoryInstance.getFolderEntries('/fo1/subFolder34')
  const expectedEntries2: IEntry[] = [
    {
      id: '/fo1/subFolder34/checkCT.jpeg',
      isFile: true
    },
    {
      id: '/fo1/subFolder34/anotherExt_f2.jpg',
      isFile: true
    }, {
      id: '/fo1/subFolder34/gifFile.gif',
      isFile: true
    }
  ]

  t.true(
    foundEntries2.every(
      (foundEntry: IEntry) => {
        return Boolean(expectedEntries2.find(
          (expectedEntry) => expectedEntry.id === foundEntry.id && expectedEntry.isFile === foundEntry.isFile)
        )
      }
    )
  )
})

test('[getFolderEntries] It must throw when folder id does not exist', async (t) => {
  await t.throwsAsync(async () => {
    await t.context.repositoryInstance.getFolderEntries('/doesnotexits')
  })
})
