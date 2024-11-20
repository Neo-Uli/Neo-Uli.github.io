document.addEventListener("DOMContentLoaded", function() {
    const auth = firebase.auth();

    // Cierre de Sesión
    const cerrar = document.querySelector('#boton-cierre-sesion');

    cerrar.addEventListener('click', e => {
        e.preventDefault();
        auth.signOut().then(() => {
            window.location = 'login.html';
            console.log('Sesión cerrada');
        });
    });

    // Agrega un observador de estado de autenticación para manejar cambios en el estado de autenticación
    const Regist = document.querySelector('.Registrado');
    const NoRegist = document.querySelector('.noRegistrado');
    const cotizarLink = document.querySelector('.cotizar');
    const citaLink = document.querySelector('.citas');

    auth.onAuthStateChanged(function(user) {
        if (user) {
            var displayName = user.displayName;

            Regist.classList.remove('ocultar');
            NoRegist.classList.add('ocultar');
            cotizarLink.classList.remove('ocultar'); // Muestra el enlace de Cotizar
            citaLink.classList.remove('ocultar'); // Muestra el enlace de Cotizar


            // displayName contiene el nombre del usuario
            console.log('Nombre del usuario:', displayName);
            console.log(user.displayName);

            // Actualiza el contenido del elemento HTML con el nombre del usuario
            document.getElementById('nombreUsuario').innerText = 'Hola, ' + displayName;
            document.getElementById('nombre').value = displayName;

        } else {
            // No hay usuario autenticado, puedes redirigir o hacer otras acciones
            console.log('No hay usuario autenticado');
            Regist.classList.add('ocultar');
            NoRegist.classList.remove('ocultar');
            cotizarLink.classList.add('ocultar'); // Oculta el enlace de Cotizar
            citaLink.classList.add('ocultar'); // Oculta el enlace de Cotizar

        }
    });
});
