require('dotenv').config()
const { ApolloServer } = require('apollo-server')
const { importSchema } = require('graphql-import')
const { Prisma } = require('prisma-binding')
const path = require('path')

const resolvers = {
  Query: {
    posts: (_, args, context, info) => {
      return context.prisma.query.posts(
        {
          where: {
            OR: [
              { title_contains: args.searchString },
              { content_contains: args.searchString }
            ]
          }
        },
        info
      )
    },
    user: (_, args, context, info) => {
      return context.prisma.query.user(
        {
          where: {
            id: args.id
          }
        },
        info
      )
    }
  },
  Mutation: {
    createDraft: (_, args, context, info) => {
      return context.prisma.mutation.createPost(
        {
          data: {
            title: args.title,
            content: args.content,
            slug: args.slug,
            author: {
              connect: {
                id: args.authorId
              }
            }
          }
        },
        info
      )
    },
    publish: (_, args, context, info) => {
      return context.prisma.mutation.updatePost(
        {
          where: {
            id: args.id
          },
          data: {
            published: true
          }
        },
        info
      )
    },
    deletePost: (_, args, context, info) => {
      return context.prisma.mutation.deletePost(
        {
          where: {
            id: args.id
          }
        },
        info
      )
    },
    signup: (_, args, context, info) => {
      return context.prisma.mutation.createUser(
        {
          data: {
            name: args.name
          }
        },
        info
      )
    }
  }
}

const typeDefs = importSchema(path.resolve('src/schema.graphql'))

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: req => ({
    ...req,
    prisma: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: process.env.PRISMA_URL
    })
  })
})

server.listen({ port: process.env.PORT }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
