import User from "../models/user.model.js";

import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";

import {
  getReceiverSocketId,
  io,
} from "../lib/socket.js";

// GET USERS
export const getUsersForSidebar =
  async (req, res) => {
    try {
      const loggedInUserId =
        req.user._id;

      const filteredUsers =
        await User.find({
          _id: {
            $ne: loggedInUserId,
          },
        }).select("-password");

      res
        .status(200)
        .json(filteredUsers);
    } catch (error) {
      console.error(
        "Error in getUsersForSidebar: ",
        error.message
      );

      res.status(500).json({
        error:
          "Internal server error",
      });
    }
  };

// GET MESSAGES
export const getMessages = async (
  req,
  res
) => {
  try {
    const {
      id: userToChatId,
    } = req.params;

    const myId = req.user._id;

    const messages =
      await Message.find({
        $and: [
          {
            $or: [
              {
                senderId: myId,
                receiverId:
                  userToChatId,
              },

              {
                senderId:
                  userToChatId,
                receiverId: myId,
              },
            ],
          },

          // HIDE DELETED MESSAGES
          {
            deletedFor: {
              $ne: myId,
            },
          },
        ],
      });

    res.status(200).json(messages);
  } catch (error) {
    console.log(
      "Error in getMessages controller: ",
      error.message
    );

    res.status(500).json({
      error:
        "Internal server error",
    });
  }
};

// SEND MESSAGE
export const sendMessage = async (
  req,
  res
) => {
  try {
    const { text, image } =
      req.body;

    const {
      id: receiverId,
    } = req.params;

    const senderId =
      req.user._id;

    let imageUrl;

    // IMAGE UPLOAD
    if (image) {
      const uploadResponse =
        await cloudinary.uploader.upload(
          image
        );

      imageUrl =
        uploadResponse.secure_url;
    }

    const newMessage =
      new Message({
        senderId,
        receiverId,
        text,
        image: imageUrl,
      });

    await newMessage.save();

    const receiverSocketId =
      getReceiverSocketId(
        receiverId
      );

    if (receiverSocketId) {
      io.to(
        receiverSocketId
      ).emit(
        "newMessage",
        newMessage
      );
    }

    res
      .status(201)
      .json(newMessage);
  } catch (error) {
    console.log(
      "Error in sendMessage controller: ",
      error.message
    );

    res.status(500).json({
      error:
        "Internal server error",
    });
  }
};

// CLEAR CHAT (DELETE FOR ME)
export const clearChat = async (
  req,
  res
) => {
  try {
    const {
      id: userToChatId,
    } = req.params;

    const myId = req.user._id;

    // MARK CHAT AS DELETED
    await Message.updateMany(
      {
        $or: [
          {
            senderId: myId,
            receiverId:
              userToChatId,
          },

          {
            senderId:
              userToChatId,
            receiverId: myId,
          },
        ],
      },

      {
        $addToSet: {
          deletedFor: myId,
        },
      }
    );

    res.status(200).json({
      message:
        "Chat cleared successfully",
    });
  } catch (error) {
    console.log(
      "Error in clearChat controller:",
      error.message
    );

    res.status(500).json({
      error:
        "Internal server error",
    });
  }
};