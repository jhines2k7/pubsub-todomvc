import EventStore from './EventStore'
import HeaderComponent from './components/TodoHeader'
import TodoContainerComponent from './components/TodoContainer'
import TodoContainerFooter from './components/TodoContainerFooter'

let eventStore = new EventStore();

let headerComponent = new HeaderComponent(document.getElementById('header'), eventStore);
headerComponent.render();

let todoContainerComponent = new TodoContainerComponent(document.getElementById('main'), eventStore);
todoContainerComponent.subscribe('sync', 'todo.add');
todoContainerComponent.subscribe('sync', 'todo.toggle.complete');
todoContainerComponent.subscribe('sync', 'todo.toggle.incomplete');
todoContainerComponent.subscribe('sync', 'todo.toggle.all.complete');
todoContainerComponent.subscribe('sync', 'todo.toggle.all.incomplete');

let todoContainerFooter = new TodoContainerFooter(document.getElementById('footer'), eventStore);
todoContainerFooter.subscribe('sync', 'todo.add');
todoContainerFooter.subscribe('sync', 'todo.toggle.complete');
todoContainerFooter.subscribe('sync', 'todo.toggle.incomplete');
todoContainerFooter.subscribe('sync', 'todo.toggle.all.complete');
todoContainerFooter.subscribe('sync', 'todo.toggle.all.incomplete');