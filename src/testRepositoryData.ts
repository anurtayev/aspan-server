import { IMetaData, IFile, IFolder } from './types'

type TMeta = {
  meta?: IMetaData
}
type TReducedFile = Pick<IFile, 'id' | 'type'> & TMeta
type TReducedFolder = Pick<IFolder, 'id' | 'type'> &
  TMeta & {
    children?: TChildren
  }
export type TChildren = Array<TReducedFile | TReducedFolder>

export const entryLiterals: TChildren = [
  {
    id: 'f1',
    type: 'file'
  },
  {
    id: 'f2',
    type: 'file',
    meta: { tags: ['receipts', 'electronics', 'NYtour'] }
  },
  {
    id: 'fo1',
    type: 'folder',
    meta: {
      tags: ['firstFolder'],
      attributes: [
        ['title', 'fatWedding'],
        ['description', 'who-an!'],
        ['lop', 'ka']
      ]
    },
    children: [
      {
        id: 'sf1',
        type: 'folder'
      },
      {
        id: 'sf2',
        type: 'folder'
      },
      {
        id: 'sfo1',
        type: 'folder'
      },
      {
        id: 'subFolder34',
        type: 'folder',
        meta: {
          tags: ['notEmpty', 'NY', '2018', 'friends'],
          attributes: [
            ['empty', false],
            ['title', 'New Year celebration'],
            ['description', 'At Zhukovs home'],
            ['numberOfFiles', 45]
          ]
        },
        children: [
          {
            id: 'checkCT.jpeg',
            type: 'file',
            meta: {
              attributes: [['description', 'Serega taking a picture']],
              tags: ['favorite', 'friends']
            }
          },
          {
            id: 'anotherExt_f2.jpg',
            type: 'file'
          },
          {
            id: 'gifFile.gif',
            type: 'file'
          }
        ]
      }
    ]
  }
]
