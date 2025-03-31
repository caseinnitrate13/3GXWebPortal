(function () {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    if (all) {
      select(el, all).forEach((e) => e.addEventListener(type, listener));
    } else {
      select(el, all).addEventListener(type, listener);
    }
  };

  /**
   * Easy on scroll event listener
   */
  const onscroll = (el, listener) => {
    el.addEventListener("scroll", listener);
  };

  /**
   * Sidebar toggle
   */
  if (select(".toggle-sidebar-btn")) {
    on("click", ".toggle-sidebar-btn", function (e) {
      select("body").classList.toggle("toggle-sidebar");
    });
  }

  /**
   * Back to top button
   */
  let backtotop = select(".back-to-top");
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add("active");
      } else {
        backtotop.classList.remove("active");
      }
    };
    window.addEventListener("load", toggleBacktotop);
    onscroll(document, toggleBacktotop);
  }

  /**
   * Initiate tooltips
   */
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  /**
   * Initiate Datatables
   */
  const datatables = select(".datatable", true);
  datatables.forEach((datatable) => {
    new simpleDatatables.DataTable(datatable, {
      perPageSelect: [5, 10, 15, ["All", -1]],
      columns: [
        {
          select: 2,
          sortSequence: ["desc", "asc"],
        },
        {
          select: 3,
          sortSequence: ["desc"],
        },
        {
          select: 4,
          cellClass: "green",
          headerClass: "red",
        },
      ],
    });
  });

  /**
   * Autoresize echart charts
   */
  const mainContainer = select("#main");
  if (mainContainer) {
    setTimeout(() => {
      new ResizeObserver(function () {
        select(".echart", true).forEach((getEchart) => {
          echarts.getInstanceByDom(getEchart).resize();
        });
      }).observe(mainContainer);
    }, 200);
  }
})();

document.addEventListener("DOMContentLoaded", function () {
  // SIDEBAR
  const quotation = document.getElementById("quotation");
  const account = document.getElementById("account");

  const path = window.location.pathname;

  if (path.includes("/quotation")) {
    quotation.classList.remove("collapsed");
    account.classList.add("collapsed");
  } else if (path.includes("/account")) {
    account.classList.remove("collapsed");
    quotation.classList.add("collapsed");
  }

  // REGISTER ACCOUNT
  document
    .getElementById("createAccount")
    .addEventListener("click", function (event) {
      event.preventDefault(); // Prevent page refresh

      const form = document.getElementById("registerForm");
      const regUsername = document.getElementById("regUsername");
      const regPassword = document.getElementById("regPassword");
      const confirmPassword = document.getElementById("confirmPassword");
      const regCompanyName = document.getElementById("regCompanyName");
      const regCompanyAddress = document.getElementById("regCompanyAddress");
      const regCompanyEmail = document.getElementById("regCompanyEmail");
      const busPermit = document.getElementById("busPermit");
      const regPhoneNum = document.getElementById("regPhoneNum");
      const regRepName = document.getElementById("regRepName");
      const validId = document.getElementById("validId");
      const acceptTerms = document.getElementById("acceptTerms");

      let isValid = true;

      function validateField(input, regex = null) {
        if (input.value.trim() === "") {
          input.classList.add("is-invalid");
          input.classList.remove("is-valid");
          isValid = false;
        } else if (regex && !regex.test(input.value)) {
          input.classList.add("is-invalid");
          input.classList.remove("is-valid");
          isValid = false;
        } else {
          input.classList.add("is-valid");
          input.classList.remove("is-invalid");
        }
      }

      // Username (10- alphanumeric characters)
      validateField(regUsername, /^[a-zA-Z0-9\s]{10,}$/);

      // Password validation (10-15 characters, at least one uppercase, one lowercase, one number, one special character)
      validateField(
        regPassword,
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/
      );

      // Confirm password validation
      if (
        confirmPassword.value.trim() === "" ||
        confirmPassword.value !== regPassword.value
      ) {
        confirmPassword.classList.add("is-invalid");
        confirmPassword.classList.remove("is-valid");
        isValid = false;
      } else {
        confirmPassword.classList.add("is-valid");
        confirmPassword.classList.remove("is-invalid");
      }

      // Company name validation (letters, numbers, and spaces)
      validateField(regCompanyName, /^[A-Za-z0-9\s]+$/);

      // Representative name validation (only letters and spaces)
      validateField(regRepName, /^[A-Za-z\s]+$/);

      // Company address validation (alphanumeric and common punctuation)
      validateField(regCompanyAddress, /^[A-Za-z0-9\s,.-]+$/);

      // Email validation
      validateField(
        regCompanyEmail,
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      );

      // Phone number validation (only digits)
      validateField(regPhoneNum, /^\d+$/);

      // Business permit validation
      if (busPermit.files.length === 0) {
        document.getElementById("busPermitError").style.display = "block";
        isValid = false;
      } else {
        document.getElementById("busPermitError").style.display = "none";
      }

      // Valid ID validation
      if (validId.files.length === 0) {
        document.getElementById("validIdError").style.display = "block";
        isValid = false;
      } else {
        const fileType = validId.files[0].type;
        if (!fileType.startsWith("image/")) {
          document.getElementById("validIdError").textContent =
            "Only image files are allowed.";
          document.getElementById("validIdError").style.display = "block";
          isValid = false;
        } else {
          document.getElementById("validIdError").style.display = "none";
        }
      }

      // Terms and conditions validation
      if (!acceptTerms.checked) {
        acceptTerms.classList.add("is-invalid");
        acceptTerms.classList.remove("is-valid");
        isValid = false;
      } else {
        acceptTerms.classList.add("is-valid");
        acceptTerms.classList.remove("is-invalid");
      }

      // Only redirect if all fields are valid
      if (isValid) {
        // DB CRUD - Inserting users
        const formData = new FormData();

        const repNamesArray = [
          {
            name: document.getElementById("regRepName").value,
            position: "Main Representative",
          },
        ];

        formData.append(
          "regUsername",
          document.getElementById("regUsername").value
        );
        formData.append(
          "regPassword",
          document.getElementById("regPassword").value
        );
        formData.append(
          "regCompanyName",
          document.getElementById("regCompanyName").value
        );
        formData.append(
          "regCompanyAddress",
          document.getElementById("regCompanyAddress").value
        );
        formData.append(
          "regCompanyEmail",
          document.getElementById("regCompanyEmail").value
        );
        formData.append("repNames", JSON.stringify(repNamesArray));
        formData.append(
          "regPhoneNum",
          document.getElementById("regPhoneNum").value
        );
        formData.append(
          "busPermit",
          document.getElementById("busPermit").files[0]
        );
        formData.append("validId", document.getElementById("validId").files[0]);

        fetch("/register", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              alert(data.message); // Show success message

              // Redirect based on response
              window.location.href = data.redirect || "/quotation"; // Redirect to index ("/") if pending, otherwise to "/quotation"
            } else {
              alert(data.message); // Show the actual error message from the backend
            }
          })
          .catch((error) => console.error("Error:", error));
      }
    });

  // File input label updates
  function truncateFileName(fileName, maxLength = 30) {
    if (fileName.length > maxLength) {
      return fileName.substring(0, maxLength) + "...";
    }
    return fileName;
  }

  document.getElementById("busPermit").addEventListener("change", function () {
    let label = document.getElementById("busPermitLabel");
    label.textContent = this.files.length
      ? truncateFileName(this.files[0].name)
      : "Upload Business Permit";
  });

  document.getElementById("validId").addEventListener("change", function () {
    let label = document.getElementById("validIdLabel");
    label.textContent = this.files.length
      ? truncateFileName(this.files[0].name)
      : "Upload Valid ID";
  });
});

// ACCOUNT
// REPRESENTATIVE
document.addEventListener("DOMContentLoaded", function () {
  // ADD SUB-REPRESENTATIVE
  const addSubRepBtn = document.getElementById("addSubRepBtn");
  const form = document.getElementById("addSubRepForm");

  addSubRepBtn.addEventListener("click", function () {
    let subRepName = document.getElementById("subRepInput");
    let subRepDept = document.getElementById("subRepDeptInput");

    let isValid = true;

    // Create a new sub-representative entry
    const subRepEntry = document.createElement("div");
    subRepEntry.classList.add("sub-rep-entry", "mb-2");
    subRepEntry.innerHTML = `<strong>${RepName}</strong><br><span class="text-muted">${RepDept}</span>`;

    document.getElementById("subRepList").appendChild(subRepEntry);

    // close modal
    const addSubRepModal = document.getElementById("addSubRepModal");
    const addRepModal = bootstrap.Modal.getInstance(addSubRepModal);

    if (addRepModal) {
      // Clear input fields
      subRepName.value = "";
      subRepDept.value = "";

      addRepModal.hide();
    }

    validateField(subRepName, /^[A-Za-z\s]+$/);
    validateField(subRepDept, /^[A-Za-z0-9\s]+$/);

    if (isValid) {
      const RepName = subRepName.value.trim();
      const RepDept = subRepDept.value.trim();

      // Create a new sub-representative entry
      const subRepEntry = document.createElement("div");
      subRepEntry.classList.add("sub-rep-entry", "mb-2");
      subRepEntry.innerHTML = `<strong>${RepName}</strong><br><span class="text-muted">${RepDept}</span>`;

      document.getElementById("subRepList").appendChild(subRepEntry);

      // close modal
      const addSubRepModal = document.getElementById("addSubRepModal");
      const addRepModal = bootstrap.Modal.getInstance(addSubRepModal);

      if (addRepModal) {
        // Clear input fields
        subRepName.value = "";
        subRepDept.value = "";

        addRepModal.hide();
      }

      addSubRepModal.addEventListener(
        "hidden.bs.modal",
        () => {
          document
            .querySelectorAll(".modal-backdrop")
            .forEach((backdrop) => backdrop.remove());
          document.body.style.overflow = "auto";
        },
        { once: true }
      );
    }
  });

  // Reset modal content when closed
  document
    .getElementById("addSubRepModal")
    .addEventListener("hidden.bs.modal", function () {
      subRepName.value = "";
      subRepDept.value = "";
    });

  // ensure proper display
  const addSubRep = document.getElementById("addSubRep");
  addSubRep.addEventListener("click", function () {
    form.classList.remove("was-validated");
    const addRepModalElement = document.getElementById("addSubRepModal");
    document
      .querySelectorAll(".modal-backdrop")
      .forEach((backdrop) => backdrop.remove());
    const representativeModal = new bootstrap.Modal(addRepModalElement);
    representativeModal.show();
  });

  // EDIT SUB-REPRESENTATIVE
  let selectedRow = null;

  document
    .getElementById("editRepTable")
    .addEventListener("click", function (event) {
      if (event.target.classList.contains("bi-pencil-square")) {
        selectedRow = event.target.closest("tr");

        repName = selectedRow.cells[1].textContent.trim();
        repDept = selectedRow.cells[2].textContent.trim();

        document.getElementById("editRepInput").value = repName;
        document.getElementById("editRepDeptInput").value = repDept;

        // Show the edit modal
        let editModal = new bootstrap.Modal(document.getElementById("editRow"));
        editModal.show();
      }
    });

  const saveRow = document.getElementById("saveRow");
  saveRow.addEventListener("click", function () {
    const editRow = document.getElementById("editRow");
    const editRowModal = bootstrap.Modal.getInstance(editRow);

    if (editRowModal) {
      editRowModal.hide();
    }

    if (selectedRow) {
      const newRepInput = document.getElementById("editRepInput").value.trim();
      const newRepDeptInput = document
        .getElementById("editRepDeptInput")
        .value.trim();
    }

    if (editRowModal) {
      editRowModal.hide();
    }
  });

  // close button (x)
  const xBtn = document.getElementById("xBtn");
  xBtn.addEventListener("click", function () {
    document
      .getElementById("editRow")
      .addEventListener("hidden.bs.modal", function () {
        if (selectedRow) {
          const newRepInput = document
            .getElementById("editRepInput")
            .value.trim();
          const newRepDeptInput = document
            .getElementById("editRepDeptInput")
            .value.trim();

          selectedRow.cells[1].textContent = newRepInput;
          selectedRow.cells[2].textContent = newRepDeptInput;
        }

        // Show the next modal
        let editSubRepModal = new bootstrap.Modal(
          document.getElementById("editSubRepModal")
        );
        editSubRepModal.show();

        document.getElementById("editSubRepModal").addEventListener(
          "hidden.bs.modal",
          function () {
            document
              .querySelectorAll(".modal-backdrop")
              .forEach((backdrop) => backdrop.remove());
            document.body.style.overflow = "auto";
          },
          { once: true }
        );
      });

    // cancel butto
    const cancelBtn = document.getElementById("cancelBtn");
    cancelBtn.addEventListener("click", function () {
      document.getElementById("editRow").addEventListener(
        "hidden.bs.modal",
        function () {
          document
            .querySelectorAll(".modal-backdrop")
            .forEach((backdrop) => backdrop.remove());
          document.body.style.overflow = "auto";
        },
        { once: true }
      );
    });

    // EDIT MAIN REPRESENTATIVE
    const mainRepNameInput = document.getElementById("mainRepNameInput");
    const mainRepDeptInput = document.getElementById("mainRepDeptInput");
    const mainRepName = document.getElementById("mainRepName");
    const mainRepDept = document.getElementById("mainRepDept");

    const mainForm = document.getElementById("editMainRepForm");

    const saveMainRep = document.getElementById("saveMainRep");
    saveMainRep.addEventListener("click", function () {
      // validation
      if (!mainForm.checkValidity()) {
        mainForm.classList.add("was-validated");
        return;
      }

      const newMainName = mainRepNameInput.value.trim();
      const newMainDept = mainRepDeptInput.value.trim();

      if (mainRepNameInput && mainRepDeptInput) {
        mainRepName.textContent = newMainName;
        mainRepDept.textContent = newMainDept;
      }

      const editMainRepModal = document.getElementById("editMainRepModal");
      const editMainModal = bootstrap.Modal.getInstance(editMainRepModal);

      if (editMainModal) {
        mainRepNameInput.value = "";
        mainRepDeptInput.value = "";

        editMainModal.hide();
      }

      editMainModal.addEventListener(
        "hidden.bs.modal",
        () => {
          document
            .querySelectorAll(".modal-backdrop")
            .forEach((backdrop) => backdrop.remove());
          document.body.style.overflow = "auto";
        },
        { once: true }
      );
    });

    // Reset modal content when closed
    document
      .getElementById("editMainRepModal")
      .addEventListener("hidden.bs.modal", function () {
        mainRepNameInput.value = "";
        mainRepDeptInput.value = "";
      });

    // ensure proper display
    const editMainRep = document.getElementById("editMainRep");
    editMainRep.addEventListener("click", function () {
      mainForm.classList.remove("was-validated");

      mainRepNameInput.value = mainRepName.textContent.trim();
      mainRepDeptInput.value = mainRepDept.textContent.trim();

      const editMainModalElement = document.getElementById("editMainRepModal");
      document
        .querySelectorAll(".modal-backdrop")
        .forEach((backdrop) => backdrop.remove());
      const mainModal = new bootstrap.Modal(editMainModalElement);
      mainModal.show();
    });

    // logout
    const logout = document.getElementById("logoutBtn");
    logout.addEventListener("click", function () {
      window.location.href = "/";
    });

    // EDIT PROFILE
    const profileUpload = document.getElementById("uploadProfile");
    const deleteProfile = document.getElementById("deleteProfile");
    const profileInput = document.getElementById("profileInput");
    const profileImage = document.querySelector(".profile-img");

    // save changes
    const saveEdit = document.getElementById("editDetails");

    const usernameEdit = document.getElementById("usernameEdit");
    const companyNameEdit = document.getElementById("companyNameEdit");
    const companyAddressEdit = document.getElementById("companyAddressEdit");
    const emailEdit = document.getElementById("emailEdit");
    const repNameEdit = document.getElementById("repNameEdit");
    const phoneNumEdit = document.getElementById("phoneNumEdit");

    const username = document.getElementById("username");
    const companyName = document.getElementById("companyName");
    const companyAddress = document.getElementById("companyAddress");
    const email = document.getElementById("email");
    const representative = document.getElementById("representative");
    const phoneNumber = document.getElementById("phoneNumber");

    const formValidation = document.getElementById("editProfileForm");

    const profilecompanyName = document.getElementById("profilecompanyName");
    const headerCompanyName = document.getElementById("headerCompanyName");
    const headerProfileImg = document.getElementById("headerProfileImg");
    const ProfileImgDisplay = document.getElementById("profileDisplay");
    const defaultImage = "/assets/img/default-profile.png";

    let isEditing = false;
    let uploadedImageURL = defaultImage;

    profileUpload.disabled = true;
    deleteProfile.disabled = true;

    saveEdit.addEventListener("click", function () {
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

        deleteProfile.addEventListener("click", function () {
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

        profilecompanyName.textContent = companyNameEdit.value.trim();
        headerCompanyName.textContent = companyNameEdit.value.trim();

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
  document.addEventListener("DOMContentLoaded", function () {
    // card/table dropdown
    const cardView = document.getElementById("card-view");
    const tableView = document.getElementById("table-view");
    const selectedViewText = document.getElementById("selected-view");
    const viewOptions = document.querySelectorAll(".view-option");

    viewOptions.forEach((option) => {
      option.addEventListener("click", function (e) {
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

      const deleteModal = bootstrap.Modal.getInstance(
        document.getElementById("deleteRowModal")
      );
      deleteModal.hide();
    });
  });

  // RFQ
  // T&C textarea
  const quill = new Quill("#editor", {
    modules: {
      toolbar: [
        ["bold", "italic"],
        ["link", "blockquote", "code-block", "image"],
        [{ list: "ordered" }, { list: "bullet" }],
      ],
    },
    theme: "snow",
  });

  // note textares
  const quill2 = new Quill("#editor2", {
    modules: {
      toolbar: [
        ["bold", "italic"],
        ["link", "blockquote", "code-block", "image"],
        [{ list: "ordered" }, { list: "bullet" }],
      ],
    },
    theme: "snow",
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
        const attachmentModalElement =
          document.getElementById("attachmentModal");
        const signatureModal = bootstrap.Modal.getInstance(
          attachmentModalElement
        );

        if (signatureModal) {
          signatureModal.hide();
        }

        attachmentModalElement.addEventListener(
          "hidden.bs.modal",
          () => {
            document
              .querySelectorAll(".modal-backdrop")
              .forEach((backdrop) => backdrop.remove());
            document.body.style.overflow = "auto";

            canvas
              .getContext("2d")
              .clearRect(0, 0, canvas.width, canvas.height);
          },
          { once: true }
        );

        // Truncate long file names for the button
        let displayFileName =
          uploadedFileName.length > 20
            ? uploadedFileName.substring(0, 17) + "..."
            : uploadedFileName;

        attachBtn.innerHTML = `<i class="bi bi-paperclip me-1"></i> ${displayFileName}`;
      }
    });

    // Reset modal content when closed
    document
      .getElementById("attachmentModal")
      .addEventListener("hidden.bs.modal", function () {
        fileUploadPreview.innerHTML = `<span class="addIcon"><i class="bi bi-plus"></i></span><h4 class="mb-4 w400">Drag File</h4>`;

        uploadedFileName = null;
        fileUpload.value = "";
      });

    // Ensure clicking the attach button always reopens the file chooser
    attachBtn.addEventListener("click", function () {
      const signatureModalElement = document.getElementById("attachmentModal");
      // Remove lingering backdrops (if any)
      document
        .querySelectorAll(".modal-backdrop")
        .forEach((backdrop) => backdrop.remove());
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
        const signatureModalElement = document.getElementById("signatureModal");
        const signatureModal = bootstrap.Modal.getInstance(
          signatureModalElement
        );

        if (signatureModal) {
          signatureModal.hide();
        }

        signatureModalElement.addEventListener(
          "hidden.bs.modal",
          () => {
            document
              .querySelectorAll(".modal-backdrop")
              .forEach((backdrop) => backdrop.remove());
            document.body.style.overflow = "auto";

            canvas
              .getContext("2d")
              .clearRect(0, 0, canvas.width, canvas.height);
          },
          { once: true }
        );

        const uploadSignBtn = document.getElementById("uploadSignBtn");
        const previewContainer = document.getElementById("previewContainer");

        uploadSignBtn.style.display = "none";
        signPadBtn.style.display = "none";

        signaturePreview.innerHTML = `<img src="${uploadedImage}" class="img-fluid">`;
        previewContainer.style.display = "block";
        document.getElementById("signatureModal").classList.remove("show");
        document.body.classList.remove("modal-open");
      }
    });

    // Reset modal content when closed
    document
      .getElementById("signatureModal")
      .addEventListener("hidden.bs.modal", function () {
        uploadSignPreview.innerHTML = `<span class="addIcon"><i class="bi bi-plus"></i></span><h4 class="mb-4 w400">Drag File</h4>`;
        uploadedImage = null;
      });

    // Ensure modal resets properly when reopening
    document.getElementById("uploadSignBtn").addEventListener("click", () => {
      const signatureModalElement = document.getElementById("signatureModal");

      // Remove lingering backdrops (if any)
      document
        .querySelectorAll(".modal-backdrop")
        .forEach((backdrop) => backdrop.remove());

      const signatureModal = new bootstrap.Modal(signatureModalElement);
      signatureModal.show();
    });
  });

  // signature pad
  const canvas = document.getElementById("signature-pad");
  const ctx = canvas.getContext("2d");
  const clearButton = document.getElementById("clear");
  const submitButton = document.getElementById("submit");

  let writingMode = false;

  canvas.width = 420;
  canvas.height = 200;

  // Initialize the drawing context properties
  ctx.lineWidth = 2;
  ctx.lineJoin = ctx.lineCap = "round";

  let lastX, lastY, lastMidX, lastMidY;

  canvas.addEventListener("pointerdown", (event) => {
    const { offsetX, offsetY } = getCanvasOffset(event);
    writingMode = true;
    lastX = offsetX;
    lastY = offsetY;
    lastMidX = offsetX;
    lastMidY = offsetY;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
  });

  canvas.addEventListener("pointerup", () => {
    writingMode = false;
  });

  canvas.addEventListener("pointermove", (event) => {
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

  canvas.addEventListener("pointerout", () => {
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
  clearButton.addEventListener("click", (event) => {
    event.preventDefault();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // submit
  submitButton.addEventListener("click", () => {
    const imageURL = canvas.toDataURL();
    const imgElement = document.createElement("img");
    imgElement.src = imageURL;
    imgElement.style.display = "block";

    const signatureModalElement = document.getElementById("signaturePadModal");
    const signatureModal = bootstrap.Modal.getInstance(signatureModalElement);

    if (signatureModal) {
      signatureModal.hide();
    }

    signatureModalElement.addEventListener(
      "hidden.bs.modal",
      () => {
        document
          .querySelectorAll(".modal-backdrop")
          .forEach((backdrop) => backdrop.remove());
        document.body.style.overflow = "auto";

        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      },
      { once: true }
    );

    // preview image
    const previewArea = document.getElementById("signature-preview");
    const uploadSignBtn = document.getElementById("uploadSignBtn");
    const signPadBtn = document.getElementById("signPadBtn");
    const previewContainer = document.getElementById("previewContainer");

    uploadSignBtn.style.display = "none";
    signPadBtn.style.display = "none";
    previewContainer.style.display = "block";

    previewArea.innerHTML = "";
    previewArea.appendChild(imgElement);
  });

  const closePreview = document.getElementById("closePreview");

  closePreview.addEventListener("click", () => {
    const previewContainer = document.getElementById("previewContainer");
    const uploadSignBtn = document.getElementById("uploadSignBtn");
    const signPadBtn = document.getElementById("signPadBtn");

    previewContainer.style.display = "none";
    uploadSignBtn.style.display = "block";
    signPadBtn.style.display = "block";
  });

  // Ensure modal resets properly when reopening
  document.getElementById("signPadBtn").addEventListener("click", () => {
    const signatureModalElement = document.getElementById("signaturePadModal");

    // Remove lingering backdrops (if any)
    document
      .querySelectorAll(".modal-backdrop")
      .forEach((backdrop) => backdrop.remove());

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    const signatureModal = new bootstrap.Modal(signatureModalElement);
    signatureModal.show();
  });

  // save/send form
  document.getElementById("sendBtn").addEventListener("click", () => {
    window.location.href = "quotation";
  });

  document.getElementById("saveDraftBtn").addEventListener("click", () => {
    window.location.href = "quotation";
  });
});
