'use strict';

if (process.env.NODE_ENV === "production") {
  module.exports = require("./shared.cjs.prod.js");
} else {
  module.exports = require("./shared.cjs.dev.js");
}
