import HeaderComponent from './components/Header'
import TodoContainerComponent from './components/TodoContainer'

let headerComponent = new HeaderComponent(document.getElementById('header'));
headerComponent.render();

let todoContainerComponent = new TodoContainerComponent(document.getElementById('main'));
todoContainerComponent.render();