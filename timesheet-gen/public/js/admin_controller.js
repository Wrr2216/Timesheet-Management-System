$(document).ready(function () {});

var newUserMenuState = false;
function toggleModal() {
  if (newUserMenuState == false) {
    $(".new-user.modal").fadeIn();
    newUserMenuState = true;
  } else {
    $(".new-user.modal").fadeOut();
    newUserMenuState = false;
  }
}

var editUserMenuState = false;
function toggleEditModal() {
  if (editUserMenuState == false) {
    $(".new-user.modal#edit-modal").fadeIn();
    editUserMenuState = true;
  } else {
    $(".new-user.modal#edit-modal").fadeOut();
    editUserMenuState = false;
  }
}

function editUserModal(id, first_name, last_name, base, username, email, role) {
  // Get the form elements
  const idField = document.getElementById("edit_id");
  const firstNameField = document.getElementById("edit_first_name");
  const lastNameField = document.getElementById("edit_last_name");
  const baseField = document.getElementById("edit_base");
  const usernameField = document.getElementById("edit_username");
  const emailField = document.getElementById("edit_email");
  const roleField = document.getElementById("edit_role");

  // Set the values of the form elements to the user information
  idField.value = id;
  firstNameField.value = first_name;
  lastNameField.value = last_name;
  baseField.value = base;
  usernameField.value = username;
  emailField.value = email;
  roleField.value = role;

  // Show the edit modal
  toggleEditModal();
}
