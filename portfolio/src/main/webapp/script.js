// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

let slideIndex = 0;
showSlide(slideIndex);

/**
 * Goes to the previous or next slide in the slideshow
 */
function nextSlide(n) {
  slideIndex+=n
  showSlide(slideIndex);
}

/**
 * Displays the current slide
 */
function showSlide(n) {
  let slides = document.getElementsByClassName("slide");
  //Reset to slide 1 once past last slide
  if (n > slides.length-1) {
    slideIndex = 0;
  }
  //Set to last slide if go before first slide
  if (n < 0) {
    slideIndex = slides.length-1
  }
  for (let i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  slides[slideIndex].style.display = "block";
}

async function showComments(num=-1) {
  const response = await fetch('/data');
  const comments = await response.json();
  renderComments(comments, num);
}

function renderComments(comments, num) {
  const commentList = document.getElementById('data-servlet');
  const searchTerm = document.getElementById('search-text').value;
  commentList.innerHTML = "";
  let parsedNum = parseInt(num);
  if (parsedNum === -1 || comments.length<parsedNum) {
      parsedNum = comments.length;
  }
  let counter = 0;
  console.log(searchTerm);
  comments.forEach(elem => {
    if (counter < parsedNum && match(searchTerm, elem.text)) {
      const div = document.createElement('div');
      div.setAttribute('class', 'total-comment');
      const innerDiv = document.createElement('div');
      innerDiv.setAttribute('class', 'comment-text');
      const img = document.createElement('img');
      img.setAttribute('src', elem.image);
      img.setAttribute('class', 'anon-icon');
      const comment = document.createElement('h3');
      const text = document.createTextNode(elem.text);
      comment.appendChild(text);
      const name = document.createElement('p');
      const owner = document.createTextNode(elem.owner);
      name.appendChild(owner);
      div.appendChild(img);
      innerDiv.appendChild(name);
      innerDiv.appendChild(comment);
      div.appendChild(innerDiv);
      commentList.appendChild(div);
    }
    counter +=1;
  });
}

function match(searchTerm, comment) {
  searchTerm = searchTerm.toLowerCase();
  comment = comment.toLowerCase();
  return searchTerm === "" || comment.includes(searchTerm);
}

async function deleteComments() {
  const response = await fetch('/delete-comments');
  showComments();
}

function onSignIn(googleUser) {
  const blankProfile = document.getElementById('profile-box');
  const profile = googleUser.getBasicProfile();
  const input = document.createElement('input');
  const info = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
  input.setAttribute('name', 'profile-token');
  input.setAttribute('value', info);
  blankProfile.appendChild(input);
  const button = document.getElementById('google-buttons');
  button.innerHTML = '';
  const div = document.createElement('div');
  div.setAttribute('id', 'sign-out');
  div.setAttribute('href', '#');
  div.setAttribute('onclick', 'signOut()');
  const img = document.createElement('img');
  img.setAttribute('id', 'google-id');
  img.setAttribute('src', profile.getImageUrl());
  const p = document.createElement('p');
  p.innerText = 'Sign out';
  div.appendChild(img);
  div.appendChild(p);
  button.appendChild(div);
}

function signOut() {
  const auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    location.reload();
  });
  const button = document.getElementById('google-buttons');
  button.innerHTML = '';
  const div = document.createElement('div');
  div.setAttribute('class', 'g-signin2');
  div.setAttribute('data-onsuccess', 'onSignIn');
  div.setAttribute('data-theme', 'dark');
}