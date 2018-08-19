import {
  GraphQLSchema,
  GraphQLString,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLBoolean
} from 'graphql'
import {
  getEntries,
  getEntry,
  addTag,
  removeTag,
  changeTitle,
  readFileRaw,
  readThumbFileRaw,
  setInfo,
  searchRepo,
  searchFavorites
} from '../Repo'

const Info = new GraphQLInputObjectType({
  name: 'Info',
  fields: {
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    tags: {type: new GraphQLList(GraphQLString)},
    favorite: {type: GraphQLBoolean}
  }
})

export const GraphQLAspanEntry = new GraphQLInterfaceType({
  name: 'Entry',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'file system path'
    },
    type: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'FILE or ALBUM'
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'last portion of a path'
    },
    title: {
      type: GraphQLString,
      description: 'meta: title assigned to a media file'
    },
    description: {
      type: GraphQLString,
      description: 'meta: description assigned to a media file or an album. By default it is an empty string.'
    },
    tags: {
      type: new GraphQLList(GraphQLString),
      description: 'meta: list of tags assigned to entry. Can be empty but not null.'
    }
  }),
  resolveType: value =>
    value.type === 'FILE' ? GraphQLAspanFile : GraphQLAspanAlbum
})

export const GraphQLAspanFile = new GraphQLObjectType({
  name: 'File',
  description: 'A representation of any media file in repository',
  interfaces: [GraphQLAspanEntry],
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Meadia file id.'
    },
    type: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'returns FILE or ALBUM'
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'last portion of a id'
    },
    title: {
      type: GraphQLString,
      description: 'title assigned to a media file'
    },
    description: {
      type: GraphQLString,
      description: 'description assigned to a media file'
    },
    tags: {
      type: new GraphQLList(GraphQLString),
      description: 'list of tags assigned to entry. Can be null',
      resolve: (source, args, ctx) => source.tags || []
    },
    ext: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'media file extension'
    },
    bufBase64: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'base64 representation of raw buffer of the media file',
      resolve: async (source, args, ctx) =>
        new Buffer(await readFileRaw(ctx, source.id)).toString('base64')
    },
    thumbBufBase64: {
      type: GraphQLString,
      description: `base64 representation of raw buffer of the thumbnail of media file. Thumbnail can be missing, therefore this property can be null.`,
      resolve: async (source, args, ctx) =>
        new Buffer(await readThumbFileRaw(ctx, source.id)).toString('base64')
    },
    favorite: {
      type: GraphQLBoolean,
      description: 'favorite flag'
    }
  })
})

export const GraphQLAspanAlbum = new GraphQLObjectType({
  name: 'Album',
  description: 'Any folder inside repository. Can contain media files.',
  interfaces: [GraphQLAspanEntry],
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'file system id to album'
    },
    type: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'returns FILE or ALBUM'
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'last portion of a id'
    },
    title: {
      type: GraphQLString,
      description: 'title assigned to an album'
    },
    description: {
      type: GraphQLString,
      description: 'description assigned to an album'
    },
    tags: {
      type: new GraphQLList(GraphQLString),
      description: 'list of tags assigned to entry. Can be null',
      resolve: (source, args, ctx) => source.tags || []
    },
    entries: {
      type: new GraphQLNonNull(new GraphQLList(GraphQLAspanEntry)),
      description: `array of files and subAlbums inside album.
        If album is empty returns empty array.`,
      resolve: async(source, args, ctx) => (await getEntries(ctx, source.id))
    },
    files: {
      type: new GraphQLNonNull(new GraphQLList(GraphQLAspanFile)),
      description: 'array of files inside album',
      resolve: async(source, args, ctx) => (await getEntries(ctx, source.id))
        .filter(entry => entry.type === 'FILE')
    },
    subAlbums: {
      type: new GraphQLNonNull(new GraphQLList(GraphQLAspanAlbum)),
      description: 'array of subAlbums inside album',
      resolve: async(source, args, ctx) => (await getEntries(ctx, source.id))
        .filter(entry => entry.type === 'ALBUM')
    }
  })
})

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'query',
    fields: () => ({
      rootAlbum: {
        type: GraphQLAspanAlbum,
        resolve: source => source
      },
      getAlbum: {
        type: GraphQLAspanAlbum,
        args: {
          id: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: async(source, { id }, ctx) => await getEntry(ctx, id)
      },
      getPicture: {
        type: GraphQLAspanFile,
        args: {
          id: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve: async(source, { id }, ctx) => {
          const entry = await getEntry(ctx, id)
          if (entry.type === 'ALBUM') throw new TypeError(`getPicture: must be file, was album ${id}`)
          return entry
        }
      },
      search: {
        type: new GraphQLList(GraphQLAspanEntry),
        description: 'searches all media files by id, title, description, tags',
        args: {
          pattern: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve: async(source, {pattern}, ctx) => searchRepo(ctx, pattern)
      },
      searchFavorites: {
        type: new GraphQLList(GraphQLAspanEntry),
        description: 'searches among favorite media files by id, title, description, tags',
        args: {
          pattern: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve: async(source, {pattern}, ctx) => searchFavorites(ctx, pattern)
      }
    })
  }),
  mutation: new GraphQLObjectType({
    name: 'mutation',
    fields: () => ({
      changeTitle: {
        type: GraphQLAspanEntry,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLString)
          },
          title: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve: async(source, { id, title }, ctx) =>
          await changeTitle(ctx, id, title)
      },
      addTag: {
        type: GraphQLAspanEntry,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLString)
          },
          tag: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve: async(source, { id, tag }, ctx) => await addTag(ctx, id, tag)
      },
      removeTag: {
        type: GraphQLAspanEntry,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLString)
          },
          tag: {
            type: new GraphQLNonNull(GraphQLString)
          }
        },
        resolve: async(source, { id, tag }, ctx) => await removeTag(ctx, id, tag)
      },
      setInfo: {
        type: GraphQLAspanEntry,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLString)
          },
          info: {
            type: Info,
            description: '{tags, title, description, favorite}'
          }
        },
        resolve: async(source, { id, info }, ctx) => await setInfo(ctx, id, info)
      }
    })
  })
})
