import { GraphQLServer } from 'graphql-yoga'
import { v4 as uuidv4 } from 'uuid'
// Scalar types - String, Boolean, Int, Float, ID

// Demo user data
const users = [{
    id: '1',
    name: 'Tae',
    email: 'tae@example.com',
    age: 36
}, {
    id: '2',
    name: 'Joe',
    email: 'joe@example.com'
}, {
    id: '3',
    name: 'Tamaki',
    email: 'tamaki@example.com',
    age: 4
}] 

// Demo post data
const posts = [{
    id: '1',
    title: 'Habits to work on',
    body: 'Jog for 20 mins',
    published: true,
    author: '1'
}, {
    id: '2',
    title: 'Dinner for weekend',
    body: 'Chicken noodle soup',
    published: false, 
    author: '2'
}, {
    id: '3',
    title: 'Plan for the weekend',
    body: 'Go out for a park',
    published: true,
    author: '3'
}]

// Demo comments data
const comments = [{
    id: '1',
    text: 'GraphQL is cool!',
    author: '1',
    post: '1'
},{
    id: '2',
    text: 'I like Python!',
    author: '1',
    post: '2'
},{
    id: '3',
    text: 'Peggy piggy',
    author: '2',
    post: '2'
},{
    id: '4',
    text: 'Hoo hoo hoo!',
    author: '3',
    post: '3'
}]

// Type definitions (schema)
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        comments: [Comment!]!
        me: User!
        post: Post!
    }

    type Mutation {
        createUser(data: CreateUserInput): User!
        createPost(data: CreatePostInput): Post!
        createComment(data: CreateCommentInput): Comment!
    }

    input CreateUserInput {
        name: String!
        email: String!
        age: Int
    }

    input CreatePostInput {
        title: String!
        body: String! 
        published: Boolean!
        author: ID!
    }

    input CreateCommentInput {
        text: String!
        author: ID!
        post: ID!
    }
    
    type User {
        id: ID!
        name: String!
        email: String!
        age: Int	
        posts: [Post!]!
        comments: [Comment!]!
    }
    
    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }

    type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post!
    }
`

// Resolvers
const resolvers = {
    Query: {
        users (parent, args, ctx, info) {
            if (!args.query) {
                return users
            }
            return users.filter((user) => user.name.toLowerCase().includes(args.query.toLowerCase()))
        }, 
        posts (parent, args, ctx, info) {
            if (!args.query) {
                return posts
            }
            return posts.filter((post) => {
                const isTitleMatch = post.title.toLowerCase().includes(args.query.toLowerCase())
                const isBodyMatch = post.body.toLowerCase().includes(args.query.toLowerCase())
                return isTitleMatch || isBodyMatch
            }) 
        }, 
        comments (parent, args, ctx, info) {
            return comments
        },
        me () {
            return {
                id: '123',
                name: 'Joe', 
                email: 'joe@example.com',
                age: 2
            }
        },
        post () {
            return {
                id: '1234sdasfds', 
                title: 'Cool node course!', 
                body: 'This course is so insightful', 
                published: false
            }
        }
    },
    Mutation: {
        createUser(parent, args, ctx, info) {
            const emailTaken = users.some((user) => user.email === args.data.email)

            if (emailTaken) {
                throw new Error('Email taken.')
            }

            const user = {
                id: uuidv4(),
                ...args.data
            }

            users.push(user)

            return user
        },
        createPost(parent, args, ctx, info) {
            const userExists = users.some((user) => user.id === args.data.author)

            if (!userExists) {
                throw new Error('User not exist')
            }

            const post = {
                id: uuidv4(),
                ...args.data
            }

            posts.push(post)

            return post
        },
        createComment(parent, args, ctx, info) {
            const userExists = users.some((user) => user.id === args.data.author)
            const postExists = posts.some((post) => post.id === args.data.post && post.published)
            
            if (!userExists || !postExists) {
                throw new Error('User or post does not exist')
            }
            
            const comment = {
                id: uuidv4(),
                ...args.data
            }

            comments.push(comment)

            return comment
        }
    },
    Post: {
        author (parent, args, ctx, info) {
            return users.find((user) => parent.author === user.id)
        },
        comments (parent, args, ctx, info) {
            return comments.filter((comment) => parent.id === comment.post)
        }
    },
    Comment: {
        author (parent, args, ctx, info) {
            return users.find((user) => parent.author === user.id)
        },
        post (parent, args, ctx, info) {
            return posts.find((post) => parent.post === post.id)
        }
    },
    User: {
        posts (parent, args, ctx, info) {
            return posts.filter((post) => parent.id === post.author)
        },
        comments (parent, args, ctx, info) {
            return comments.filter((comment) => parent.id === comment.author)
        }
    }
}

const server = new GraphQLServer({
    typeDefs,
    resolvers
})

server.start(()=>{
    console.log('The server is up')
})