const graphql = require('graphql');
const _ = require('lodash');
const Book = require('../models/book');
const Author = require('../models/author');

const {
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
} = graphql;

// example books array
// var books = [
//     {name: 'Book 1', genre: 'Action', id: '1', authorId: '1'},
//     {name: 'Book 2', genre: 'Sci-Fi', id: '2', authorId: '1'},
//     {name: 'Book 3', genre: 'Action', id: '3', authorId: '2'},
//     {name: 'Book 4', genre: 'Science', id: '4', authorId: '1'},
//     {name: 'Book 5', genre: 'Sci-Fi', id: '5', authorId: '3'},
//     {name: 'Book 6', genre: 'Science', id: '6', authorId: '3'},
// ];

// var authors = [
//     {name: 'Alex Serban', age: 18, id: '1'},
//     {name: 'Author 2', age: 21, id: '2'},
//     {name: 'Author 3', age: 56, id: '3'},
// ]

const BookType = new GraphQLObjectType({
    name: 'Book', 
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        genre: {type: GraphQLString},
        author: {
            type: AuthorType,
            resolve(parent, args){
                // return author of this book

                // console.log(parent);
                // return _.find(authors, {id: parent.authorId});
                return Author.findById(parent.authorId);

            }
        }
    }),
});

const AuthorType = new GraphQLObjectType({
    name: 'Author', 
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        age: {type: GraphQLInt},
        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args){
                // return author's books

                // return _.filter(books, {authorId: parent.id});
                return Book.find({
                    authorId: parent.id,
                });
            }
        }
    }),
}); 

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        book: {
            type: BookType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args){
                // code to get data from db / other source
                // console.log(typeof(args.id));

                // return _.find(books, {id: args.id});
                return Book.findById(args.id);
            }
        }, 
        author: {
            type: AuthorType,
            args: {
                id: {type: GraphQLID}
            },
            resolve(parent, args){
                // code to get data from db / other source such as the array above :) 
                
                // return _.find(authors, {id: args.id});
                return Author.findById(args.id);
            }
        },
        books: {
            type: new GraphQLList(BookType), 
            resolve(parent, args){
                // returns all books

                // return books;
                return Book.find({});
            }
        }, 
        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent, args){
                // returns all authors

                // return authors;
                return Author.find({});
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        addAuthor: {
            type: AuthorType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                age: {type:  new GraphQLNonNull(GraphQLInt)},
            },
            resolve(parent, args){
                let author = new Author({
                    name: args.name,
                    age: args.age,
                });

                return author.save();
            }
        },
        addBook: {
            type: BookType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                genre: {type: new GraphQLNonNull(GraphQLString)},
                authorId: {type: new GraphQLNonNull(GraphQLID)},
            },
            resolve(parent, args){
                let book = new Book({
                    name: args.name,
                    genre: args.genre,
                    // authorId: Math.random().toString(36).substring(7),
                    authorId: args.authorId,
                });

                return book.save();
            }
        }
    }),
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});