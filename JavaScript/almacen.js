// Referencia a Firestore
const db = firebase.firestore();

//////////////////////////////////////////////////////////////////////////////
let isAdmin = false; // Variable para indicar si el usuario es admin


firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        const userEmail = user.email; // Obtener el correo del usuario autenticado

        firebase.firestore().collection('Trabajadores')
            .where('correo', '==', userEmail)
            .get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        // Verificar si el trabajador es administrador
                        if (data.admin) {
                            isAdmin = true; // Establecer la variable isAdmin en true
                        }
                    });
                }

                // Llama a cargarAlmacenes después de verificar el rol
                cargarAlmacenes();
            })
            .catch((error) => {
                console.error('Error al obtener el rol del usuario:', error);
            });
    } else {
        window.location.href = 'login.html'; // Redirigir al login si no hay usuario
    }
});



// Función para cargar los almacenes existentes
function cargarAlmacenes() {
    const almacenesLista = document.getElementById('almacenes-lista');
    almacenesLista.innerHTML = ''; // Limpiar la lista antes de cargar

    db.collection("Almacenes").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const almacen = doc.data();

            const li = document.createElement('li');

            // Crear el contenedor del nombre del almacén
            const nombreDiv = document.createElement('div');
            nombreDiv.classList.add('almacen-nombre');
            nombreDiv.textContent = almacen.nombre;

            // Crear el contenedor para los botones
            const botonesDiv = document.createElement('div');
            botonesDiv.classList.add('almacen-botones');

            // Botón para agregar productos al almacén
            const botonAgregar = document.createElement('button');
            botonAgregar.textContent = 'Agregar Productos';
            botonAgregar.onclick = () => mostrarProductos(doc.id); // Pasar el ID del almacén

            // Botón para ver el almacén
            const botonVerAlmacen = document.createElement('button');
            botonVerAlmacen.textContent = 'Ver Almacén';
            botonVerAlmacen.onclick = () => mostrarAlmacen(doc.id);

            // Botón para eliminar el almacén
            const botonEliminar = document.createElement('button');
            botonEliminar.textContent = 'Eliminar Almacén';
            botonEliminar.onclick = () => eliminarAlmacen(doc.id);

            // Mostrar u ocultar botones según el rol de usuario
            if (isAdmin) {
                botonesDiv.appendChild(botonAgregar);
                botonesDiv.appendChild(botonEliminar);
            }
            botonesDiv.appendChild(botonVerAlmacen);

            // Agregar nombre y botones al elemento de lista
            li.appendChild(nombreDiv);
            li.appendChild(botonesDiv);

            // Agregar el elemento de lista a la lista principal
            almacenesLista.appendChild(li);
        });
    }).catch((error) => {
        console.error("Error al cargar almacenes: ", error);
    });
}



// Función para eliminar un almacén
function eliminarAlmacen(almacenId) {
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar este almacén?");
    if (confirmacion) {
        db.collection("Almacenes").doc(almacenId).delete().then(() => {
            alert("Almacén eliminado exitosamente.");
            cargarAlmacenes(); // Recargar la lista de almacenes
        }).catch((error) => {
            console.error("Error al eliminar almacén: ", error);
        });
    }
}

//////////////////////////////////////////////////////////////////////////////
// Función para mostrar los productos del almacén como catálogo
function mostrarAlmacen(almacenId) {
    // Ocultar el contenido anterior
    document.getElementById('main-content').classList.add('hidden');
    document.getElementById('footer').classList.add('hidden');
    document.getElementById('help').classList.add('hidden');

    // Crear el contenedor del catálogo del almacén
    const almacenContainer = document.createElement('div');
    almacenContainer.setAttribute('class', 'almacen-container');

    const almacenCatalogo = document.createElement('div');
    almacenCatalogo.setAttribute('class', 'almacen-catalogo');

    // Crear el botón "Cerrar Almacén" con ícono
    const cerrarAlmacen = document.createElement('button');
    cerrarAlmacen.setAttribute('class', 'btn-cerrar-almacen');
    cerrarAlmacen.onclick = () => {
        document.body.removeChild(almacenContainer);
        document.getElementById('main-content').classList.remove('hidden');
    };

    // Crear el ícono de puerta de salida
    const iconoCerrar = document.createElement('i');
    iconoCerrar.setAttribute('class', 'fas fa-door-open');
    cerrarAlmacen.appendChild(iconoCerrar);
    cerrarAlmacen.appendChild(document.createTextNode(' Cerrar Almacén'));

    // Botón para generar tickets
    const botonGenerarTickets = document.createElement('button');
    botonGenerarTickets.setAttribute('class', 'btn-generar-tickets');
    const iconoQR = document.createElement('i');
    iconoQR.setAttribute('class', 'fas fa-qrcode');
    botonGenerarTickets.appendChild(iconoQR);
    botonGenerarTickets.appendChild(document.createTextNode(' Generar Tickets'));
    botonGenerarTickets.onclick = () => generarTickets(almacenId);

    // Botón para escanear QR
    const botonEscanearQR = document.createElement('button');
    botonEscanearQR.textContent = 'Escanear QR';
    botonEscanearQR.setAttribute('class', 'btn-escanear-qr');

    // Contenedor para el lector de QR
    const lectorQRContainer = document.createElement('div');
    lectorQRContainer.setAttribute('id', 'lector-qr-container'); // Asigna un ID
    lectorQRContainer.setAttribute('class', 'lector-qr-container hidden');

    // Crear el footer
    const foot = document.createElement('footer');
    const paragraph = document.createElement('p');
    paragraph.textContent = '&copy; 2024 MEGA TABLAROCA. Todos los derechos reservados.'; // Ajusta el texto según necesites
    foot.appendChild(paragraph);

    // Agregar el contenedor del lector QR al almacenContainer
    almacenContainer.appendChild(lectorQRContainer);

    // Función para manejar el escaneo de QR
    botonEscanearQR.onclick = () => {
        lectorQRContainer.classList.toggle('hidden'); // Mostrar/Ocultar el lector de QR
        escanearQR(almacenId, lectorQRContainer); // Pasar el contenedor al escanearQR
    };

    // Agregar el botón al contenedor
    almacenContainer.appendChild(botonEscanearQR);

    // Crear un contenedor para los botones
    const contenedorBotones = document.createElement('div');
    contenedorBotones.setAttribute('class', 'contenedor-botones');
    contenedorBotones.appendChild(botonGenerarTickets);
    contenedorBotones.appendChild(cerrarAlmacen);

    // Escuchar cambios en el documento del almacén
    db.collection("Almacenes").doc(almacenId).onSnapshot((doc) => {
        const almacen = doc.data();
        const productos = almacen.productos || {};

        // Limpiar el catálogo existente antes de agregar nuevos productos
        almacenCatalogo.innerHTML = '';

        // Recorrer los productos y crear elementos para cada uno
// Recorrer los productos y crear elementos para cada uno
Object.keys(productos).forEach((productoId) => {
    db.collection("Productos").doc(productoId).get().then((productoDoc) => {
        const producto = productoDoc.data();
        
        const cantidadExistente = productos[productoId].cantidadExistente || 0;
        const unidadesMaximas = productos[productoId].unidadesMaximas || 20;

        const divProducto = document.createElement('div');
        divProducto.setAttribute('class', 'almacen-item');

        const imgProducto = document.createElement('img');
        imgProducto.src = producto.url || 'https://via.placeholder.com/100';
        imgProducto.alt = producto.nombre;

        const nombreProducto = document.createElement('p');
        nombreProducto.textContent = producto.nombre;

        const cantidadProducto = document.createElement('p');
        cantidadProducto.setAttribute('class', 'cantidad-producto');
        cantidadProducto.textContent = `${cantidadExistente}/${unidadesMaximas}`;

        // Crear un contenedor para los botones
        const contenedorBotonesProducto = document.createElement('div');
        contenedorBotonesProducto.setAttribute('class', 'contenedor-botones-producto');

        // Botón para modificar cantidad, solo visible si es admin
        const botonModificar = document.createElement('button');
        botonModificar.textContent = 'Modificar Cantidad';
        botonModificar.setAttribute('class', 'btn-modificar'); // Asigna una clase
        botonModificar.onclick = () => abrirModalModificarCantidad(almacenId, productoId, cantidadExistente, unidadesMaximas);

        // Botón para eliminar producto, solo visible si es admin
        const botonEliminar = document.createElement('button');
        botonEliminar.textContent = 'Eliminar Producto';
        botonEliminar.setAttribute('class', 'btn-eliminar'); // Asigna una clase
        botonEliminar.onclick = () => eliminarProductoDelAlmacen(almacenId, productoId);

        // Agregar botones según el rol de usuario
        if (isAdmin) {
            contenedorBotonesProducto.appendChild(botonModificar);
            contenedorBotonesProducto.appendChild(botonEliminar);
        }

        // Agregar los elementos al div del producto
        divProducto.appendChild(imgProducto);
        divProducto.appendChild(nombreProducto);
        divProducto.appendChild(cantidadProducto);
        divProducto.appendChild(contenedorBotonesProducto); // Agregar contenedor de botones

        // Finalmente, agregar el div del producto al catálogo
        almacenCatalogo.appendChild(divProducto);
    }).catch((error) => {
        console.error("Error al cargar producto: ", error);
    });
});


        // Agregar el catálogo y los botones al contenedor
        almacenContainer.appendChild(almacenCatalogo);
        almacenContainer.appendChild(contenedorBotones);
        document.body.appendChild(almacenContainer);
        // Agregar el footer al cuerpo del documento
        document.body.appendChild(foot);
    }, (error) => {
        console.error("Error al escuchar cambios en el almacén: ", error);
    });
}

//////////////////////////////////////////////////////////////////////////////
// Para escanear Codigos QR

let html5QrCode; // Declarar html5QrCode en el ámbito superior
let escaneoActivo = false; // Variable para rastrear si el escáner está activo

function escanearQR(almacenId) {
    // Crear una ventana emergente
    const modal = document.createElement('div');
    modal.setAttribute('class', 'modal');

    const modalContent = document.createElement('div');
    modalContent.setAttribute('class', 'modal-content');

    const closeButton = document.createElement('span');
    closeButton.setAttribute('class', 'close-button');
    closeButton.textContent = '×';
    closeButton.style.display = 'none'; // Inicialmente oculto

    // Manejar el cierre del modal
    closeButton.onclick = () => {
        detenerEscaneo(modal);
    };

    const resultElement = document.createElement('div');
    resultElement.setAttribute('class', 'qr-result');

    html5QrCode = new Html5Qrcode("lector-qr"); // Usar ID estático

    // Contenedor para el lector de QR
    const lectorQRContainer = document.createElement('div');
    lectorQRContainer.setAttribute('id', 'lector-qr');
    lectorQRContainer.setAttribute('class', 'lector-qr-container');

    // Botón para detener el escaneo
    const stopButton = document.createElement('button');
    stopButton.textContent = 'Detener Escaneo';
    stopButton.setAttribute('class', 'btn-detener');
    stopButton.onclick = () => {
        detenerEscaneo(modal);
    };

    // Botón para continuar el escaneo
    const continueButton = document.createElement('button');
    continueButton.textContent = 'Continuar Escaneo';
    continueButton.setAttribute('class', 'btn-continuar');
    continueButton.style.display = 'none'; // Inicialmente oculto
    continueButton.onclick = () => {
        continuarEscaneo(almacenId, resultElement);
    };

    modalContent.appendChild(closeButton);
    modalContent.appendChild(lectorQRContainer);
    //modalContent.appendChild(resultElement);
    modalContent.appendChild(stopButton);
    modalContent.appendChild(continueButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Iniciar el escáner
    iniciarEscaneo(almacenId, resultElement);

    // Mostrar la ventana emergente
    modal.style.display = 'flex';
}

function iniciarEscaneo(almacenId, resultElement) {
    html5QrCode.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        },
        (decodedText, decodedResult) => {
            console.log(`Código QR decodificado: ${decodedText}`);
            resultElement.innerHTML = `Código QR: ${decodedText}`;
            procesarQRCode(almacenId, decodedText.trim());
        },
        (errorMessage) => {
            console.log(`Error: ${errorMessage}`);
        }
    ).then(() => {
        escaneoActivo = true; // Indica que el escáner está activo
        document.querySelector('.btn-detener').style.display = 'block'; // Muestra el botón de detener
        document.querySelector('.btn-continuar').style.display = 'none'; // Oculta el botón de continuar
        document.querySelector('.close-button').style.display = 'none'; // Oculta el botón de cerrar
    }).catch(err => {
        console.error(`Error al iniciar el escáner: ${err}`);
    });
}

function detenerEscaneo(modal) {
    if (html5QrCode && escaneoActivo) {
        html5QrCode.stop().then(() => {
            escaneoActivo = false; // Actualiza el estado del escáner

            // Ocultar el botón de detener y mostrar el botón de continuar
            const btnDetener = document.querySelector('.btn-detener');
            const btnContinuar = document.querySelector('.btn-continuar');
            const closeButton = document.querySelector('.close-button');

            if (btnDetener) btnDetener.style.display = 'none'; // Oculta el botón de detener
            if (btnContinuar) btnContinuar.style.display = 'block'; // Muestra el botón de continuar
            if (closeButton) closeButton.style.display = 'block'; // Muestra el botón de cerrar

            if (modal) {
                modal.style.display = 'flex'; // Muestra el modal centrado
            }
        }).catch(err => {
            console.error(`Error al detener el escáner: ${err}`);
        });
    } else if (modal) {
        modal.style.display = 'none'; // Cierra el modal si no hay escáner activo
    }
}

function continuarEscaneo(almacenId, resultElement) {
    // Reinicia el escáner
    iniciarEscaneo(almacenId, resultElement);
}


// Función para procesar el código QR escaneado
async function procesarQRCode(almacenId, codigoQR) {
    try {
        // Limpiar y normalizar el código QR
        const codigoQRNormalizado = codigoQR.trim();
        console.log("Código QR escaneado y limpio:", codigoQRNormalizado);

        // Extraer el nombre del producto y el ID del código QR
        const regex = /Producto:\s*([^,]+),\s*ID:\s*([a-zA-Z0-9]+)/; // Expresión regular para capturar el nombre y el ID
        const match = codigoQRNormalizado.match(regex);

        if (!match) {
            console.log("No se encontró un ID o nombre válido en el código QR.");
            alert("No se encontró un ID o nombre válido en el código QR.");
            return;
        }

        const nombreProducto = match[1].trim(); // Nombre extraído
        const productoId = match[2]; // ID extraído
        console.log("Nombre del producto:", nombreProducto);
        console.log("ID extraído del código QR:", productoId);

        const almacenDoc = await db.collection("Almacenes").doc(almacenId).get();
        const almacen = almacenDoc.data();
        const productos = almacen.productos || {};

        console.log("Productos en el almacén:", Object.keys(productos));

        // Verificar si el ID extraído corresponde a un producto en el almacén
        if (productos.hasOwnProperty(productoId)) {
            const producto = productos[productoId];
            const cantidadExistente = producto.cantidadExistente || 0;

            console.log(`Producto encontrado:`, producto);

            // Verificar si la unidad ya ha sido escaneada
            if (!producto.unidadesEscaneadas) {
                producto.unidadesEscaneadas = [];
            }

            if (producto.unidadesEscaneadas.includes(codigoQRNormalizado)) {
                console.log("Este código QR ya ha sido escaneado.");
                alert("Este código QR ya ha sido escaneado y no se puede usar nuevamente.");
                return;
            }

            if (cantidadExistente > 0) {
                producto.cantidadExistente = cantidadExistente - 1;
                producto.unidadesEscaneadas.push(codigoQRNormalizado); // Marcar como escaneada

                await db.collection("Almacenes").doc(almacenId).update({
                    productos: productos
                });

                console.log("Cantidad reducida correctamente.");
                alert(`Producto escaneado: ${nombreProducto}. Quedan ${producto.cantidadExistente} unidades.`);
            } else {
                console.log("No hay suficiente cantidad disponible.");
                alert("No hay suficiente cantidad disponible.");
            }
        } else {
            console.log("Producto no encontrado en el almacén. ID buscado:", productoId);
            alert("Producto no encontrado en el almacén.");
        }
    } catch (error) {
        console.error("Error al procesar el código QR: ", error);
        alert("Ocurrió un error al procesar el código QR.");
    }
}





//////////////////////////////////////////////////////////////////////////////
//Para generar los codigos QR de los almacenes
async function generarTickets(almacenId) {
    const { jsPDF } = window.jspdf;

    // Crear un nuevo documento PDF
    const doc = new jsPDF();

    // Posiciones iniciales en el PDF
    let xPos = 10; // Posición X inicial
    let yPos = 10; // Posición Y inicial
    const qrSize = 50; // Tamaño de cada código QR
    const maxQRsPerRow = 3; // Máximo número de QR por fila
    const maxQRsPerColumn = 3; // Máximo número de QR por columna (3 filas)
    const maxQRsPerPage = maxQRsPerRow * maxQRsPerColumn; // Total de QR por página
    let qrCount = 0; // Contador de QR para controlar salto de página

    try {
        const almacenDoc = await db.collection("Almacenes").doc(almacenId).get();
        const almacen = almacenDoc.data();
        const productos = almacen.productos || {};

        // Obtener todos los productos y ordenarlos
        const productoIds = Object.keys(productos);
        const productoDocs = await Promise.all(productoIds.map(id => db.collection("Productos").doc(id).get()));
        
        // Agrupar productos por nombre
        const productosPorNombre = {};
        productoDocs.forEach((productoDoc) => {
            const producto = productoDoc.data();
            const unidadesMaximas = productos[productoDoc.id].unidadesMaximas || 0;

            console.log(`Producto encontrado: ${producto.nombre}, ID: ${productoDoc.id}`); 

            if (!productosPorNombre[producto.nombre]) {
                productosPorNombre[producto.nombre] = { producto, unidadesMaximas: 0 };
            }
            productosPorNombre[producto.nombre].unidadesMaximas += unidadesMaximas; // Sumar unidades
        });

        // Iterar sobre cada producto agrupado
        for (const nombre in productosPorNombre) {
            const { producto, unidadesMaximas } = productosPorNombre[nombre];

            // Generar un QR por cada unidad máxima del producto
            for (let i = 0; i < unidadesMaximas; i++) {
                // Obtener el ID del producto desde el documento
                const productoId = productoDocs.find(doc => doc.data().nombre === producto.nombre)?.id;

                // Verificar si el ID del producto está definido
                if (productoId) {
                    const qrCodeData = `Producto: ${producto.nombre}, ID: ${productoId}, Unidad: ${i + 1}`;

                    const qrCode = new QRCodeStyling({
                        width: qrSize,
                        height: qrSize,
                        data: qrCodeData,
                        type: 'png',
                    });

                    // Obtener la imagen QR en formato PNG
                    const qrCodeImage = await qrCode.getRawData('png');

                    // Crear un objeto URL para la imagen QR
                    const qrCodeUrl = URL.createObjectURL(new Blob([qrCodeImage], { type: 'image/png' }));

                    // Crear una nueva imagen para el QR generado
                    const img = new Image();
                    img.src = qrCodeUrl;

                    // Esperar que la imagen se cargue y agregarla al PDF
                    await new Promise((resolve) => {
                        img.onload = function () {
                            // Añadir la imagen QR al PDF
                            doc.addImage(img, 'PNG', xPos, yPos, qrSize, qrSize);
                            doc.text(`Producto: ${producto.nombre}`, xPos, yPos + qrSize + 5);
                            doc.text(`Unidad: ${i + 1}`, xPos, yPos + qrSize + 10);

                            // Actualizar posición para el próximo QR
                            xPos += qrSize + 20;

                            // Si hemos alcanzado el límite de QR por fila, mover a la siguiente fila
                            if ((qrCount + 1) % maxQRsPerRow === 0) {
                                xPos = 10; // Reiniciar posición X
                                yPos += qrSize + 30; // Aumentar la posición Y para la nueva fila
                            }

                            // Si llegamos al límite de QR por página, pasamos a una nueva
                            qrCount++;
                            if (qrCount % maxQRsPerPage === 0) {
                                doc.addPage();
                                xPos = 10; // Reiniciar posición X
                                yPos = 10; // Reiniciar posición Y
                            }

                            resolve();
                        };
                    });
                } else {
                    console.error(`Error: El ID del producto no está definido para ${producto.nombre}`);
                }
            }
        }

        // Guardar el PDF
        doc.save(`tickets-almacen-${almacen.nombre}.pdf`);
    } catch (error) {
        console.error("Error al generar tickets: ", error);
    }
}

//////////////////////////////////////////////////////////////////////////////
// Función para abrir el modal de modificación de cantidad
function abrirModalModificarCantidad(almacenId, productoId, cantidadExistente, unidadesMaximas) {

    // Crear el contenedor del modal
    const modal = document.createElement('div');
    modal.setAttribute('class', 'mod');

    const modalContent = document.createElement('div');
    modalContent.setAttribute('class', 'modal-mod');

    const title = document.createElement('h2');
    title.textContent = 'Modificar Cantidad';

    const labelCantidadExistente = document.createElement('label');
    labelCantidadExistente.textContent = `Cantidad Existente: ${cantidadExistente}`;

    const inputCantidadExistente = document.createElement('input');
    inputCantidadExistente.type = 'number';
    inputCantidadExistente.value = cantidadExistente;
    inputCantidadExistente.min = '0';

    const labelUnidadesMaximas = document.createElement('label');
    labelUnidadesMaximas.textContent = `Cantidad Máxima: ${unidadesMaximas}`;

    const inputUnidadesMaximas = document.createElement('input');
    inputUnidadesMaximas.type = 'number';
    inputUnidadesMaximas.value = unidadesMaximas;
    inputUnidadesMaximas.min = '0';

    const botonGuardar = document.createElement('button');
    botonGuardar.textContent = 'Guardar Cambios';
    botonGuardar.onclick = () => {
        const nuevaCantidadExistente = parseInt(inputCantidadExistente.value);
        const nuevaCantidadMaxima = parseInt(inputUnidadesMaximas.value);

        if (nuevaCantidadExistente >= 0 && nuevaCantidadMaxima >= 0) {
            modificarCantidadProducto(almacenId, productoId, nuevaCantidadExistente, nuevaCantidadMaxima);
            document.body.removeChild(modal); // Cerrar el modal
        } else {
            alert('Por favor, ingresa cantidades válidas.');
        }
    };

    const botonCerrar = document.createElement('span');
    botonCerrar.textContent = '×';
    botonCerrar.classList.add('close');
    botonCerrar.onclick = () => {
        document.body.removeChild(modal); // Cerrar el modal
    };

    // Agregar elementos al contenido del modal
    modalContent.appendChild(title);
    modalContent.appendChild(labelCantidadExistente);
    modalContent.appendChild(inputCantidadExistente);
    modalContent.appendChild(labelUnidadesMaximas);
    modalContent.appendChild(inputUnidadesMaximas);
    modalContent.appendChild(botonGuardar);
    modalContent.appendChild(botonCerrar);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

//////////////////////////////////////////////////////////////////////////////
// Función para modificar la cantidad de un producto en el almacén
function modificarCantidadProducto(almacenId, productoId, nuevaCantidadExistente, nuevaCantidadMaxima) {
    const almacenRef = db.collection("Almacenes").doc(almacenId);

    // Actualizar la cantidad del producto en el almacén
    almacenRef.set({
        productos: {
            [productoId]: {
                unidadesMaximas: nuevaCantidadMaxima,
                cantidadExistente: nuevaCantidadExistente
            }
        }
    }, { merge: true })
    .then(() => {
        alert('Cantidad modificada correctamente.');
        document.body.removeChild(document.querySelector('.almacen-container')); // Cerrar el catálogo actual
        mostrarAlmacen(almacenId); // Volver a cargar el catálogo
    }).catch((error) => {
        console.error("Error al modificar cantidad: ", error);
    });
}

//////////////////////////////////////////////////////////////////////////////
// Función para eliminar un producto del almacén
function eliminarProductoDelAlmacen(almacenId, productoId) {
    const almacenRef = db.collection("Almacenes").doc(almacenId);

    // Eliminar el producto del almacén
    almacenRef.update({
        [`productos.${productoId}`]: firebase.firestore.FieldValue.delete()
    }).then(() => {
        alert('Producto eliminado del almacén.');
        document.body.removeChild(document.querySelector('.almacen-container')); // Cerrar el catálogo actual
        mostrarAlmacen(almacenId); // Volver a cargar el catálogo
    }).catch((error) => {
        console.error("Error al eliminar producto: ", error);
    });
}

//////////////////////////////////////////////////////////////////////////////
// Función para mostrar productos disponibles en un modal estilo catálogo
function mostrarProductos(almacenId) {
    // Crear el contenedor del modal
    const productosContainer = document.createElement('div');
    productosContainer.setAttribute('class', 'productos-container');

    const productosCatalogo = document.createElement('div');
    productosCatalogo.setAttribute('class', 'productos-catalogo');
    
    const cerrarModal = document.createElement('button');
    cerrarModal.textContent = 'Cerrar';
    cerrarModal.setAttribute('class', 'cerrar-modal');
    cerrarModal.onclick = () => document.body.removeChild(productosContainer);

    const productosGrid = document.createElement('div');
    productosGrid.setAttribute('class', 'productos-grid');

    // Cargar productos desde Firestore
    db.collection("Productos").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const producto = doc.data();
            const productoId = doc.id; // Obtener el ID del documento

            // Crear el div del producto
            const divProducto = document.createElement('div');
            divProducto.setAttribute('class', 'producto-item');

            const imgProducto = document.createElement('img');
            imgProducto.src = producto.url || 'https://via.placeholder.com/100'; // Placeholder si no hay imagen
            imgProducto.alt = producto.nombre;

            const nombreProducto = document.createElement('p');
            nombreProducto.textContent = producto.nombre;

            // Verificar si el producto ya está agregado
            db.collection("Almacenes").doc(almacenId).get().then((almacenDoc) => {
                const almacen = almacenDoc.data();
                if (almacen && almacen.productos && almacen.productos[productoId]) {
                    // Si el producto ya está en el almacén, deshabilitar el botón y cambiar el estilo
                    divProducto.style.opacity = '0.5'; // Cambiar el color a más apagado
                    const textoAgregado = document.createElement('p');
                    textoAgregado.textContent = 'Producto ya agregado';
                    divProducto.appendChild(textoAgregado);
                } else {
                    // Crear un input para ingresar la cantidad
                    const inputCantidad = document.createElement('input');
                    inputCantidad.type = 'number';
                    inputCantidad.min = '1'; // Establecer el mínimo en 1
                    inputCantidad.placeholder = 'Cantidad';

                    // Botón para agregar el producto al almacén
                    const botonAgregar = document.createElement('button');
                    botonAgregar.textContent = 'Agregar';
                    botonAgregar.onclick = () => {
                        const cantidad = parseInt(inputCantidad.value);
                        if (cantidad && cantidad > 0) {
                            agregarProductoAlAlmacen(almacenId, productoId, cantidad, divProducto);
                        } else {
                            alert('Por favor, ingrese una cantidad válida.');
                        }
                    };

                    divProducto.appendChild(inputCantidad);
                    divProducto.appendChild(botonAgregar);
                }
            }).catch((error) => {
                console.error("Error al cargar información del almacén: ", error);
            });

            // Agregar los elementos al div del producto
            divProducto.appendChild(imgProducto);
            divProducto.appendChild(nombreProducto);
            productosGrid.appendChild(divProducto);
        });

        productosCatalogo.appendChild(productosGrid);
        productosContainer.appendChild(productosCatalogo);
        productosContainer.appendChild(cerrarModal);
        document.body.appendChild(productosContainer);
    }).catch((error) => {
        console.error("Error al cargar productos: ", error);
    });
}

//////////////////////////////////////////////////////////////////////////////
// Función para agregar un producto al almacén
function agregarProductoAlAlmacen(almacenId, productoId, cantidad, divProducto) {
    const almacenRef = db.collection("Almacenes").doc(almacenId);

    almacenRef.get().then(docSnapshot => {
        if (docSnapshot.exists) {
            // Si el documento ya existe, fusionar con el campo productos existente
            almacenRef.update({
                [`productos.${productoId}`]: {
                    unidadesMaximas: cantidad,
                    cantidadExistente: cantidad,
                    escaneado: false,
                    unidadesEscaneadas: [] // Inicializar como array vacío
                }
            });
        } else {
            // Si el documento no existe, lo creamos con el producto
            almacenRef.set({
                productos: {
                    [productoId]: {
                        unidadesMaximas: cantidad,
                        cantidadExistente: cantidad,
                        escaneado: false,
                        unidadesEscaneadas: [] // Inicializar como array vacío
                    }
                }
            });
        }
    }).then(() => {
        divProducto.style.opacity = '0.5';
        divProducto.innerHTML += `<p>Producto ya agregado (Cantidad: ${cantidad}/${cantidad})</p>`;
    }).catch((error) => {
        console.error("Error al agregar producto: ", error);
    });
}


//////////////////////////////////////////////////////////////////////////////
//nuevo almacen
// Manejo del botón para agregar nuevo almacén
document.getElementById('agregarAlmacen').onclick = () => {
    const nombreAlmacen = document.getElementById('nombreAlmacen').value;
    if (nombreAlmacen) {
        db.collection("Almacenes").add({
            nombre: nombreAlmacen,
            productos: [] // Inicialmente sin productos
        }).then(() => {
            alert('Almacén agregado');
            cargarAlmacenes(); // Recargar la lista de almacenes
            document.getElementById('nombreAlmacen').value = ''; // Limpiar el campo
        }).catch((error) => {
            console.error("Error al agregar almacén: ", error);
        });
    } else {
        alert('Por favor, ingresa un nombre para el almacén.');
    }
};

// Cargar almacenes al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarAlmacenes();
});
