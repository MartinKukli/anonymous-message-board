"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const messageSchema = new Schema({
  board_name: String,
  text: String,
  created_on: String,
  bumped_on: String,
  reported: Boolean,
  delete_password: String,
  replies: [String]
});
const Message = mongoose.model("Message", messageSchema);

module.exports = (app) => {
  mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true
  });

  app.route("/api/threads/:board")
    .post(async (req, res) => {
      try {
        const board = req.params.board;
        const input = req.body;

        const newMessage = new Message({
          board_name: board,
          text: input.text,
          created_on: new Date().toISOString(),
          bumped_on: new Date().toISOString(),
          reported: false,
          delete_password: input.delete_password,
          replies: []
        });

        await newMessage.save();

        res.json(newMessage);
      } catch (e) {
        console.error(e.message);
        res.status(400).send("something went wrong...");
      }
    })
    .get(async (req, res) => {})

    .put(async (req, res) => {})

    .delete(async (req, res) => {
      try {
        const board = req.params.board;
        const input = req.body;
        
        let test = await Message.deleteOne({ _id: input._id, board_name: board, delete_password: input.password });
        if (test === null) throw new Error("input invalid");
        
        res.send("success")
      } catch (e) {
        console.error(e.message);
        res.status(400).send("something went wrong...");
      }
    });

  app.route("/api/replies/:board")
    .post(async (req, res) => {})
    .get(async (req, res) => {})
    .put(async (req, res) => {})
    .delete(async (req, res) => {});
};