import { db } from '@/db/db'
import { InsertIssues, SelectIssues, issues, users } from '@/db/schema'
import { GQLContext } from '@/types'
import { getUserFromToken, signin, signup } from '@/utils/auth'
import { and, asc, desc, eq, or, sql } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

const resolvers = {
    IssueStatus: {
        BACKLOG: 'backlog',
        TODO: 'todo',
        INPROGRESS: 'inprogress',
        DONE: 'done',
    },

    Query: {
        me: async (_, __, ctx: GQLContext) => {
            return ctx.user
        },
    },
    Mutation: {
        createIssue: async (_, { input }, ctx: GQLContext) => {
            if (!ctx.user)
                throw new GraphQLError('UNAUTHORIZED', { extensions: { code: 401 } })

            const issue = await db
                .insert(issues)
                .values({ ...input, userId: ctx.user.id })
                .returning()

            return issue[0]
        },

        signin: async (_, { input }, ctx) => {
            const data = await signin(input)

            if (!data || !data.user || !data.token) {
                throw new GraphQLError('UNAUTHORIZED', {
                    extensions: { code: 401 },
                })
            }

            return { ...data.user, token: data.token }
        },
        createUser: async (_, { input }, ctx) => {
            const data = await signup(input)

            if (!data || !data.user || !data.token) {
                throw new GraphQLError('UNAUTHORIZED', {
                    extensions: { code: 401 },
                })
            }

            return { ...data.user, token: data.token }
        },
    },

    Issue: {
        user: (issue, __, ctx) => {
            if (!ctx.user)
                throw new GraphQLError('UNAUTHORIZED', { extensions: { code: 401 } })

            return db.query.users.findFirst({
                where: eq(users.id, issue.userId),
            })
        },
    },
}

export default resolvers