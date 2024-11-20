// Función para mostrar/ocultar el menú desplegable de notificaciones en la página
function toggleNotifications() {
    const notificationDropdown = document.getElementById('notificationDropdown');
    notificationDropdown.classList.toggle('show');
}

// Variable para controlar si hay una notificación visible
let notificacionVisible = false;

// Para almacenar los IDs de las notificaciones ya mostradas
let notificacionesMostradasBrowser = new Set(JSON.parse(localStorage.getItem('notificacionesMostradasBrowser')) || []);

// Solicitar permiso para notificaciones flotantes
function solicitarPermisoNotificaciones() {
    if (!("Notification" in window)) {
        alert("Este navegador no soporta notificaciones de escritorio.");
    } else if (Notification.permission === "granted") {
        console.log("Permiso para notificaciones ya otorgado.");
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function(permission) {
            if (permission === "granted") {
                console.log("Permiso para notificaciones otorgado.");
            }
        });
    }
}

// Mostrar notificación de navegador si no hay otra activa y aún no se ha mostrado
// Mostrar notificación de navegador si no hay otra activa y aún no se ha mostrado
function mostrarNotificacion(titulo, mensaje, urlRedireccion, idNotificacion) {
    console.log(`Mostrando notificación: ${titulo} - ID: ${idNotificacion}`); // Para depuración
    if (Notification.permission === "granted" && !notificacionVisible) {
        notificacionVisible = true;

        const opciones = {
            body: mensaje,
            icon: 'img/Logo.png',
            requireInteraction: true,
        };

        const notificacion = new Notification(titulo, opciones);

        notificacion.onclick = function(event) {
            event.preventDefault();
            window.open(urlRedireccion, '_blank');
            notificacion.close();
        };

        notificacion.onclose = function() {
            notificacionVisible = false; // Se restablece cuando se cierra la notificación
        };

        // Temporizador para restablecer la visibilidad después de 5 segundos
        setTimeout(() => {
            notificacionVisible = false; // Restablecer después de 5 segundos
        }, 5000); // Ajusta este tiempo según lo necesites

        // Agregar el ID de notificación al conjunto de mostradas
        notificacionesMostradasBrowser.add(idNotificacion);
        localStorage.setItem('notificacionesMostradasBrowser', JSON.stringify(Array.from(notificacionesMostradasBrowser)));
        console.log(`ID de notificación añadido: ${idNotificacion}`); // Para depuración
    } else {
        console.log("No se puede mostrar la notificación: ", {
            permission: Notification.permission,
            notificacionVisible
        }); // Para depuración
    }
}


// Función para agregar notificaciones con ícono y botón de eliminación en el menú desplegable
function agregarNotificacion(mensaje, id, tipo) {
    if (notificacionesMostradasBrowser.has(id)) return; // Prevenir duplicados

    const notificationList = document.getElementById("notificationList");

    const eliminados = JSON.parse(localStorage.getItem('eliminados')) || [];
    if (eliminados.includes(id)) return;

    const li = document.createElement("li");
    li.classList.add('notification-item');

    const icon = document.createElement("i");
    if (tipo === 'cotizar') {
        icon.className = 'fas fa-file-alt';
    } else if (tipo === 'citas') {
        icon.className = 'fas fa-calendar-alt';
    }

    const span = document.createElement("span");
    span.textContent = mensaje;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Eliminar";
    deleteButton.classList.add('delete-btn');
    deleteButton.onclick = function() {
        eliminados.push(id);
        localStorage.setItem('eliminados', JSON.stringify(eliminados));
        notificationList.removeChild(li);
    };

    span.onclick = function() {
        window.location.href = tipo === 'cotizar' ? 'cotizaA.html' : 'CitasA.html';
    };

    li.appendChild(icon);
    li.appendChild(span);
    li.appendChild(deleteButton);
    notificationList.appendChild(li);
}

// Escuchar los últimos documentos en la colección "Cotizar"
// Escuchar los últimos documentos en la colección "Cotizar"
function iniciarNotificacionesCotizaciones() {
    const refCotizar = firebase.firestore().collection('Cotizar');

    refCotizar.orderBy('timestamp', 'desc').onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            if (change.type === "added") {
                const doc = change.doc;
                const data = doc.data();
                
                const idNotificacion = doc.id; // Usar ID del documento como ID de notificación
                console.log(`Cotización añadida: ${idNotificacion} - Nombre: ${data.nombre}`); // Para depuración

                // Verifica si la notificación ya ha sido mostrada
                if (!notificacionesMostradasBrowser.has(idNotificacion)) {
                    agregarNotificacion(`Nueva cotización de: ${data.nombre}`, idNotificacion, 'cotizar');
                    mostrarNotificacion("Nueva Cotización", `Nueva cotización de: ${data.nombre}`, 'cotizaA.html', idNotificacion);
                } else {
                    console.log(`Notificación ya mostrada para ID: ${idNotificacion}`); // Para depuración
                }
            }
        });
    });
}

// Escuchar los últimos documentos en la colección "Citas"
function iniciarNotificacionesCitas() {
    const refCitas = firebase.firestore().collection('Citas');

    refCitas.orderBy('timestamp', 'desc').onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            if (change.type === "added") {
                const doc = change.doc;
                const data = doc.data();
                
                const idNotificacion = doc.id; // Usar ID del documento como ID de notificación
                console.log(`Cita añadida: ${idNotificacion} - Nombre: ${data.nombre}`); // Para depuración

                // Verifica si la notificación ya ha sido mostrada
                if (!notificacionesMostradasBrowser.has(idNotificacion)) {
                    agregarNotificacion(`Nueva cita para el cliente: ${data.nombre}`, idNotificacion, 'citas');
                    mostrarNotificacion("Nueva Cita", `Nueva cita para el cliente: ${data.nombre}`, 'CitasA.html', idNotificacion);
                } else {
                    console.log(`Notificación ya mostrada para ID: ${idNotificacion}`); // Para depuración
                }
            }
        });
    });
}


// Iniciar la funcionalidad al cargar la página
window.onload = function() {
    solicitarPermisoNotificaciones();
    iniciarNotificacionesCotizaciones();
    iniciarNotificacionesCitas();
};
