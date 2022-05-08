"use strict";

require("marko/node-require");
const createGzip = require("zlib").createGzip;

const Koa = require("koa");
const mount = require("koa-mount");

const app = new Koa();
const port = 8080;
const template = require("./index.marko");
const serve = require("koa-static");

var isProduction = process.env.NODE_ENV === "production";

require("lasso").configure({
  plugins: [
    "lasso-marko", // Allow Marko templates to be compiled and transported to the browser
  ],
  outputDir: __dirname + "/static", // Place all generated JS/CSS/etc. files into the "static" dir
  bundlingEnabled: isProduction, // Only enable bundling in production
  minify: isProduction, // Only minify JS and CSS code in production
  fingerprintsEnabled: isProduction, // Only add fingerprints to URLs in production
});

app.use(mount("/static", serve(__dirname + "/static")));

app.use((ctx, next) => {
  ctx.type = "html";
  ctx.body = template.stream({
    name: "Frank",
    count: 30,
    template: "mod-fasz",
    sections: [
      {
        template: "mod-menu",
        data: {
          somedata: 1,
        },
      },
    ],
    colors: ["red", "green", "blue"],
  });

  ctx.vary("Accept-Encoding");
  if (ctx.acceptsEncodings("gzip")) {
    ctx.set("Content-Encoding", "gzip");
    ctx.body = ctx.body.pipe(createGzip());
  }
});

app.listen(port, function () {
  console.log("Server started! Try it out:\nhttp://localhost:" + port + "/");

  if (process.send) {
    process.send("online");
  }
});
