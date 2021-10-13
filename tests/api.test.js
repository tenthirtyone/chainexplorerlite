process.env.NODE_ENV = "test";
const expect = require("expect");
const API = require("../lib/api");
const { logRequest } = require("../lib/api/middleware");

describe("API", () => {
  let api;
  const testPort = 9001;

  beforeEach(() => {
    api = new API({ port: testPort });
    api.start();
  });

  afterEach(() => {
    api.stop();
  });

  it(`is running on port ${testPort}`, () => {
    const { port } = api.server.address();

    expect(port).toBe(testPort);
  });
  it("logs the request method and path", () => {
    const req = {
      method: "GET",
      originalUrl: "/path",
    };
    let testPassed = false;
    logRequest(req, null, () => {
      testPassed = true;
    });

    expect(testPassed).toBe(true);
  });
});
