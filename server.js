//creating a server
const http = require("http");
const url = require("url");
const fs = require("fs");
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const tempOverview = fs.readFileSync(
  `${__dirname}/template/overview.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/template/product.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(`${__dirname}/template/card.html`, "utf-8");
const dataObj = JSON.parse(data);

const replaceTemplate = (temp, product) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.name);
  output = output.replace(/{%PRODUCTIMAGE%}/g);
  output = output.replace(/{%ID%}/g);
};

const server = http.createServer((req, res) => {
  //   req.url is used to perform the routes for the application
  const pathName = req.url;
  //OVERVIEW
  if (pathName === "/" || pathName === "/overview") {
    res.writeHead("404", {
      "Content-Type": "application/html",
    });

    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    const output = tempOverview.replace();
    res.end(tempOverview);
    //PRODUCT
  } else if (pathName === "/product") {
    res.end("hello from the pRODUCTS");
    //API
  } else if (pathName === "/api") {
    res.writeHead("404", {
      "Content-Type": "application/json",
    });

    res.end(data);
    //NOTFOUND
  } else {
    res.writeHead(404, {
      "Content-Type": "text/html",
    });

    res.end("This page doesnt exist");
  }

  //alternative
  //   switch (pathName) {
  //     case "/" || "/overview":
  //       res.end("hello from the server");
  //     case "/product":
  //       res.end("hello from the pRODUCTS");
  //     default:
  //       res.end("This page doesnt exist");
  //   }
});

server.listen(8000, "127.0.0.1", () => console.log("listening on port 8000"));
