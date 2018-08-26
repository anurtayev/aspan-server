import { IEntry, IMetaData } from './types'

export interface IEntryLiteral {
  entry: IEntry,
  metaData?: IMetaData,
  entries?: IEntryLiteral[]
}

export const entryLiterals: IEntryLiteral[] = [
  {
    entry: {
      id: 'f1',
      isFile: true
    }
  },
  {
    entry: {
      id: 'f2',
      isFile: true
    },
    metaData: {
      tags: ['receipts', 'electronics', 'NYtour']
    }
  },
  {
    entry: {
      id: 'fo1',
      isFile: false
    },
    metaData: {
      tags: ['firstFolder'],
      attributes: {
        title: 'fatWedding',
        description: 'who-an!',
        lop: 'ka'
      }
    },
    entries: [
      {
        entry: {
          id: 'sf1',
          isFile: true
        }
      },
      {
        entry: {
          id: 'sf2',
          isFile: true
        }
      },
      {
        entry: {
          id: 'sfo1',
          isFile: false
        },
        metaData: {
          tags: ['empty'],
          attributes: {
            empty: true
          }
        }
      },
      {
        entry: {
          id: 'subFolder34',
          isFile: false
        },
        metaData: {
          tags: ['notEmpty', 'NY', '2018', 'friends'],
          attributes: {
            empty: false,
            title: 'New Year celebration',
            description: 'At Zhukovs home',
            numberOfFiles: 45
          }
        },
        entries: [
          {
            entry: {
              id: 'checkCT.jpeg',
              isFile: true
            },
            metaData: {
              attributes: {
                description: 'Serega taking a picture'
              },
              tags: ['favorite']
            }
          }, {
            entry: {
              id: 'anotherExt_f2.jpg',
              isFile: true
            }
          }, {
            entry: {
              id: 'gifFile.gif',
              isFile: true
            }
          }
        ]
      }
    ]
  }
]
