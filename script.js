const sidebarToggleBtns = document.querySelectorAll(".sidebar-toggle");
const sidebar = document.querySelector(".sidebar");
const searchForm = document.querySelector(".search-form");
const themeToggleBtn = document.querySelector(".theme-toggle");
const themeIcon = themeToggleBtn.querySelector(".theme-icon");

// Updates the theme icon based on current theme and sidebar state
const updateThemeIcon = () => {
  const isDark = document.body.classList.contains("dark-theme");
  themeIcon.textContent = sidebar.classList.contains("collapsed") ? (isDark ? "light_mode" : "dark_mode") : "dark_mode";
};

// Apply dark theme if saved or system prefers, then update icon
const savedTheme = localStorage.getItem("theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const shouldUseDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);

document.body.classList.toggle("dark-theme", shouldUseDarkTheme);
updateThemeIcon();

// Toggle between themes on theme button click
themeToggleBtn.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeIcon();
});

// Toggle sidebar collapsed state on buttons click
sidebarToggleBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    updateThemeIcon();
  });
});

// Expand the sidebar when the search form is clicked
searchForm.addEventListener("click", () => {
  if (sidebar.classList.contains("collapsed")) {
    sidebar.classList.remove("collapsed");
    searchForm.querySelector("input").focus();
  }
});

// Expand sidebar by default on large screens
if (window.innerWidth > 768) sidebar.classList.remove("collapsed");

// SwiperJS chỉ nên khởi tạo khi có .card-wrapper (slider), không nên khởi tạo khi chỉ có mini game
if (document.querySelector('.card-wrapper')) {
  new Swiper(".card-wrapper", {
    loop: true,
    spaceBetween: 30,

    // Pagination bullets
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      dynamicBullets: true,
    },

    // Navigation arrows
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },

    // Responsive breakpoints
    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
    },
  });
}

// --- MINI GAME LOGIC: ensure it runs in iframe or main window ---
function initMiniGame() {
  const cardsContainer = document.querySelector('.cards');
  if (!cardsContainer) return; // Chỉ chạy khi có mini game
  const cards = cardsContainer.querySelectorAll('.card');
  if (!cards.length) return;

  let matched = 0;
  let cardOne = null, cardTwo = null;
  let disableDeck = false;

  function flipCard(e) {
    const clickedCard = e.currentTarget;
    if (clickedCard === cardOne || disableDeck || clickedCard.classList.contains('flip')) return;
    clickedCard.classList.add('flip');
    if (!cardOne) {
      cardOne = clickedCard;
      return;
    }
    cardTwo = clickedCard;
    disableDeck = true;
    const cardOneImg = cardOne.querySelector('.back-view img').src;
    const cardTwoImg = cardTwo.querySelector('.back-view img').src;
    matchCards(cardOneImg, cardTwoImg);
  }

  function matchCards(img1, img2) {
    if (img1 === img2) {
      matched++;
      if (matched === cards.length / 2) {
        setTimeout(shuffleCard, 1000);
      }
      cardOne.removeEventListener('click', flipCard);
      cardTwo.removeEventListener('click', flipCard);
      cardOne = cardTwo = null;
      disableDeck = false;
    } else {
      setTimeout(() => {
        cardOne.classList.add('shake');
        cardTwo.classList.add('shake');
      }, 400);
      setTimeout(() => {
        cardOne.classList.remove('shake', 'flip');
        cardTwo.classList.remove('shake', 'flip');
        cardOne = cardTwo = null;
        disableDeck = false;
      }, 1200);
    }
  }

  function shuffleCard() {
    matched = 0;
    disableDeck = false;
    cardOne = cardTwo = null;
    let arr = [];
    for (let i = 1; i <= cards.length / 2; i++) {
      arr.push(i, i);
    }
    arr.sort(() => Math.random() - 0.5);
    cards.forEach((card, i) => {
      card.classList.remove('flip', 'shake');
      let imgTag = card.querySelector('.back-view img');
      imgTag.src = `images/img-${arr[i]}.png`;
      card.removeEventListener('click', flipCard);
      card.addEventListener('click', flipCard);
    });
  }

  shuffleCard();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMiniGame);
} else {
  initMiniGame();
}

// Tab switching logic for sidebar menu
const menuLinks = document.querySelectorAll(".menu-link");
const mainContents = document.querySelectorAll(".main-content");
menuLinks.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    menuLinks.forEach((l) => l.classList.remove("active"));
    this.classList.add("active");
    // Hide all main-content sections
    mainContents.forEach((content) => {
      content.classList.add("hidden");
      content.style.display = "none";
    });
    // Show the selected tab's content
    const label = this.querySelector(".menu-label")?.textContent.trim();
    if (label === "Dashboard") {
      document.getElementById("profile-content").classList.remove("hidden");
      document.getElementById("profile-content").style.display = "block";
    } else if (label === "Mini game") {
      document.getElementById("game-content").classList.remove("hidden");
      document.getElementById("game-content").style.display = "block";
      if (typeof initMiniGame === 'function') setTimeout(initMiniGame, 0);
    } else if (label === "Draw") {
      document.getElementById("draw-content").classList.remove("hidden");
      document.getElementById("draw-content").style.display = "block";
      if (typeof initDrawingBoard === 'function') setTimeout(initDrawingBoard, 0);
    } else if (label === "Piano") {
      document.getElementById("piano-content").classList.remove("hidden");
      document.getElementById("piano-content").style.display = "block";
  }
    else {
      // For other tabs, just show dashboard for now
      document.getElementById("profile-content").classList.remove("hidden");
      document.getElementById("profile-content").style.display = "block";
    }
  });
});

function initDrawingBoard() {
  const canvas = document.querySelector("#draw-content canvas"),
    toolBtns = document.querySelectorAll("#draw-content .tool"),
    fillColor = document.querySelector("#draw-content #fill-color"),
    sizeSlider = document.querySelector("#draw-content #size-slider"),
    colorBtns = document.querySelectorAll("#draw-content .colors .option"),
    colorPicker = document.querySelector("#draw-content #color-picker"),
    clearCanvas = document.querySelector("#draw-content .clear-canvas"),
    saveImg = document.querySelector("#draw-content .save-img");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let prevMouseX, prevMouseY, snapshot,
    isDrawing = false,
    selectedTool = "brush",
    brushWidth = 5,
    selectedColor = "#000";
  const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
  };
  // Đặt lại kích thước canvas mỗi lần mở tab
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  setCanvasBackground();
  const drawRect = (e) => {
    if(!fillColor.checked) {
      return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
  };
  const drawCircle = (e) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
  };
  const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
  };
  const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  };
  const drawing = (e) => {
    if(!isDrawing) return;
    ctx.putImageData(snapshot, 0, 0);
    if(selectedTool === "brush" || selectedTool === "eraser") {
      ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    } else if(selectedTool === "rectangle"){
      drawRect(e);
    } else if(selectedTool === "circle"){
      drawCircle(e);
    } else {
      drawTriangle(e);
    }
  };
  toolBtns.forEach(btn => {
    btn.onclick = () => {
      document.querySelector("#draw-content .options .active").classList.remove("active");
      btn.classList.add("active");
      selectedTool = btn.id;
    };
  });
  sizeSlider.onchange = () => brushWidth = sizeSlider.value;
  colorBtns.forEach(btn => {
    btn.onclick = () => {
      document.querySelector("#draw-content .options .selected").classList.remove("selected");
      btn.classList.add("selected");
      selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    };
  });
  colorPicker.onchange = () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
  };
  clearCanvas.onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
  };
  saveImg.onclick = () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
  };
  canvas.onmousedown = startDraw;
  canvas.onmousemove = drawing;
  canvas.onmouseup = () => isDrawing = false;
}




const pianoKeys = document.querySelectorAll(".piano-keys .key"),
volumeSlider = document.querySelector(".volume-slider input"),
keysCheckbox = document.querySelector(".keys-checkbox input");
const pianoContent = document.getElementById("piano-content");


let allKeys = [],
audio = new Audio(`tunes/a.wav`); // by default, audio src is "a" tune

const playTune = (key) => {
    audio.src = `tunes/${key}.wav`; // passing audio src based on key pressed 
    audio.play(); // playing audio

    const clickedKey = document.querySelector(`[data-key="${key}"]`); // getting clicked key element
    clickedKey.classList.add("active"); // adding active class to the clicked key element
    setTimeout(() => { // removing active class after 150 ms from the clicked key element
        clickedKey.classList.remove("active");
    }, 150);
}

pianoKeys.forEach(key => {
    allKeys.push(key.dataset.key); // adding data-key value to the allKeys array
    // calling playTune function with passing data-key value as an argument
    key.addEventListener("click", () => playTune(key.dataset.key));
});

const handleVolume = (e) => {
    audio.volume = e.target.value; // passing the range slider value as an audio volume
}

const showHideKeys = () => {
    // toggling hide class from each key on the checkbox click
    pianoKeys.forEach(key => key.classList.toggle("hide"));
}

const pressedKey = (e) => {
    // if the pressed key is in the allKeys array, only call the playTune function
    if(allKeys.includes(e.key)) playTune(e.key);
}

keysCheckbox.addEventListener("click", showHideKeys);
volumeSlider.addEventListener("input", handleVolume);
document.addEventListener("keydown", pressedKey);
