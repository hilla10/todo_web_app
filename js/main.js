import TodoList from './todoList.js';
import TodoItem from './todoItem.js';

const toDoList = new TodoList();

// Launch app

const initApp = () => {
  // add listeners
  const itemEntryForm = document.getElementById('itemEntryForm');
  itemEntryForm.addEventListener('submit', processSubmission);

  const clearItems = document.getElementById('clearItems');
  clearItems.addEventListener('click', (event) => {
    const list = toDoList.getList();
    if (list.length) {
      const confirmed = confirm(
        'Are you sure you went to clear the entire list'
      );
      if (confirmed) {
        toDoList.clearList();
        // update persistent data
        updatePersistentData(toDoList.getList());
        refreshThePage();
      }
    }
  });
  // procedural
  // load list object
  loadListObject();
  // refresh the page
  refreshThePage();
};

// load list object
const loadListObject = () => {
  const storedList = localStorage.getItem('TodoList');
  if (typeof storedList !== 'string') return;
  const parsedList = JSON.parse(storedList);
  parsedList.forEach((itemObj) => {
    const newTodoItem = createNewItem(itemObj._id, itemObj._item);
    TodoList.addItemToList(newTodoItem);
  });
  renderList();
};

document.addEventListener('DOMContentLoaded', initApp);

const refreshThePage = () => {
  clearListDisplay();
  renderList();
  clearItemEntryField();
  setFocusOnItemEntry();
};

const clearListDisplay = () => {
  const parentElement = document.getElementById('listItems');
  deleteContents(parentElement);
};

const deleteContents = (parentElement) => {
  let child = parentElement.lastElementChild;
  while (child) {
    parentElement.removeChild(child);
    child = parentElement.lastElementChild;
  }
};

const renderList = () => {
  const list = toDoList.getList();
  list.forEach((item) => {
    buildListItem(item);
  });
};

const buildListItem = (item) => {
  const div = document.createElement('div');
  div.classList.add('item');
  const check = document.createElement('input');
  check.type = 'checkbox';
  check.id = item.getId();
  check.tabIndex = 0;
  addClickListenerToCheckbox(check);
  const label = document.createElement('label');
  label.htmlFor = item.getId();
  label.textContent = item.getItem();
  div.appendChild(check);
  div.appendChild(label);
  const container = document.getElementById('listItems');
  container.appendChild(div);
};

const addClickListenerToCheckbox = (checkbox) => {
  checkbox.addEventListener('click', (event) => {
    //remove from persistent data
    toDoList.removeItemFromList(checkbox.id);
    updatePersistentData(toDoList.getList());
    const removeText = getLabelText(checkbox.id);
    updateScreenReaderConfirmation(removeText, 'removed from list');
    setTimeout(() => {
      refreshThePage();
    }, 1500);
  });
};

const getLabelText = (checkboxId) => {
  return document.getElementById(checkboxId).nextElementSibling.textContent;
};

const updatePersistentData = (listArray) => {
  localStorage.setItem('TodoList', JSON.stringify(listArray));
};

const clearItemEntryField = () => {
  document.getElementById('newItem').value = '';
};

const setFocusOnItemEntry = () => {
  document.getElementById('newItem').focus();
};

const processSubmission = (event) => {
  event.preventDefault();
  const newEntryText = getNewEntry();
  if (!newEntryText.length) return;
  const nextItemId = calcNextItemId();
  const todoItem = createNewItem(nextItemId, newEntryText);
  toDoList.addItemToList(todoItem);
  // update persistent data
  updatePersistentData(toDoList.getList());
  updateScreenReaderConfirmation(newEntryText, 'add to list');
  refreshThePage();
};

const getNewEntry = () => {
  return document.getElementById('newItem').value.trim();
};

const calcNextItemId = () => {
  let nextItemId = 1;
  const list = toDoList.getList();
  if (list.length > 0) {
    nextItemId = list[list.length - 1].getId() + 1;
  }
  return nextItemId;
};

const createNewItem = (itemId, itemText) => {
  const toDo = new TodoItem();
  toDo.setId(itemId);
  toDo.setItem(itemText);
  return toDo;
};

const updateScreenReaderConfirmation = (newEntryText, actionVerb) => {
  const item = newEntryText.length > 15 ? 'item' : newEntryText;
  document.getElementById(
    'confirmation'
  ).textContent = `${item} ${actionVerb}.`;
};
