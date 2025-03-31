// REPRESENTATIVES
$(document).ready(function () {

    // ADD SUB-REPRESENTATIVE
    $('#addSubRepBtn').on('click', function () {
      const form = $('#addSubRepForm')[0];
  
      // validation
      if (!form.checkValidity()) {
        $(form).addClass('was-validated');
        return;
      }
  
      let subRepName = $('#subRepInput');
      let subRepDept = $('#subRepDeptInput');
  
      const RepName = subRepName.val().trim();
      const RepDept = subRepDept.val().trim();
  
      // sub-representative entry
      const subRepEntry = $('<div>')
        .addClass('sub-rep-entry mb-2')
        .html(`<strong>${RepName}</strong><br><span class='text-muted'>${RepDept}</span>`);
  
      $('#subRepList').append(subRepEntry);
  
      // close modal
      const addRepModal = bootstrap.Modal.getInstance($('#addSubRepModal')[0]);
      if (addRepModal) {
        subRepName.val('');
        subRepDept.val('');
        addRepModal.hide();
      }
  
      $('#addSubRepModal').one('hidden.bs.modal', function () {
        $('.modal-backdrop').remove();
        $('body').css('overflow', 'auto');
      });
    });
  
    // Reset modal content when closed
    $('#addSubRepModal').on('hidden.bs.modal', function () {
      $('#subRepInput, #subRepDeptInput').val('');
    });
  
    // Ensure proper display
    $('#addSubRep').on('click', function () {
      $('#addSubRepForm').removeClass('was-validated');
      $('.modal-backdrop').remove();
      new bootstrap.Modal($('#addSubRepModal')[0]).show();
    });
  
    // EDIT SUB-REPRESENTATIVE
    $('#editRepTable').on('click', '.bi-pencil-square', function () {
      let row = $(this).closest('tr');
      $('#editRepInput').val(row.find('td:eq(1)').text().trim());  
      $('#editRepDeptInput').val(row.find('td:eq(2)').text().trim());  
      $('#editRow').modal('show');
    });
  
    // EDIT MAIN REPRESENTATIVE
    $('#saveMainRep').on('click', function () {
      const mainForm = $('#editMainRepForm')[0];
      if (!mainForm.checkValidity()) {
        $(mainForm).addClass('was-validated');
        return;
      }
  
      $('#mainRepName').text($('#mainRepNameInput').val().trim());
      $('#mainRepDept').text($('#mainRepDeptInput').val().trim());
  
      const editMainModal = bootstrap.Modal.getInstance($('#editMainRepModal')[0]);
      if (editMainModal) {
        $('#mainRepNameInput, #mainRepDeptInput').val('');
        editMainModal.hide();
      }
  
      $('#editMainRepModal').one('hidden.bs.modal', function () {
        $('.modal-backdrop').remove();
        $('body').css('overflow', 'auto');
      });
    });
  
    // Reset modal content when closed
    $('#editMainRepModal').on('hidden.bs.modal', function () {
      $('#mainRepNameInput, #mainRepDeptInput').val('');
    });
  
    // Ensure proper display
    $('#editMainRep').on('click', function () {
      $('#editMainRepForm').removeClass('was-validated');
      $('#mainRepNameInput').val($('#mainRepName').text().trim());
      $('#mainRepDeptInput').val($('#mainRepDept').text().trim());
      $('.modal-backdrop').remove();
      new bootstrap.Modal($('#editMainRepModal')[0]).show();
    });
  
    // logout
    $('#logoutBtn').on('click', function () {
      window.location.href = '/';
    });
  
  });