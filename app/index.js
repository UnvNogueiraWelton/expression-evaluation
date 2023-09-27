import CalculatorController from './Controller/CalculatorController.js';
import CalculatorView from './View/CalculatorView.js';
import NodeFactory from './Factory/NodeFactory.js';

CalculatorController.initialize({
  view: new CalculatorView({
    form: 'form',
    result: '[data-result]',
  }),
  nodeFactory: new NodeFactory(),
});
