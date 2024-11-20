const db = firebase.firestore();  
const citasDisponiblesRef = db.collection('FechasDisponibles');

let fechasParaAgregar = [];  // Fechas seleccionadas para agregar
let fechasParaEliminar = []; // Fechas seleccionadas para eliminar
let eventosParaEliminar = []; // Referencia a los eventos para eliminar visualmente del calendario
let eventosParaAgregar = []; // Eventos temporales para agregar visualmente

document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendario-admin');

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        selectable: true,
        select: function(info) {
            let fechaSeleccionada = info.startStr;

            // Verificar si la fecha ya está en el calendario como disponible (color verde)
            let eventoDisponible = calendar.getEvents().find(event => event.startStr === fechaSeleccionada && event.backgroundColor === 'green');
            
            // Verificar si la fecha ya está ocupada
            let eventoOcupado = calendar.getEvents().find(event => event.startStr === fechaSeleccionada && event.backgroundColor === 'red');

            if (eventoDisponible) {
                alert('Esta fecha ya está marcada como disponible. No se puede agregar nuevamente.');
                return;
            }

            if (eventoOcupado) {
                alert('Esta fecha ya está ocupada. No se puede agregar como disponible.');
                return;
            }

            // Si ya hay fechas para eliminar, no permitir seleccionar para agregar
            if (fechasParaEliminar.length > 0) {
                alert('Ya has seleccionado fechas para eliminar. Primero elimina o limpia la selección.');
                return;
            }

            // Si la fecha ya está en la lista para agregar, quitarla
            if (fechasParaAgregar.includes(fechaSeleccionada)) {
                fechasParaAgregar = fechasParaAgregar.filter(fecha => fecha !== fechaSeleccionada);
                removeTemporaryEvent(fechaSeleccionada);
            } else {
                // Agregar la fecha seleccionada para agregar
                fechasParaAgregar.push(fechaSeleccionada);

                // Mostrarla con color más oscuro
                let evento = calendar.addEvent({
                    title: 'Seleccionada para agregar',
                    start: fechaSeleccionada,
                    backgroundColor: '#555555',  // Color más oscuro
                    borderColor: '#555555',
                    rendering: 'background'
                });

                eventosParaAgregar.push(evento); // Guardar el evento temporal para poder eliminarlo
            }
        },
        eventClick: function(info) {
            let fechaSeleccionada = info.event.startStr;

            // Aquí se añade la condición para evitar el doble clic en "seleccionada para agregar"
            if (info.event.backgroundColor === '#555555') {
                // Esto significa que es una fecha "Seleccionada para agregar", y no se debería tratar como un evento para eliminar
                return; // Ignorar el clic en eventos "seleccionados para agregar"
            }

            // Si ya hay fechas para agregar, no permitir seleccionar para eliminar
            if (fechasParaAgregar.length > 0) {
                alert('Ya has seleccionado fechas para agregar. Primero agrega o limpia la selección.');
                return;
            }

            // Si la fecha ya está en la lista para eliminar, quitarla
            if (fechasParaEliminar.includes(fechaSeleccionada)) {
                fechasParaEliminar = fechasParaEliminar.filter(fecha => fecha !== fechaSeleccionada);
                info.event.setProp('backgroundColor', 'green');  // Restablecer el color original
                info.event.setProp('borderColor', 'green');
            } else {
                // Agregar la fecha seleccionada para eliminar
                fechasParaEliminar.push(fechaSeleccionada);
                eventosParaEliminar.push(info.event); // Guardar el evento para poder eliminarlo luego

                // Cambiar el color para mostrar que está seleccionada para eliminar
                info.event.setProp('backgroundColor', '#e86132');  // Color rojo para eliminar
                info.event.setProp('borderColor', '#e86132');
            }
            
        },
        events: async function(fetchInfo, successCallback, failureCallback) {
            let fechasDisponibles = [];
            try {
                const snapshot = await citasDisponiblesRef.get();
                snapshot.forEach(doc => {
                    const estado = doc.data().estado; // Obtener el estado de la fecha
                    fechasDisponibles.push({
                        title: estado === 'Disponible' ? 'Disponible' : 'Ocupado',
                        start: doc.data().fechaInicio,
                        color: estado === 'Disponible' ? 'green' : 'red'  // Color verde para fechas disponibles, rojo para ocupadas
                    });
                });
                successCallback(fechasDisponibles);
            } catch (error) {
                failureCallback(error);
            }
        }
    });

    calendar.render();

    // Función para remover visualmente eventos temporales del calendario
    function removeTemporaryEvent(fechaSeleccionada) {
        let events = calendar.getEvents();
        events.forEach(event => {
            if (event.startStr === fechaSeleccionada && event.backgroundColor === '#555555') {
                event.remove();  // Eliminar evento visualmente
            }
        });
    }
});

// Función para guardar todas las fechas seleccionadas en Firestore
function guardarFechasDisponibles() {
    if (fechasParaAgregar.length === 0) {
        alert('No has seleccionado ninguna fecha para agregar.');
        return;
    }

    const batch = db.batch();  // Para realizar varias escrituras de manera eficiente

    fechasParaAgregar.forEach(fecha => {
        const nuevaFechaRef = citasDisponiblesRef.doc();  // Crear un nuevo documento
        batch.set(nuevaFechaRef, {
            fechaInicio: fecha,  // Guardar solo la fecha seleccionada
            estado: "Disponible"  // Establecer el estado como "Disponible"
        });
    });

    // Ejecutar el batch
    batch.commit().then(() => {
        alert('Fechas disponibles guardadas con éxito.');
        fechasParaAgregar = [];  // Reiniciar la lista de fechas seleccionadas
        location.reload();  // Recargar para reflejar cambios
    }).catch(error => {
        console.error('Error al guardar las fechas:', error);
    });
}

// Función para eliminar fechas de Firestore
function eliminarFechasSeleccionadas() {
    if (fechasParaEliminar.length === 0) {
        alert('No has seleccionado ninguna fecha para eliminar.');
        return;
    }

    const batch = db.batch();  // Crear un nuevo batch para las operaciones

    // Crear una lista de promesas para manejar operaciones asíncronas
    const promises = [];

    // Recorrer cada fecha a eliminar
    fechasParaEliminar.forEach(fecha => {
        const promise = citasDisponiblesRef.where('fechaInicio', '==', fecha).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    batch.delete(citasDisponiblesRef.doc(doc.id));  // Añadir eliminación al batch
                });
            })
            .catch(error => {
                console.error('Error al obtener documentos para eliminar:', error);
            });
        
        // Añadir la promesa a la lista
        promises.push(promise);
    });

    // Esperar a que todas las promesas se completen antes de hacer commit del batch
    Promise.all(promises).then(() => {
        batch.commit()
            .then(() => {
                alert('Fechas eliminadas con éxito.');

                // Remover visualmente los eventos del calendario
                eventosParaEliminar.forEach(event => event.remove());

                // Limpiar las listas de fechas y eventos seleccionados para eliminar
                fechasParaEliminar = [];
                eventosParaEliminar = [];
            })
            .catch(error => {
                console.error('Error al eliminar las fechas:', error);
            });
    }).catch(error => {
        console.error('Error al completar las operaciones:', error);
    });
}
