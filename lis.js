// const readline = require('readline').createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

Sym = String;
Num = Number;
List = Array;

Procedure = function(params, body, env) {
  return function(...args) {
    params.forEach((param, index) => {
      env[param] = args[index];
    });
    return evaluate(body, env);
  };
}

// Global environment
standard_env = function() {
  // An environment with some standard Scheme procedures.
  env = {};
  Object.getOwnPropertyNames(Math).forEach((key) => {
    env[key] = 'Math.' + key;
  });

  // Does not support more than two arguments, unlike Scheme
  // Same shortcoming is there in lis.py
  env = {...env,
    '+' : (a, b) => a + b,
    '-' : (a, b) => a - b,
    '*' : (a, b) => a * b,
    '/' : (a, b) => a / b, // !!Check what kind of division
    '=' : (a, b) => a === b,
    '<' : (a, b) => a < b,
    '<=' : (a, b) => a <= b,
    '>' : (a, b) => a > b,
    '>=' : (a, b) => a >= b,
    'abs' : x => Math.abs(x),
    //'append' : ,
    'begin': (...x) => x[x.length-1],
    'car' : x => x[0],
    'cdr' : x => x.slice(1),
    'cons' : (x, y) => [x].concat(y),
    //'eq?' :,
    'equal?' : (x, y) => x === y,
    'length' : x => x.length,
    'list' : (...x) => x,
    'list?' : x => x instanceof Array, // !!false not getting returned
    //'map' :,
    'max' : (x, y) => Math.max(x, y),
    'min' : (x, y) => Math.min(x, y),
    'not' : (x) => !x, // !!not working as expected
    'null' : x => x == [], // !!not tested


  };

  return env;
}

global_env = standard_env();

/////////////////////////////////////////////////////////////
// Parsing: parse, tokenize, read_from_tokens
////////////////////////////////////////////////////////////

parse = function(program) {
  // Read a scheme expression from a string.
  return read_from_tokens(tokenize(program));
};

tokenize = function(s) {
  // Convert a string into a list of tokens.
  return s.replaceAll('(', ' ( ')
            .replaceAll(')', ' ) ')
            .split(' ')
            .filter(e => e.trim().length > 0)
};

read_from_tokens = function(tokens) {
  // Read an expression from a sequence of tokens.
  if (tokens.length == 0) {
    throw new SyntaxError('unexpected EOF while reading', 'lis.js', 12);
  }
  token = tokens.shift();
  if ('(' == token) {
    var L = []
    while (tokens[0] != ')') {
      L.push(read_from_tokens(tokens));
    }
    tokens.shift();
    return L;
  } else if (')' == token) {
    throw new SyntaxError('unexpected )', 'lis.js', 23);
  } else {
    return atom(token);
  }
}

atom = function(token) {
  // Numbers become numbers, every other token is a symbol.
  // !!!Need to check some conditions still
  var parsedToken;
  // Decimal numbers and exponential notation should first
  // be tried to be parsed as float.
  if (token.includes('.') || token.includes('e'))
  {
    parsedToken = parseFloat(token);
    if (!Object.is(NaN, parsedToken)) {
      return parsedToken;
    }
  } else {
    parsedToken = parseInt(token);
    if (!Object.is(NaN, parsedToken)) {
      return parsedToken;
    }
  }
  return Sym(token); // !!Revisit - Sym vs primitive string
};
/////////////////////////////////////////////////////////
////// Formatting function for REPL /////////////////////

lispstr = function(exp) {
  if (exp instanceof List) {
    return '(' + exp.join(' ') + ')';
  } else {
    return exp.toString();
  }
};

/////////////////////////////////////////////////////////
// !!rename to eval after cleaning up module structure
evaluate = function(x, env = global_env) {
  // console.log(x);
  // Evaluate an expression in an environment.
  if (typeof x == 'string') { // Revist to see if it needs to be using instanceof Sym
    return env[x];  // variable reference
  } else if (!(x instanceof List)) {
    return x;       // constant literal
  } else if (x[0] == 'quote') {
    return x[1];    // (quote exp)
  } else if (x[0] == 'if') {
    [_, test, conseq, alt] = x;  // if test conseq alt
    exp = evaluate(test, env) ? conseq : alt;
    return evaluate(exp, env);
  } else if (x[0] == 'define') {
    [_, variable, exp] = x;          // (define variable exp)
    env[variable] = evaluate(exp, env);
    //return env; !!Need some other way to test define variable
  } else if (x[0] == 'lambda') {
    [_, params, body] = x;      // (lambda (var...) body)
    return new Procedure(params, body, env)
  } else {
    var proc = evaluate(x[0], env);      // return (proc arg...)
    //args = [for (item of x.slice(1)) evaluate(item, env)];
    // !!Try again using arrow function
    // for (let item of x.slice(1)) {
    //     arg = evaluate(item, env);
    //     args.push(arg);
    //     console.log(x, arg, args);
    // }
    var args = x.slice(1).map(item => (evaluate(item, env)));
    //console.log(x, args);
    return proc(...args);
  }

}

module.exports = {
  tokenize: tokenize,
  read_from_tokens: read_from_tokens,
  atom: atom,
  standard_env: standard_env,
  lispstr: lispstr,
  parse: parse,
  evaluate: evaluate
};
