// let hello="hello";
// returnHello = ()=>{
//     console.log("HELLO");
// }
// returnHello();
const readline = require("readline");
const args = require("minimist")(process.argv.slice(2));

console.log(args);

const lineDetail = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

lineDetail.question(`Please provide your name - `, (name) => {
  console.log(`Hi ${name}!`);
  lineDetail.close();
});
