import { ApolloServer } from 'apollo-server'
import { typeDefs } from './schema'
import { resolvers } from './resolvers'
import BasicFileSystemRepository from './BasicFileSystemRepository'
import { options } from './util'

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { repository: new BasicFileSystemRepository(options) }
})

server
  .listen()
  .then(({ url }) => {
    console.log(`Server ready at ${url}`)
  })
  .catch(reason => {
    console.log(reason)
  })
