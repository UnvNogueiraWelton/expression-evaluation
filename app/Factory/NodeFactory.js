import Node from '../Model/Node.js';

export default class NodeFactory {
  create(type, value) {
    return new Node(type, value);
  }
}
