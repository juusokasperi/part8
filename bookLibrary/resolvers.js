const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();
const DataLoader = require("dataloader");

const User = require("./models/user");
const Author = require("./models/author");
const Book = require("./models/book");

const bookCountLoader = new DataLoader(async (authorIds) => {
  const counts = await Book.aggregate([
    {
      $match: {
        author: { $in: authorIds },
      },
    },
    {
      $group: {
        _id: "$author",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = {};
  counts.forEach((item) => {
    countMap[item._id.toString()] = item.count;
  });

  return authorIds.map((authorId) => countMap[authorId.toString()] || 0);
});

const resolvers = {
  Mutation: {
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });
      return user.save().catch((error) => {
        throw new GraphQLError("Creating user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQLError("Wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = { username: user.username, id: user._id };
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      let author = await Author.findOne({ name: args.author });
      if (!author) {
        author = new Author({ name: args.author });
        await author.save();
      }

      const book = new Book({ ...args, author: author._id });
      try {
        await book.save();
      } catch (error) {
        throw new GraphQLError("Adding book failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            error,
          },
        });
      }

      const bookWithAuthor = await book.populate("author");

      pubsub.publish("BOOK_ADDED", { bookAdded: bookWithAuthor });

      console.log(book);
      bookCountLoader.clear(book.author.toString());
      return bookWithAuthor;
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const author = await Author.findOneAndUpdate(
        { name: args.name },
        { born: args.setBornTo },
        { new: true }
      );
      return author;
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
    },
  },
  Query: {
    bookCount: async () => Book.countDocuments(),
    authorCount: async () => Author.countDocuments(),
    allBooks: async (root, args) => {
      let query = {};
      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        if (!author) return [];
        query.author = author._id;
      }
      if (args.genre) {
        query.genres = args.genre;
      }
      return Book.find(query).populate("author");
    },
    allAuthors: async () => {
      return Author.find({});
    },
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Author: {
    bookCount: async (author) => {
      return bookCountLoader.load(author._id);
    },
  },
};

module.exports = resolvers;
