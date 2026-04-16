
let clubId = window.location.href;
clubId = clubId.replace(window.location.origin, '').replace('/', '');

let clubData = null;


function addToSchedule(html) {
  let bodyElement = document.querySelector(".schedule");
  bodyElement.innerHTML = html;
}

function addToTitle(string) {
  let titleElement = document.querySelector(".title");
  titleElement.innerHTML = string;
}

function getClubData($clubId) {
  return fetch(`?c=${$clubId}`);
}

function buildSchedule(clubData) {
  let html = '';
  Object.entries(clubData.events).forEach(([key, event]) => {
      const date = new Date(key.slice(0,4), key.slice(4,6) - 1, key.slice(6,8));
      const showdate = date.toLocaleString('default', { month: 'short' }); // "December", "September"
      const { host, location, book } = event;
      const showbook = book.replace(',', '<br>');
      html += `<div class="event as-row">
        <div class="datebox as-column">
          <div class="date">${showdate}</div>
          <div class="host">${host}</div>
        </div>
        <div class="titlebox as-column">
          <div class="book">${showbook}</div>
          <div class="location">${clubData.locations[location]}</div>
        </div>
        <div class="edit" onclick="editEvent('${key}')"><i class="fas fa-edit"></i></div>
      </div>`;
  });

  return html;
}

function showDialog(html) {
  const dialog = document.querySelector('.dialog');
  dialog.innerHTML = `<div class="dialog-close" onclick="closeDialog()">✕</div>${html}`;
  dialog.classList.add('visible');
}

function closeDialog() {
  document.querySelector('.dialog').classList.remove('visible');
}

function editEvent(key) {
  showDialog(editForm(key));
}

function editForm(key) {
  const event = clubData.events[key];
  console.log(event);
  let html = ``;
  html += inputField('book', event.book, 'book', 'book');
  return html;
}

function inputField(key, value, label, placeholder) {
  return `<div class="row">
    <label>${label}</label>
    <input type="text" name="${key}" value="${value}" placeholder="${placeholder}"></input>
  </div>
  `;
}


// The show starts here
document.addEventListener('DOMContentLoaded', async () => {
  const res = await getClubData(clubId);
  clubData = await res.json();
  addToTitle(clubData.name);
  addToSchedule(buildSchedule(clubData));
});