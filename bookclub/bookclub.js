
let clubId = window.location.href;
clubId = clubId.replace(window.location.origin, '').replace('/bookclub/', '');

let clubData = null;
let newClub = false;


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
async function editEvent(key) {
  await refreshClubData();
  showDialog(editForm(key));
}

async function editClub() {
  await refreshClubData();
  showDialog(editClubForm(clubData));
}

async function refreshClubData() {
  const res = await getClubData(clubId);
  clubData = await res.json();
}

async function saveForm() {
  const dialog = document.querySelector('.dialog');
  const fields = dialog.querySelectorAll('input, select, textarea');
  const newData = {};
  fields.forEach(field => {
      const { name, value } = field;
      newData[name] = value;
  });

  if (newClub) {
    clubId = newClubId(newData.clubname);
  }

  // send this data to the server to sort out what to save
  fetch(`?c=${clubId}&d=${JSON.stringify(newData)}`).then(res => {
    if(res.ok) {
      location.reload();
    }}
  );  
}

async function addEvent() {
  await refreshClubData();
  const newDate = nextThirdWednesday();
  showDialog(editForm(newDate));
}


function deleteEvent() {
  if (confirm('Are you sure you want to delete this event?')) {
    const dialog = document.querySelector('.dialog');
    const altField = dialog.querySelector('input[name="alt"]');
    altField.value = 'DELETE';
    saveForm();
  }
}

function newClubId(clubname) {
  return clubname.split(' ').map(w => w[0].toLowerCase()).join('');
}

function buildBooks(books) {
  let html = '';
  if (!books || books.length < 1) {
    return html;
  }
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
  if (clubData.events.length < 1) {
    html += newEventButton();
    return html;
  }
  Object.entries(clubData.events).forEach(([key, event]) => {
      const date = keyToDate(key);
      const month = date.toLocaleString('default', { month: 'short' }); // "Apr"
      const weekday = date.toLocaleString('default', { weekday: 'short' }); // "Wed"
      const monthday = date.getDate(); // 15 // "December", "September"
      const { host, location, books } = event;

      const showlocation = event.alt !== '' ? event.alt : clubData.locations[location] ?? '';

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

  html += newEventButton();
  html += switchClubButton();
  return html;
}

function switchClubButton() {
  return `<div class="switchclub" onclick="switchClub()"><i class="fas fa-arrow-left"></i> Switch clubs</div>`;
}

function newEventButton () {
  return `<div class="addevent button addbutton" onclick="addEvent()">+ Add another event</div>`;
}

function nextThirdWednesday() {
    let lastKey = Object.keys(clubData.events).sort().at(-1);
    if (!lastKey) {
      // if there are no events, start from the 1st of next month
      const now = new Date();
      lastKey = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}01`;
    }
    const after = keyToDate(lastKey);

    // start from the 1st of the next month
    let d = new Date(after.getFullYear(), after.getMonth() + 1, 1);

    // find first Wednesday
    while (d.getDay() !== 3) d.setDate(d.getDate() + 1);

    // advance to 3rd Wednesday
    d.setDate(d.getDate() + 14);

    return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
}

function showDialog(html) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelector('.overlay').classList.add('visible');
  const dialog = document.querySelector('.dialog');
  dialog.innerHTML = `<div class="dialog-close" onclick="closeDialog()"><i class="fas fa-close"></i></div>${html}`;
  dialog.classList.add('visible');

  let deleteButton = html.includes('name="date"') ? `<div class="button" onclick="deleteEvent()">Delete</div>` : '';

  dialog.innerHTML +=`<div class="dialogbuttons">
    ${deleteButton}
    <div class="button" onclick="closeDialog()">Cancel</div>
    <div class="button" onclick="saveForm()">Save</div>
    </div>`;
}

function closeDialog() {
  document.querySelector('.overlay').classList.remove('visible');
  document.querySelector('.dialog').classList.remove('visible');
}

function editClubForm(clubData) {
  let html = `<div class="editform">`;
  html += makeInputRow('Club name', inputField('clubname', clubData.name, 'Bookclub name'));
  html += makeInputRow('Password', inputField('code', clubData.code, 'Secret password'));
  html += makeInputRow('Hosts', editList('hosts', clubData.members.map(m => m.name).join('\n'), 'Host names (one per line)'));
  html += makeInputRow('Locations', editList('locations', clubData.locations.join('\n'), 'Location names (one per line)'));
  html += '</div>';
  return html;
}

function addClub() {
  const blankClubData = {
    name: '',
    code: '',
    members: [],
    locations: []
  };

  newClub = true;
  
  showDialog(editClubForm(blankClubData));
}


function editForm(key) {
  const blankEvent = { host: '', location: '', alt: '', books: [
    { title: '', by: '', url: '' }
  ] };

  const event = clubData.events[key] || blankEvent;
  const date = keyToDate(key);
  const editDate = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); // "01 Feb 2026"
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
 if (!books || books.length < 1) {
    html += makeBookRow({ title: '', by: '', url: '' }, 0);
    return html;
 }

  for(const [index, book] of books.entries()) {
    html += makeBookRow(book, index);
  }
  html += `<div class="addbook button addbutton" onclick="addBook(${books.length})">+ Add another book</div>`;
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

function addBook(index) {
  const html = makeBookRow({ title: '', by: '', url: '' }, index);
  document.querySelector('.addbook').insertAdjacentHTML('beforebegin', html); 
}

function isNumeric(val) {
  return !isNaN(parseFloat(val)) && isFinite(val);
}

function selectList(sources, selected, name) {
  let html = `<select name="${name}"><option value=""></option>`;
  for( const source of sources) {
    const sameValue = source.key === 0 ? selected === 0 || selected === "0"
           : (source.key === "" && (selected === "" || selected == null))
           || source.key == selected;
           
    const isSelected = sameValue ? 'selected' : '';  
    if (isNumeric(source.key)) {
      console.log(`Comparing number [${source.key}]`);
    } 
    if (isNumeric(selected)) {
      console.log(`With number [${source.key}]`);
    } 
       
    if (sameValue) {
      console.log(`${name} Selected  [${source.key}] == [${selected}]`);
    }
    html += `<option value="${source.key}" ${isSelected}>${source.value}</option>`;
  }
  html += `</select>`;

  return html;
}

function editList(name, itemList, placeholder) {
  let items = itemList.split('\n');
  let html = '';
  html += `<textarea class="editlist" name="${name}" placeholder="${placeholder}">`;
  items.forEach((item, index) => {
    html += `${item}\n`;
  });
  html += `</textarea>`;
  return html;
}

function promptPassword() {
  let password = localStorage.getItem(clubId);
  if (password == clubData.code) {
    return true;
  }
  password = prompt('Enter password');
  if (password == clubData.code) {   
    localStorage.setItem(clubId, password);
    return true;
  }

  return false;
}

function switchClub() {
  localStorage.removeItem('clubId');
  window.location.href = '/bookclub/';
}

// The show starts here
document.addEventListener('DOMContentLoaded', async () => {
  if (!clubId) {
    const savedClub = localStorage.getItem('clubId');
    if (savedClub) {
      window.location.href = `/bookclub/${savedClub}`;
      return;
    }
  } else {
    localStorage.setItem('clubId', clubId);
  }
  if (!clubId) {
    return;
  }

  await refreshClubData();

  if (promptPassword()) {
    AddToClubTitle(clubData.name);
    addEditClubButton();
    addToSchedule(buildSchedule(clubData));
  }
});