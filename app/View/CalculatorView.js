export default class CalculatorView {
  constructor({ form, result }) {
    this.form = document.querySelector(form);
    this.resultContainer = document.querySelector(result);
  }

  showResult(result) {
    this.resultContainer.innerText = `Resultado: ${result}`;
  }

  handleError(error) {
    alert(`${error}`);
    this.resultContainer.innerText = '';
  }

  getVariableValue(token) {
    return prompt(`Insira o valor da variável "${token}"`);
  }

  configure(callback) {
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const expression = e.target.expression.value;

        if (!expression) {
          alert('Insira uma expressão válida!');
          return;
        }

        callback(expression);
      });
    }
  }
}
