/**
* Template Name: NiceAdmin
* Template URL: https://bootstrapmade.com/nice-admin-bootstrap-admin-html-template/
* Updated: Apr 20 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    if (all) {
      select(el, all).forEach(e => e.addEventListener(type, listener))
    } else {
      select(el, all).addEventListener(type, listener)
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Sidebar toggle
   */
  if (select('.toggle-sidebar-btn')) {
    on('click', '.toggle-sidebar-btn', function(e) {
      select('body').classList.toggle('toggle-sidebar')
    })
  }

  /**
   * Search bar toggle
   */
  if (select('.search-bar-toggle')) {
    on('click', '.search-bar-toggle', function(e) {
      select('.search-bar').classList.toggle('search-bar-show')
    })
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Initiate tooltips
   */
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })

  /**
   * Initiate quill editors
   */
  if (select('.quill-editor-default')) {
    new Quill('.quill-editor-default', {
      theme: 'snow'
    });
  }

  if (select('.quill-editor-bubble')) {
    new Quill('.quill-editor-bubble', {
      theme: 'bubble'
    });
  }

  if (select('.quill-editor-full')) {
    new Quill(".quill-editor-full", {
      modules: {
        toolbar: [
          [{
            font: []
          }, {
            size: []
          }],
          ["bold", "italic", "underline", "strike"],
          [{
              color: []
            },
            {
              background: []
            }
          ],
          [{
              script: "super"
            },
            {
              script: "sub"
            }
          ],
          [{
              list: "ordered"
            },
            {
              list: "bullet"
            },
            {
              indent: "-1"
            },
            {
              indent: "+1"
            }
          ],
          ["direction", {
            align: []
          }],
          ["link", "image", "video"],
          ["clean"]
        ]
      },
      theme: "snow"
    });
  }

  /**
   * Initiate TinyMCE Editor
   */

  const useDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isSmallScreen = window.matchMedia('(max-width: 1023.5px)').matches;

  tinymce.init({
    selector: 'textarea.tinymce-editor',
    plugins: 'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons accordion',
    editimage_cors_hosts: ['picsum.photos'],
    menubar: 'file edit view insert format tools table help',
    toolbar: "undo redo | accordion accordionremove | blocks fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image | table media | lineheight outdent indent| forecolor backcolor removeformat | charmap emoticons | code fullscreen preview | save print | pagebreak anchor codesample | ltr rtl",
    autosave_ask_before_unload: true,
    autosave_interval: '30s',
    autosave_prefix: '{path}{query}-{id}-',
    autosave_restore_when_empty: false,
    autosave_retention: '2m',
    image_advtab: true,
    link_list: [{
        title: 'My page 1',
        value: 'https://www.tiny.cloud'
      },
      {
        title: 'My page 2',
        value: 'http://www.moxiecode.com'
      }
    ],
    image_list: [{
        title: 'My page 1',
        value: 'https://www.tiny.cloud'
      },
      {
        title: 'My page 2',
        value: 'http://www.moxiecode.com'
      }
    ],
    image_class_list: [{
        title: 'None',
        value: ''
      },
      {
        title: 'Some class',
        value: 'class-name'
      }
    ],
    importcss_append: true,
    file_picker_callback: (callback, value, meta) => {
      /* Provide file and text for the link dialog */
      if (meta.filetype === 'file') {
        callback('https://www.google.com/logos/google.jpg', {
          text: 'My text'
        });
      }

      /* Provide image and alt text for the image dialog */
      // if (meta.filetype === 'image') {
      //   callback('https://www.google.com/logos/google.jpg', {
      //     alt: 'My alt text'
      //   });
      // }

      /* Provide alternative source and posted for the media dialog */
      // if (meta.filetype === 'media') {
      //   callback('movie.mp4', {
      //     source2: 'alt.ogg',
      //     poster: 'https://www.google.com/logos/google.jpg'
      //   });
      // }
    },
    height: 600,
    image_caption: true,
    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
    noneditable_class: 'mceNonEditable',
    toolbar_mode: 'sliding',
    contextmenu: 'link image table',
    skin: useDarkMode ? 'oxide-dark' : 'oxide',
    content_css: useDarkMode ? 'dark' : 'default',
    content_style: 'body { font-family:Helvetica,Montserrat,sans-serif; font-size:14px }'
  });

  /**
   * Initiate Bootstrap validation check
   */
  // var needsValidation = document.querySelectorAll('.needs-validation')

  // Array.prototype.slice.call(needsValidation)
  //   .forEach(function(form) {
  //     form.addEventListener('submit', function(event) {
  //       if (!form.checkValidity()) {
  //         event.preventDefault()
  //         event.stopPropagation()
  //       }

  //       form.classList.add('was-validated')
  //     }, false)
  //   })

  /**
   * Initiate Datatables
   */
  const datatables = select('.datatable', true)
  datatables.forEach(datatable => {
    new simpleDatatables.DataTable(datatable, {
      perPageSelect: [5, 10, 15, ["All", -1]],
      columns: [{
          select: 2,
          sortSequence: ["desc", "asc"]
        },
        {
          select: 3,
          sortSequence: ["desc"]
        },
        {
          select: 4,
          cellClass: "green",
          headerClass: "red"
        }
      ]
    });
  })

  /**
   * Autoresize echart charts
   */
  const mainContainer = select('#main');
  if (mainContainer) {
    setTimeout(() => {
      new ResizeObserver(function() {
        select('.echart', true).forEach(getEchart => {
          echarts.getInstanceByDom(getEchart).resize();
        })
      }).observe(mainContainer);
    }, 200);
  }

})();

// ACCOUNT
// REPRESENTATIVE
document.addEventListener("DOMContentLoaded", function() {

  // ADD SUB-REPRESENTATIVE
  const addSubRepBtn =  document.getElementById('addSubRepBtn');
  const form = document.getElementById("addSubRepForm");
  addSubRepBtn.addEventListener('click', function () {

    // validation
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    let subRepName = document.getElementById('subRepInput');
    let subRepDept = document.getElementById('subRepDeptInput');

    const RepName = subRepName.value.trim();
    const RepDept = subRepDept.value.trim();

    // Create a new sub-representative entry
    const subRepEntry = document.createElement("div");
    subRepEntry.classList.add("sub-rep-entry", "mb-2");
    subRepEntry.innerHTML = `<strong>${RepName}</strong><br><span class="text-muted">${RepDept}</span>`
          ;

    document.getElementById("subRepList").appendChild(subRepEntry);

    // close modal 
    const addSubRepModal = document.getElementById('addSubRepModal');
    const addRepModal = bootstrap.Modal.getInstance(addSubRepModal);
    
    if (addRepModal) {
      // Clear input fields
      subRepName.value = "";
      subRepDept.value = "";

      addRepModal.hide();
    }

    addSubRepModal.addEventListener('hidden.bs.modal', () => {
      document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
      document.body.style.overflow = 'auto';
    }, { once: true });

  });

  // Reset modal content when closed
  document.getElementById("addSubRepModal").addEventListener("hidden.bs.modal", function () {
    subRepName.value = "";
    subRepDept.value = "";

  });

  // ensure proper display
  const addSubRep = document.getElementById('addSubRep');
  addSubRep.addEventListener("click", function () {
    form.classList.remove("was-validated");
    const addRepModalElement = document.getElementById('addSubRepModal')
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    const representativeModal = new bootstrap.Modal(addRepModalElement);
    representativeModal.show();
  });

  // EDIT SUB-REPRESENTATIVE
  $(document).ready(function () {
    $('#editRepTable').on('click', '.bi-pencil-square', function () {
      let row = $(this).closest('tr');
  
      let repName = row.find('td:eq(1)').text().trim();  
      let repDept = row.find('td:eq(2)').text().trim();  
  
      $('#editRepInput').val(repName);
      $('#editRepDeptInput').val(repDept);
  
      // Show the edit modal
      $('#editRow').modal('show');
    });
  });
  
  // EDIT MAIN REPRESENTATIVE
  const mainRepNameInput = document.getElementById('mainRepNameInput');
  const mainRepDeptInput = document.getElementById('mainRepDeptInput');
  const mainRepName = document.getElementById('mainRepName');
  const mainRepDept = document.getElementById('mainRepDept');

  const mainForm = document.getElementById("editMainRepForm");

  const saveMainRep = document.getElementById('saveMainRep');
  saveMainRep.addEventListener('click', function(){

    // validation
    if (!mainForm.checkValidity()) {
      mainForm.classList.add("was-validated");
      return;
    }

    const newMainName = mainRepNameInput.value.trim();
    const newMainDept = mainRepDeptInput.value.trim();

    if (mainRepNameInput && mainRepDeptInput){
      mainRepName.textContent = newMainName;
      mainRepDept.textContent = newMainDept;
    } 

    const editMainRepModal = document.getElementById('editMainRepModal');
    const editMainModal = bootstrap.Modal.getInstance(editMainRepModal);
    
    if (editMainModal) {
      mainRepNameInput.value = "";
      mainRepDeptInput.value = "";

      editMainModal.hide();
    }

    editMainModal.addEventListener('hidden.bs.modal', () => {
      document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
      document.body.style.overflow = 'auto';
    }, { once: true });

  });

  // Reset modal content when closed
  document.getElementById("editMainRepModal").addEventListener("hidden.bs.modal", function () {
    mainRepNameInput.value = "";
    mainRepDeptInput.value = "";

  });

  // ensure proper display
  const editMainRep = document.getElementById('editMainRep');
  editMainRep.addEventListener("click", function () {
    mainForm.classList.remove("was-validated");

    mainRepNameInput.value = mainRepName.textContent.trim();
    mainRepDeptInput.value = mainRepDept.textContent.trim();

    const editMainModalElement = document.getElementById('editMainRepModal')
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    const mainModal = new bootstrap.Modal(editMainModalElement);
    mainModal.show();
  });

  // logout
  const logout = document.getElementById("logoutBtn");
  logout.addEventListener('click', function(){
    window.location.href = "/";
  });


  // EDIT PROFILE
  const profileUpload = document.getElementById('uploadProfile');
  const deleteProfile = document.getElementById('deleteProfile');
  const profileInput = document.getElementById('profileInput');
  const profileImage = document.querySelector('.profile-img'); 
  
  // save changes
  const saveEdit = document.getElementById('editDetails');

  const usernameEdit = document.getElementById('usernameEdit');
  const companyNameEdit = document.getElementById('companyNameEdit');
  const companyAddressEdit = document.getElementById('companyAddressEdit');
  const emailEdit = document.getElementById('emailEdit');
  const repNameEdit = document.getElementById('repNameEdit');
  const phoneNumEdit = document.getElementById('phoneNumEdit');

  const username = document.getElementById('username');
  const companyName = document.getElementById('companyName');
  const companyAddress = document.getElementById('companyAddress');
  const email = document.getElementById('email');
  const representative = document.getElementById('representative');
  const phoneNumber = document.getElementById('phoneNumber');
  
  const formValidation = document.getElementById('editProfileForm');
  
  const headerProfileImg = document.getElementById('headerProfileImg');
  const ProfileImgDisplay = document.getElementById('profileDisplay');
  const defaultImage = "/assets/img/default-profile.png"; 

  let isEditing = false;
  let uploadedImageURL = defaultImage; 

  profileUpload.disabled = true;
  deleteProfile.disabled = true;

  saveEdit.addEventListener('click', function () {
    if (!isEditing) {
        profileUpload.disabled = false;
        deleteProfile.disabled = false;

        // upload profile
        profileUpload.addEventListener("click", function (event) {
          event.preventDefault(); 
          profileInput.click();
        });
        
        // Handle file selection
        profileInput.addEventListener("change", function (event) {
          if (event.target.files.length > 0) {
            const file = event.target.files[0];
            uploadedImageURL = URL.createObjectURL(file);
            profileImage.src = uploadedImageURL;
          }
        });

        deleteProfile.addEventListener('click', function(){
          profileImage.src = defaultImage; 
          profileInput.value = ""; 
        });

        usernameEdit.readOnly = false;
        companyNameEdit.readOnly = false;
        companyAddressEdit.readOnly = false;
        emailEdit.readOnly = false;
        repNameEdit.readOnly = false;
        phoneNumEdit.readOnly = false;

        usernameEdit.focus();
        saveEdit.textContent = "Save Changes"; 
    } else {
        // Validate form before saving
        if (!formValidation.checkValidity()) {
            formValidation.classList.add("was-validated");
            return;
        }

        // save values
        username.textContent = usernameEdit.value.trim();
        companyName.textContent = companyNameEdit.value.trim();
        companyAddress.textContent = companyAddressEdit.value.trim();
        email.textContent = emailEdit.value.trim();
        representative.textContent = repNameEdit.value.trim();
        phoneNumber.textContent = phoneNumEdit.value.trim();

        ProfileImgDisplay.src = uploadedImageURL;
        headerProfileImg.src = uploadedImageURL;

        usernameEdit.readOnly = true;
        companyNameEdit.readOnly = true;
        companyAddressEdit.readOnly = true;
        emailEdit.readOnly = true;
        repNameEdit.readOnly = true;
        phoneNumEdit.readOnly = true;

        saveEdit.textContent = "Edit Details";
    }
  
      isEditing = !isEditing;
  });
  
});

// QUOTATION
document.addEventListener("DOMContentLoaded", function() {
  // card/table dropdown
  const cardView = document.getElementById("card-view");
  const tableView = document.getElementById("table-view");
  const selectedViewText = document.getElementById("selected-view");
  const viewOptions = document.querySelectorAll(".view-option");

  viewOptions.forEach(option => {
    option.addEventListener("click", function(e) {
      e.preventDefault();
      const view = this.getAttribute("data-view");

      if (view === "card") {
        cardView.classList.remove("d-none");
        tableView.classList.add("d-none");
        selectedViewText.textContent = "Card View";
      } else {
        cardView.classList.add("d-none");
        tableView.classList.remove("d-none");
        selectedViewText.textContent = "Table View";
      }
    });
  });

  // delete table
  let selectedRow;

  document.querySelectorAll(".remove-row").forEach((btn) => {
    btn.addEventListener("click", function () {
      selectedRow = this.closest("tr"); 
    });
  });

  document.getElementById("deleteRow").addEventListener("click", function () {
    if (selectedRow) {
      selectedRow.remove(); 
      selectedRow = null; 
    }

    const deleteModal = bootstrap.Modal.getInstance(document.getElementById("deleteRowModal"));
    deleteModal.hide();
  });
  
});


// RFQ
// T&C textarea
const quill = new Quill('#editor',{
  modules: {
    toolbar: [
      ['bold', 'italic'],
      ['link', 'blockquote', 'code-block', 'image'],
      [{ list: 'ordered' }, { list: 'bullet' }],
    ],
  },
  theme: 'snow', 
});

// note textares
const quill2 = new Quill('#editor2',{
  modules: {
    toolbar: [
      ['bold', 'italic'],
      ['link', 'blockquote', 'code-block', 'image'],
      [{ list: 'ordered' }, { list: 'bullet' }],
    ],
  },
  theme: 'snow', 
});


// RFQ table
$(document).ready(function () {
  $("#addRowBtn").on("click", function (e) {
      e.preventDefault(); // Prevents page refresh

      let newRow = `
          <tr>
            <td><input type="text" class="form-control-plaintext border-bottom-custom" name="item_name"></td>
            <td><input type="text" class="form-control-plaintext border-bottom-custom" name="description"></td>
            <td><input type="text" class="form-control-plaintext border-bottom-custom" name="unit"></td>
            <td><input type="number" class="form-control-plaintext border-bottom-custom" name="quantity"></td>
            <td><input type="text" class="form-control-plaintext border-bottom-custom" name="special_request"></td>
            <td><input type="text" class="form-control-plaintext border-bottom-custom" name="unit_price"></td>
            <td>
                <button type="button" class="btn btn-danger btn-sm remove-row"><i class="bi bi-trash3"></i></button>
            </td>
        </tr>
      `;

      $("#tableBody").append(newRow);
  });

  // remove row
  $(document).on("click", ".remove-row", function () {
      $(this).closest("tr").remove();
  });
});

// file upload
document.addEventListener("DOMContentLoaded", function () {
  const fileUploadPreview = document.getElementById("fileUploadPreview");
  const fileUpload = document.getElementById("fileUpload");
  const fileUploadBtn = document.getElementById("fileUploadBtn");
  const uploadSaveBtn = document.getElementById("uploadSaveBtn");
  const attachBtn = document.getElementById("attachBtn");
  let uploadedFileName = null;

  fileUploadBtn.addEventListener("click", function () {
      fileUpload.click();
  });

  // Handle file selection
  fileUpload.addEventListener("change", function (event) {
      if (event.target.files.length > 0) {
          handleFile(event.target.files[0]);
      }
  });

  // Drag & Drop functionality
  fileUploadPreview.addEventListener("dragover", function (event) {
      event.preventDefault();
      fileUploadPreview.classList.add("drag-over");
  });

  fileUploadPreview.addEventListener("dragleave", function () {
      fileUploadPreview.classList.remove("drag-over");
  });

  fileUploadPreview.addEventListener("drop", function (event) {
      event.preventDefault();
      fileUploadPreview.classList.remove("drag-over");
      if (event.dataTransfer.files.length > 0) {
          handleFile(event.dataTransfer.files[0]);
      }
  });

  // Function to handle the file display
  function handleFile(file) {
      if (file) {
          uploadedFileName = file.name;
          fileUploadPreview.innerHTML = `
              <div class="file-preview">
                  <i class="bi bi-file-earmark-text"></i>
                  <p>${uploadedFileName}</p>
              </div>
          `;
      }
  }

  // save uploaded file
  uploadSaveBtn.addEventListener("click", function () {
    if (uploadedFileName) {
      const attachmentModalElement = document.getElementById('attachmentModal');
      const signatureModal = bootstrap.Modal.getInstance(attachmentModalElement);
      
      if (signatureModal) {
        signatureModal.hide();
      }
    
      attachmentModalElement.addEventListener('hidden.bs.modal', () => {
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
        document.body.style.overflow = 'auto';
    
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      }, { once: true });


        // Truncate long file names for the button
        let displayFileName = uploadedFileName.length > 20 
            ? uploadedFileName.substring(0, 17) + "..." 
            : uploadedFileName;

        attachBtn.innerHTML = `<i class="bi bi-paperclip me-1"></i> ${displayFileName}`;
    }
});

  // Reset modal content when closed
  document.getElementById("attachmentModal").addEventListener("hidden.bs.modal", function () {
      fileUploadPreview.innerHTML = `<span class="addIcon"><i class="bi bi-plus"></i></span><h4 class="mb-4 w400">Drag File</h4>`;

      uploadedFileName = null;
      fileUpload.value = ""; 
  });

  // Ensure clicking the attach button always reopens the file chooser
  attachBtn.addEventListener("click", function () {
    const signatureModalElement = document.getElementById('attachmentModal')
    // Remove lingering backdrops (if any)
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    const signatureModal = new bootstrap.Modal(signatureModalElement);
    signatureModal.show();
  });


});


// upload signature
document.addEventListener("DOMContentLoaded", function () {
  const uploadSignPreview = document.getElementById("uploadSignPreview");
  const fileInput = document.getElementById("fileInput");
  const uploadImgBtn = document.getElementById("uploadImgBtn");
  const saveButton = document.getElementById("saveButton");
  const signaturePreview = document.getElementById("signature-preview");
  let uploadedImage = null;

  uploadImgBtn.addEventListener("click", function () {
      fileInput.click(); 
  });

  // Handle file selection
  fileInput.addEventListener("change", function (event) {
      if (event.target.files.length > 0) {
          handleFile(event.target.files[0]);
      }
  });

  // Handle drag & drop
  uploadSignPreview.addEventListener("dragover", function (event) {
      event.preventDefault();
      uploadSignPreview.classList.add("drag-over");
  });

  uploadSignPreview.addEventListener("dragleave", function () {
      uploadSignPreview.classList.remove("drag-over");
  });

  uploadSignPreview.addEventListener("drop", function (event) {
      event.preventDefault();
      uploadSignPreview.classList.remove("drag-over");
      if (event.dataTransfer.files.length > 0) {
          handleFile(event.dataTransfer.files[0]);
      }
  });

  // Handle image display
  function handleFile(file) {
      if (file && file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = function (e) {
              uploadedImage = e.target.result;
              uploadSignPreview.innerHTML = `<img src="${uploadedImage}" class="img-fluid">`;
          };
          reader.readAsDataURL(file);
      }
  }

  // Save uploaded image to previewContainer
  saveButton.addEventListener("click", function () {

      if (uploadedImage) {
          const signatureModalElement = document.getElementById('signatureModal');
          const signatureModal = bootstrap.Modal.getInstance(signatureModalElement);
          
          if (signatureModal) {
            signatureModal.hide();
          }
        
          signatureModalElement.addEventListener('hidden.bs.modal', () => {
            document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
            document.body.style.overflow = 'auto';
        
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
          }, { once: true });
      
          const uploadSignBtn = document.getElementById('uploadSignBtn');
          const previewContainer = document.getElementById('previewContainer');
        
          uploadSignBtn.style.display = 'none';
          signPadBtn.style.display = 'none';

          signaturePreview.innerHTML = `<img src="${uploadedImage}" class="img-fluid">`;
          previewContainer.style.display = "block";
          document.getElementById("signatureModal").classList.remove("show");
          document.body.classList.remove("modal-open");
      }
  });

  // Reset modal content when closed
  document.getElementById("signatureModal").addEventListener("hidden.bs.modal", function () {
      uploadSignPreview.innerHTML = `<span class="addIcon"><i class="bi bi-plus"></i></span><h4 class="mb-4 w400">Drag File</h4>`;
      uploadedImage = null;
  });

  // Ensure modal resets properly when reopening
document.getElementById('uploadSignBtn').addEventListener('click', () => {
  const signatureModalElement = document.getElementById('signatureModal');

  // Remove lingering backdrops (if any)
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());

  const signatureModal = new bootstrap.Modal(signatureModalElement);
  signatureModal.show();
});

});


// signature pad
const canvas = document.getElementById('signature-pad');
const ctx = canvas.getContext('2d');
const clearButton = document.getElementById('clear');
const submitButton = document.getElementById('submit');

let writingMode = false;

canvas.width = 420;  
canvas.height = 200; 

// Initialize the drawing context properties
ctx.lineWidth = 2; 
ctx.lineJoin = ctx.lineCap = 'round';

let lastX, lastY, lastMidX, lastMidY;

canvas.addEventListener('pointerdown', (event) => {
  const { offsetX, offsetY } = getCanvasOffset(event);
  writingMode = true;
  lastX = offsetX;
  lastY = offsetY;
  lastMidX = offsetX;
  lastMidY = offsetY;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
});

canvas.addEventListener('pointerup', () => {
  writingMode = false;
});

canvas.addEventListener('pointermove', (event) => {
  if (!writingMode) return;

  const { offsetX, offsetY } = getCanvasOffset(event);

  // Quadratic Bézier curve to draw a smooth line
  const midX = (lastX + offsetX) / 2;
  const midY = (lastY + offsetY) / 2;

  // Smoothing the line using quadratic Bézier curve
  ctx.quadraticCurveTo(lastX, lastY, midX, midY);
  ctx.stroke();

  lastX = offsetX;
  lastY = offsetY;
});

canvas.addEventListener('pointerout', () => {
  writingMode = false;
});

// Function to get canvas offset relative to the canvas itself
function getCanvasOffset(event) {
  const rect = canvas.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;   
  const offsetY = event.clientY - rect.top;   
  return { offsetX, offsetY };
}

// refresh button
clearButton.addEventListener('click', (event) => {
  event.preventDefault();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// submit
submitButton.addEventListener('click', () => {
  const imageURL = canvas.toDataURL();
  const imgElement = document.createElement('img');
  imgElement.src = imageURL;
  imgElement.style.display = 'block';

  const signatureModalElement = document.getElementById('signaturePadModal');
  const signatureModal = bootstrap.Modal.getInstance(signatureModalElement);
  
  if (signatureModal) {
    signatureModal.hide();
  }

  signatureModalElement.addEventListener('hidden.bs.modal', () => {
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    document.body.style.overflow = 'auto';

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }, { once: true });

  // preview image 
  const previewArea = document.getElementById('signature-preview');
  const uploadSignBtn = document.getElementById('uploadSignBtn');
  const signPadBtn = document.getElementById('signPadBtn');
  const previewContainer = document.getElementById('previewContainer');

  uploadSignBtn.style.display = 'none';
  signPadBtn.style.display = 'none';
  previewContainer.style.display = 'block';

  previewArea.innerHTML = ''; 
  previewArea.appendChild(imgElement);
});

const closePreview = document.getElementById('closePreview');

closePreview.addEventListener('click', () => {
  const previewContainer = document.getElementById('previewContainer');
  const uploadSignBtn = document.getElementById('uploadSignBtn');
  const signPadBtn = document.getElementById('signPadBtn');

  previewContainer.style.display = 'none';
  uploadSignBtn.style.display = 'block';
  signPadBtn.style.display = 'block';
});

// Ensure modal resets properly when reopening
document.getElementById('signPadBtn').addEventListener('click', () => {
  const signatureModalElement = document.getElementById('signaturePadModal');

  // Remove lingering backdrops (if any)
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());

  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

  const signatureModal = new bootstrap.Modal(signatureModalElement);
  signatureModal.show();
});


// save/send form
document.getElementById('sendBtn').addEventListener('click', () => {
  window.location.href = "quotation"; 
});

document.getElementById('saveDraftBtn').addEventListener('click', () => {
  window.location.href = "quotation";
});


