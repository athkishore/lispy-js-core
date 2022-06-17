const {
  tokenize,
  read_from_tokens,
  atom,
  Sym,
  standard_env
} = require('./lis');

describe('tokenizes', () => {
  test('tokenized array should correspond to input string', () => {
    var inputString = '(+ (+ 1 2) (+ 3 4))';
    var output = ['(', '+', '(', '+', '1', '2', ')', '(', '+', '3', '4', ')', ')'];
    //console.log(tokenize(inputString));
    expect(tokenize(inputString)).toEqual(output);
  });
});

describe('atomizes', () => {
  test('atomized tokens should match correct value', () => {
    var inputs = ['4', '4.5', '4e5', 'test', '*ijk'];
    var atomized = [4, 4.5, 400000, 'test', '*ijk'];
    inputs.forEach((value, ind) => {
      expect(atom(value)).toBe(atomized[ind]);
    });
  });
});

describe('reads from tokens', () => {
  test('read token array should correspond to input string', () => {
    var inputString = '(+ (+ 1 2.3) (+ x 4e6))';
    var output = ['+', ['+', 1, 2.3], ['+', 'x', 4000000.0]];

    // need to check error handling also
    expect(read_from_tokens(tokenize(inputString))).toEqual(output);
  });
});

describe('parses program', () => {
  test('parsed token array should correspond to input string', () => {
    var inputString = '(+ (+ 1 2.3) (+ x 4e6))';
    var output = ['+', ['+', 1, 2.3], ['+', 'x', 4000000.0]];

    // need to check error handling also
    expect(parse(inputString)).toEqual(output);
  });
});

describe('generates environment', () => {
  test('sets variables to environment and reads back', () => {
    var add_args = [1, 2];
    var add_output = 3;
    var sub_args = [5, 2];
    var sub_output = 3

    env = standard_env();
    expect(env['+'](...add_args)).toBe(add_output);
    expect(env['-'](...sub_args)).toBe(sub_output);
  });
});

describe("Testing eval", () => {
  test("should evaluate variable reference", () => {
    variableName = 'myVar';
    inputValue = 25;
    env = standard_env();
    env[variableName] = inputValue;
    exp = 'myVar';
    outputValue = 25;
    expect(evaluate(read_from_tokens(tokenize(exp)), env)).toBe(outputValue);
  });

  test("should evaluate constant literal", () => {
    exps = ['25', '25.4', '4e3'];
    outputValues = [25, 25.4, 4000];
    env = standard_env();
    exps.forEach((exp, ind) => {
      expect(evaluate(read_from_tokens(tokenize(exp, env)))).toBe(outputValues[ind]);
    });
  });
  test("should evaluate (quote exp)", () => {
    exps = ['(quote 25)', '(quote exp)', '(quote ?*$)'];
    outputValues = [25, 'exp', '?*$'];
    env = standard_env();
    exps.forEach((exp, ind) => {
      expect(evaluate(read_from_tokens(tokenize(exp, env)))).toBe(outputValues[ind]);
    });
  });
  test("should evaluate (if test conseq alt)", () => {
    exp = '(if (> 3 2) 1 2)';
    outputValue = 1;
    env = standard_env();
    expect(evaluate(read_from_tokens(tokenize(exp, env)))).toBe(outputValue);
  });
  test("should evaluate (proc arg...)", () => {
    exp = '(+ 4 5)';
    outputValue = 9;
    env = standard_env();
    expect(evaluate(read_from_tokens(tokenize(exp, env)))).toBe(outputValue);
  });
  test("should evaluate (lambda var... body)", () => {
    exp1 = '(define f (lambda (x) (* x 5)))';
    exp2 = '(f 5)'
    outputValue = 25;
    env = standard_env();
    evaluate(read_from_tokens(tokenize(exp1, env)));
    expect(evaluate(read_from_tokens(tokenize(exp2, env)))).toBe(outputValue);
  });

  // !!Need some other way to test define variable
  // test("should evaluate (define variable exp)", () => {
  //   exp = '(define v 25)';
  //   outputValue = 25;
  //   env = standard_env();
  //   output_env = standard_env();
  //   output_env['v'] = outputValue;
  //   expect(evaluate(read_from_tokens(tokenize(exp, env)))['v']).toBe(outputValue);
  // });
});
