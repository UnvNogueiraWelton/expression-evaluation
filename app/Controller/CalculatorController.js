export default class CalculatorController {
  #view;
  #nodeFactory;
  #precedence;

  constructor({ view, nodeFactory }) {
    this.#view = view;
    this.#nodeFactory = nodeFactory;
  }

  #lexer(expression) {
    return expression.map((char) => {
      // Numeros
      if (/\d/.test(char)) {
        return { type: 'NUMBER', value: parseFloat(char) };
      }

      // Variaveis
      if (/[A-Z]/.test(char)) {
        return { type: 'VARIABLE', value: char };
      }

      // Operadores
      if (/[\+\-\*\/]/.test(char)) {
        return { type: 'OPERATOR', value: char };
      }

      // Parenteses
      if (char === '(' || char === ')') {
        return { type: 'PARENTHESIS', value: char };
      }

      // Erro lexico
      throw new Error(`Caractere Invalido: ${char}`);
    });
  }

  #createExpressionTree(tokens) {
    let current = 0;

    function parseExpression(precedence = 0) {
      let node;

      const token = tokens[current];
      if (token.type === 'NUMBER') {
        current++;
        node = this.#nodeFactory.create('LITERAL', token.value);
      } else if (token.type === 'VARIABLE') {
        const variableValue = this.#view.getVariableValue(token.value);
        current++;

        if (isNaN(variableValue)) {
          throw new Error('Variavel nao pode possuir valor nao numerico!');
        }

        node = this.#nodeFactory.create('NUMBER', variableValue);
      } else if (token.type === 'PARENTHESIS' && token.value === '(') {
        current++;
        node = parseExpression.apply(this);
        if (
          tokens[current].type === 'PARENTHESIS' &&
          tokens[current].value === ')'
        ) {
          current++;
        } else {
          throw new Error('Syntax Error: Missing closing parenthesis');
        }
      }

      while (current < tokens.length) {
        const nextToken = tokens[current];
        let nextPrecedence = 0;

        if (nextToken.type === 'OPERATOR') {
          if (nextToken.value === '+' || nextToken.value === '-') {
            nextPrecedence = 1;
          } else if (nextToken.value === '*' || nextToken.value === '/') {
            nextPrecedence = 2;
          }
        }

        if (precedence >= nextPrecedence) {
          break;
        }

        current++;

        const newNode = this.#nodeFactory.create('EXPRESSION', nextToken.value);
        newNode.setLeft(node);
        newNode.setRight(parseExpression.apply(this, [nextPrecedence]));
        node = newNode;
      }

      return node;
    }

    return parseExpression.apply(this);
  }

  #evaluate(node) {
    console.log(node);
    switch (node.type) {
      case 'LITERAL':
        return node.value;
      case 'EXPRESSION':
        const left = this.#evaluate.apply(this, [node.left]);
        const right = this.#evaluate.apply(this, [node.right]);
        switch (node.value) {
          case '+':
            return left + right;
          case '-':
            return left - right;
          case '*':
            return left * right;
          case '/':
            return left / right;
          default:
            throw new Error(`Operador invalido: ${node.value}`);
        }
      default:
        throw new Error(`Tipo invalido: ${node.type}`);
    }
  }

  #calculate(expression) {
    try {
      const tokens = this.#lexer(expression.match(/(\d+)|([^\s])/g));
      const root = this.#createExpressionTree(tokens);
    } catch (err) {
      this.#view.handleError(err);
    }
  }

  init() {
    this.#view.configure(this.#calculate.bind(this));
    return this;
  }

  static initialize(deps) {
    return new CalculatorController(deps).init();
  }
}
