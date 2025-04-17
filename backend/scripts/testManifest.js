const handler = require('../../frontend/api/[[...config]].js').default;

const req = {
  query: {
    config: [
      Buffer.from(JSON.stringify({
        catalogs: [
          { id: 123, name: "Test", type: "movie", enabled: true, showInHome: true, icon: "/favicon.png" }
        ],
        apiKey: "fake",
        rpdbKey: ""
      })).toString("base64")
    ]
  }
};

const res = {
  status(code) {
    this.statusCode = code;
    return this;
  },
  setHeader(name, value) {
    console.log(`Header: ${name}: ${value}`);
  },
  json(data) {
    console.log("Response JSON:", JSON.stringify(data, null, 2));
  }
};

handler(req, res);
