
let clubId = window.location.href;
clubId = clubId.replace(window.location.origin, '').replace('/bookclub/', '');

let clubData = null;


function addToSchedule(html) {
  let bodyElement = document.querySelector(".schedule");
  bodyElement.innerHTML = html;
}

function AddToClubTitle(string) {
  let titleElement = document.querySelector(".clubtitle");
  titleElement.innerHTML = string;
}

function addEditClubButton() {
  let titleElement = document.querySelector("body");
  titleElement.innerHTML += `<div class="editclub" onclick="editClub()"><i class="fas fa-pencil"></i></div>`;
}


function getClubData($clubId) {
  return fetch(`?c=${$clubId}`);
}

function buildBooks(books) {
  let html = '';
  for (const book of books) {
    const link = book.url ? `<a href="${book.url}" target="_blank"><i class="fa fa-up-right-from-square"></i></a>` : '';
    const by = book.by ? `by ${book.by}` : '';
    html += `<div class="book">
       <div class="title">${book.title}</div>
       <div class="by">${by} ${link}</div>
    </div>`;
  }
  return html;

}

function buildSchedule(clubData) {
  let html = '';
  Object.entries(clubData.events).forEach(([key, event]) => {
      const date = keyToDate(key);
      const month = date.toLocaleString('default', { month: 'short' }); // "Apr"
      const weekday = date.toLocaleString('default', { weekday: 'short' }); // "Wed"
      const monthday = date.getDate(); // 15 // "December", "September"
      const { host, location, books } = event;

      const showlocation = event.alt !== '' ? event.alt : clubData.locations[location];

      const booksHtml = buildBooks(books);
      html += `<div class="event">
        <div class="datebox">
          <div class="date">
            <div class="monthday">${weekday} ${monthday}</div>
            <div class="month">${month}</div>
          </div>
          <div class="host">${host}</div>
        </div>
        <div class="bookbox">
          <div class="books">${booksHtml}</div>
          <div class="location">${showlocation}</div>
        </div>
        <div class="edit" onclick="editEvent('${key}')"><i class="fas fa-pencil"></i></div>
      </div>`;
  });

  return html;
}


function showDialog(html) {
  const dialog = document.querySelector('.dialog');
  dialog.innerHTML = `<div class="dialog-close" onclick="closeDialog()"><i class="fas fa-close"></i></div>${html}`;
  dialog.classList.add('visible');

  dialog.innerHTML +=`<div class="dialogbuttons">
    <div class="button" onclick="closeDialog()">Cancel</div>
    <div class="button" onclick="saveForm()">Save</div>
    </div>`;
}

function closeDialog() {
  document.querySelector('.dialog').classList.remove('visible');
}

function editEvent(key) {
  showDialog(editForm(key));
}

function editClub() {
  showDialog(editClubForm());
}

function saveForm() {
  const dialog = document.querySelector('.dialog');
  const fields = dialog.querySelectorAll('input, select, textarea');
  const newData = {};
  fields.forEach(field => {
      const { name, value } = field;
      newData[name] = value;
  });
  console.log(newData);
  // send this data to the server to sort out what to save
  fetch(`?c=${clubId}&d=${JSON.stringify(newData)}`).then(res => {
    if(res.ok) {
      location.reload();
    }}
  );  

}

function editClubForm() {
  let html = `<div class="editform">`;
  html += makeInputRow('Club name', inputField('clubname', clubData.name, 'Bookclub'));
  html += '</div>';
  return html;
}


function editForm(key) {
  console.log({clubData});
  const event = clubData.events[key];
  const date = keyToDate(key);
  const editDate = date.toLocaleDateString('default', { day: '2-digit', month: 'short', year: 'numeric' }); // "01 Feb 2026"
  const hostsSelect = makeHostSources();
  let html = `<div class="editform">`;
  html += makeInputRow('Date', inputField('date', editDate, 'DD MMM YYYY'));
  html += makeInputRow('Host', selectList(makeHostSources(), event.host, 'host'));
  html += makeInputRow('Location', selectList(makeLocationSources(), event.location, 'location'));
  html += makeInputRow('Alt', inputField('alt', event.alt, 'Alternate location'));
  
  html += makeBookRows(event.books);
  html += '</div>';
  return html;
}

function keyToDate(key) {
  return new Date(key.slice(0,4), key.slice(4,6) - 1, key.slice(6,8));
} 

function makeInputRow(label, html) {
  return `<div class="row">
    <div class="label">${label}</div>
    ${html}
  </div>
  `;

}

function inputField(key, value, placeholder) {
  return `<input type="text" name="${key}" value="${value}" placeholder="${placeholder}"></input>`;
}

/**
 * Takes clubData.members of [{name: "Clare"} ...]
 * @returns array of [{key: 1, value: "Clare"} ...]
 */
function makeHostSources() {
  return clubData.members.map((item) => ({ key: item.name, value: item.name }));
}
function makeLocationSources() {
  return clubData.locations.map((item, i) => ({ key: i, value: item }));
}

function makeBookRows(books) {
  let html = '';
  console.log(books);
  for(const [index, book] of books.entries()) {
    html += makeBookRow(book, index);
  }
  html += `<div class="addbook" onclick="addBook()">+ Add another book</div>`;
  return html;
}

function makeBookRow(book, index) {
  let html = '';
    html += makeInputRow('Title', inputField(`title-${index}`, book.title, 'Book title'));
    html += makeInputRow('By', inputField(`by-${index}`, book.by, 'Author'));
    html += makeInputRow('Url', inputField(`url-${index}`, book.url, 'Web link'));
    html += `<hr>`;
  return html;

}

function selectList(sources, selected, name) {
  console.log({sources, selected, name});
  let html = `<select name="${name}"><option></option>`;
  for( const source of sources) {
    const isSelected = source.key == selected ? 'selected' : '';
    html += `<option value="${source.key}" ${isSelected}>${source.value}</option>`;
  }
  html += `</select>`;

  return html;
}


// The show starts here
document.addEventListener('DOMContentLoaded', async () => {
  const res = await getClubData(clubId);
  clubData = await res.json();
  AddToClubTitle(clubData.name);
  addEditClubButton();
  addToSchedule(buildSchedule(clubData));
});