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

async function getComments(num=-1) {
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
    let img = document.createElement('img');
    img.setAttribute('src', '/images/blank.png');
    img.setAttribute('class', 'anon-icon');
    let elem = document.createElement("h2");
    elem.innerText = comments[i];
    div.appendChild(img);
    div.appendChild(elem);
    commentList.appendChild(div);
  }
}

async function deleteComments() {
    const response = await fetch('/delete-comments');
    getComments();
}
