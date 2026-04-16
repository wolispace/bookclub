
let clubId = window.location.href;
clubId = clubId.replace(window.location.origin, '').replace('/', '');

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
        <div class="edit"><i class="fas fa-edit"></i></div>
      </div>`;
  });

  return html;
}

// The show starts here
document.addEventListener('DOMContentLoaded', () => {
  getClubData(clubId).then(response => response.json()).then(data => {
    addToTitle(data.name);
    const schedule = buildSchedule(data);
    addToSchedule(schedule);
  });

});