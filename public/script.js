const notesContainer = document.getElementById("notes");
const themeItems = document.querySelectorAll(".theme-item");
const createNoteModal = document.getElementById("create-note-modal");
const submitNoteButton = document.getElementById("submitNote");
const nameInput = document.getElementById("name");
const anonymousCheckbox = document.getElementById("anonymous");
const loadMoreBtn = document.getElementById("load-more-btn");
const loadMoreContainer = document.getElementById("load-more-container");
let currentPage = 0;
const notesPerPage = 20;
// Tema
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

const savedTheme = localStorage.getItem("theme") || "dim";
setTheme(savedTheme);

themeItems.forEach((item) => {
  item.addEventListener("click", () => {
    const theme = item.getAttribute("data-theme");
    setTheme(theme);
  });
});
// Fetch Data
async function fetchNotes(page = 0) {
  if (page === 0) {
    notesContainer.innerHTML = `
      <div class="card bg-base-100 shadow-xl mb-4 animate-pulse">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <div class="w-32 h-6 skeleton rounded"></div>
            <div class="dropdown dropdown-end">
              <span tabindex="0" role="button" class="p-1">
                <i class="fa-solid fa-ellipsis-vertical text-gray-300"></i>
              </span>
            </div>
          </div>
          <div class="mt-4 w-full h-32 skeleton rounded"></div>
          <div class="card-actions justify-start mt-2">
            <div class="w-24 h-4 skeleton rounded"></div>
          </div>
        </div>
      </div>
    `;
  } else {
    loadMoreBtn.classList.add("loading");
  }

  try {
    const response = await axios.get(
      `/api/notes?limit=${notesPerPage}&skip=${page * notesPerPage}`
    );
    const notes = response.data;

    if (page === 0) {
      notesContainer.innerHTML = "";
    }

    notes.forEach((note) => {
const noteElement = document.createElement("div");
noteElement.innerHTML = `
  <div id=${note._id} key=${
  note._id
} class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 mb-4">
    <div class="card-body">
      <div class="flex items-center justify-between">
        <h2 class="card-title text-primary">${note.name}</h2>
        <div class="dropdown dropdown-end">
          <span tabindex="0" role="button" class="p-1"><i class="fa-solid fa-ellipsis-vertical"></i></span>
          <ul tabindex="0" class="dropdown-content menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow">
            <li><a id="shareNote">Share</a></li>
            ${
              note.canEdit
                ? `
              <li><a>Edit</a></li>
              <li class="text-error"><a>Delete</a></li>
            `
                : ``
            }
          </ul>
        </div>
      </div>
      <span class="text-left text-base-content break-words overflow-hidden whitespace-pre-wrap">${formatMessage(
        note.message
      )}</span>

      ${
        note.imageUrl
          ? `<div class="max-h-96">
    <div class="relative pb-[133.33%]"> 
        <img 
            src="${note.imageUrl}" 
            alt="Posted image" 
            class="w-full h-96 object-cover object-fit rounded-lg"
            loading="lazy"
        />
    </div>
</div>`
          : ``
      }

      <div class="card-actions justify-end">
        <p class="text-sm opacity-50 mt-2">
          ${new Date(note.createdAt).toLocaleString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  </div>
`;
      notesContainer.appendChild(noteElement.firstElementChild);
    });
    
    

    if (notes.length < notesPerPage) {
      loadMoreContainer.style.display = "none";
    } else {
      loadMoreContainer.style.display = "block";
    }

    loadMoreBtn.classList.remove("loading");
  } catch (error) {
    console.error("Error fetching notes:", error);
    loadMoreBtn.classList.remove("loading");
  }
}

loadMoreBtn.addEventListener("click", () => {
  currentPage++;
  fetchNotes(currentPage);
});
//krim note
submitNoteButton.addEventListener("click", async () => {
  const name = nameInput.value;
  const message = document.getElementById("message").value;
  const secretCode = document.getElementById("secret-code").value;
  const anonymous = anonymousCheckbox.checked;
  const fileInput = document.getElementById("fileInput");
      
    if (message === "") {
      createNoteModal.close();
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Pesan harus di isi yaaa!!!",
      });
      return;
    }
  

  let imageUrl = "";

  submitNoteButton.disabled = true;
  submitNoteButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Mengirim...`;

  try {
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];

      const formData = new FormData();
      formData.append("photos", file);

      const uploadResponse = await fetch("https://api.zenn.my.id/api/tool/upload/image", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (uploadData.status && uploadData.result.length > 0) {
        imageUrl = uploadData.result[0].image_url;
      } else {
        throw new Error("Gagal mengunggah gambar.");
      }
    }
    

    const noteData = {
      name: anonymous ? "Someone" : name,
      message,
      secretCode,
      imageUrl, 
    };

    await axios.post("/api/notes", noteData);

    Swal.fire({
      title: "Berhasil",
      text: "Catatan berhasil dikirim.",
      icon: "success",
    });

    createNoteModal.close();
    currentPage = 0;
    fetchNotes();
  } catch (error) {
    createNoteModal.close();
    const errorMessage = error.response?.data?.errors?.[0]?.message || "Terjadi kesalahan.";
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: errorMessage,
    });
  } finally {
    submitNoteButton.disabled = false;
    submitNoteButton.innerHTML = `Kirim Catatan`;
  }
});


//someone 
anonymousCheckbox.addEventListener("change", () => {
  if (anonymousCheckbox.checked) {
    nameInput.disabled = true;
    nameInput.placeholder = "Someone"; 
    nameInput.classList.add("bg-gray-100", "cursor-not-allowed");
  } else {
    nameInput.disabled = false;
    nameInput.placeholder = "Nama Anda";
    nameInput.classList.remove("bg-gray-100", "cursor-not-allowed");
  }
});

// Initial fetch
fetchNotes();

// Format Message
function formatMessage(message) {
  let formattedMessage = message.replace(/\n/g, "<br>");

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  formattedMessage = formattedMessage.replace(urlRegex, function (url) {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url}</a>`;
  });

  return formattedMessage;
}

// Hapus Catatan
async function deleteNote(id) {
  const { value: secretCode } = await Swal.fire({
    title: "Masukan Kode Rahasia",
    input: "text",
    inputLabel: "Secret Code",
    inputPlaceholder:
      "Masukan kode rahasia yang anda masukan saat membuat catatan",
    confirmButtonText: "Hapus",
    cancelButtonText: "Batal",
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return "kamu harus memasukan kode rahasia!";
      }
    },
  });

  if (secretCode) {
    try {
      const response = await axios.get(
        `/api/notes/delete/${id}?code=${secretCode}`
      );
      if (response.status === 200) {
        Swal.fire("Deleted!", "Catatan berhasil di hapus", "success");
        document.getElementById(id).remove();
      }
    } catch (error) {
      Swal.fire(
        "Error!",
        error.response.data.error ||
          "Failed to delete the note. Please check your secret code.",
        "error"
      );
    }
  }
}

notesContainer.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("li.text-error a");
  if (deleteButton) {
    const noteId = deleteButton.closest(".card").id;
    deleteNote(noteId);
  }

  const editButton = event.target.closest("li:not(.text-error) a");
  if (editButton && editButton.textContent === "Edit") {
    const noteId = editButton.closest(".card").id;
    editNote(noteId);
  }
});

// Edit Catatan
async function editNote(id) {
  const { value: secretCode } = await Swal.fire({
    title: "Masukan Kode Rahasia",
    input: "text",
    inputLabel: "Secret Code",
    inputPlaceholder:
      "Masukan kode rahasia yang anda masukan saat membuat catatan",
    confirmButtonText: "Edit",
    cancelButtonText: "Batal",
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return "You need to enter a secret code!";
      }
    },
  });

  if (secretCode) {
    try {
      const response = await axios.get(`/api/notes/${id}?code=${secretCode}`);
      if (response.status === 200) {
        const note = response.data;
        showEditNoteModal(note);
      }
    } catch (error) {
      Swal.fire(
        "Error!",
        error.response.data.error ||
          "Failed to edit the note. Please check your secret code.",
        "error"
      );
    }
  }
}
// Modal Edit Catatan
function showEditNoteModal(note) {
  document.getElementById("edit-note-id").value = note._id;
  document.getElementById("edit-name").value = note.name;
  document.getElementById("edit-message").value = note.message;
  document.getElementById("edit-secret-code").value = note.secretCode;
  document.getElementById("edit-secret-code").disabled = true;
  document.getElementById("edit-note-modal").showModal();
}

document
  .getElementById("editNoteForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const noteId = document.getElementById("edit-note-id").value;
    const name = document.getElementById("edit-name").value;
    const message = document.getElementById("edit-message").value;
    const secretCode = document.getElementById("edit-secret-code").value;

    try {
      const response = await axios.put(`/api/notes/${noteId}`, {
        name,
        message,
        secretCode,
      });
      if (response.status === 200) {
        Swal.fire("Success", "Catatan Berhasil Di Update", "success");
        document.getElementById("edit-note-modal").close();
        fetchNotes(0);
      }
    } catch (error) {
      Swal.fire(
        "Error",
        error.response.data.error || "Gagal Mengedit Catatan",
        "error"
      );
    }
  });

//  Share Catatan
notesContainer.addEventListener("click", (event) => {
  const shareButton = event.target.closest("li:first-child a");
  if (!shareButton) {
    return;
  }

  const noteId = event.target.closest(".card").id;
  const note = document.getElementById(noteId);
  const noteName = note.querySelector(".card-title").textContent;
  const noteMessage = note.querySelector(".text-base-content").textContent;

  const shareData = {
    title: `Catatan dari ${noteName}`,
    text: noteMessage,
    url: window.location.href + "#" + noteId,
  };

  if (navigator.share) {
    navigator.share(shareData);
  } else {
    const shareUrl = `whatsapp://send?text=${encodeURIComponent(
      `${noteMessage}`
    )}`;
    window.open(shareUrl, "_blank");
  }
});

// add gambar 
const fileInput = document.getElementById("fileInput");
    const filePreview = document.getElementById("filePreview");
    const addImageButton = document.getElementById("addImageButton");

    addImageButton.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", function () {
      if (this.files.length > 0) {
        const file = this.files[0];

        if (!file.type.startsWith("image/")) {
          alert("Hanya file gambar yang diperbolehkan!");
          this.value = "";
          return;
        }

        filePreview.innerHTML = `
          <div class="flex items-center alert alert-outline alert-primary-content mb-4">
            <i class="fas fa-file-image text-primary text-xl mr-2"></i>
            <span class="flex-1">${file.name}</span>
            <button id="removeFile" class="text-red-500 hover:text-red-700 text-lg">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `;

        document.getElementById("removeFile").addEventListener("click", function () {
          fileInput.value = ""; 
          filePreview.innerHTML = ""; 
        });
      }
    });