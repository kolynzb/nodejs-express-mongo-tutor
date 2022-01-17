const fs = require("fs");
const http = require("http");

// reading test files
const textIn = fs.readFileSync("./text/input.txt", "utf8");
console.log(textIn);

//writing into a file
const textOut = `this is what we know about the overcado : ${textIn} .\nCreated at ${Date.now()}`;
fs.writeFileSync("./text/output.txt", textOut);
console.log("file has been created");
