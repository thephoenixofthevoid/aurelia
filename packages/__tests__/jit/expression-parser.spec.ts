import {
  AccessKeyed,
  AccessMember,
  AccessScope,
  AccessThis,
  ArrayBindingPattern,
  ArrayLiteral,
  Assign,
  Binary,
  BinaryOperator,
  BindingBehavior,
  BindingIdentifier,
  BindingType,
  CallFunction,
  CallMember,
  CallScope,
  Conditional,
  ExpressionKind,
  ForOfStatement,
  Interpolation,
  ObjectBindingPattern,
  ObjectLiteral,
  PrimitiveLiteral,
  TaggedTemplate,
  Template,
  Unary,
  ValueConverter,
  IsLeftHandSide,
  IsAssign
} from '@aurelia/runtime';
import {
  Access,
  Precedence,
  parseExpression,
  parse,
  ParserState
} from '@aurelia/jit';
import {
  latin1IdentifierPartChars,
  latin1IdentifierStartChars,
  otherBMPIdentifierPartChars
} from './unicode';
import { assert } from '@aurelia/testing';

function createTaggedTemplate(cooked: string[], func: IsLeftHandSide, expressions?: ReadonlyArray<IsAssign>): TaggedTemplate {
  return new TaggedTemplate(cooked, cooked, func, expressions);
}

const binaryMultiplicative: BinaryOperator[] = ['*', '%', '/'];
const binaryAdditive: BinaryOperator[] = ['+', '-'];
const binaryRelational: [BinaryOperator, string][] = [
  ['<', '<'],
  ['<=', '<='],
  ['>', '>'],
  ['>=', '>='],
  ['in', ' in '],
  ['instanceof', ' instanceof '],
];
const binaryEquality: BinaryOperator[] = ['==', '!=', '===', '!=='];

const $false = PrimitiveLiteral.$false;
const $true = PrimitiveLiteral.$true;
const $null = PrimitiveLiteral.$null;
const $undefined = PrimitiveLiteral.$undefined;
const $str = PrimitiveLiteral.$empty;
const $tpl = Template.$empty;
const $arr = ArrayLiteral.$empty;
const $obj = ObjectLiteral.$empty;
const $this = AccessThis.$this;
const $parent = AccessThis.$parent;

const $a = new AccessScope('a');
const $b = new AccessScope('b');
const $c = new AccessScope('c');
const $num0 = new PrimitiveLiteral(0);
const $num1 = new PrimitiveLiteral(1);

const codes = {
  //SyntaxError
  InvalidExpressionStart: 'Code 100',
  UnconsumedToken: 'Code 101',
  DoubleDot: 'Code 102',
  InvalidMemberExpression: 'Code 103',
  UnexpectedEndOfExpression: 'Code 104',
  ExpectedIdentifier: 'Code 105',
  InvalidForDeclaration: 'Code 106',
  InvalidObjectLiteralPropertyDefinition: 'Code 107',
  UnterminatedQuote: 'Code 108',
  UnterminatedTemplate: 'Code 109',
  MissingExpectedToken: 'Code 110',
  UnexpectedCharacter: 'Code 111',

  //SemanticError
  NotAssignable: 'Code 150',
  UnexpectedForOf: 'Code 151'
};

function bindingTypeToString(bindingType: BindingType): string {
  switch (bindingType) {
    case BindingType.BindCommand:
      return 'BindCommand';
    case BindingType.OneTimeCommand:
      return 'OneTimeCommand';
    case BindingType.ToViewCommand:
      return 'ToViewCommand';
    case BindingType.FromViewCommand:
      return 'FromViewCommand';
    case BindingType.TwoWayCommand:
      return 'TwoWayCommand';
    case BindingType.CallCommand:
      return 'CallCommand';
    case BindingType.CaptureCommand:
      return 'CaptureCommand';
    case BindingType.DelegateCommand:
      return 'DelegateCommand';
    case BindingType.ForCommand:
      return 'ForCommand';
    case BindingType.Interpolation:
      return 'Interpolation';
    case undefined:
      return 'BindCommand';
    default:
      return 'fix your tests fred';
  }
}

function verifyResultOrError(expr: string, expected: any, expectedMsg?: string, bindingType?: BindingType): any {
  let error: Error = null;
  let actual: any = null;
  try {
    actual = parseExpression(expr, bindingType as any);
  } catch (e) {
    error = e;
  }
  if (bindingType === BindingType.Interpolation && !(expected instanceof Interpolation)) {
    if (error != null) {
      throw new Error(`Expected expression "${expr}" with BindingType.${bindingTypeToString(bindingType)} not to throw, but it threw "${error.message}"`);
    }
  } else if (expectedMsg == null) {
    if (error == null) {
      assert.deepStrictEqual(actual, expected);
    } else {
      throw new Error(`Expected expression "${expr}" with BindingType.${bindingTypeToString(bindingType)} parse successfully, but it threw "${error.message}"`);
    }
  } else {
    if (error == null) {
      throw new Error(`Expected expression "${expr}" with BindingType.${bindingTypeToString(bindingType)} to throw "${expectedMsg}", but no error was thrown`);
    } else {
      if (!error.message.startsWith(expectedMsg)) {
        throw new Error(`Expected expression "${expr}" with BindingType.${bindingTypeToString(bindingType)} to throw "${expectedMsg}", but got "${error.message}" instead`);
      }
    }
  }
}

// Note: we could loop through all generated tests by picking SimpleIsBindingBehaviorList and ComplexIsBindingBehaviorList,
// but we're separating them out to make the test suites more granular for debugging and reporting purposes
describe('ExpressionParser', function () {

  // #region Simple lists

  // The goal here is to pre-create arrays of string+ast expression pairs that each represent a unique
  // path taken in the expression parser. We're creating them here at the module level simply to speed up
  // the tests. They're never modified, so it's safe to reuse the same expression for multiple tests.

  // They're called Simple..Lists because we're not creating any combinations / nested expressions yet.
  // Instead, these lists will be the inputs for combinations further down below.

  // Note: we're more or less following the same ordering here as the tc39 spec description comments;
  // those comments (https://tc39.github.io/... in expression-parser.ts) are partial extracts from the spec
  // with mostly just omissions; the only modification is the special parsing rules related to AccessThis

  // 1. parsePrimaryExpression.this
  const AccessThisList: [string, any][] = [
    [`$this`,             $this],
    [`$parent`,           $parent],
    [`$parent.$parent`,   new AccessThis(2)]
  ];
  // 2. parsePrimaryExpression.IdentifierName
  const AccessScopeList: [string, any][] = [
    ...AccessThisList.map(([input, expr]) => [`${input}.a`, new AccessScope('a', expr.ancestor)] as [string, any]),
    [`$this.$parent`,     new AccessScope('$parent')],
    [`$parent.$this`,     new AccessScope('$this', 1)],
    [`a`,                 $a]
  ];
  // 3. parsePrimaryExpression.Literal
  const SimpleStringLiteralList: [string, any][] = [
    [`''`,                $str],
    [`""`,                $str]
  ];
  const SimpleNumberLiteralList: [string, any][] = [
    [`1`,                 $num1],
    [`1.1`,               new PrimitiveLiteral(1.1)],
    [`.1`,                new PrimitiveLiteral(0.1)],
    [`0.1`,               new PrimitiveLiteral(0.1)]
  ];
  const KeywordPrimitiveLiteralList: [string, any][] = [
    [`undefined`,         $undefined],
    [`null`,              $null],
    [`true`,              $true],
    [`false`,             $false]
  ];
  // concatenation of 3.
  const SimplePrimitiveLiteralList: [string, any][] = [
    ...SimpleStringLiteralList,
    ...SimpleNumberLiteralList,
    ...KeywordPrimitiveLiteralList
  ];

  // 4. parsePrimaryExpression.ArrayLiteral
  const SimpleArrayLiteralList: [string, any][] = [
    [`[]`,                $arr]
  ];
  // 5. parsePrimaryExpression.ObjectLiteral
  const SimpleObjectLiteralList: [string, any][] = [
    [`{}`,                $obj]
  ];
  // 6. parsePrimaryExpression.TemplateLiteral
  const SimpleTemplateLiteralList: [string, any][] = [
    [`\`\``,              $tpl],
    [`\`\${a}\``,         new Template(['', ''], [$a])]
  ];
  // concatenation of 3., 4., 5., 6.
  const SimpleLiteralList: [string, any][] = [
    ...SimplePrimitiveLiteralList,
    ...SimpleTemplateLiteralList,
    ...SimpleArrayLiteralList,
    ...SimpleObjectLiteralList
  ];
  // 7. parsePrimaryExpression.ParenthesizedExpression
  // Note: this is simply one of each precedence group, except for Primary because
  // parenthesized and primary are already from the same precedence group
  const SimpleParenthesizedList: [string, any][] = [
    [`(a[b])`,            new AccessKeyed($a, $b)],
    [`(a.b)`,             new AccessMember($a, 'b')],
    [`(a\`\`)`,           createTaggedTemplate([''], $a, [])],
    [`($this())`,         new CallFunction($this, [])],
    [`(a())`,             new CallScope('a', [])],
    [`(!a)`,              new Unary('!', $a)],
    [`(a+b)`,             new Binary('+', $a, $b)],
    [`(a?b:c)`,           new Conditional($a, $b, new AccessScope('c'))],
    [`(a=b)`,             new Assign($a, $b)]
  ];
  // concatenation of 1 through 7 (all Primary expressions)
  // This forms the group Precedence.Primary
  const SimplePrimaryList: [string, any][] = [
    ...AccessThisList,
    ...AccessScopeList,
    ...SimpleLiteralList,
    ...SimpleParenthesizedList
  ];
  // 2. parseMemberExpression.MemberExpression [ AssignmentExpression ]
  const SimpleAccessKeyedList: [string, any][] = [
    ...SimplePrimaryList
      .map(([input, expr]) => [`${input}[b]`, new AccessKeyed(expr, $b)] as [string, any])
  ];
  // 3. parseMemberExpression.MemberExpression . IdentifierName
  const SimpleAccessMemberList: [string, any][] = [
    ...[...AccessScopeList, ...SimpleLiteralList]
      .map(([input, expr]) => [`${input}.b`, new AccessMember(expr, 'b')] as [string, any])
  ];
  // 4. parseMemberExpression.MemberExpression TemplateLiteral
  const SimpleTaggedTemplateList: [string, any][] = [
    ...SimplePrimaryList
      .map(([input, expr]) => [`${input}\`\``, createTaggedTemplate([''], expr, [])] as [string, any]),

    ...SimplePrimaryList
      .map(([input, expr]) => [`${input}\`\${a}\``, createTaggedTemplate(['', ''], expr, [$a])] as [string, any])
  ];
  // 1. parseCallExpression.MemberExpression Arguments (this one doesn't technically fit the spec here)
  const SimpleCallFunctionList: [string, any][] = [
    ...[...AccessThisList, ...SimpleLiteralList]
      .map(([input, expr]) => [`${input}()`, new CallFunction(expr, [])] as [string, any])
  ];
  // 2. parseCallExpression.MemberExpression Arguments
  const SimpleCallScopeList: [string, any][] = [
    ...[...AccessScopeList]
      .map(([input, expr]) => [`${input}()`, new CallScope(expr.name, [], expr.ancestor)] as [string, any])
  ];
  // 3. parseCallExpression.MemberExpression Arguments
  const SimpleCallMemberList: [string, any][] = [
    ...[...AccessScopeList, ...SimpleLiteralList]
      .map(([input, expr]) => [`${input}.b()`, new CallMember(expr, 'b', [])] as [string, any])
  ];
  // concatenation of 1-3 of MemberExpression and 1-3 of CallExpression
  const SimpleLeftHandSideList: [string, any][] = [
    ...SimpleAccessKeyedList,
    ...SimpleAccessMemberList,
    ...SimpleTaggedTemplateList,
    ...SimpleCallFunctionList,
    ...SimpleCallScopeList,
    ...SimpleCallMemberList
  ];

  // concatenation of Primary and Member+CallExpression
  // This forms the group Precedence.LeftHandSide
  // used only for testing complex Unary expressions
  const SimpleIsLeftHandSideList: [string, any][] = [
    ...SimplePrimaryList,
    ...SimpleLeftHandSideList
  ];

  // same as SimpleIsLeftHandSideList but without $parent and $this (ergo, LeftHandSide according to the actual spec)
  const SimpleIsNativeLeftHandSideList: [string, any][] = [
    ...AccessScopeList,
    ...SimpleLiteralList,
    ...SimpleParenthesizedList,
    ...SimpleLeftHandSideList
  ];

  // parseUnaryExpression (this is actually at the top in the parser due to the order in which expressions must be parsed)
  const SimpleUnaryList: [string, any][] = [
    [`!$1`, new Unary('!', new AccessScope('$1'))],
    [`-$2`, new Unary('-', new AccessScope('$2'))],
    [`+$3`, new Unary('+', new AccessScope('$3'))],
    [`void $4`, new Unary('void', new AccessScope('$4'))],
    [`typeof $5`, new Unary('typeof', new AccessScope('$5'))]
  ];
  // concatenation of Unary + LeftHandSide
  // This forms the group Precedence.LeftHandSide and includes Precedence.Unary
  const SimpleIsUnaryList: [string, any][] = [
    ...SimpleIsLeftHandSideList,
    ...SimpleUnaryList
  ];

  // This forms the group Precedence.Multiplicative
  const SimpleMultiplicativeList: [string, any][] = [
    [`$6*$7`, new Binary('*', new AccessScope('$6'), new AccessScope('$7'))],
    [`$8%$9`, new Binary('%', new AccessScope('$8'), new AccessScope('$9'))],
    [`$10/$11`, new Binary('/', new AccessScope('$10'), new AccessScope('$11'))]
  ];
  const SimpleIsMultiplicativeList: [string, any][] = [
    ...SimpleIsUnaryList,
    ...SimpleMultiplicativeList
  ];

  // This forms the group Precedence.Additive
  const SimpleAdditiveList: [string, any][] = [
    [`$12+$13`, new Binary('+', new AccessScope('$12'), new AccessScope('$13'))],
    [`$14-$15`, new Binary('-', new AccessScope('$14'), new AccessScope('$15'))]
  ];
  const SimpleIsAdditiveList: [string, any][] = [
    ...SimpleIsMultiplicativeList,
    ...SimpleAdditiveList
  ];

  // This forms the group Precedence.Relational
  const SimpleRelationalList: [string, any][] = [
    [`$16<$17`, new Binary('<', new AccessScope('$16'), new AccessScope('$17'))],
    [`$18>$19`, new Binary('>', new AccessScope('$18'), new AccessScope('$19'))],
    [`$20<=$21`, new Binary('<=', new AccessScope('$20'), new AccessScope('$21'))],
    [`$22>=$23`, new Binary('>=', new AccessScope('$22'), new AccessScope('$23'))],
    [`$24 in $25`, new Binary('in', new AccessScope('$24'), new AccessScope('$25'))],
    [`$26 instanceof $27`, new Binary('instanceof', new AccessScope('$26'), new AccessScope('$27'))]
  ];
  const SimpleIsRelationalList: [string, any][] = [
    ...SimpleIsAdditiveList,
    ...SimpleRelationalList
  ];

  // This forms the group Precedence.Equality
  const SimpleEqualityList: [string, any][] = [
    [`$28==$29`, new Binary('==', new AccessScope('$28'), new AccessScope('$29'))],
    [`$30!=$31`, new Binary('!=', new AccessScope('$30'), new AccessScope('$31'))],
    [`$32===$33`, new Binary('===', new AccessScope('$32'), new AccessScope('$33'))],
    [`$34!==$35`, new Binary('!==', new AccessScope('$34'), new AccessScope('$35'))]
  ];
  const SimpleIsEqualityList: [string, any][] = [
    ...SimpleIsRelationalList,
    ...SimpleEqualityList
  ];

  // This forms the group Precedence.LogicalAND
  const SimpleLogicalANDList: [string, any][] = [
    [`$36&&$37`, new Binary('&&', new AccessScope('$36'), new AccessScope('$37'))]
  ];
  const SimpleIsLogicalANDList: [string, any][] = [
    ...SimpleIsEqualityList,
    ...SimpleLogicalANDList
  ];

  // This forms the group Precedence.LogicalOR
  const SimpleLogicalORList: [string, any][] = [
    [`$38||$39`, new Binary('||', new AccessScope('$38'), new AccessScope('$39'))]
  ];
  const SimpleIsLogicalORList: [string, any][] = [
    ...SimpleIsLogicalANDList,
    ...SimpleLogicalORList
  ];

  // This forms the group Precedence.Conditional
  const SimpleConditionalList: [string, any][] = [
    [`a?b:c`, new Conditional($a, $b, new AccessScope('c'))]
  ];
  const SimpleIsConditionalList: [string, any][] = [
    ...SimpleIsLogicalORList,
    ...SimpleConditionalList
  ];

  // This forms the group Precedence.Assign
  const SimpleAssignList: [string, any][] = [
    [`a=b`, new Assign($a, $b)]
  ];
  const SimpleIsAssignList: [string, any][] = [
    ...SimpleIsConditionalList,
    ...SimpleAssignList
  ];

  // This forms the group Precedence.Variadic
  const SimpleValueConverterList: [string, any][] = [
    [`a|b`, new ValueConverter($a, 'b', [])],
    [`a|b:c`, new ValueConverter($a, 'b', [new AccessScope('c')])],
    [`a|b:c:d`, new ValueConverter($a, 'b', [new AccessScope('c'), new AccessScope('d')])]
  ];
  const SimpleIsValueConverterList: [string, any][] = [
    ...SimpleIsAssignList,
    ...SimpleValueConverterList
  ];

  const SimpleBindingBehaviorList: [string, any][] = [
    [`a&b`, new BindingBehavior($a, 'b', [])],
    [`a&b:c`, new BindingBehavior($a, 'b', [new AccessScope('c')])],
    [`a&b:c:d`, new BindingBehavior($a, 'b', [new AccessScope('c'), new AccessScope('d')])]
  ];

  const SimpleIsBindingBehaviorList: [string, any][] = [
    ...SimpleIsValueConverterList,
    ...SimpleBindingBehaviorList
  ];

  for (const bindingType of [
    undefined,
    BindingType.BindCommand,
    BindingType.ToViewCommand,
    BindingType.FromViewCommand,
    BindingType.TwoWayCommand,
    BindingType.TriggerCommand,
    BindingType.DelegateCommand,
    BindingType.CaptureCommand,
    BindingType.CallCommand
  ] as any[]) {
    describe(bindingTypeToString(bindingType), function () {
      describe('parse AccessThisList', function () {
        for (const [input, expected] of AccessThisList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse AccessScopeList', function () {
        for (const [input, expected] of AccessScopeList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleStringLiteralList', function () {
        for (const [input, expected] of SimpleStringLiteralList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleNumberLiteralList', function () {
        for (const [input, expected] of SimpleNumberLiteralList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse KeywordPrimitiveLiteralList', function () {
        for (const [input, expected] of KeywordPrimitiveLiteralList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleArrayLiteralList', function () {
        for (const [input, expected] of SimpleArrayLiteralList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleObjectLiteralList', function () {
        for (const [input, expected] of SimpleObjectLiteralList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleTemplateLiteralList', function () {
        for (const [input, expected] of SimpleTemplateLiteralList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleParenthesizedList', function () {
        for (const [input, expected] of SimpleParenthesizedList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleAccessKeyedList', function () {
        for (const [input, expected] of SimpleAccessKeyedList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleAccessMemberList', function () {
        for (const [input, expected] of SimpleAccessMemberList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleTaggedTemplateList', function () {
        for (const [input, expected] of SimpleTaggedTemplateList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleCallFunctionList', function () {
        for (const [input, expected] of SimpleCallFunctionList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleCallScopeList', function () {
        for (const [input, expected] of SimpleCallScopeList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleCallMemberList', function () {
        for (const [input, expected] of SimpleCallMemberList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleUnaryList', function () {
        for (const [input, expected] of SimpleUnaryList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleMultiplicativeList', function () {
        for (const [input, expected] of SimpleMultiplicativeList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleAdditiveList', function () {
        for (const [input, expected] of SimpleAdditiveList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleRelationalList', function () {
        for (const [input, expected] of SimpleRelationalList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleEqualityList', function () {
        for (const [input, expected] of SimpleEqualityList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleLogicalANDList', function () {
        for (const [input, expected] of SimpleLogicalANDList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleLogicalORList', function () {
        for (const [input, expected] of SimpleLogicalORList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleConditionalList', function () {
        for (const [input, expected] of SimpleConditionalList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleAssignList', function () {
        for (const [input, expected] of SimpleAssignList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleValueConverterList', function () {
        for (const [input, expected] of SimpleValueConverterList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleBindingBehaviorList', function () {
        for (const [input, expected] of SimpleBindingBehaviorList) {
          it(input, function () {
            verifyResultOrError(input, expected, null, bindingType);
          });
        }
      });

      describe('parse SimpleBindingBehaviorList with Precedence.Unary', function () {
        for (const [input, expected] of SimpleBindingBehaviorList) {
          it(input, function () {
            const state = new ParserState(input);
            const result = parse(state, Access.Reset, Precedence.Unary, bindingType);
            if ((result.$kind & ExpressionKind.IsPrimary) > 0 ||
              (result.$kind & ExpressionKind.Unary) === ExpressionKind.Unary) {
              if ((expected.$kind & ExpressionKind.IsPrimary) > 0 ||
                (expected.$kind & ExpressionKind.Unary) === ExpressionKind.Unary) {
                assert.deepStrictEqual(result, expected);
                assert.strictEqual(state.index >= state.length, true, `state.index >= state.length`);
              } else {
                assert.strictEqual(state.index < state.length, true, `state.index < state.length`);
                assert.notStrictEqual(result.$kind, expected.$kind, 'result.$kind');
              }
            } else {
              throw new Error('Should not parse anything higher than Unary');
            }
          });
        }
      });

      describe('parse SimpleBindingBehaviorList with Precedence.Binary', function () {
        for (const [input, expected] of SimpleBindingBehaviorList) {
          it(input, function () {
            const state = new ParserState(input);
            const result = parse(state, Access.Reset, Precedence.Binary, bindingType);
            if ((result.$kind & ExpressionKind.IsPrimary) > 0 ||
              (result.$kind & ExpressionKind.Unary) === ExpressionKind.Unary ||
              (result.$kind & ExpressionKind.Binary) === ExpressionKind.Binary) {
              if ((expected.$kind & ExpressionKind.IsPrimary) > 0 ||
                (expected.$kind & ExpressionKind.Unary) === ExpressionKind.Unary ||
                (expected.$kind & ExpressionKind.Binary) === ExpressionKind.Binary) {
                assert.deepStrictEqual(result, expected);
                assert.strictEqual(state.index >= state.length, true, `state.index >= state.length`);
              } else {
                assert.strictEqual(state.index < state.length, true, `state.index < state.length`);
                assert.notStrictEqual(result.$kind, expected.$kind, 'result.$kind');
              }
            } else {
              throw new Error('Should not parse anything higher than Binary');
            }
          });
        }
      });

      describe('parse SimpleBindingBehaviorList with Precedence.Conditional', function () {
        for (const [input, expected] of SimpleBindingBehaviorList) {
          it(input, function () {
            const state = new ParserState(input);
            const result = parse(state, Access.Reset, Precedence.Conditional, bindingType);
            if ((result.$kind & ExpressionKind.IsPrimary) > 0 ||
              (result.$kind & ExpressionKind.Unary) === ExpressionKind.Unary ||
              (result.$kind & ExpressionKind.Binary) === ExpressionKind.Binary ||
              (result.$kind & ExpressionKind.Conditional) === ExpressionKind.Conditional) {
              if ((expected.$kind & ExpressionKind.IsPrimary) > 0 ||
                (expected.$kind & ExpressionKind.Unary) === ExpressionKind.Unary ||
                (expected.$kind & ExpressionKind.Binary) === ExpressionKind.Binary ||
                (expected.$kind & ExpressionKind.Conditional) === ExpressionKind.Conditional) {
                assert.deepStrictEqual(result, expected);
                assert.strictEqual(state.index >= state.length, true, `state.index >= state.length`);
              } else {
                assert.strictEqual(state.index < state.length, true, `state.index < state.length`);
                assert.notStrictEqual(result.$kind, expected.$kind, 'result.$kind');
              }
            } else {
              throw new Error('Should not parse anything higher than Conditional');
            }
          });
        }
      });

      describe('parse SimpleBindingBehaviorList with Precedence.Assign', function () {
        for (const [input, expected] of SimpleBindingBehaviorList) {
          it(input, function () {
            const state = new ParserState(input);
            const result = parse(state, Access.Reset, Precedence.Assign, bindingType);
            if ((result.$kind & ExpressionKind.IsPrimary) > 0 ||
              (result.$kind & ExpressionKind.Unary) === ExpressionKind.Unary ||
              (result.$kind & ExpressionKind.Binary) === ExpressionKind.Binary ||
              (result.$kind & ExpressionKind.Conditional) === ExpressionKind.Conditional ||
              (result.$kind & ExpressionKind.Assign) === ExpressionKind.Assign) {
              if ((expected.$kind & ExpressionKind.IsPrimary) > 0 ||
                (expected.$kind & ExpressionKind.Unary) === ExpressionKind.Unary ||
                (expected.$kind & ExpressionKind.Binary) === ExpressionKind.Binary ||
                (expected.$kind & ExpressionKind.Conditional) === ExpressionKind.Conditional ||
                (expected.$kind & ExpressionKind.Assign) === ExpressionKind.Assign) {
                assert.deepStrictEqual(result, expected);
                assert.strictEqual(state.index >= state.length, true, `state.index >= state.length`);
              } else {
                assert.strictEqual(state.index < state.length, true, `state.index < state.length`);
                assert.notStrictEqual(result.$kind, expected.$kind, 'result.$kind');
              }
            } else {
              throw new Error('Should not parse anything higher than Assign');
            }
          });
        }
      });

      describe('parse SimpleBindingBehaviorList with Precedence.Variadic', function () {
        for (const [input, expected] of SimpleBindingBehaviorList) {
          it(input, function () {
            const state = new ParserState(input);
            const result = parse(state, Access.Reset, Precedence.Variadic, bindingType);
            assert.deepStrictEqual(result, expected);
          });
        }
      });
    });
  }

  // #endregion

  // #region Complex lists
  // This is where the fun begins :) We're now going to create large lists of combinations in order
  // to hit every possible (non-error) edge case. The fundamental edge cases are written by hand, which
  // we then supplement by mixing in the simple lists created above. This generates a fair amount of redundancy
  // in the tests, but that's a perfectly acceptable tradeoff as it will cause issues to surface that you would
  // otherwise never think of.

  // We're validating all (meaningful) strings that can be escaped and combining them
  // with normal leading and trailing strings to verify escaping works correctly in different situations
  // This array is used to verify parsing of string PrimitiveLiteral, and the strings in Template and TaggedTemplate
  const stringEscapables = [
    [`\\\\`, `\\`],
    [`\\\``, `\``],
    [`\\'`,  `'`],
    [`\\"`,  `"`],
    [`\\f`,  `\f`],
    [`\\n`,  `\n`],
    [`\\r`,  `\r`],
    [`\\t`,  `\t`],
    [`\\b`,  `\b`],
    [`\\v`,  `\v`]
  ]
  .map(([raw, cooked]) => [
    [raw,         cooked],
    [`${raw}`,   `${cooked}`],
    [`x${raw}`,  `x${cooked}`],
    [`${raw}x`,  `${cooked}x`],
    [`x${raw}x`, `x${cooked}x`]
  ])
  .reduce((acc, cur) => acc.concat(cur));

  // Verify all string escapes, unicode characters, double and single quotes
  const ComplexStringLiteralList: [string, any][] = [
    ...[
      ['foo',                new PrimitiveLiteral('foo')],
      ['äöüÄÖÜß',            new PrimitiveLiteral('äöüÄÖÜß')],
      ['ಠ_ಠ',               new PrimitiveLiteral('ಠ_ಠ')],
      ...stringEscapables.map(([raw, cooked]) => [raw, new PrimitiveLiteral(cooked)])]
    .map(([input, expr]) => [
      [`'${input}'`, expr],
      [`"${input}"`, expr]
    ] as [string, any][])
    .reduce((acc, cur) => acc.concat(cur))
  ];
  describe('parse ComplexStringLiteralList', function () {
    for (const [input, expected] of ComplexStringLiteralList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  // Verify different floating point notations and parsing numbers that are outside the "safe" integer range
  const ComplexNumberList: [string, any][] = [
    ['9007199254740992',                                                  new PrimitiveLiteral(9007199254740992)],
    ['0.9007199254740992',                                                new PrimitiveLiteral(0.9007199254740992)],
    ['.9007199254740992',                                                 new PrimitiveLiteral(0.9007199254740992)],
    ['.90071992547409929007199254740992',                                 new PrimitiveLiteral(0.90071992547409929007199254740992)],
    ['9007199254740992.9007199254740992',                                 new PrimitiveLiteral(9007199254740992.9007199254740992)],
    ['9007199254740992.90071992547409929007199254740992',                 new PrimitiveLiteral(9007199254740992.90071992547409929007199254740992)],
    ['90071992547409929007199254740992',                                  new PrimitiveLiteral(90071992547409929007199254740992)],
    ['90071992547409929007199254740992.9007199254740992',                 new PrimitiveLiteral(90071992547409929007199254740992.9007199254740992)],
    ['90071992547409929007199254740992.90071992547409929007199254740992', new PrimitiveLiteral(90071992547409929007199254740992.90071992547409929007199254740992)]
  ];
  describe('parse ComplexNumberList', function () {
    for (const [input, expected] of ComplexNumberList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  // Verify various combinations of nested and chained parts/expressions, with/without escaped strings
  // Also combine this with the full list of SimpleIsAssign (once and twice) to validate parsing precedence of arguments
  const ComplexTemplateLiteralList: [string, any][] = [
    [`\`a\``,                       new Template(['a'], [])],
    [`\`\\\${a}\``,                 new Template(['${a}'], [])],
    [`\`$a\``,                      new Template(['$a'], [])],
    [`\`\${a}\${b}\``,              new Template(['', '', ''],                       [$a, $b])],
    [`\`a\${a}\${b}\``,             new Template(['a', '', ''],                      [$a, $b])],
    [`\`\${a}a\${b}\``,             new Template(['', 'a', ''],                      [$a, $b])],
    [`\`a\${a}a\${b}\``,            new Template(['a', 'a', ''],                     [$a, $b])],
    [`\`\${a}\${b}a\``,             new Template(['', '', 'a'],                      [$a, $b])],
    [`\`\${a}a\${b}a\``,            new Template(['', 'a', 'a'],                     [$a, $b])],
    [`\`a\${a}a\${b}a\``,           new Template(['a', 'a', 'a'],                    [$a, $b])],
    [`\`\${\`\${a}\`}\``,           new Template(['', ''], [new Template(['', ''],   [$a])])],
    [`\`\${\`a\${a}\`}\``,          new Template(['', ''], [new Template(['a', ''],  [$a])])],
    [`\`\${\`\${a}a\`}\``,          new Template(['', ''], [new Template(['', 'a'],  [$a])])],
    [`\`\${\`a\${a}a\`}\``,         new Template(['', ''], [new Template(['a', 'a'], [$a])])],
    [`\`\${\`\${\`\${a}\`}\`}\``,   new Template(['', ''], [new Template(['', ''], [new Template(['', ''],   [$a])])])],
    ...stringEscapables.map(([raw, cooked]) => [
      [`\`${raw}\``,                new Template([cooked],              [])],
      [`\`\${a}${raw}\``,           new Template(['', cooked],        [$a])],
      [`\`${raw}\${a}\``,           new Template([cooked, ''],        [$a])],
      [`\`${raw}\${a}${raw}\``,     new Template([cooked, cooked],    [$a])],
      [`\`\${a}${raw}\${a}\``,      new Template(['', cooked, ''],    [$a, $a])],
    ] as [string, any][])
    .reduce((acc, cur) => acc.concat(cur)),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`\`\${${input}}\``, new Template(['', ''], [expr])] as [string, any]),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`\`\${${input}}\${${input}}\``, new Template(['', '', ''], [expr, expr])] as [string, any])
  ];
  describe('parse ComplexTemplateLiteralList', function () {
    for (const [input, expected] of ComplexTemplateLiteralList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  // Verify various combinations of specified and unspecified (elision) array items
  // Also combine this with the full list of SimpleIsAssign (once and twice) to validate parsing precedence of element expressions
  const ComplexArrayLiteralList: [string, any][] = [
    [`[,]`,                 new ArrayLiteral([$undefined])],
    [`[,,]`,                new ArrayLiteral([$undefined, $undefined])],
    [`[,,,]`,               new ArrayLiteral([$undefined, $undefined, $undefined])],
    [`[a,]`,                new ArrayLiteral([$a])],
    [`[a,,]`,               new ArrayLiteral([$a, $undefined])],
    [`[a,a,]`,              new ArrayLiteral([$a, $a])],
    [`[a,,,]`,              new ArrayLiteral([$a, $undefined, $undefined])],
    [`[a,a,,]`,             new ArrayLiteral([$a, $a, $undefined])],
    [`[,a]`,                new ArrayLiteral([$undefined, $a])],
    [`[,a,]`,               new ArrayLiteral([$undefined, $a])],
    [`[,a,,]`,              new ArrayLiteral([$undefined, $a, $undefined])],
    [`[,a,a,]`,             new ArrayLiteral([$undefined, $a, $a])],
    [`[,,a]`,               new ArrayLiteral([$undefined, $undefined, $a])],
    [`[,a,a]`,              new ArrayLiteral([$undefined, $a, $a])],
    [`[,,a,]`,              new ArrayLiteral([$undefined, $undefined, $a])],
    [`[,,,a]`,              new ArrayLiteral([$undefined, $undefined, $undefined, $a])],
    [`[,,a,a]`,             new ArrayLiteral([$undefined, $undefined, $a, $a])],
    ...SimpleIsAssignList.map(([input, expr]) => [
      [`[${input}]`,           new ArrayLiteral([expr])],
      [`[${input},${input}]`,  new ArrayLiteral([expr, expr])]
    ] as [string, any][])
    .reduce((acc, cur) => acc.concat(cur))
  ];
  describe('parse ComplexArrayLiteralList', function () {
    for (const [input, expected] of ComplexArrayLiteralList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  // Verify various combinations of shorthand, full, string and number property definitions
  // Also combine this with the full list of SimpleIsAssign (once and twice) to validate parsing precedence of value expressions
  const ComplexObjectLiteralList: [string, any][] = [
    [`{a}`,                 new ObjectLiteral(['a'], [$a])],
    [`{a:a}`,               new ObjectLiteral(['a'], [$a])],
    [`{'a':a}`,             new ObjectLiteral(['a'], [$a])],
    [`{"a":a}`,             new ObjectLiteral(['a'], [$a])],
    [`{1:a}`,               new ObjectLiteral([1], [$a])],
    [`{'1':a}`,             new ObjectLiteral(['1'], [$a])],
    [`{"1":a}`,             new ObjectLiteral(['1'], [$a])],
    [`{'a':a,b}`,           new ObjectLiteral(['a', 'b'], [$a, $b])],
    [`{"a":a,b}`,           new ObjectLiteral(['a', 'b'], [$a, $b])],
    [`{1:a,b}`,             new ObjectLiteral([1, 'b'], [$a, $b])],
    [`{'1':a,b}`,           new ObjectLiteral(['1', 'b'], [$a, $b])],
    [`{"1":a,b}`,           new ObjectLiteral(['1', 'b'], [$a, $b])],
    [`{a,'b':b}`,           new ObjectLiteral(['a', 'b'], [$a, $b])],
    [`{a,"b":b}`,           new ObjectLiteral(['a', 'b'], [$a, $b])],
    [`{a,1:b}`,             new ObjectLiteral(['a', 1], [$a, $b])],
    [`{a,'1':b}`,           new ObjectLiteral(['a', '1'], [$a, $b])],
    [`{a,"1":b}`,           new ObjectLiteral(['a', '1'], [$a, $b])],
    [`{a,b}`,               new ObjectLiteral(['a', 'b'], [$a, $b])],
    [`{a:a,b}`,             new ObjectLiteral(['a', 'b'], [$a, $b])],
    [`{a,b:b}`,             new ObjectLiteral(['a', 'b'], [$a, $b])],
    [`{a:a,b,c}`,           new ObjectLiteral(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a,b:b,c}`,           new ObjectLiteral(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a,b,c:c}`,           new ObjectLiteral(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a:a,b:b,c}`,         new ObjectLiteral(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a:a,b,c:c}`,         new ObjectLiteral(['a', 'b', 'c'], [$a, $b, $c])],
    [`{a,b:b,c:c}`,         new ObjectLiteral(['a', 'b', 'c'], [$a, $b, $c])],
    ...SimpleIsAssignList.map(([input, expr]) => [
      [`{a:${input}}`,            new ObjectLiteral(['a'], [expr])],
      [`{a:${input},b:${input}}`, new ObjectLiteral(['a', 'b'], [expr, expr])]
    ] as [string, any][])
    .reduce((acc, cur) => acc.concat(cur))
  ];
  describe('parse ComplexObjectLiteralList', function () {
    for (const [input, expected] of ComplexObjectLiteralList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexAccessKeyedList: [string, any][] = [
    ...SimpleIsAssignList
      .map(([input, expr]) => [`a[${input}]`, new AccessKeyed($a, expr)] as [string, any])
  ];
  describe('parse ComplexAccessKeyedList', function () {
    for (const [input, expected] of ComplexAccessKeyedList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexAccessMemberList: [string, any][] = [
    ...[
      ...KeywordPrimitiveLiteralList,
      [`typeof`],
      [`void`],
      [`$this`],
      [`$parent`],
      [`in`],
      [`instanceof`],
      [`of`]]
      .map(([input]) => [`a.${input}`, new AccessMember($a, input)] as [string, any])
  ];
  describe('parse ComplexAccessMemberList', function () {
    for (const [input, expected] of ComplexAccessMemberList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexTaggedTemplateList: [string, any][] = [
    [`a\`a\``,                       createTaggedTemplate(['a'],           $a, [])],
    [`a\`\\\${a}\``,                 createTaggedTemplate(['${a}'],        $a, [])],
    [`a\`$a\``,                      createTaggedTemplate(['$a'],          $a, [])],
    [`a\`\${b}\${c}\``,              createTaggedTemplate(['', '', ''],    $a, [$b, $c])],
    [`a\`a\${b}\${c}\``,             createTaggedTemplate(['a', '', ''],   $a, [$b, $c])],
    [`a\`\${b}a\${c}\``,             createTaggedTemplate(['', 'a', ''],   $a, [$b, $c])],
    [`a\`a\${b}a\${c}\``,            createTaggedTemplate(['a', 'a', ''],  $a, [$b, $c])],
    [`a\`\${b}\${c}a\``,             createTaggedTemplate(['', '', 'a'],   $a, [$b, $c])],
    [`a\`\${b}a\${c}a\``,            createTaggedTemplate(['', 'a', 'a'],  $a, [$b, $c])],
    [`a\`a\${b}a\${c}a\``,           createTaggedTemplate(['a', 'a', 'a'], $a, [$b, $c])],
    [`a\`\${\`\${a}\`}\``,           createTaggedTemplate(['', ''],        $a, [new Template(['', ''],   [$a])])],
    [`a\`\${\`a\${a}\`}\``,          createTaggedTemplate(['', ''],        $a, [new Template(['a', ''],  [$a])])],
    [`a\`\${\`\${a}a\`}\``,          createTaggedTemplate(['', ''],        $a, [new Template(['', 'a'],  [$a])])],
    [`a\`\${\`a\${a}a\`}\``,         createTaggedTemplate(['', ''],        $a, [new Template(['a', 'a'], [$a])])],
    [`a\`\${\`\${\`\${a}\`}\`}\``,   createTaggedTemplate(['', ''],        $a, [new Template(['', ''], [new Template(['', ''],   [$a])])])],
    ...stringEscapables.map(([raw, cooked]) => [
      [`a\`${raw}\``,                createTaggedTemplate([cooked],         $a,     [])],
      [`a\`\${a}${raw}\``,           createTaggedTemplate(['', cooked],     $a,   [$a])],
      [`a\`${raw}\${a}\``,           createTaggedTemplate([cooked, ''],     $a,   [$a])],
      [`a\`${raw}\${a}${raw}\``,     createTaggedTemplate([cooked, cooked], $a,   [$a])],
      [`a\`\${a}${raw}\${a}\``,      createTaggedTemplate(['', cooked, ''], $a,   [$a, $a])],
    ] as [string, any][])
    .reduce((acc, cur) => acc.concat(cur)),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`a\`\${${input}}\``, createTaggedTemplate(['', ''], $a, [expr])] as [string, any]),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`a\`\${${input}}\${${input}}\``, createTaggedTemplate(['', '', ''], $a, [expr, expr])] as [string, any])
  ];
  describe('parse ComplexTaggedTemplateList', function () {
    for (const [input, expected] of ComplexTaggedTemplateList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexCallFunctionList: [string, any][] = [
    ...SimpleIsAssignList
      .map(([input, expr]) => [`$this(${input})`, new CallFunction($this, [expr])] as [string, any]),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`$this(${input},${input})`, new CallFunction($this, [expr, expr])] as [string, any])
  ];
  describe('parse ComplexCallFunctionList', function () {
    for (const [input, expected] of ComplexCallFunctionList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexCallScopeList: [string, any][] = [
    ...SimpleIsAssignList
      .map(([input, expr]) => [`a(${input})`, new CallScope('a', [expr])] as [string, any]),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`a(${input},${input})`, new CallScope('a', [expr, expr])] as [string, any])
  ];
  describe('parse ComplexCallScopeList', function () {
    for (const [input, expected] of ComplexCallScopeList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexCallMemberList: [string, any][] = [
    ...SimpleIsAssignList
      .map(([input, expr]) => [`a.b(${input})`, new CallMember($a, 'b', [expr])] as [string, any]),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`a.b(${input},${input})`, new CallMember($a, 'b', [expr, expr])] as [string, any])
  ];
  describe('parse ComplexCallMemberList', function () {
    for (const [input, expected] of ComplexCallMemberList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexUnaryList: [string, any][] = [
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => [`!${input}`, new Unary('!', expr)] as [string, any]),
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => [`+${input}`, new Unary('+', expr)] as [string, any]),
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => [`-${input}`, new Unary('-', expr)] as [string, any]),
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => [`void ${input}`, new Unary('void', expr)] as [string, any]),
    ...SimpleIsLeftHandSideList
      .map(([input, expr]) => [`typeof ${input}`, new Unary('typeof', expr)] as [string, any])
  ];
  describe('parse ComplexUnaryList', function () {
    for (const [input, expected] of ComplexUnaryList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  // Combine a precedence group with all precedence groups below it, the precedence group on the same
  // level, and a precedence group above it, and verify that the precedence/associativity is correctly enforced
  const ComplexMultiplicativeList: [string, any][] = [
    ...binaryMultiplicative.map(op => [
      ...SimpleIsMultiplicativeList.map(([i1, e1]) => [`${i1}${op}a`, new Binary(op, e1, $a)]),
      ...SimpleUnaryList
        .map(([i1, e1]) => SimpleMultiplicativeList.map(([i2, e2]) => [`${i2}${op}${i1}`, new Binary(op, e2, e1)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleMultiplicativeList
        .map(([i1, e1]) => SimpleMultiplicativeList.map(([i2, e2]) => [`${i1}${op}${i2}`, new Binary(e2.operation, new Binary(op, new Binary(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleAdditiveList
        .map(([i1, e1]) => SimpleMultiplicativeList.map(([i2, e2]) => [`${i1}${op}${i2}`, new Binary(e1.operation, e1.left, new Binary(e2.operation, new Binary(op, e1.right, e2.left), e2.right))]))
        .reduce((a, b) => a.concat(b))
    ] as [string, any][]).reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexMultiplicativeList', function () {
    for (const [input, expected] of ComplexMultiplicativeList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexAdditiveList: [string, any][] = [
    ...binaryAdditive.map(op => [
      ...SimpleIsAdditiveList.map(([i1, e1]) => [`${i1}${op}a`, new Binary(op, e1, $a)]),
      ...SimpleMultiplicativeList
        .map(([i1, e1]) => SimpleAdditiveList.map(([i2, e2]) => [`${i2}${op}${i1}`, new Binary(op, e2, e1)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleAdditiveList
        .map(([i1, e1]) => SimpleAdditiveList.map(([i2, e2]) => [`${i1}${op}${i2}`, new Binary(e2.operation, new Binary(op, new Binary(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleRelationalList
        .map(([i1, e1]) => SimpleAdditiveList.map(([i2, e2]) => [`${i1}${op}${i2}`, new Binary(e1.operation, e1.left, new Binary(e2.operation, new Binary(op, e1.right, e2.left), e2.right))]))
        .reduce((a, b) => a.concat(b))
    ] as [string, any][]).reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexAdditiveList', function () {
    for (const [input, expected] of ComplexAdditiveList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexRelationalList: [string, any][] = [
    ...binaryRelational.map(([op, txt]) => [
      ...SimpleIsRelationalList.map(([i1, e1]) => [`${i1}${txt}a`, new Binary(op, e1, $a)]),
      ...SimpleAdditiveList
        .map(([i1, e1]) => SimpleRelationalList.map(([i2, e2]) => [`${i2}${txt}${i1}`, new Binary(op, e2, e1)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleRelationalList
        .map(([i1, e1]) => SimpleRelationalList.map(([i2, e2]) => [`${i1}${txt}${i2}`, new Binary(e2.operation, new Binary(op, new Binary(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleEqualityList
        .map(([i1, e1]) => SimpleRelationalList.map(([i2, e2]) => [`${i1}${txt}${i2}`, new Binary(e1.operation, e1.left, new Binary(e2.operation, new Binary(op, e1.right, e2.left), e2.right))]))
        .reduce((a, b) => a.concat(b))
    ] as [string, any][]).reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexRelationalList', function () {
    for (const [input, expected] of ComplexRelationalList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexEqualityList: [string, any][] = [
    ...binaryEquality.map(op => [
      ...SimpleIsEqualityList.map(([i1, e1]) => [`${i1}${op}a`, new Binary(op, e1, $a)]),
      ...SimpleRelationalList
        .map(([i1, e1]) => SimpleEqualityList.map(([i2, e2]) => [`${i2}${op}${i1}`, new Binary(op, e2, e1)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleEqualityList
        .map(([i1, e1]) => SimpleEqualityList.map(([i2, e2]) => [`${i1}${op}${i2}`, new Binary(e2.operation, new Binary(op, new Binary(e1.operation, e1.left, e1.right), e2.left), e2.right)]))
        .reduce((a, b) => a.concat(b)),
      ...SimpleLogicalANDList
        .map(([i1, e1]) => SimpleEqualityList.map(([i2, e2]) => [`${i1}${op}${i2}`, new Binary(e1.operation, e1.left, new Binary(e2.operation, new Binary(op, e1.right, e2.left), e2.right))]))
        .reduce((a, b) => a.concat(b))
    ] as [string, any][]).reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexEqualityList', function () {
    for (const [input, expected] of ComplexEqualityList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexLogicalANDList: [string, any][] = [
    ...SimpleIsLogicalANDList.map(([i1, e1]) => [`${i1}&&a`, new Binary('&&', e1, $a)] as [string, any]),
    ...SimpleEqualityList
      .map(([i1, e1]) => SimpleLogicalANDList.map(([i2, e2]) => [`${i2}&&${i1}`, new Binary('&&', e2, e1)]) as [string, any][])
      .reduce((a, b) => a.concat(b)),
    ...SimpleLogicalANDList
      .map(([i1, e1]) => SimpleLogicalANDList.map(([i2, e2]) => [`${i1}&&${i2}`, new Binary(e2.operation, new Binary('&&', new Binary(e1.operation, e1.left, e1.right), e2.left), e2.right)]) as [string, any][])
      .reduce((a, b) => a.concat(b)),
    ...SimpleLogicalORList
      .map(([i1, e1]) => SimpleLogicalANDList.map(([i2, e2]) => [`${i1}&&${i2}`, new Binary(e1.operation, e1.left, new Binary(e2.operation, new Binary('&&', e1.right, e2.left), e2.right))]) as [string, any][])
      .reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexLogicalANDList', function () {
    for (const [input, expected] of ComplexLogicalANDList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexLogicalORList: [string, any][] = [
    ...SimpleIsLogicalORList.map(([i1, e1]) => [`${i1}||a`, new Binary('||', e1, $a)] as [string, any]),
    ...SimpleLogicalANDList
      .map(([i1, e1]) => SimpleLogicalORList.map(([i2, e2]) => [`${i2}||${i1}`, new Binary('||', e2, e1)]) as [string, any][])
      .reduce((a, b) => a.concat(b)),
    ...SimpleLogicalORList
      .map(([i1, e1]) => SimpleLogicalORList.map(([i2, e2]) => [`${i1}||${i2}`, new Binary(e2.operation, new Binary('||', new Binary(e1.operation, e1.left, e1.right), e2.left), e2.right)]) as [string, any][])
      .reduce((a, b) => a.concat(b)),
    ...SimpleConditionalList
      .map(([i1, e1]) => SimpleLogicalORList.map(([i2, e2]) => [`${i1}||${i2}`, new Conditional(e1.condition, e1.yes, new Binary(e2.operation, new Binary('||', e1.no, e2.left), e2.right))]) as [string, any][])
      .reduce((a, b) => a.concat(b))
  ];
  describe('parse ComplexLogicalORList', function () {
    for (const [input, expected] of ComplexLogicalORList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexConditionalList: [string, any][] = [
    ...SimpleIsLogicalORList.map(([i1, e1]) => [`${i1}?0:1`, new Conditional(e1, $num0, $num1)] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`0?1:${i1}`, new Conditional($num0, $num1, e1)] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`0?${i1}:1`, new Conditional($num0, e1, $num1)] as [string, any]),
    ...SimpleConditionalList.map(([i1, e1]) => [`${i1}?0:1`, new Conditional(e1.condition, e1.yes, new Conditional(e1.no, $num0, $num1))] as [string, any])
  ];
  describe('parse ComplexConditionalList', function () {
    for (const [input, expected] of ComplexConditionalList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexAssignList: [string, any][] = [
    ...SimpleIsAssignList.map(([i1, e1]) => [`a=${i1}`, new Assign($a, e1)] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`a=b=${i1}`, new Assign($a, new Assign($b, e1))] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}=a`, new Assign(e1, $a)] as [string, any]),
    ...SimpleAccessMemberList.map(([i1, e1]) => [`${i1}=a`, new Assign(e1, $a)] as [string, any]),
    ...SimpleAccessKeyedList.map(([i1, e1]) => [`${i1}=a`, new Assign(e1, $a)] as [string, any]),
    ...SimpleAssignList.map(([i1, e1]) => [`${i1}=c`, new Assign(e1.target, new Assign(e1.value, $c))] as [string, any])
  ];
  describe('parse ComplexAssignList', function () {
    for (const [input, expected] of ComplexAssignList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexValueConverterList: [string, any][] = [
    ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}|a`, new ValueConverter(e1, 'a', [])] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}|a:${i1}`, new ValueConverter(e1, 'a', [e1])] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}`, new ValueConverter(e1, 'a', [e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}|a|b`, new ValueConverter(new ValueConverter(e1, 'a', []), 'b', [])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}|a|b|c`, new ValueConverter(new ValueConverter(new ValueConverter(e1, 'a', []), 'b', []), 'c', [])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}`, new ValueConverter(e1, 'a', [e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}:${i1}`, new ValueConverter(e1, 'a', [e1, e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}:${i1}|b|c:${i1}:${i1}:${i1}`, new ValueConverter(new ValueConverter(new ValueConverter(e1, 'a', [e1, e1, e1]), 'b', []), 'c', [e1, e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}|a:${i1}:${i1}:${i1}|b:${i1}:${i1}:${i1}|c`, new ValueConverter(new ValueConverter(new ValueConverter(e1, 'a', [e1, e1, e1]), 'b', [e1, e1, e1]), 'c', [])] as [string, any])
  ];
  describe('parse ComplexValueConverterList', function () {
    for (const [input, expected] of ComplexValueConverterList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  const ComplexBindingBehaviorList: [string, any][] = [
    ...SimpleIsValueConverterList.map(([i1, e1]) => [`${i1}&a`, new BindingBehavior(e1, 'a', [])] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}&a:${i1}`, new BindingBehavior(e1, 'a', [e1])] as [string, any]),
    ...SimpleIsAssignList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}`, new BindingBehavior(e1, 'a', [e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}&a&b`, new BindingBehavior(new BindingBehavior(e1, 'a', []), 'b', [])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}&a&b&c`, new BindingBehavior(new BindingBehavior(new BindingBehavior(e1, 'a', []), 'b', []), 'c', [])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}`, new BindingBehavior(e1, 'a', [e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}:${i1}`, new BindingBehavior(e1, 'a', [e1, e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}:${i1}&b&c:${i1}:${i1}:${i1}`, new BindingBehavior(new BindingBehavior(new BindingBehavior(e1, 'a', [e1, e1, e1]), 'b', []), 'c', [e1, e1, e1])] as [string, any]),
    ...AccessScopeList.map(([i1, e1]) => [`${i1}&a:${i1}:${i1}:${i1}&b:${i1}:${i1}:${i1}&c`, new BindingBehavior(new BindingBehavior(new BindingBehavior(e1, 'a', [e1, e1, e1]), 'b', [e1, e1, e1]), 'c', [])] as [string, any])
  ];
  describe('parse ComplexBindingBehaviorList', function () {
    for (const [input, expected] of ComplexBindingBehaviorList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input), expected);
      });
    }
  });

  // #endregion

  // https://tc39.github.io/ecma262/#sec-runtime-semantics-iteratordestructuringassignmentevaluation
  describe('parse ForOfStatement', function () {
    const SimpleForDeclarations: [string, any][] = [
      [`a`,           new BindingIdentifier('a')],
      [`{}`,          new ObjectBindingPattern([], [])],
      [`[]`,          new ArrayBindingPattern([])],
    ];

    const ForDeclarations: [string, any][] = [
      [`{a}`,         new ObjectBindingPattern(['a'], [$a])],
      [`{a:a}`,       new ObjectBindingPattern(['a'], [$a])],
      [`{a,b}`,       new ObjectBindingPattern(['a', 'b'], [$a, $b])],
      [`{a:a,b}`,     new ObjectBindingPattern(['a', 'b'], [$a, $b])],
      [`{a,b:b}`,     new ObjectBindingPattern(['a', 'b'], [$a, $b])],
      [`{a:a,b,c}`,   new ObjectBindingPattern(['a', 'b', 'c'], [$a, $b, $c])],
      [`{a,b:b,c}`,   new ObjectBindingPattern(['a', 'b', 'c'], [$a, $b, $c])],
      [`{a,b,c:c}`,   new ObjectBindingPattern(['a', 'b', 'c'], [$a, $b, $c])],
      [`{a:a,b:b,c}`, new ObjectBindingPattern(['a', 'b', 'c'], [$a, $b, $c])],
      [`{a:a,b,c:c}`, new ObjectBindingPattern(['a', 'b', 'c'], [$a, $b, $c])],
      [`{a,b:b,c:c}`, new ObjectBindingPattern(['a', 'b', 'c'], [$a, $b, $c])],
      [`[,]`,         new ArrayBindingPattern([$undefined])],
      [`[,,]`,        new ArrayBindingPattern([$undefined, $undefined])],
      [`[,,,]`,       new ArrayBindingPattern([$undefined, $undefined, $undefined])],
      [`[a,]`,        new ArrayBindingPattern([$a])],
      [`[a,,]`,       new ArrayBindingPattern([$a, $undefined])],
      [`[a,a,]`,      new ArrayBindingPattern([$a, $a])],
      [`[a,,,]`,      new ArrayBindingPattern([$a, $undefined, $undefined])],
      [`[a,a,,]`,     new ArrayBindingPattern([$a, $a, $undefined])],
      [`[,a]`,        new ArrayBindingPattern([$undefined, $a])],
      [`[,a,]`,       new ArrayBindingPattern([$undefined, $a])],
      [`[,a,,]`,      new ArrayBindingPattern([$undefined, $a, $undefined])],
      [`[,a,a,]`,     new ArrayBindingPattern([$undefined, $a, $a])],
      [`[,,a]`,       new ArrayBindingPattern([$undefined, $undefined, $a])],
      [`[,a,a]`,      new ArrayBindingPattern([$undefined, $a, $a])],
      [`[,,a,]`,      new ArrayBindingPattern([$undefined, $undefined, $a])],
      [`[,,,a]`,      new ArrayBindingPattern([$undefined, $undefined, $undefined, $a])],
      [`[,,a,a]`,     new ArrayBindingPattern([$undefined, $undefined, $a, $a])]
    ];

    const ForOfStatements: [string, any][] = [
      ...SimpleForDeclarations.map(([decInput, decExpr]) => [
        ...SimpleIsBindingBehaviorList.map(([forInput, forExpr]) => [`${decInput} of ${forInput}`, new ForOfStatement(decExpr, forExpr)])
      ] as [string, any][]).reduce((a, c) => a.concat(c)),
      ...ForDeclarations.map(([decInput, decExpr]) => [
        ...AccessScopeList.map(([forInput, forExpr]) => [`${decInput} of ${forInput}`, new ForOfStatement(decExpr, forExpr)])
      ] as [string, any][]).reduce((a, c) => a.concat(c))
    ];

    for (const [input, expected] of ForOfStatements) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input, BindingType.ForCommand as any), expected);
      });
    }
  });

  const InterpolationList: [string, any][] = [
    [`a`,                       null],
    [`\\\${a`,                  null],
    [`\\\${a}`,                 null],
    [`\\\${a}\\\${a}`,          null],
    [`$a`,                      null],
    [`$a$a`,                    null],
    [`$\\{a`,                   null],
    [`\${a}\${b}`,              new Interpolation(['', '', ''],                       [$a, $b])],
    [`a\${a}\${b}`,             new Interpolation(['a', '', ''],                      [$a, $b])],
    [`\${a}a\${b}`,             new Interpolation(['', 'a', ''],                      [$a, $b])],
    [`a\${a}a\${b}`,            new Interpolation(['a', 'a', ''],                     [$a, $b])],
    [`\${a}\${b}a`,             new Interpolation(['', '', 'a'],                      [$a, $b])],
    [`\${a}a\${b}a`,            new Interpolation(['', 'a', 'a'],                     [$a, $b])],
    [`a\${a}a\${b}a`,           new Interpolation(['a', 'a', 'a'],                    [$a, $b])],
    [`\${\`\${a}\`}`,           new Interpolation(['', ''], [new Template(['', ''],   [$a])])],
    [`\${\`a\${a}\`}`,          new Interpolation(['', ''], [new Template(['a', ''],  [$a])])],
    [`\${\`\${a}a\`}`,          new Interpolation(['', ''], [new Template(['', 'a'],  [$a])])],
    [`\${\`a\${a}a\`}`,         new Interpolation(['', ''], [new Template(['a', 'a'], [$a])])],
    [`\${\`\${\`\${a}\`}\`}`,   new Interpolation(['', ''], [new Template(['', ''], [new Template(['', ''],   [$a])])])],
    ...stringEscapables.map(([raw, cooked]) => [
      [`${raw}`,                null],
      [`\${a}${raw}`,           new Interpolation(['', cooked],        [$a])],
      [`${raw}\${a}`,           new Interpolation([cooked, ''],        [$a])],
      [`${raw}\${a}${raw}`,     new Interpolation([cooked, cooked],    [$a])],
      [`\${a}${raw}\${a}`,      new Interpolation(['', cooked, ''],    [$a, $a])],
    ] as [string, any][])
    .reduce((acc, cur) => acc.concat(cur)),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`\${${input}}`, new Interpolation(['', ''], [expr])] as [string, any]),
    ...SimpleIsAssignList
      .map(([input, expr]) => [`\${${input}}\${${input}}`, new Interpolation(['', '', ''], [expr, expr])] as [string, any])
  ];
  describe('parse Interpolation', function () {
    for (const [input, expected] of InterpolationList) {
      it(input, function () {
        assert.deepStrictEqual(parseExpression(input, BindingType.Interpolation as any), expected);
      });
    }
  });

  describe('parse unicode IdentifierStart', function () {
    for (const char of latin1IdentifierStartChars) {
      it(char, function () {
        assert.deepStrictEqual(parseExpression(char), new AccessScope(char, 0));
      });
    }
  });

  describe('parse unicode IdentifierPart', function () {
    for (const char of latin1IdentifierPartChars) {
      it(char, function () {
        const identifier = `$${char}`;
        assert.deepStrictEqual(parseExpression(identifier), new AccessScope(identifier, 0));
      });
    }
  });

  describe('Errors', function () {
    for (const input of [
      ')', '}', ']', '%', '*',
      ',', '/', ':', '>', '<',
      '=', '?', 'of', 'instanceof', 'in', ' '
    ]) {
      it(`throw Code 100 (InvalidExpressionStart) on "${input}"`, function () {
        verifyResultOrError(input, null, 'Code 100');
      });
    }

    for (const input of ['..', '...', '..a', '...a', '..1', '...1', '.a.', '.a..']) {
      it(`throw Code 101 (UnconsumedToken) on "${input}"`, function () {
        verifyResultOrError(input, null, 'Code 101');
      });
    }
    it(`throw Code 101 (UnconsumedToken) on "$this!"`, function () {
      verifyResultOrError(`$this!`, null, 'Code 101');
    });
    for (const [input] of SimpleIsAssignList) {
      for (const op of [')', ']', '}']) {
        it(`throw Code 110 (MissingExpectedToken) on "${input}${op}"`, function () {
          verifyResultOrError(`${input}${op}`, null, 'Code 101');
        });
      }
    }

    for (const start of ['$parent', '$parent.$parent']) {
      for (const middle of ['..', '...']) {
        for (const end of ['', 'bar', '$parent']) {
          const expr = `${start}${middle}${end}`;
          it(`throw Code 102 (DoubleDot) on "${expr}"`, function () {
            verifyResultOrError(expr, null, 'Code 102');
          });
        }
      }
    }

    for (const nonTerminal of ['!', ' of', ' typeof', '=']) {
      it(`throw Code 103 (InvalidMemberExpression) on "$parent${nonTerminal}"`, function () {
        verifyResultOrError(`$parent${nonTerminal}`, null, 'Code 103');
      });
    }

    for (const op of ['!', '(', '+', '-', '.', '[', 'typeof']) {
      it(`throw Code 104 (UnexpectedEndOfExpression) on "${op}"`, function () {
        verifyResultOrError(op, null, 'Code 104');
      });
    }

    for (const [input, expr] of SimpleIsLeftHandSideList) {
      it(`throw Code 105 (ExpectedIdentifier) on "${input}."`, function () {
        if (typeof expr['value'] !== 'number' || input.includes('.')) { // only non-float numbers are allowed to end on a dot
          verifyResultOrError(`${input}.`, null, 'Code 105');
        } else {
          verifyResultOrError(`${input}.`, expr, null);
        }
      });
    }

    for (const [input] of SimpleIsNativeLeftHandSideList) {
      for (const dots of ['..', '...']) {
        it(`throw Code 105 (ExpectedIdentifier) on "${input}${dots}"`, function () {
          verifyResultOrError(`${input}${dots}`, null, 'Code 105');
        });
      }
    }
    for (const input of ['.1.', '.1..']) {
      it(`throw Code 105 (ExpectedIdentifier) on "${input}"`, function () {
        verifyResultOrError(input, null, 'Code 105');
      });
    }

    for (const [input] of SimpleIsBindingBehaviorList) {
      it(`throw Code 106 (InvalidForDeclaration) on "${input}"`, function () {
        verifyResultOrError(input, null, 'Code 106', BindingType.ForCommand);
      });
    }
    for (const [input] of [
      [`a`, new BindingIdentifier('a')]
    ] as [string, any][]) {
      it(`throw Code 106 (InvalidForDeclaration) on "${input}"`, function () {
        verifyResultOrError(input, null, 'Code 106', BindingType.ForCommand);
      });
    }

    for (const input of ['{', '{[]}', '{[}', '{[a]}', '{[a}', '{{', '{(']) {
      it(`throw Code 107 (InvalidObjectLiteralPropertyDefinition) on "${input}"`, function () {
        verifyResultOrError(input, null, 'Code 107');
      });
    }

    for (const input of ['"', '\'']) {
      it(`throw Code 108 (UnterminatedQuote) on "${input}"`, function () {
        verifyResultOrError(input, null, 'Code 108');
      });
    }

    for (const input of ['`', '` ', '`${a}']) {
      it(`throw Code 109 (UnterminatedTemplate) on "${input}"`, function () {
        verifyResultOrError(input, null, 'Code 109');
      });
    }

    for (const [input] of SimpleIsAssignList) {
      for (const op of ['(', '[']) {
        it(`throw Code 110 (MissingExpectedToken) on "${op}${input}"`, function () {
          verifyResultOrError(`${op}${input}`, null, 'Code 110');
        });
      }
    }
    for (const [input] of SimpleIsConditionalList) {
      it(`throw Code 110 (MissingExpectedToken) on "${input}?${input}"`, function () {
        verifyResultOrError(`${input}?${input}`, null, 'Code 110');
      });
    }
    for (const [input] of AccessScopeList) {
      it(`throw Code 110 (MissingExpectedToken) on "{${input}"`, function () {
        verifyResultOrError(`{${input}`, null, 'Code 110');
      });
    }
    for (const [input] of SimpleStringLiteralList) {
      it(`throw Code 110 (MissingExpectedToken) on "{${input}}"`, function () {
        verifyResultOrError(`{${input}}`, null, 'Code 110');
      });
    }
    for (const input of ['{24}', '{24, 24}', '{\'\'}', '{a.b}', '{a[b]}', '{a()}']) {
      it(`throw Code 110 (MissingExpectedToken) on "${input}"`, function () {
        verifyResultOrError(input, null, 'Code 110');
      });
    }

    for (const input of ['#', ';', '@', '^', '~', '\\', 'foo;']) {
      it(`throw Code 111 (UnexpectedCharacter) on "${input}"`, function () {
        verifyResultOrError(input, null, 'Code 111');
      });
    }

    for (const [input] of SimpleIsAssignList) {
      it(`throw Code 112 (MissingValueConverter) on "${input}|"`, function () {
        verifyResultOrError(`${input}|`, null, 'Code 112');
      });
    }

    for (const [input] of SimpleIsAssignList) {
      it(`throw Code 113 (MissingBindingBehavior) on "${input}&"`, function () {
        verifyResultOrError(`${input}&`, null, 'Code 113');
      });
    }

    for (const [input] of [
      [`$this`, $this],
      ...SimpleLiteralList,
      ...SimpleUnaryList
    ]) {
      it(`throw Code 150 (NotAssignable) on "${input}=a"`, function () {
        verifyResultOrError(`${input}=a`, null, 'Code 150');
      });
    }

    for (const [input] of SimpleIsBindingBehaviorList.filter(([, e]) => !e.ancestor)) {
      it(`throw Code 151 (UnexpectedForOf) on "${input} of"`, function () {
        verifyResultOrError(`${input} of`, null, 'Code 151');
      });
    }
  });

  describe('unknown unicode IdentifierPart', function () {
    for (const char of otherBMPIdentifierPartChars) {
      it(char, function () {
        const identifier = `$${char}`;
        verifyResultOrError(identifier, null, codes.UnexpectedCharacter);
      });
    }
  });
});
