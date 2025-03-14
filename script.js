document.addEventListener("DOMContentLoaded", function () {
    const addTabButton = document.getElementById("addTab");
    const tabContainer = document.getElementById("tabs");
    const noteInput = document.getElementById("noteInput");
    const saveNoteButton = document.getElementById("saveNote");
    const clearNotesButton = document.getElementById("clearNotes");
    const imageUpload = document.getElementById("imageUpload");
    const notesContainer = document.getElementById("notes");

    const helpButton = document.getElementById("helpButton");
    const tutorial = document.getElementById("tutorial");
    const closeHelp = document.getElementById("closeHelp");

    let activeTab = null;

    // Help button toggle
    helpButton.addEventListener("click", () => {
        tutorial.style.display = tutorial.style.display === "none" ? "block" : "none";
    });

    closeHelp.addEventListener("click", () => {
        tutorial.style.display = "none";
    });

    addTabButton.addEventListener("click", function () {
        let tabName = prompt("Enter tab name:");
        if (tabName && !document.getElementById(`tab-${tabName}`)) {
            createTab(tabName);
            saveTabs();
        }
    });

    function createTab(tabName) {
        let tabButton = document.createElement("button");
        tabButton.textContent = tabName;
        tabButton.id = `tab-${tabName}`;
        tabButton.classList.add("tab");
        tabButton.onclick = function () {
            switchTab(tabName);
        };

        let deleteButton = document.createElement("span");
        deleteButton.textContent = " ✖";
        deleteButton.classList.add("deleteTabButton");
        deleteButton.onclick = function (event) {
            event.stopPropagation();
            if (confirm(`Delete tab "${tabName}"?`)) {
                tabButton.remove();
                deleteTab(tabName);
                saveTabs();
            }
        };

        tabButton.appendChild(deleteButton);
        tabContainer.appendChild(tabButton);
        switchTab(tabName);
    }

    function switchTab(tabName) {
        activeTab = tabName;
        document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
        document.getElementById(`tab-${tabName}`)?.classList.add("active");

        noteInput.value = localStorage.getItem(`note-${tabName}`) || "";
        loadImages(tabName);
        localStorage.setItem("activeTab", tabName);
    }

    saveNoteButton.addEventListener("click", function () {
        if (!activeTab) {
            alert("Select a tab first!");
            return;
        }
        localStorage.setItem(`note-${activeTab}`, noteInput.value);
        alert("Note saved!");
    });

    clearNotesButton.addEventListener("click", function () {
        if (!activeTab) {
            alert("Select a tab first!");
            return;
        }
        if (confirm("Clear this note?")) {
            noteInput.value = "";
            localStorage.removeItem(`note-${activeTab}`);
            notesContainer.innerHTML = "";
            localStorage.removeItem(`images-${activeTab}`);
        }
    });

    imageUpload.addEventListener("change", function (event) {
        if (!activeTab) {
            alert("Select a tab first!");
            return;
        }
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                saveImage(activeTab, e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    function saveImage(tabName, imageData) {
        let images = JSON.parse(localStorage.getItem(`images-${tabName}`)) || [];
        images.push({ src: imageData, width: 300, height: 200 });
        localStorage.setItem(`images-${tabName}`, JSON.stringify(images));
        loadImages(tabName);
    }

    function loadImages(tabName) {
        notesContainer.innerHTML = "";
        let images = JSON.parse(localStorage.getItem(`images-${tabName}`)) || [];
        images.forEach((image, index) => {
            let imgWrapper = document.createElement("div");
            imgWrapper.classList.add("image-wrapper");

            let img = document.createElement("img");
            img.src = image.src;
            img.classList.add("note-image");
            img.style.width = image.width + "px";
            img.style.height = image.height + "px";

            // Add arrows for resizing
            ["left", "right", "top", "bottom"].forEach(side => {
                let arrow = document.createElement("div");
                arrow.classList.add("resize-handle", `resize-${side}`);
                arrow.innerHTML = side === "top" || side === "bottom" ? "↕" : "↔";
                arrow.onmousedown = function (event) {
                    startResize(event, img, tabName, index, side);
                };
                imgWrapper.appendChild(arrow);
            });

            let deleteButton = document.createElement("button");
            deleteButton.textContent = "🗑";
            deleteButton.classList.add("deleteImageButton");
            deleteButton.onclick = function () {
                deleteImage(tabName, index);
            };

            imgWrapper.appendChild(img);
            imgWrapper.appendChild(deleteButton);
            notesContainer.appendChild(imgWrapper);
        });
    }

    function deleteImage(tabName, index) {
        let images = JSON.parse(localStorage.getItem(`images-${tabName}`)) || [];
        images.splice(index, 1);
        localStorage.setItem(`images-${tabName}`, JSON.stringify(images));
        loadImages(tabName);
    }

    function startResize(event, img, tabName, index, direction) {
        event.preventDefault();
        let startX = event.clientX;
        let startY = event.clientY;
        let startWidth = img.offsetWidth;
        let startHeight = img.offsetHeight;

        function resize(event) {
            if (direction === "right" || direction === "left") {
                let newWidth = startWidth + (direction === "right" ? event.clientX - startX : startX - event.clientX);
                img.style.width = newWidth + "px";
            } else {
                let newHeight = startHeight + (direction === "bottom" ? event.clientY - startY : startY - event.clientY);
                img.style.height = newHeight + "px";
            }

            let images = JSON.parse(localStorage.getItem(`images-${tabName}`)) || [];
            images[index].width = img.offsetWidth;
            images[index].height = img.offsetHeight;
            localStorage.setItem(`images-${tabName}`, JSON.stringify(images));
        }

        function stopResize() {
            document.removeEventListener("mousemove", resize);
            document.removeEventListener("mouseup", stopResize);
        }

        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", stopResize);
    }

    function saveTabs() {
        let tabs = [];
        document.querySelectorAll(".tab").forEach(tab => {
            tabs.push(tab.firstChild.textContent.trim());
        });
        localStorage.setItem("tabs", JSON.stringify(tabs));
    }

    function deleteTab(tabName) {
        localStorage.removeItem(`note-${tabName}`);
        localStorage.removeItem(`images-${tabName}`);
        let savedTabs = JSON.parse(localStorage.getItem("tabs")) || [];
        savedTabs = savedTabs.filter(name => name !== tabName);
        localStorage.setItem("tabs", JSON.stringify(savedTabs));
    }

    function loadTabs() {
        JSON.parse(localStorage.getItem("tabs") || "[]").forEach(createTab);
        switchTab(localStorage.getItem("activeTab"));
    }

    loadTabs();
});