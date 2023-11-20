const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (user) {
        return await User.findOne({ _id: user._id });
      }
      throw new Error("User not found");
    },
  },
  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error("User not found");
      }

      const isCorrectPassword = await user.isCorrectPassword(password);

      if (!isCorrectPassword) {
        throw new Error("Incorrect credentials");
      }

      const token = signToken(user);
      return { token, user };
    },
    addUser: async (_, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (_, { input }, { user }) => {
      if (user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: user._id },
          {
            $push: {
              savedBooks: input,
            },
          },
          { new: true }
        );
        return updatedUser;
      }
      throw new Error("User not found");
    },
    removeBook: async (_, { bookId }, { user }) => {
      if (user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: user._id },
          {
            $pull: {
              savedBooks: { bookId },
            },
          },
          { new: true }
        );
        return updatedUser;
      }
      throw new Error("User not found");
    },
  },
};

module.exports = resolvers;
