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
  const commentList = document.getElementById('data-servlet');
  commentList.innerHTML = "";
  let parsedNum = parseInt(num);
  if (parsedNum === -1 || comments.length<parsedNum) {
      parsedNum = comments.length;
  }
  for(let i = 0; i<parsedNum; i++) {
    let div = document.createElement('div');
    div.setAttribute('class', 'total-comment');
    let innerDiv = document.createElement('div');
    innerDiv.setAttribute('class', 'comment-text');
    let img = document.createElement('img');
    img.setAttribute('src', comments[i][1]);
    img.setAttribute('class', 'anon-icon');
    let comment = document.createElement('h3');
    comment.innerText = comments[i][0];
    let name = document.createElement('p');
    name.innerText = comments[i][2];
    div.appendChild(img);
    innerDiv.appendChild(name);
    innerDiv.appendChild(comment);
    div.appendChild(innerDiv);
    commentList.appendChild(div);
  }
}

async function deleteComments() {
  const response = await fetch('/delete-comments');
  showComments();
}

function onSignIn(googleUser) {
  const blankProfile = document.getElementById('profile-box');
  const profile = googleUser.getBasicProfile();
  let input = document.createElement('input');
  const info = profile.getName() + " " + profile.getImageUrl() + " " + profile.getEmail();
  input.setAttribute('name', 'profile');
  input.setAttribute('value', info);
  blankProfile.appendChild(input);
  const button = document.getElementById('google-buttons');
  button.innerHTML = `
        <div id="sign-out" href="#" onclick="signOut()">
          <img id="google-logo" src="/images/google-logo.jpg">
          <p>Sign out</p>
        </div>`;
}

function signOut() {
  let auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    location.reload();
  });
  const button = document.getElementById('google-buttons');
  button.innerHTML = `<div class="g-signin2" data-onsuccess="onSignIn" data-theme="dark"></div>`;
}



