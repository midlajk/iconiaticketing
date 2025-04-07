document.getElementById('mobileMenuToggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Show add employee modal
  document.getElementById('addEmployeeBtn').addEventListener('click', function() {
    const modal = new bootstrap.Modal(document.getElementById('addEmployeeModal'));
    modal.show();
  });

  // Toggle password visibility
  document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('empPassword');
    const icon = this.querySelector('i');
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  });

  // Handle form submission
  document.getElementById('addEmployeeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('empName').value;
    const email = document.getElementById('empEmail').value;
    const role = document.getElementById('empRole').value;
    
    // Create new employee row
    const tableBody = document.getElementById('employeeTableBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>
        <div class="d-flex align-items-center">
          <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random" alt="User" class="rounded-circle me-3" width="40" height="40">
          <div>
            <h6 class="mb-0">${name}</h6>
            <small class="text-muted">ID: EMP${(tableBody.children.length + 1).toString().padStart(3, '0')}</small>
          </div>
        </div>
      </td>
      <td>${email}</td>
      <td><span class="badge ${role === 'Admin' ? 'bg-primary' : 'bg-secondary'} bg-gradient">${role}</span></td>
      <td><span class="badge bg-success bg-gradient">Active</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary me-2 edit-btn"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-outline-danger delete-btn"><i class="fas fa-trash"></i></button>
      </td>
    `;
    
    // Add row to table
    tableBody.appendChild(newRow);
    
    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(document.getElementById('addEmployeeModal'));
    modal.hide();
    this.reset();
    
    // Show success message
    alert('Employee added successfully!');
  });

  // Add event listeners for edit and delete buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
      if (confirm('Are you sure you want to delete this employee?')) {
        e.target.closest('tr').remove();
      }
    } else if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
      // In a real app, you would populate the modal with the employee data
      const modal = new bootstrap.Modal(document.getElementById('addEmployeeModal'));
      modal.show();
      document.querySelector('.modal-title').innerHTML = '<i class="fas fa-user-edit me-2"></i>Edit Employee';
    }
  });

  document.addEventListener('DOMContentLoaded', function() {
    // Priority selection effect
    const priorityOptions = document.querySelectorAll('.priority-option');
    const priorityRadios = document.querySelectorAll('.priority-option input[type="radio"]');
    
    priorityRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        priorityOptions.forEach(option => {
          option.classList.remove('selected');
        });
        
        if (this.checked) {
          const parent = this.closest('.priority-option');
          parent.classList.add('selected');
        }
      });
    });
    
    // File upload hover effect and file selection
    const fileUpload = document.querySelector('.file-upload');
    const fileInput = document.querySelector('.file-upload input[type="file"]');
    
    if (fileUpload && fileInput) {
      fileUpload.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#4fd1c5';
        this.style.backgroundColor = 'rgba(79, 209, 197, 0.1)';
        this.style.transform = 'translateY(-5px)';
      });
      
      fileUpload.addEventListener('dragleave', function() {
        this.style.borderColor = '#e2e8f0';
        this.style.backgroundColor = 'transparent';
        this.style.transform = 'translateY(0)';
      });
      
      fileUpload.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#4fd1c5';
        this.style.backgroundColor = 'rgba(79, 209, 197, 0.05)';
        this.style.transform = 'translateY(0)';
        
        if (e.dataTransfer.files.length) {
          fileInput.files = e.dataTransfer.files;
          updateFileList(fileInput);
        }
      });
      
      fileInput.addEventListener('change', function() {
        updateFileList(this);
      });
      
      function updateFileList(input) {
        const fileInfo = document.createElement('div');
        fileInfo.className = 'mt-3 text-start';
        let fileListHTML = '<p class="fw-bold mb-2">Selected Files:</p><ul class="list-group">';
        
        for (let i = 0; i < input.files.length; i++) {
          const file = input.files[i];
          const fileSize = (file.size / 1024).toFixed(1);
          const fileIcon = getFileIcon(file.name);
          
          fileListHTML += `<li class="list-group-item d-flex align-items-center">
                              <i class="${fileIcon} me-2" style="color: var(--primary-color)"></i>
                              <div class="d-flex justify-content-between align-items-center w-100">
                                <span class="text-truncate" style="max-width: 200px;">${file.name}</span>
                                <span class="badge bg-light text-secondary">${fileSize} KB</span>
                              </div>
                            </li>`;
        }
        
        fileListHTML += '</ul>';
        
        const existingFileInfo = fileUpload.querySelector('.mt-3');
        if (existingFileInfo) {
          existingFileInfo.remove();
        }
        
        if (input.files.length) {
          fileInfo.innerHTML = fileListHTML;
          fileUpload.appendChild(fileInfo);
        }
      }
      
      function getFileIcon(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        
        const iconMap = {
          'pdf': 'fas fa-file-pdf',
          'doc': 'fas fa-file-word',
          'docx': 'fas fa-file-word',
          'xls': 'fas fa-file-excel',
          'xlsx': 'fas fa-file-excel',
          'ppt': 'fas fa-file-powerpoint',
          'pptx': 'fas fa-file-powerpoint',
          'jpg': 'fas fa-file-image',
          'jpeg': 'fas fa-file-image',
          'png': 'fas fa-file-image',
          'gif': 'fas fa-file-image',
          'zip': 'fas fa-file-archive',
          'rar': 'fas fa-file-archive',
          'txt': 'fas fa-file-alt'
        };
        
        return iconMap[extension] || 'fas fa-file';
      }
    }
  })

  document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    
    if (mobileMenuToggle && sidebar) {
      mobileMenuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
      });
    }
    
    // Select all checkbox functionality
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('tbody .form-check-input');
    
    if (selectAll) {
      selectAll.addEventListener('change', function() {
        checkboxes.forEach(checkbox => {
          checkbox.checked = this.checked;
        });
      });
    }
  });

  