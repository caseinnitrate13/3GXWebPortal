
(function () {
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
    on('click', '.toggle-sidebar-btn', function (e) {
      select('body').classList.toggle('toggle-sidebar')
    })
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
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })

  /**
   * Initiate Datatables
   */
  // const datatables = select('.datatable', true)
  // datatables.forEach(datatable => {
  //   new simpleDatatables.DataTable(datatable, {
  //     responsive: true,
  //     perPageSelect: [5, 10, 15, ["All", -1]],
  //     columns: [{
  //       select: 2,
  //       sortSequence: ["desc", "asc"]
  //     },
  //     {
  //       select: 3,
  //       sortSequence: ["desc"]
  //     },
  //     {
  //       select: 4,
  //       cellClass: "green",
  //       headerClass: "red"
  //     }
  //     ]
  //   });
  // })

  const datatables = document.querySelectorAll(".datatable");

  datatables.forEach(table => {
    new simpleDatatables.DataTable(table, {
      searchable: true,
      responsive: true,
      perPageSelect: [5, 10, 15, ["All", -1]],
      columns: [
        {
          select: 2,
          sortSequence: ["desc", "asc"]
        },
        {
          select: 3,
          sortSequence: ["desc"]
        },
      ]
    });
  });


  /**
   * Autoresize echart charts
   */
  const mainContainer = select('#main');
  if (mainContainer) {
    setTimeout(() => {
      new ResizeObserver(function () {
        select('.echart', true).forEach(getEchart => {
          echarts.getInstanceByDom(getEchart).resize();
        })
      }).observe(mainContainer);
    }, 200);
  }

})();

document.addEventListener('DOMContentLoaded', function () {

  // SIDEBAR
  const requestQuotation = document.getElementById('requestQuotation');
  const quotation = document.getElementById('quotations');
  const account = document.getElementById('account');

  const path = window.location.pathname;
  console.log(path);
  if(path.includes('/quotations')) {
    quotation.classList.remove('collapsed');
    account.classList.add('collapsed');
    requestQuotation.classList.add('collapsed');
    console.log('quoteations path');

   
  } else if (path.includes('/request-quotation')) {
    requestQuotation.classList.remove('collapsed');
    account.classList.add('collapsed');
    quotation.classList.add('collapsed');
    console.log('rfq path');

  } else if (path.includes('/account')) {
    account.classList.remove('collapsed');
    quotation.classList.add('collapsed');
    requestQuotation.classList.add('collapsed');
    console.log('account path');
  }


  // REGISTER ACCOUNT
  document.getElementById('createAccount').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent page refresh

    const form = document.getElementById('registerForm');
    const regUsername = document.getElementById('regUsername');
    const regPassword = document.getElementById('regPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const regCompanyName = document.getElementById('regCompanyName');
    const regCompanyAddress = document.getElementById('regCompanyAddress');
    const regCompanyEmail = document.getElementById('regCompanyEmail');
    const busPermit = document.getElementById('busPermit');
    const regPhoneNum = document.getElementById('regPhoneNum');
    const regRepName = document.getElementById('regRepName');
    const validId = document.getElementById('validId');
    const acceptTerms = document.getElementById('acceptTerms');


    let isValid = true;

    function validateField(input, regex = null) {
      if (input.value.trim() === "") {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        isValid = false;
      } else if (regex && !regex.test(input.value)) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        isValid = false;
      } else {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
      }
    }

    // Username (10- alphanumeric characters)
    validateField(regUsername, /^[a-zA-Z0-9\s]{10,}$/);

    // Password validation (10-15 characters, at least one uppercase, one lowercase, one number, one special character)
    validateField(regPassword, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/);

    // Confirm password validation
    if (confirmPassword.value.trim() === "" || confirmPassword.value !== regPassword.value) {
      confirmPassword.classList.add('is-invalid');
      confirmPassword.classList.remove('is-valid');
      isValid = false;
    } else {
      confirmPassword.classList.add('is-valid');
      confirmPassword.classList.remove('is-invalid');
    }

    // Company name validation (letters, numbers, and spaces)
    validateField(regCompanyName, /^[A-Za-z0-9\s]+$/);

    // Representative name validation (only letters and spaces)
    validateField(regRepName, /^[A-Za-z\s]+$/);

    // Company address validation (alphanumeric and common punctuation)
    validateField(regCompanyAddress, /^[A-Za-z0-9\s,.-]+$/);

    // Email validation
    validateField(regCompanyEmail, /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);

    // Phone number validation (only digits)
    validateField(regPhoneNum, /^\d+$/);

    // Business permit validation
    if (busPermit.files.length === 0) {
      document.getElementById('busPermitError').style.display = 'block';
      isValid = false;
    } else {
      document.getElementById('busPermitError').style.display = 'none';
    }

    // Valid ID validation
    if (validId.files.length === 0) {
      document.getElementById('validIdError').style.display = 'block';
      isValid = false;
    } else {
      const fileType = validId.files[0].type;
      if (!fileType.startsWith('image/')) {
        document.getElementById('validIdError').textContent = "Only image files are allowed.";
        document.getElementById('validIdError').style.display = 'block';
        isValid = false;
      } else {
        document.getElementById('validIdError').style.display = 'none';
      }
    }

    // Terms and conditions validation
    if (!acceptTerms.checked) {
      acceptTerms.classList.add('is-invalid');
      acceptTerms.classList.remove('is-valid');
      isValid = false;
    } else {
      acceptTerms.classList.add('is-valid');
      acceptTerms.classList.remove('is-invalid');
    }


    if (isValid) {

      // DB CRUD - Inserting users
      const formData = new FormData();

      const repNamesArray = [
        { name: document.getElementById('regRepName').value, position: "Authorized Representative" }
      ];

      formData.append('regUsername', document.getElementById('regUsername').value);
      formData.append('regPassword', document.getElementById('regPassword').value);
      formData.append('regCompanyName', document.getElementById('regCompanyName').value);
      formData.append('regCompanyAddress', document.getElementById('regCompanyAddress').value);
      formData.append('regCompanyEmail', document.getElementById('regCompanyEmail').value);
      formData.append('repNames', JSON.stringify(repNamesArray));
      formData.append('regPhoneNum', document.getElementById('regPhoneNum').value);
      formData.append('busPermit', document.getElementById('busPermit').files[0]);
      formData.append('validId', document.getElementById('validId').files[0]);

      fetch('/register', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // alert(data.message); 
            localStorage.setItem('user', JSON.stringify({ userID: data.userID }));

            window.location.href = data.redirect;
          } else {
            alert(data.message);
          }
        })
        .catch(error => console.error('Error:', error));
    }
  });


  // File input label updates
  function truncateFileName(fileName, maxLength = 30) {
    if (fileName.length > maxLength) {
      return fileName.substring(0, maxLength) + '...';
    }
    return fileName;
  }

  document.getElementById('busPermit').addEventListener('change', function () {
    let label = document.getElementById('busPermitLabel');
    label.textContent = this.files.length ? truncateFileName(this.files[0].name) : 'Upload Business Permit';
  });

  document.getElementById('validId').addEventListener('change', function () {
    let label = document.getElementById('validIdLabel');
    label.textContent = this.files.length ? truncateFileName(this.files[0].name) : 'Upload Valid ID';
  });

});

document.addEventListener("DOMContentLoaded", function () {
  // INITIAL REGISTRATION
  document.getElementById('reloadBtn')?.addEventListener('click', async function () {
    try {
      const storedUser = localStorage.getItem('user');
      console.log('stored user', storedUser);


      if (!storedUser) {
        alert('No user found. Please log in again.');
        window.location.href = "/";
        return;
      }

      const user = JSON.parse(storedUser);
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: user.userID })
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = data.redirect;
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error checking account status:', error);
      alert('An error occurred while checking your account status.');
    }
  });

  // LOGIN | INDEX
  document.getElementById('loginBtn')?.addEventListener('click', async function (event) {
    event.preventDefault();

    const loginUsername = document.getElementById('loginUsername');
    const loginPassword = document.getElementById('loginPassword');

    if (!loginUsername || !loginPassword) return;

    let isValid = true;

    function validateField(input) {
      if (input.value.trim() === "") {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        isValid = false;
      } else {
        // input.classList.add('is-valid');
        input.classList.remove('is-invalid');
      }
    }

    validateField(loginUsername);
    validateField(loginPassword);

    if (isValid) {
      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: loginUsername.value,
            password: loginPassword.value
          }),
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.href = data.redirect || "/request-quotation";
        } else {
          showModal(data.message);
        }
      } catch (error) {
        console.error('Login failed:', error);
        showModal('An error occurred during login');
      }
    }

    function showModal(message) {
      const modalBody = document.getElementById('alertModalBody');
      modalBody.textContent = message;
    
      const modal = new bootstrap.Modal(document.getElementById('alertModal'));
      modal.show();
    }

  });


});

// ACCOUNT

//USER DETAILS
document.addEventListener("DOMContentLoaded", () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userID = storedUser?.userID;

  if (!userID) {
    console.error("User not logged in");
    return;
  }

  fetch(`/user-details?userID=${userID}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const isQuotationPage = location.pathname === '/request-quotation';
        const isAccountPage = location.pathname === '/account';
        const isRFQFormPage = location.pathname === '/request-for-quotation-form';

        if (isQuotationPage || isRFQFormPage) {
          document.getElementById("headerCompanyName").textContent = data.user.companyName;
          document.getElementById("toggleCompanyName").textContent = data.user.companyName;
        } else if (isAccountPage) {
          document.getElementById("username").textContent = data.user.username;
          document.getElementById("companyName").textContent = data.user.companyName;
          document.getElementById("companyAddress").textContent = data.user.companyAddress;
          document.getElementById("email").textContent = data.user.companyEmail;

          let repArray = [];
          try {
            repArray = JSON.parse(data.user.repNames);
          } catch (e) {
            console.error("Failed to parse repNames:", e);
          }

          let repName = 'No representative found';
          let repPosition = 'No position found';
          if (Array.isArray(repArray) && repArray.length > 0) {
            repName = repArray[0]?.name || repName;
            repPosition = repArray[0]?.position || repPosition;
          }

          document.getElementById("representative").textContent = repName;
          document.getElementById("mainRepName").textContent = repName;
          document.getElementById("mainRepDept").textContent = repPosition;
          document.getElementById("phoneNumber").textContent = data.user.repNum;
          document.getElementById("profilecompanyName").textContent = data.user.companyName;
          document.getElementById("headerCompanyName").textContent = data.user.companyName;
          document.getElementById("toggleCompanyName").textContent = data.user.companyName;

          fetch(`/get-sub-reps?userID=${userID}`)
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                const subRepList = document.getElementById("subRepList");
                subRepList.innerHTML = "";

                const subReps = data.reps.slice(1);

                subReps.forEach(rep => {
                  const subRepEntry = document.createElement("div");
                  subRepEntry.classList.add("sub-rep-entry", "mb-2");
                  subRepEntry.innerHTML = `<strong>${rep.name}</strong><br><span class="text-muted">${rep.department}</span>`;
                  subRepList.appendChild(subRepEntry);
                });

                //Sub Reps List on Modal
                const editRepTableBody = document.querySelector("#editRepTable tbody");
                editRepTableBody.innerHTML = "";

                subReps.forEach((rep, index) => {
                  const row = document.createElement("tr");
                  row.innerHTML = `
                    <td><input type="checkbox" class="select-checkbox-business" title="select"></td>
                    <td>${rep.name}</td>
                    <td>${rep.department}</td>
                    <td class="d-flex justify-content-center align-items-center">
                      <div data-bs-toggle="tooltip" data-bs-placement="top" title="Delete">
                        <i class="bi bi-trash me-2 remove-row" data-bs-toggle="modal" data-bs-target="#deleteRowModal" data-rep-index="${index + 1}"></i>
                      </div>
                      <div data-bs-toggle="tooltip" data-bs-placement="top" title="Edit">
                        <i class="bi bi-pencil-square" data-bs-toggle="modal" data-bs-target="#editRow" data-rep-index="${index + 1}"></i>
                      </div>
                    </td>
                  `;
                  editRepTableBody.appendChild(row);
                });
              }
            })
            .catch(error => console.error("Error fetching sub-reps:", error));
        }
      } else {
        console.error("Error fetching user details:", data.message);
      }
    })
    .catch(error => console.error("Fetch error:", error));


});



// REPRESENTATIVE

document.addEventListener("DOMContentLoaded", function () {


  //MAIN REPRESENTATIVE
  document.getElementById("saveMainRep").addEventListener("click", async () => {
    const name = document.getElementById("mainRepNameInput").value.trim();
    const position = document.getElementById("mainRepDeptInput").value.trim();
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userID = storedUser?.userID;

    if (!name || !position) {
      alert("Please fill in both name and department.");
      return;
    }

    try {
      const response = await fetch('/update-representative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID,
          repIndex: 0,
          repData: { name, position }
        }),
      });

      const result = await response.json();

      if (result.success) {
        document.getElementById("mainRepName").textContent = name;
        document.getElementById("mainRepDept").textContent = position;
        document.getElementById("representative").textContent = name;

        const modal = bootstrap.Modal.getInstance(document.getElementById("editMainRepModal"));
        modal.hide();
        alert("Representative updated successfully!");
      } else {
        alert("Failed to update representative.");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Something went wrong.");
    }
  });


  // EDIT MAIN REPRESENTATIVE
  const mainRepNameInput = document.getElementById('mainRepNameInput');
  const mainRepDeptInput = document.getElementById('mainRepDeptInput');
  const mainRepName = document.getElementById('mainRepName');
  const mainRepDept = document.getElementById('mainRepDept');

  const mainForm = document.getElementById("editMainRepForm");
  const saveMainRep = document.getElementById('saveMainRep');

  saveMainRep.addEventListener('click', function () {
    let isValid = true;

    // Validation function
    function validateField(input, regex = null) {
      if (input.value.trim() === "") {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        isValid = false;
      } else if (regex && !regex.test(input.value)) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        isValid = false;
      } else {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
      }
    }

    validateField(mainRepNameInput, /^[A-Za-z\s]+$/);
    validateField(mainRepDeptInput, /^[A-Za-z0-9\s]+$/);

    if (isValid) {
      const newMainName = mainRepNameInput.value.trim();
      const newMainDept = mainRepDeptInput.value.trim();

      mainRepName.textContent = newMainName;
      mainRepDept.textContent = newMainDept;

      const editMainRepModal = document.getElementById('editMainRepModal');
      const editMainModal = bootstrap.Modal.getInstance(editMainRepModal);

      if (editMainModal) {
        editMainModal.hide();
      }

      // reset inputs and remove backdrop
      editMainRepModal.addEventListener('hidden.bs.modal', () => {
        mainRepNameInput.value = "";
        mainRepDeptInput.value = "";

        mainRepNameInput.classList.remove('is-valid', 'is-invalid');
        mainRepDeptInput.classList.remove('is-valid', 'is-invalid');

        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
        document.body.style.overflow = 'auto';
        document.body.style.paddingRight = '0px';
      }, { once: true });
    }
  });


  // ADD SUB-REPRESENTATIVE
  const addSubRepBtn = document.getElementById('addSubRepBtn');
  const form = document.getElementById("addSubRepForm");

  addSubRepBtn.addEventListener('click', function () {

    let subRepName = document.getElementById('subRepInput');
    let subRepDept = document.getElementById('subRepDeptInput');

    let isValid = true;

    function validateField(input, regex = null) {
      if (input.value.trim() === "") {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        isValid = false;
      } else if (regex && !regex.test(input.value)) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        isValid = false;
      } else {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
      }
    }

    validateField(subRepName, /^[A-Za-z\s]+$/);
    validateField(subRepDept, /^[A-Za-z0-9\s]+$/);

    if (isValid) {
      const RepName = subRepName.value.trim();
      const RepDept = subRepDept.value.trim();

      const subRepEntry = document.createElement("div");
      subRepEntry.classList.add("sub-rep-entry", "mb-2");
      subRepEntry.innerHTML = `<strong>${RepName}</strong><br><span class="text-muted">${RepDept}</span>`
        ;

      document.getElementById("subRepList").appendChild(subRepEntry);

      const newSubRep = {
        userID: JSON.parse(localStorage.getItem("user"))?.userID,
        rep: {
          name: RepName,
          position: "Sub Representative",
          department: RepDept
        }
      };

      fetch('/add-sub-rep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSubRep)
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log("Sub-representative added to database.");
          } else {
            console.error("Failed to update sub-representative:", data.message);
          }
        })
        .catch(error => {
          console.error("Error sending sub-representative data:", error);
        });


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
    }
  });

  // Reset modal content when closed
  document.getElementById("addSubRepModal").addEventListener("hidden.bs.modal", function () {
    let subRepName = document.getElementById('subRepInput');
    let subRepDept = document.getElementById('subRepDeptInput');

    subRepName.value = "";
    subRepDept.value = "";

    subRepName.classList.remove("is-valid", "is-invalid");
    subRepDept.classList.remove("is-valid", "is-invalid");

    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0px';
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
  let selectedRow = null;

  document.getElementById("editRepTable").addEventListener("click", function (event) {
    if (event.target.classList.contains("bi-pencil-square")) {
      selectedRow = event.target.closest("tr");

      repName = selectedRow.cells[1].textContent.trim();
      repDept = selectedRow.cells[2].textContent.trim();

      document.getElementById("editRepInput").value = repName;
      document.getElementById("editRepDeptInput").value = repDept;

      document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());

      let editModal = new bootstrap.Modal(document.getElementById("editRow"));
      editModal.show();
    }
  });

  const saveRow = document.getElementById("saveRow");
  saveRow.addEventListener("click", function () {
    const editRow = document.getElementById("editRow");
    const editRowModal = bootstrap.Modal.getInstance(editRow);
    const newRepInput = document.getElementById("editRepInput");
    const newRepDeptInput = document.getElementById("editRepDeptInput");

    let isValid = true;

    function validateField(input, regex = null) {
      if (input.value.trim() === "") {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        isValid = false;
      } else if (regex && !regex.test(input.value)) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        isValid = false;
      } else {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
      }
    }

    // Validate fields
    validateField(newRepInput, /^[A-Za-z\s]+$/);
    validateField(newRepDeptInput, /^[A-Za-z0-9\s]+$/);

    if (isValid) {
      const newRepname = newRepInput.value.trim();
      const newRepDept = newRepDeptInput.value.trim();

      if (selectedRow) {
        selectedRow.cells[1].textContent = newRepname;
        selectedRow.cells[2].textContent = newRepDept;
      }

      if (editRowModal) {
        newRepInput.classList.remove('is-valid');
        newRepDeptInput.classList.remove('is-valid');
        editRowModal.hide();
      }

      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userID = storedUser?.userID;

  
      fetch(`/get-sub-reps?userID=${userID}`)
        .then(response => response.json())
        .then(data => {
          if (data.success && data.reps) {
            const currentRepNames = data.reps;
            const subRepIndex = selectedRow.rowIndex; 
            if (currentRepNames && currentRepNames[subRepIndex]) {
              currentRepNames[subRepIndex] = {
                name: newRepname,
                department: newRepDept
              };

              fetch("/update-representative", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  userID,
                  repIndex: subRepIndex,
                  repData: {
                    name: newRepname,
                    department: newRepDept
                  }
                })
              })
                .then(response => response.json())
                .then(updateData => {
                  if (updateData.success) {
                    console.log("Sub-representative updated successfully.");
                  } else {
                    console.error("Failed to update sub-representative:", updateData.message);
                  }
                })
                .catch(error => {
                  console.error("Error sending update:", error);
                });
            }
          } else {
            console.error("Failed to fetch current representatives");
          }
        })
        .catch(error => {
          console.error("Error fetching current sub-representatives:", error);
        });
    }
  });


  // editSubRepModal close backdrop 
  document.getElementById("editSubRepModal").addEventListener("hidden.bs.modal", function () {
    document.body.classList.remove("modal-open");
    document.body.style.overflow = 'auto';
  });

  // editRow close backdrop 
  document.getElementById("editRow").addEventListener("hidden.bs.modal", function () {
    document.body.classList.remove("modal-open");
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0px';

    let editSubRepModal = new bootstrap.Modal(document.getElementById("editSubRepModal"));
    editSubRepModal.show();
  });


  // editSubRepModal close backdrop 
  document.getElementById("editMainRepModal").addEventListener("hidden.bs.modal", function () {
    document.body.classList.remove("modal-open");
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0px';
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
  logout.addEventListener('click', function () {
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

  const profilecompanyName = document.getElementById('profilecompanyName');
  const headerCompanyName = document.getElementById('headerCompanyName');
  const headerProfileImg = document.getElementById('headerProfileImg');
  const ProfileImgDisplay = document.getElementById('profileDisplay');
  const defaultImage = "/assets/img/account.png";

  let isEditing = false;
  let uploadedImageURL = defaultImage;

  profileUpload.disabled = true;
  profileUpload.style.pointerEvents = 'none';
  deleteProfile.disabled = true;
  deleteProfile.style.pointerEvents = 'none';

  saveEdit.addEventListener('click', function () {
    if (!isEditing) {
      profileUpload.disabled = false;
      profileUpload.style.pointerEvents = 'auto';
      deleteProfile.style.pointerEvents = 'auto';

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

      deleteProfile.addEventListener('click', function () {
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

      profileUpload.disabled = true;
      profileUpload.style.pointerEvents = 'none';
      deleteProfile.disabled = true;
      deleteProfile.style.pointerEvents = 'none';

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

  viewOptions.forEach(option => {
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

    const deleteModal = bootstrap.Modal.getInstance(document.getElementById("deleteRowModal"));
    deleteModal.hide();
  });

});


// RFQ
// T&C textarea
const quill = new Quill('#editor', {
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
const quill2 = new Quill('#editor2', {
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
                <button type="button" class="btn red btn-sm remove-row"><i class="bi bi-trash3"></i></button>
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
    document.body.style.overflow = "auto";
    document.body.style.paddingRight = "0px";

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
    document.body.style.overflow = "auto";
    document.body.style.paddingRight = "0px";
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

// restore scrolling 
document.getElementById("signaturePadModal").addEventListener("hidden.bs.modal", function () {
  document.body.style.overflow = "auto";
  document.body.style.paddingRight = "0px";
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
  window.location.href = "/request-quotation";
});

document.getElementById('saveDraftBtn').addEventListener('click', () => {
  window.location.href = "/request-quotation";
});
