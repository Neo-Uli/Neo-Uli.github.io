// Script para redireccionar
function goToPage(page) {
    window.location.href = page;
}

const modal = document.getElementById("registerModal");
    const openModalBtn = document.getElementById("openModalBtn");
    const closeModalBtn = document.getElementsByClassName("close")[0];
    const formTitle = document.getElementById("modalTitle");
    const submitButton = document.getElementById("submitButton");
    let editUserId = null;  // Variable para almacenar el ID del usuario que se está editando

    // Abrir el modal para agregar nuevo usuario
    openModalBtn.onclick = function () {
        resetForm();
        formTitle.textContent = "Registrar Nuevo Trabajador";
        submitButton.textContent = "Registrar Trabajador";
        modal.style.display = "block";
    }

    // Cerrar el modal
    closeModalBtn.onclick = function () {
        modal.style.display = "none";
    }

    // Cerrar el modal si se hace clic fuera de él
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

    const auth = firebase.auth();
    const firestore = firebase.firestore();

    // Manejo del registro o edición de trabajadores
    document.getElementById('registerForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const isAdmin = document.getElementById('isAdmin').checked;

    const trabajadorData = {
        nombre: name,
        correo: email,
        admin: isAdmin,
        contra:password
    };

    if (editUserId) {
        // Si estamos editando un trabajador existente
        firestore.collection('Trabajadores').doc(editUserId).update(trabajadorData).then(() => {
            document.getElementById('message').textContent = 'Trabajador actualizado exitosamente.';
            modal.style.display = 'none';
            resetForm();
            loadUsers();
            editUserId = null; // Limpiar la variable editUserId después de la edición
        }).catch((error) => {
            document.getElementById('message').textContent = `Error al actualizar: ${error.message}`;
        });
    } else {
        // Si estamos registrando un nuevo trabajador
        const password = document.getElementById('password').value;
        
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                return user.updateProfile({
                    displayName: name
                });
            })
            .then(() => {
                return firestore.collection('Trabajadores').add(trabajadorData);
            })
            .then(() => {
                document.getElementById('message').textContent = 'Trabajador registrado exitosamente.';
                modal.style.display = 'none';
                resetForm();
                loadUsers();
            })
            .catch((error) => {
                if (error.message == "Password should be at least 6 characters"){
                //document.getElementById('message').textContent = `Error al registrar: ${error.message}`;
                document.getElementById('message').textContent = `Error al registrar: la contraseña debe contener al menos 8 caracteres`;
                }else if(error.message == "The email address is badly formatted."){
                    document.getElementById('message').textContent = `Error al registrar: el correo esta mal escrito`;
                }

            });
    }
});
    // Función para cargar trabajadores registrados
    function loadUsers() {
        const userList = document.getElementById('userList');
        userList.innerHTML = '';

        firestore.collection('Trabajadores').get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>${userData.nombre}</td>
                    <td>${userData.correo}</td>
                    <td>${userData.admin ? 'Administrador' : 'Usuario'}</td>
                    <td>
                        <button class="icon-btn" onclick="editUser('${doc.id}', '${userData.nombre}', '${userData.correo}', ${userData.admin})">
                            <i class="fa-solid fa-user-pen"></i>
                        </button>
                        <button class="icon-btn" onclick="deleteUser('${doc.id}')">
                            <i class="fa-solid fa-user-xmark"></i>
                        </button>
                    </td>
                `;
                userList.appendChild(row);
            });
        });
    }

// Función para editar un trabajador
function editUser(userId, name, email, isAdmin) {
    editUserId = userId;  // Guardar el ID del usuario que se está editando
    document.getElementById('name').value = name;
    document.getElementById('email').value = email;
    document.getElementById('password').value = '';  // La contraseña no se modifica al editar
    document.getElementById('isAdmin').checked = isAdmin;

    // Deshabilitar el campo de email y password al editar
    document.getElementById('email').disabled = true;
    document.getElementById('password').disabled = true;

    formTitle.textContent = "Editar Trabajador";
    submitButton.textContent = "Actualizar Trabajador";
    modal.style.display = "block";
}

// Función para resetear el formulario y habilitar los campos
function resetForm() {
    document.getElementById('registerForm').reset();
    document.getElementById('email').disabled = false;  // Habilitar el campo de email para nuevos registros
    document.getElementById('password').disabled = false;  // Habilitar el campo de password para nuevos registros
    document.getElementById('message').textContent = '';
}

    // Función para eliminar un trabajador
    function deleteUser(userId) {
        if (confirm("¿Estás seguro de que deseas eliminar este trabajador?")) {
            firestore.collection('Trabajadores').doc(userId).delete().then(() => {
                loadUsers();
            }).catch((error) => {
                console.error("Error al eliminar el trabajador: ", error);
            });
        }
    }

    // Cargar usuarios cuando la página esté lista
    window.onload = function () {
        loadUsers();
    };
