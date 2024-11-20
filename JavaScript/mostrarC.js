const db = firebase.firestore();

window.onload = function() {
    cargarTodasCotizaciones();
};

function cargarTodasCotizaciones() {
    const cotizacionesContainer = document.getElementById('cotizaciones-container');
    cotizacionesContainer.innerHTML = '';

    // Consulta la colección de Cotizar
    db.collection("Cotizar").get().then((querySnapshot) => {
        if (!querySnapshot.empty) {
            const table = document.createElement('table');
            table.innerHTML = `
                <tr>
                    <th>Check-in</th>
                    <th>Nombre del Cliente</th>
                    <th>Teléfono</th>
                    <th>Cita</th>
                    <th>Solicitud</th>
                    <th>Cotización</th>
                </tr>
            `;

            querySnapshot.forEach((doc) => {
                const cotizacion = doc.data();
                const row = document.createElement('tr');

                // Check-in
                const checkInCell = document.createElement('td');
                const checkInCheckbox = document.createElement('input');
                checkInCheckbox.type = 'checkbox';
                checkInCheckbox.checked = cotizacion.revisada || false;
                checkInCheckbox.addEventListener('change', () => {
                    doc.ref.update({ revisada: checkInCheckbox.checked });
                });
                checkInCell.appendChild(checkInCheckbox);
                row.appendChild(checkInCell);

                // Nombre del cliente
                const nombreCell = document.createElement('td');
                nombreCell.textContent = cotizacion.nombre;
                row.appendChild(nombreCell);

                // Teléfono del cliente como enlace de WhatsApp
                const telCell = document.createElement('td');
                db.collection("Usuarios").where("nombre", "==", cotizacion.nombre).get().then((userSnapshot) => {
                    if (!userSnapshot.empty) {
                        userSnapshot.forEach((userDoc) => {
                            const userData = userDoc.data();
                            const telefono = userData.tel;
                            const msg = 'Hola tu cotizacion esta lista..'

                            if (telefono) {
                                // Crear enlace de WhatsApp
                                const whatsappLink = document.createElement('a');
                                whatsappLink.href = `https://wa.me/52${telefono}?text=Hemos%20recibido%20tu%20solicitud,%20ahora%20mismo%20la%20revisamos.`;
                                whatsappLink.target = '_blank'; // Abre en nueva pestaña

                                // Agregar el ícono de WhatsApp
                                const whatsappIcon = document.createElement('img');
                                whatsappIcon.src = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg'; // URL del ícono de WhatsApp
                                whatsappIcon.alt = 'WhatsApp';
                                whatsappIcon.style.width = '20px'; // Ajusta el tamaño del ícono
                                whatsappIcon.style.marginRight = '5px'; // Espacio entre el ícono y el número

                                // Agregar el número de teléfono
                                const telefonoText = document.createElement('span');
                                telefonoText.textContent = telefono;

                                whatsappLink.appendChild(whatsappIcon);
                                whatsappLink.appendChild(telefonoText);
                                telCell.appendChild(whatsappLink);
                            } else {
                                telCell.textContent = 'Sin teléfono';
                            }
                        });
                    } else {
                        telCell.textContent = 'Sin teléfono';
                    }
                }).catch((error) => {
                    console.error('Error al obtener el teléfono:', error);
                    telCell.textContent = 'Error';
                });
                row.appendChild(telCell);

                // Buscar la cita correspondiente al nombre
                const citaCell = document.createElement('td');
                db.collection("Citas").where("nombre", "==", cotizacion.nombre).get().then((citaSnapshot) => {
                    if (!citaSnapshot.empty) {
                        citaSnapshot.forEach((citaDoc) => {
                            const citaData = citaDoc.data();
                            let fechaCita;

                            // Verificar si la fecha es un Timestamp o un string
                            if (citaData.fecha instanceof firebase.firestore.Timestamp) {
                                // Si es un Timestamp, convertir usando UTC para evitar problemas de zona horaria
                                const fecha = citaData.fecha.toDate();
                                fechaCita = new Date(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()).toLocaleDateString();
                            } else {
                                // Si es un string, asume que puede ser convertido a Date
                                const fecha = new Date(citaData.fecha);
                                fechaCita = new Date(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()).toLocaleDateString();
                            }

                            citaCell.textContent = `Cita: ${fechaCita}`;
                        });
                    } else {
                        citaCell.textContent = 'Sin cita';
                    }
                });
                row.appendChild(citaCell);

                // Solicitud (Detalles)
                const solicitudCell = document.createElement('td');
                const solicitudButton = document.createElement('button');
                solicitudButton.textContent = 'Ver Solicitud';
                solicitudButton.classList.add('styled-button', 'solicitud-button');
                solicitudButton.addEventListener('click', () => mostrarDetallesCotizacion(doc));
                solicitudCell.appendChild(solicitudButton);
                row.appendChild(solicitudCell);

                // Cotización PDF
                const cotizacionCell = document.createElement('td');
                db.collection("cotizaciones").where("nombre", "==", cotizacion.nombre).get().then((cotSnapshot) => {
                    if (!cotSnapshot.empty) {
                        cotSnapshot.forEach((cotDoc) => {
                            const cotData = cotDoc.data();
                            const cotizacionButton = document.createElement('button');
                            cotizacionButton.textContent = 'Ver PDF';
                            cotizacionButton.classList.add('styled-button', 'pdf-button');
                            cotizacionButton.addEventListener('click', () => {
                                if (cotData.pdfUrl) {
                                    window.open(cotData.pdfUrl, '_blank');
                                } else {
                                    alert('No hay PDF disponible para esta cotización.');
                                }
                            });
                            cotizacionCell.appendChild(cotizacionButton);
                        });
                    } else {
                        cotizacionCell.textContent = 'No disponible';
                    }
                });
                row.appendChild(cotizacionCell);

                table.appendChild(row);
            });

            cotizacionesContainer.appendChild(table);
        } else {
            cotizacionesContainer.innerHTML = '<p>No se encontraron cotizaciones.</p>';
        }
    }).catch((error) => {
        console.error("Error cargando las cotizaciones: ", error);
        cotizacionesContainer.innerHTML = '<p>Ocurrió un error al cargar las cotizaciones.</p>';
    });
}



function buscarCotizacion() {
    const cotizacionesContainer = document.getElementById('cotizaciones-container');
    const searchInput = document.getElementById('search-input').value.trim();
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    cotizacionesContainer.innerHTML = '';

    let query = db.collection("Cotizar");

    // Verificar si se ingresó un nombre y aplicarlo en la consulta
    if (searchInput !== '') {
        query = query.where("nombre", "==", searchInput);
    }

    // Verificar si se seleccionaron fechas y aplicarlas en la consulta
    if (startDate !== '' && endDate !== '') {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Asegurarse de que el rango de tiempo cubra todo el día

        query = query.where("fecha", ">=", start).where("fecha", "<=", end);
    }

    query.get().then((querySnapshot) => {
        if (!querySnapshot.empty) {
            const table = document.createElement('table');
            table.innerHTML = `
                <tr>
                    <th>Check-in</th>
                    <th>Nombre del Cliente</th>
                    <th>Cita</th>
                    <th>Solicitud</th>
                    <th>Cotización</th>
                </tr>
            `;

            querySnapshot.forEach((doc) => {
                const cotizacion = doc.data();
                const row = document.createElement('tr');

                // Check-in
                const checkInCell = document.createElement('td');
                const checkInCheckbox = document.createElement('input');
                checkInCheckbox.type = 'checkbox';
                checkInCheckbox.checked = cotizacion.revisada || false;
                checkInCheckbox.addEventListener('change', () => {
                    doc.ref.update({ revisada: checkInCheckbox.checked });
                });
                checkInCell.appendChild(checkInCheckbox);
                row.appendChild(checkInCell);

                // Nombre del cliente
                const nombreCell = document.createElement('td');
                nombreCell.textContent = cotizacion.nombre;
                row.appendChild(nombreCell);

                // Cita
                const citaCell = document.createElement('td');
                citaCell.textContent = cotizacion.cita || 'Sin cita';
                row.appendChild(citaCell);

                // Solicitud (Detalles)
                const solicitudCell = document.createElement('td');
                const solicitudButton = document.createElement('button');
                solicitudButton.textContent = 'Ver Solicitud';
                solicitudButton.classList.add('styled-button', 'solicitud-button');
                solicitudButton.addEventListener('click', () => mostrarDetallesCotizacion(doc));
                solicitudCell.appendChild(solicitudButton);
                row.appendChild(solicitudCell);

                // Cotización PDF
                const cotizacionCell = document.createElement('td');
                db.collection("cotizaciones").where("nombre", "==", cotizacion.nombre).get().then((cotSnapshot) => {
                    if (!cotSnapshot.empty) {
                        cotSnapshot.forEach((cotDoc) => {
                            const cotData = cotDoc.data();
                            const cotizacionButton = document.createElement('button');
                            cotizacionButton.textContent = 'Ver PDF';
                            cotizacionButton.classList.add('styled-button', 'pdf-button');
                            cotizacionButton.addEventListener('click', () => {
                                if (cotData.pdfUrl) {
                                    window.open(cotData.pdfUrl, '_blank');
                                } else {
                                    alert('No hay PDF disponible para esta cotización.');
                                }
                            });
                            cotizacionCell.appendChild(cotizacionButton);
                        });
                    } else {
                        cotizacionCell.textContent = 'No disponible';
                    }
                }).catch((error) => {
                    console.error('Error al obtener el PDF:', error);
                    cotizacionCell.textContent = 'Error al obtener el PDF';
                });

                row.appendChild(cotizacionCell);
                table.appendChild(row);
            });

            cotizacionesContainer.appendChild(table);
        } else {
            cotizacionesContainer.innerHTML = '<p>No se encontró ninguna cotización con esos parámetros.</p>';
        }
    }).catch((error) => {
        console.error("Error buscando la cotización: ", error);
        cotizacionesContainer.innerHTML = '<p>Ocurrió un error al buscar la cotización.</p>';
    });
}



function mostrarDetallesCotizacion(doc) {
    const cotizacion = doc.data();
    let detalles = `
        <p><strong>Nombre:</strong> ${cotizacion.nombre}</p>
        <p><strong>Tipo de Área:</strong> ${cotizacion.acabados}</p>
        <p><strong>Metros para Interior:</strong> ${cotizacion.metros_interior}</p>
        <p><strong>Metros para Exterior:</strong> ${cotizacion.metros_exterior}</p>
        <p><strong>Cuantas ventanas:</strong> ${cotizacion.ventanas}</p>
        <p><strong>Cuantas puertas:</strong> ${cotizacion.puertas}</p>
        <p><strong>Cuantos tomacorrientes:</strong> ${cotizacion.tomacorrientes}</p>
        <p><strong>Notas adiccionales:</strong> ${cotizacion.notas}</p>
        <p><strong>Fecha de cotización:</strong> ${cotizacion.fecha.toDate().toLocaleDateString()}</p>
    `;

    document.getElementById('solicitud-content').innerHTML = detalles;
    document.getElementById('solicitud-modal').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('solicitud-modal').style.display = 'none';
}

