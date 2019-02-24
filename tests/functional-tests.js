const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", () => {
  suite("API ROUTING FOR /api/threads/:board", () => {
    suite("POST", () => {});
    
    suite("GET", () => {});
    
    suite("DELETE", () => {});
    
    suite("PUT", () => {});
  });
  
  suite("API ROUTING FOR /api/replies/:board", () => {
    suite("POST", () => {});
    
    suite("GET", () => {});
    
    suite("PUT", () => {});
    
    suite("DELETE", () => {});
  });
});
