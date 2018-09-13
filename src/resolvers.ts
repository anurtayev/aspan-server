// tslint:disable:variable-name

import { IEntry } from './types'
import { IContext } from './index'
import { IntStringBooleanInstance } from './IntStringBoolean'

export const resolvers = {
    IntStringBoolean: IntStringBooleanInstance,

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
            if (obj.isFile) {
                return 'File'
            } else {
                return 'Folder'
            }
        },

        metaData(entry: IEntry, _args, { repository }: IContext) {
            return repository.getMetaData(entry.id)
        }
    },

    Folder: {
        children(entry: IEntry, _args, { repository }: IContext) {
            return repository.getFolderEntries(entry.id)
        }
    },

    File: {
        contentType(entry: IEntry, _args, { repository }: IContext) {
            return repository.getContentType(entry.id)
        },

        size(entry: IEntry, _args, { repository }: IContext) {
            return repository.getSize(entry.id)
        }
    }
}
