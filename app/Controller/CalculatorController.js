export default class CalculatorController {
  #view;
  #nodeFactory;
  #numberRules;
  #operatorRules;

  constructor({ view, nodeFactory }) {
    this.#view = view;
    this.#nodeFactory = nodeFactory;
    this.#numberRules = ['CLOSE_PARENTHESIS', 'OPERATOR'];
    this.#operatorRules = [
      'NUMBER',
      'VARIABLE',
      'EXPRESSION',
      'OPEN_PARENTHESIS',
    ];
  }

  #lexer(expression) {
    return expression.map((char) => {
      // Numeros
      if (/\d/.test(char)) {
        return this.#nodeFactory.create('NUMBER', parseFloat(char));
      }

      // Variaveis
      if (/[A-Z]/.test(char)) {
        return this.#nodeFactory.create('VARIABLE', char);
      }

      // Operadores
      if (/[\+\-\*\/]/.test(char)) {
        return this.#nodeFactory.create('OPERATOR', char);
      }

      // Abertura Parenteses
      if (char === '(') {
        return { type: 'OPEN_PARENTHESIS', value: char };
      }

      // Fechamento Parenteses
      if (char === ')') {
        return { type: 'CLOSE_PARENTHESIS', value: char };
      }

      // Erro lexico
      throw new Error(`Caractere Invalido: ${char}`);
    });
  }

  #getPrecedence(op) {
    if (op === '+' || op === '-') return 1;
    if (op === '*' || op === '/') return 2;
    return 0;
  }

  #buildTree(tokens, start = 0, end = tokens.length - 1) {
    if (start === end) return tokens[start];

    let minPrecedence = Infinity;
    let splitIndex = null;
    let balance = 0;

    for (let i = start; i <= end; i++) {
      const token = tokens[i];

      if (token.type === 'OPEN_PARENTHESIS') balance++;
      if (token.type === 'CLOSE_PARENTHESIS') balance--;

      if (token.type == 'NUMBER' && i !== tokens.length - 1) {
        if (!this.#numberRules.includes(tokens[i + 1].type)) {
          throw new Error('Erro de Syntaxe');
        }
      }

      if (
        balance === 0 &&
        token.type == 'OPERATOR' &&
        this.#getPrecedence(token.value) <= minPrecedence
      ) {
        if (
          !tokens[i + 1] ||
          !this.#operatorRules.includes(tokens[i + 1].type)
        ) {
          throw new Error('Erro de Syntaxe');
        }

        minPrecedence = this.#getPrecedence(token.value);
        splitIndex = i;
      }
    }

    if (balance !== 0) {
      throw new Error('Parênteses desequilibrados');
    }

    if (
      tokens[start].type === 'OPEN_PARENTHESIS' &&
      tokens[end].type === 'CLOSE_PARENTHESIS'
    ) {
      return this.#buildTree(tokens, start + 1, end - 1);
    }

    const root = this.#nodeFactory.create('EXPRESSION', tokens[splitIndex]);

    root.left = this.#buildTree(tokens, start, splitIndex - 1);
    root.right = this.#buildTree(tokens, splitIndex + 1, end);

    return root;
  }

  #evaluate(node) {
    switch (node.type) {
      case 'NUMBER':
        return node.value;
      case 'VARIABLE':
        const variableValue = this.#view.getVariableValue(node.value);

        if (isNaN(variableValue)) {
          throw new Error('Variavel nao pode possuir valor nao numerico');
        }

        return parseFloat(variableValue);
      case 'EXPRESSION':
        const left = this.#evaluate.apply(this, [node.left]);
        const right = this.#evaluate.apply(this, [node.right]);
        switch (node.value.value) {
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
      const root = this.#buildTree(tokens);
      this.#view.showResult(this.#evaluate(root));
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
