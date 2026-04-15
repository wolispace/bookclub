
let clubId = window.location.href;
clubId = clubId.replace(window.location.origin, '').replace('/', '');

console.log(window.location);



function addToContents(html) {
  let bodyElement = document.querySelector(".contents");
  bodyElement.insertAdjacentHTML('beforeend', html);
}

function addToTitle(string) {
  let titleElement = document.querySelector(".title");
  titleElement.innerHTML = string;
}

function getClubData($clubId) {
  return fetch(`?c=${$clubId}`);
}

// The show starts here
document.addEventListener('DOMContentLoaded', () => {
  getClubData(clubId).then(response => response.json()).then(data => {
    addToTitle(data.name);
  });

});