"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  board_name: String,
  text: String,
  created_on: Date,
  bumped_on: Date,
  reported: Boolean,
  delete_password: String,
  replies: [Object]
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

    .get(async (req, res) => {
      try {
        const board = req.params.board;
        const repliesLimit = -3;
        const queryResultLimit = 10;
        const queryResultParams = "_id board_name text created_on bumped_on replies";

        let queryResult = await Message.find({
          board_name: board,
        }, queryResultParams).limit(queryResultLimit);

        res.send(queryResult);
      } catch (e) {
        console.error(e.message);
        res.state(400).send("something went wrong...");
      }
    })

    .put(async (req, res) => {
      try {
        const board = req.params.board;
        const id = req.body.id;

        let queryResult = await Message.updateOne({
          _id: id,
          board_name: board
        }, {
          reported: true
        });

        res.send("success")
      } catch (e) {
        console.error(e.message);
        res.status(400).send("something went wrong...");
      }
    })

    .delete(async (req, res) => {
      try {
        const board = req.params.board;
        const input = req.body;

        let getBoard = await Message.findOne({
          _id: input._id,
          board_name: board
        });
        if (getBoard.delete_password !== input.password) {
          res.status(400).send("wrong password");
        } else {
          await Message.deleteOne({
            _id: input._id,
            board_name: board,
            delete_password: input.password
          });
          res.send("success");
        }
      } catch (e) {
        console.error(e.message);
        res.status(400).send("something went wrong...");
      }
    });

  app.route("/api/replies/:board")
    .post(async (req, res) => {
      try {
        const board = req.params.board;
        const input = req.body;

        await Message.updateOne({
          _id: input.id
        }, {
          bumped_on: new Date().toISOString(),
          $push: {
            replies: {
              text: input.text,
              created_on: new Date().toISOString(),
              delete_password: input.password,
              reported: false
            }
          }
        });

        res.send("success");
      } catch (e) {
        console.error(e.message);
        res.status(400).send("something went wrong...");
      }
    })

    .get(async (req, res) => {
      try {
        const id = req.query.thread_id;
        const queryResult = await Message.findById(id, "replies");
        res.json(queryResult.replies);
      } catch (e) {
        console.error(e.message);
        res.status(400).send("something went wrong...");
      }
    })

    .put(async (req, res) => {
      try {
        const id = req.body.thread_id;
        const text = req.body.text;

        await Message.findByIdAndUpdate(id, {
          "replies.0": {
            text: text
          }
        });

        res.send("success");
      } catch (e) {
        console.error(e.message);
        res.status(400).send("something went wrong...");
      }
    })

    .delete(async (req, res) => {
      try {
        const id = req.body.thread_id;
        const input = req.body;

        let queryById = await Message.findById(id, "delete_password replies");

        if (queryById.delete_password !== input.password) {
          res.status(400).send("wrong password");
        } else {
          await Message.findByIdAndRemove(id);
          res.send("success");
        }
      } catch (e) {
        console.error(e.message);
        res.status(400).send("something went wrong...");
      }
    });
};