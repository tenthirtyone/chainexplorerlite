const expect = require("expect");
const API = require("../lib/api");

describe("API", () => {
  let api;
  const testPort = 9001;
  process.env.NODE_ENV = "test";

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
});
