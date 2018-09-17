import { IEntry, IMetaData } from './types'

export const entryLiterals: Array<Pick<IEntry, 'id' | 'isFile'> & IMetaData> = [
  {
    id: '/f1',
    isFile: true
  },
  {
    id: '/f2',
    isFile: true,
    tags: ['receipts', 'electronics', 'NYtour']
  },
  {
    id: '/fo1',
    isFile: false,
    tags: ['firstFolder'],
    attributes: [['title', 'fatWedding'], ['description', 'who-an!'], ['lop', 'ka']]
  },
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
    isFile: false,
    tags: ['notEmpty', 'NY', '2018', 'friends'],
    attributes: [
      ['empty', false], ['title', 'New Year celebration'], ['description', 'At Zhukovs home'], ['numberOfFiles', 45]
    ]
  },
  {
    id: '/fo1/subFolder34/checkCT.jpeg',
    isFile: true,
    attributes: [['description', 'Serega taking a picture']],
    tags: ['favorite', 'friends']
  },
  {
    id: '/fo1/subFolder34/anotherExt_f2.jpg',
    isFile: true
  },
  {
    id: '/fo1/subFolder34/gifFile.gif',
    isFile: true
  }
]
