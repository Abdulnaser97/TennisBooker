const TennisBooker = require("./TennisBooker");

let properties = [
  { ask: "Enter hour [HH:MM]: ", name: "hr", value: "" },
  { ask: "Enter email: ", name: "mail", value: "" },
  { ask: "Enter password: ", name: "pwd", value: "" },
];

// print process.argv
process.argv.forEach((val, index) => {
  //console.log(`${index}: ${val}`);
  if (val.includes("hr=")) {
    properties[0].value = val.substr("hr=".length + 2);
  } else if (val.includes("mail=")) {
    properties[1].value = val.substr("mail=".length + 2);
  } else if (val.includes("pwd=")) {
    properties[2].value = val.substr("pwd=".length + 2);
  }
});

try {
  TennisBooker(properties[0].value, properties[1].value, properties[2].value);
  console.log("hour >> ", properties[0].value);
  // console.log("email >> ", properties[1].value);
  // console.log("pwd >> ", properties[2].value);
} catch (e) {
  return onErr("Error in TennisBooker: ", e);
}

function onErr(err) {
  console.log(err);
  return 1;
}
