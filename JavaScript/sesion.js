const auth = firebase.auth();
const firestore = firebase.firestore();

// Referencias a las colecciones
const usuariosCollection = firestore.collection('Usuarios');
const trabajadoresCollection = firestore.collection('Trabajadores');

// Registro Nuevo
const signUpForm = document.querySelector('#signup-form');

signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.querySelector('#nombre').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#pass').value;
    const telefono = document.querySelector('#telefono').value; // Capturamos el teléfono

    // Para agregar a Firestore
    const nuevoUsuario = {
        nombre: nombre,
        correo: email,
        contra: password,
        tel: telefono  
    };

    auth
       .createUserWithEmailAndPassword(email, password)
       .then(function(userCredential) {
         usuariosCollection.add(nuevoUsuario)
         .then((docRef) => {
            console.log('Documento agregado con ID:', docRef.id);
            window.location = 'index.html';
         })
         .catch((error) => {
            console.log('Error al agregar documento:', error);
         });

         // Actualizar información del perfil con el nombre
         return userCredential.user.updateProfile({
            displayName: nombre
         });
       })
       .catch(function(error) {
        // Manejar errores de registro
        console.error('Error de registro:', error.message);
        if ( error.message == "The email address is badly formatted."){
            alert('El campo de correo electronico esta vacio')
        }else{
            alert('Error la contraseña debe contener al menos 8 caracteres');
        }
       });
});

// Inicio de Sesión
const signInForm = document.querySelector('#signin-form');

signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.querySelector('#login-email').value;
    const pass = document.querySelector('#login-pass').value;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, pass);
        const user = userCredential.user;

        // Verificar si el usuario es un trabajador (admin)
        const trabajadorSnapshot = await trabajadoresCollection.where('correo', '==', email).get();
        if (!trabajadorSnapshot.empty) {
            // Si es trabajador (admin)
            console.log('Inicio de Sesión como Trabajador');
            window.location = 'menuA.html';
        } else {
            // Verificar si es un usuario normal
            const usuarioSnapshot = await usuariosCollection.where('correo', '==', email).get();
            if (!usuarioSnapshot.empty) {
                console.log('Inicio de Sesión como Usuario');
                window.location = 'index.html';
            } else {
                console.error('Usuario no encontrado en ninguna colección');
                alert('Usuario no registrado en el sistema.');
            }
        }
    } catch (error) {
        // Manejar errores de autenticación
        console.error('Error de autenticación:', error.message);
        alert('Error, el correo y contraseña no coinciden')

        //alert('Error de autenticación: ' + error.message);
    }
});

// Inicio de Sesión sin Registro
const sinR = document.getElementById('no-registro');
sinR.addEventListener('click', e => {
    window.location = 'index.html';
});

// Funcionalidad para alternar entre los formularios de registro e inicio de sesión
const btnSignIn = document.getElementById("sign-in"); // Iniciar sesión
const btnSignUp = document.getElementById("sign-up"); // Registrarse
const formRegister = document.querySelector(".register");
const formLogin = document.querySelector(".login");

btnSignIn.addEventListener("click", e => {
    formRegister.classList.add("hide");
    formLogin.classList.remove("hide");
});

btnSignUp.addEventListener("click", e => {
    formLogin.classList.add("hide");
    formRegister.classList.remove("hide");
});
