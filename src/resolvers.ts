// tslint:disable:variable-name

import { TEntry, IContext } from './types'
import { NumberStringBooleanInstance } from './NumberStringBoolean'

export const resolvers = {
  NumberStringBoolean: NumberStringBooleanInstance,

  Query: {
    getRootFolderEntries(_root, _args, { repository }: IContext) {
      const rootFolderPath = '/'
      return repository.getFolderEntries(rootFolderPath)
    },

    getFolderEntries(_root, { id }, { repository }: IContext) {
      return repository.getFolderEntries(id)
    }
  },

  Mutation: {
    addTag(_root, { id, tag }, { repository }: IContext) {
      return repository.addTag(id, tag)
    },

    removeTag(_root, { id, tag }, { repository }: IContext) {
      return repository.removeTag(id, tag)
    },

    addAttribute(_root, { id, attribute }, { repository }: IContext) {
      return repository.addAttribute(id, attribute)
    },

    removeAttribute(_root, { id, attributeKey }, { repository }: IContext) {
      return repository.removeAttribute(id, attributeKey)
    }
  },

  Entry: {
    __resolveType(obj) {
      if (obj.type === 'file') {
        return 'File'
      } else {
        return 'Folder'
      }
    }
  },

  Folder: {
    metaData(entry: TEntry, _args, { repository }: IContext) {
      return repository.getMetaData(entry.id)
    },

    children(entry: TEntry, _args, { repository }: IContext) {
      return repository.getFolderEntries(entry.id)
    }
  },

  File: {
    metaData(entry: TEntry, _args, { repository }: IContext) {
      return repository.getMetaData(entry.id)
    },

    image(entry: TEntry, _args, { repository }: IContext) {
      return repository.getBase64ImageString(entry.id)
    },

    thumbImage(entry: TEntry, _args, { repository }: IContext) {
      return repository.getBase64ImageString(entry.id)
    }
  }
}
