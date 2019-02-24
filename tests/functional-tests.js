const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const MongoClient = require("mongodb").MongoClient;

chai.use(chaiHttp);

suite("Functional Tests", () => {
  const dbName = "fcc-apis-mcs";
  const collectionName = "messages";
  const url = process.env.MONGO_URL;
  const client = new MongoClient(url, {
    useNewUrlParser: true
  });

  const testDocument1 = {
    board_name: test,
    text: "test text",
    created_on: new Date().toISOString(),
    bumped_on: new Date().toISOString(),
    reported: false,
    delete_password: "delete",
    replies: []
  }

  const listOfTestDocuments = [testDocument1];
  let testDocumentsIds;
  let deleteTestDocumentsIds = {};

  before(async () => {
    try {
      await client.connect();
      const insertResult = await client.db(dbName).collection(collectionName).insertMany(listOfTestDocuments)
      testDocumentsIds = Object.values(await insertResult.insertedIds);
    } catch (e) {
      console.error(e.message);
    }
  });

  after(async () => {
    try {
      for (const value of testDocumentsIds) {
        await client.db(dbName).collection(collectionName).deleteOne({
          _id: value
        });
      }
    } catch (e) {
      console.error(e.message);
    }
  });

  suite("API ROUTING FOR /api/threads/:board", () => {
    suite("CREATE", () => {
      test("Create new thread test", (done) => {
        chai.request(server)
          .post("/api/threads/test")
          .send({
            text: "create new thread test",
            delete_password: "delete",
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, "application/json");
            assert.property(res.body, "_id");
            assert.property(res.body, "text");
            assert.property(res.body, "created_on");
            assert.property(res.body, "bumped_on");
            assert.property(res.body, "reported");
            assert.property(res.body, "delete_password");
            assert.property(res.body, "replies");
            assert.propertyVal(res.body, "text", "create new thread test");
            assert.propertyVal(res.body, "delete_password", "delete");

            deleteTestDocumentsIds["docOne"] = res.body._id;

            done();
          });
      });
    });

    //     suite("READ", () => {});

    //     suite("UPDATE", () => {});

    suite("DELETE", () => {
      test("Delete thread test - incorrect password", (done) => {
        chai.request(server)
          .delete("/api/threads/test")
          .send({
            _id: deleteTestDocumentsIds.docOne,
            password: "DELETE"
          })
          .end(async (err, res) => {
            assert.equal(res.status, 400);
            assert.equal(res.type, "text/html");
            assert.equal(res.text, "wrong password");

            done();
          })
      });

      test("Delete thread test", (done) => {
        chai.request(server)
          .delete("/api/threads/test")
          .send({
            _id: deleteTestDocumentsIds.docOne,
            password: "delete"
          })
          .end(async (err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.type, "text/html");
            assert.equal(res.text, "success");

            const checkForBoard = await client.db(dbName).collection(collectionName).findOne({
              board_name: "test"
            });
            assert.equal(checkForBoard, null);

            done();
          })
      });
    });

    //   suite("API ROUTING FOR /api/replies/:board", () => {
    //     suite("CREATE", () => {});

    //     suite("READ", () => {});

    //     suite("UPDATE", () => {});

    //     suite("DELETE", () => {});
  });
});