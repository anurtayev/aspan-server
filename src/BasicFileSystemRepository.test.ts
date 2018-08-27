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

const compareArrays = (foundEntries: IEntry[], expectedEntries: IEntry[]): boolean => {
  if (foundEntries.length !== expectedEntries.length) {
    return false
  }

  return foundEntries.every(
    (foundEntry: IEntry) => {
      return Boolean(expectedEntries.find(
        (expectedEntry) => expectedEntry.id === foundEntry.id && expectedEntry.isFile === foundEntry.isFile)
      )
    }
  )
}

test.beforeEach(async (t) => {
  const logSpy = sinon.spy()
  // console.log = logSpy
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
  const foundEntries1 = await t.context.repositoryInstance.getFolderEntries('/fo1')
  t.true(compareArrays(foundEntries1, expectedEntries1))

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
  const foundEntries2 = await t.context.repositoryInstance.getFolderEntries('/fo1/subFolder34')
  t.true(compareArrays(foundEntries2, expectedEntries2))
})

test('[getFolderEntries] It must throw when folder id does not exist', async (t) => {
  await t.throwsAsync(async () => {
    await t.context.repositoryInstance.getFolderEntries('/doesnotexits')
  })
})

test('[findEntries] It must find correct entries', async (t) => {
  const expectedEntries = [
    {
      id: '/f2',
      isFile: true
    },
    {
      id: '/fo1/sf2',
      isFile: true
    },
    {
      id: '/fo1/subFolder34/anotherExt_f2.jpg',
      isFile: true
    }
  ]
  const foundEntries = await t.context.repositoryInstance.findEntries('/**/*f2*(.)*')
  t.true(compareArrays(foundEntries, expectedEntries))
})

test('[findEntries] It must return emtpy array of entries when there is no match', async (t) => {
  const expectedEntries = []
  const foundEntries = await t.context.repositoryInstance.findEntries('/doesnotexist')
  t.true(compareArrays(foundEntries, expectedEntries))
})

test('[getMetaData] It must throw if entry id does not exist', async (t) => {
  await t.throwsAsync(async () => {
    await t.context.repositoryInstance.getMetaData('/doesnotexits')
  })
})

test.todo('[getMetaData] It must return correct meta data')
