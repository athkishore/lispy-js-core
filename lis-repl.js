const {parse, evaluate, lispstr} = require('./lis');

repl = function(prompt = "lispy.js> ") {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  readline.question(prompt, function(exp) {
    val = evaluate(parse(exp));
    if (val) {
      console.log(lispstr(val));
    }
    readline.close();
    repl();
  });
};

repl();
