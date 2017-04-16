import HeaderComponent from './components/TodoHeader'
import TodoContainerComponent from './components/TodoContainer'
import TodoContainerFooter from './components/TodoContainerFooter'

let headerComponent = new HeaderComponent(document.getElementById('header'));
headerComponent.render();

let todoContainerComponent = new TodoContainerComponent(document.getElementById('main'));
todoContainerComponent.render();

let todoContainerFooter = new TodoContainerFooter(document.getElementById('footer'));
todoContainerFooter.render();