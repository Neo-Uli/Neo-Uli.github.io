const auth = firebase.auth();
const citasRef = firebase.firestore().collection('Citas');
const cotizacionesRef = firebase.firestore().collection('Cotizar');
const citasDisponiblesRef = firebase.firestore().collection('FechasDisponibles');

let fechaSeleccionada = null; // Almacena la fecha seleccionada del calendario
let eventoSeleccionado = null; // Almacena el evento de la fecha seleccionada
let calendar; // Almacena la instancia del calendario

// Observador de estado de autenticación
auth.onAuthStateChanged(user => {
    if (user) {
        const nombreUsuario = user.displayName;
        document.getElementById('nombreUsuario').innerText = 'Hola, ' + nombreUsuario;
        document.getElementById('nombre').value = nombreUsuario;
    } else {
        window.location.href = "login.html"; // Redirige si no está logueado
    }
});

// Función para agendar una cita
async function agendarCita() {
    const nombre = document.getElementById('nombre').value;
    const tieneCotizacion = document.querySelector('input[name="tieneCotizacion"]:checked')?.value;

    if (!fechaSeleccionada) {
        alert('Por favor, seleccione una fecha para la cita.');
        return;
    }

    if (tieneCotizacion === "no") {
        alert('Antes de continuar, realiza tu cotización.');
        window.location.href = "/cotizaC.html"; // Redirigir a la cotización
        return;
    }

    // Verifica si el usuario tiene una cotización
    const cotizacion = await cotizacionesRef.where('nombre', '==', nombre).get();

    if (cotizacion.empty) {
        alert('No se encontró ninguna cotización relacionada con este usuario.');
        return;
    }

    // Verifica si ya hay una cita agendada en la fecha seleccionada
    const citaExistente = await citasRef.where('fecha', '==', fechaSeleccionada).get();

    if (!citaExistente.empty) {
        alert('Ya hay una cita agendada para esta fecha. Por favor, selecciona otra fecha.');
        return;
    }

    // Guardar la cita en Firestore
    const citaAgendada = await citasRef.add({
        nombre: nombre,
        fecha: fechaSeleccionada,
        cotizacionID: cotizacion.docs[0].id,
        userId: auth.currentUser.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp() // Registrar la fecha y hora

    });

    alert('Cita agendada con éxito.');
    // Mostrar el mensaje de éxito
    const mensajeExito = document.getElementById('mensaje-exito');
    mensajeExito.style.display = 'block';
    
        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
            mensajeExito.style.display = 'none';
        }, 8000);

    // Actualizar la colección de fechas disponibles y cambiar el estado a "Ocupado"
    const fechasDisponibles = await citasDisponiblesRef.where('fechaInicio', '==', fechaSeleccionada).get();

    if (!fechasDisponibles.empty) {
        fechasDisponibles.forEach(async (doc) => {
            // Cambiar el estado a "Ocupado" en lugar de eliminar el documento
            await citasDisponiblesRef.doc(doc.id).update({ estado: "Ocupado" });

            // Elimina el evento correspondiente del calendario
            calendar.getEventById(doc.id)?.remove(); // Elimina el evento de calendario, si existe
        });
    }

    // Agregar o actualizar el evento de cita ocupada en el calendario
    const eventoExistente = calendar.getEventById(citaAgendada.id);
    if (eventoExistente) {
        eventoExistente.setProp('backgroundColor', 'red'); // Actualiza el color si ya existe
    } else {
        // Solo agrega si no existe
        calendar.addEvent({
            title: 'Ocupado',
            start: fechaSeleccionada,
            backgroundColor: 'red',
            id: citaAgendada.id // Usa el ID de la cita agendada
        });
    }

    // Resetear selección
    fechaSeleccionada = null;
    eventoSeleccionado?.setProp('backgroundColor', 'green'); // Resetear color de la fecha
    eventoSeleccionado = null;
}

// Cargar eventos del calendario
async function cargarEventos() {
    const eventos = [];

    // Cargar citas ocupadas
    const snapshotCitas = await citasRef.get();
    snapshotCitas.forEach(doc => {
        eventos.push({
            title: 'Ocupado',
            start: doc.data().fecha,
            backgroundColor: 'red',
            id: doc.id
        });
    });

    // Cargar fechas disponibles
    const snapshotDisponibles = await citasDisponiblesRef.get();
    snapshotDisponibles.forEach(doc => {
        if (doc.data().estado === "Disponible") { // Solo agrega si el estado es "Disponible"
            eventos.push({
                title: 'Disponible',
                start: doc.data().fechaInicio,
                backgroundColor: 'green',
                id: doc.id
            });
        }
    });

    return eventos; // Devuelve los eventos cargados
}

// Inicialización del calendario
document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendario');

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: cargarEventos,
        dateClick: function(info) {
            if (info.event && info.event.backgroundColor === 'green') {
                if (eventoSeleccionado) {
                    eventoSeleccionado.setProp('backgroundColor', 'green');
                }

                fechaSeleccionada = info.dateStr; 
                eventoSeleccionado = info.event; 

                info.event.setProp('backgroundColor', 'blue'); 
                console.log(`Fecha seleccionada: ${fechaSeleccionada}`);
            } else {
                alert('Esta fecha no está disponible. Por favor, selecciona otra.');
            }
        },
        eventClick: function(info) {
            if (info.event.backgroundColor === 'green') {
                if (eventoSeleccionado) {
                    eventoSeleccionado.setProp('backgroundColor', 'green');
                }

                fechaSeleccionada = info.event.startStr; 
                eventoSeleccionado = info.event; 

                info.event.setProp('backgroundColor', 'blue'); 
                console.log(`Fecha seleccionada: ${fechaSeleccionada}`);
            }
        }
    });

    calendar.render();
});
