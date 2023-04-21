import { Component } from 'cc';

/**
 * provides static `instance` property 
 */
export abstract class SingletonController extends Component {
    static instance;
    onLoad() {
        SingletonController.instance = this
    }
}

