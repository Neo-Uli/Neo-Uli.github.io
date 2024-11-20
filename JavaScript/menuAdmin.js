// Script para redireccionar
function goToPage(page) {
    window.location.href = page;
}
// Función para mostrar el nombre del usuario y manejar la sesión
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Mostrar el nombre del usuario en el mensaje de bienvenida
        document.getElementById('welcomeMessage').textContent = `Bienvenido, ${user.displayName || user.email}`;

        const userEmail = user.email; // Obtener el correo del usuario autenticado
        
        // Verificar si userEmail está definido
        if (userEmail) {
            // Consulta para buscar al trabajador por correo en Firestore
            console.log("Correo del usuario autenticado:", userEmail); // Imprime el correo para depuración
            
            // Reemplaza 'Trabajadores' con el nombre de tu colección en Firestore
            firebase.firestore().collection('Trabajadores')
                .where('correo', '==', userEmail)
                .get()
                .then((querySnapshot) => {
                    console.log("Snapshot de la consulta:", querySnapshot); // Depura el contenido del snapshot
                    if (!querySnapshot.empty) {
                        querySnapshot.forEach((doc) => {
                            const data = doc.data();
                            console.log("Datos del trabajador:", data);

                            // Verificar si el trabajador es administrador
                            if (data.admin) {
                                // Mostrar la opción de "Agregar Usuario" solo si es admin
                                const addUserOption = document.getElementById('addUserOption');
                                addUserOption.classList.remove('hidden'); // Quitar la clase 'hidden' para mostrar el botón
                                //
                                const addCitaOption = document.getElementById('addCitas');
                                addCitaOption.classList.remove('hidden');
                                

                            } else {
                                console.log("El usuario no es administrador.");
                            }
                        });
                    } else {
                        console.log("No se encontró el trabajador con ese correo.");
                    }
                })
                .catch((error) => {
                    console.error('Error al obtener el rol del usuario:', error);
                });
        } else {
            console.error("El correo del usuario no está definido.");
        }
    } else {
        // Redirigir al login si no hay usuario
        window.location.href = 'login.html';
    }
});



// Función para cerrar sesión
function logout() {
    firebase.auth().signOut().then(() => {
        // Redirigir a la página de inicio o login
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
    });
}
