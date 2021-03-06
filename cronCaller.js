#! /usr/local/bin node

const util = require("util");
const exec = util.promisify(require("child_process").exec);

async function cronCaller() {
  var bookingTime;
  var mail;
  var pwd;
  process.argv.forEach((val, index) => {
    if (val.includes("hr=")) {
      bookingTime = val.substr("hr=".length + 2);
    } else if (val.includes("mail=")) {
      mail = val.substr("mail=".length + 2);
    } else if (val.includes("pwd=")) {
      pwd = val.substr("pwd=".length + 2);
    }
  });

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  var day = tomorrow.getDate();
  var month = tomorrow.getMonth() + 1;

  var cmd = `01 00 ${day} ${month} * cd /Users/naser/Desktop/Projects/TennisBooker && /usr/local/bin/node TennisBookerCLI --hr=${bookingTime} --mail=${mail} --pwd=${pwd}`;

  console.log(cmd);

  const { stdout, stderr } = await exec(
    `(crontab -l 2>/dev/null; echo "${cmd}") | crontab -`
  );
  console.log("stdout:", stdout);
  console.log("stderr:", stderr);
}

cronCaller();
