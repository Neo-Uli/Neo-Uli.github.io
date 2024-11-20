// Inicializar Firebase
const db = firebase.firestore();

// Elementos del DOM
const interiorCheckbox = document.getElementById('interior');
const exteriorCheckbox = document.getElementById('exterior');
const interiorQuestions = document.getElementById('interiorQuestions');
const exteriorQuestions = document.getElementById('exteriorQuestions');

const interiorMaterialList = document.getElementById('interiorMaterialList'); // Cambiado a ul
const exteriorMaterialList = document.getElementById('exteriorMaterialList'); // Cambiado a ul
const ventanaMaterialList = document.getElementById('ventanaMaterialList'); // Cambiado a ul
const puertaMaterialSelect = document.getElementById('puertaMaterialList');
const tomacorrienteMaterialSelect = document.getElementById('tomacorrienteMaterial');

// Función para obtener el valor de un parámetro en la URL
function getParameterByName(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Al cargar la página, obtener el nombre del cliente
window.onload = function() {
    const nombreCliente = getParameterByName('nombre');
    if (nombreCliente) {
        document.getElementById('nombre').value = nombreCliente; // Asumiendo que tienes un input con este ID
    }
};

// Función para seleccionar un producto de la lista
function selectProduct(event, element) {
    // Remover la selección previa
    const allItems = element.querySelectorAll('.product-list-item');
    allItems.forEach(item => item.classList.remove('selected'));

    // Marcar el producto seleccionado
    const selectedItem = event.currentTarget;
    selectedItem.classList.add('selected');

    // Obtener el título del acordeón correspondiente
    const accordion = element.closest('.accordion');
    const accordionHeader = accordion.querySelector('.accordion-header span:first-child');

    // Obtener los datos del producto seleccionado (nombre y precio)
    const productName = selectedItem.querySelector('span').textContent;

    // Actualizar el título del acordeón con el producto seleccionado
    accordionHeader.textContent = `Producto seleccionado: ${productName}`;

    // Cerrar el acordeón (retraer la lista)
    accordion.classList.remove('open');
}

// Función para alternar el acordeón (abrir/cerrar)
function toggleAccordion(header) {
    const accordion = header.parentElement;
    accordion.classList.toggle('open');
}

// Función modificada para cargar productos
function loadMaterials(categoria, element, isList = false) {
    db.collection('Productos').where('categoria', '==', categoria).get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                console.log(`No se encontraron materiales para ${categoria}`);
            } else {
                element.innerHTML = ""; // Limpiar las opciones anteriores

                querySnapshot.forEach((doc) => {
                    const material = doc.data();

                    if (isList) {
                        const listItem = document.createElement('li');
                        listItem.classList.add('product-list-item');
                        listItem.addEventListener('click', (event) => selectProduct(event, element));
                        listItem.addEventListener('click', (event) => selectProductV(event, element));

                        const image = document.createElement('img');
                        image.src = material.url;
                        image.alt = material.nombre;

                        const text = document.createElement('span');
                        text.textContent = `${material.nombre} - $${material.precio}`;

                        listItem.appendChild(image);
                        listItem.appendChild(text);
                        element.appendChild(listItem);
                    }
                });
            }
        })
        .catch((error) => {
            console.log("Error al obtener los materiales: ", error);
        });
}

// Función para mostrar/ocultar preguntas basadas en la selección
function updateQuestions() {
    if (interiorCheckbox.checked) {
        interiorQuestions.classList.remove('hidden');
        loadMaterials('interior', interiorMaterialList, true); // Cargar productos de interior
    } else {
        interiorQuestions.classList.add('hidden');
    }

    if (exteriorCheckbox.checked) {
        exteriorQuestions.classList.remove('hidden');
        loadMaterials('exterior', exteriorMaterialList, true); // Cargar productos de exterior
    } else {
        exteriorQuestions.classList.add('hidden');
    }
}

// Función para cargar productos para ventanas, puertas, y tomacorrientes
function updateExtraFields() {
    const ventanasInput = document.getElementById('ventanas');
    const puertasInput = document.getElementById('puertas');
    const tomacorrientesInput = document.getElementById('tomacorrientes');

    ventanasInput.addEventListener('input', function () {
        if (parseInt(ventanasInput.value) > 0) {

            document.getElementById('ventanaAccordion').classList.remove('hidden');
            loadMaterials('Ventana', ventanaMaterialList, true); // Aquí se pasa 'true' porque es una lista
        } else {
            document.getElementById('ventanaAccordion').classList.add('hidden');
        }
    });

    puertasInput.addEventListener('input', function () {
        if (parseInt(puertasInput.value) > 0) {
            document.getElementById('puertaAccordion').classList.remove('hidden');
            loadMaterials('Puertas', puertaMaterialSelect, true);
        } else {
            document.getElementById('puertaAccordion').classList.add('hidden');
        }
    });

    tomacorrientesInput.addEventListener('input', function () {
        if (parseInt(tomacorrientesInput.value) > 0) {
            document.getElementById('tomacorrienteAccordion').classList.remove('hidden');
            loadMaterials('Toma Corriente', tomacorrienteMaterialSelect, true);
        } else {
            document.getElementById('tomacorrienteAccordion').classList.add('hidden');
        }
    });
}


function calculatePerfil() {
    const interiorArea = parseFloat(document.getElementById('interiorArea').value) || 0;
    const exteriorArea = parseFloat(document.getElementById('exteriorArea').value) || 0;
    
    const totalArea = interiorArea + exteriorArea;

    const alturaMuro = 2.5; // Altura por defecto en metros

//Calcular Perfil
    const espaciadoMontantes = 0.60; // Espaciado por defecto en metros

    // Calcular el largo del muro a partir del área y la altura (largo = área / altura)
    const largoMuro = Math.ceil(totalArea / alturaMuro);

    // Calcular el perfil canal (superior e inferior)
    const perfilCanal = Math.ceil(largoMuro * 2);

    // Calcular la cantidad de montantes
    const cantidadMontantes = Math.ceil(largoMuro / espaciadoMontantes);

    // Calcular el perfil montante (cantidad de montantes multiplicado por la altura del muro)
    const perfilMontante = Math.ceil(cantidadMontantes * alturaMuro);

    // Total de perfiles necesarios
    const totalPerfiles = perfilCanal + perfilMontante;
    document.getElementById('perfil').value = totalPerfiles;

//Calcular producto para juntas
    const anchoMuro = Math.ceil(totalArea / alturaMuro); // Ancho del muro en metros
    const perimetroMuro = Math.ceil(2 * (anchoMuro + alturaMuro)); // Cálculo del perímetro

    const productoPorMetro = 0.2; // Litros de producto para juntas por metro de unión
    const totalProducto = Math.ceil(perimetroMuro * productoPorMetro); // Total de producto necesario
    document.getElementById('productoJuntas').value = totalProducto;
    
//Calcular Cable TomaCorrientes
    const tomaCorrientes = parseFloat(document.getElementById('tomacorrientes').value) || 0;

    const cableTomacorriente = 5; //metros de cable por cada tomacorrientes

    const cableTotal = Math.ceil(tomaCorrientes * cableTomacorriente);
    document.getElementById('cable').value = cableTotal;

//Calcular Perfacinta
    const perfacintaPorMetroCuadrado = 0.1; // Metros de perfacinta por metro cuadrado
    const cantidadAdicionalPorTomacorriente = 1; // Cantidad adicional de perfacinta por tomacorriente (valor predeterminado)

    // Calcular el total de perfacinta para el área del muro
    const perfacintaPorArea = Math.ceil(totalArea * perfacintaPorMetroCuadrado);

    // Calcular la cantidad adicional de perfacinta por tomacorrientes
    const perfacintaPorTomacorrientes = Math.ceil(tomaCorrientes * cantidadAdicionalPorTomacorriente);

    // Total de perfacinta necesario
    const totalPerfacinta = Math.ceil(perfacintaPorArea + perfacintaPorTomacorrientes);
    document.getElementById('cinta').value = totalPerfacinta;

//calcular Tornillos
    const tornillos = Math.ceil(totalArea * 50);  // Ejemplo para tornillos
    document.getElementById('tornillos').value = tornillos;

//Calcular silicon
    const ventana = parseFloat(document.getElementById('ventanas').value) || 0;
    const puerta = parseFloat(document.getElementById('puertas').value) || 0;

    const siliconVentana = Math.ceil(ventana * 1.5);
    const siliconPuerta = Math.ceil(puerta * 2.5);

    const siliconTotal = Math.ceil(siliconVentana + siliconPuerta);

    document.getElementById('silicon').value = siliconTotal;
}


// Cargar productos iniciales y eventos
window.onload = function () {
    updateQuestions();
    updateExtraFields();

    document.getElementById('interiorArea').addEventListener('input', calculatePerfil);
    document.getElementById('exteriorArea').addEventListener('input', calculatePerfil);
    document.getElementById('tomacorrientes').addEventListener('input',calculatePerfil);
    document.getElementById('puertas').addEventListener('input',calculatePerfil);
    document.getElementById('ventanas').addEventListener('input',calculatePerfil);
};

// Actualizar cuando cambien los checkboxes
interiorCheckbox.addEventListener('change', updateQuestions);
exteriorCheckbox.addEventListener('change', updateQuestions);


/////////////////////////////////////

// Función para seleccionar un producto de la lista y obtener su nombre y precio
function selectProductV(event, listElement) {
    const selectedItem = event.currentTarget;
    const productName = selectedItem.querySelector('span').textContent.split(' - $')[0];
    const productPrice = selectedItem.querySelector('span').textContent.split(' - $')[1];

    // Aquí puedes decidir a qué inputs ocultos actualizar
    if (listElement.id === 'interiorMaterialList') {
        document.getElementById('interiorMaterialListNombre').value = productName;
        document.getElementById('interiorMaterialListPrecio').value = productPrice;
    } else if (listElement.id === 'exteriorMaterialList') {
        document.getElementById('exteriorMaterialListNombre').value = productName;
        document.getElementById('exteriorMaterialListPrecio').value = productPrice;
    } else if (listElement.id === 'ventanaMaterialList') {
        document.getElementById('ventanaMaterialListNombre').value = productName;
        document.getElementById('ventanaMaterialListPrecio').value = productPrice;
    } else if (listElement.id === 'puertaMaterialList') {
        document.getElementById('puertaMaterialSelectNombre').value = productName;
        document.getElementById('puertaMaterialSelectPrecio').value = productPrice;
    } else if (listElement.id === 'tomacorrienteMaterial') {
        document.getElementById('tomacorrienteMaterialSelectNombre').value = productName;
        document.getElementById('tomacorrienteMaterialSelectPrecio').value = productPrice;
    }

    console.log(`Producto seleccionado: ${productName} - $${productPrice}`);
}


//Cotizacion
// Función para mostrar la cotización
let descripcionTrabajo = '';
function mostrarCotizacion() {
    const cotizacionDetalles = document.getElementById('cotizacionDetalles');

        // Obtener nombre del cliente y la fecha actual
        const nombreCliente = document.getElementById('nombre').value;
        const fechaActual = new Date();
        const fechaFormateada = `${fechaActual.getDate()}/${fechaActual.getMonth() + 1}/${fechaActual.getFullYear()}`;
        const fechah = new Date();
        fechah.setDate(fechaActual.getDate() + 15);
        const fechaExpira = `${fechah.getDate()}/${fechah.getMonth() + 1}/${fechah.getFullYear()}`;
    
        // Mostrar el nombre del cliente y la fecha en la cotización
        document.getElementById('nombreCliente').textContent = nombreCliente;
        document.getElementById('fechaCotizacion').textContent = fechaFormateada;
        document.getElementById('fechaExpira').textContent = fechaExpira;
    
    // Obtener los valores de las áreas
    const areaInterior = parseFloat(document.getElementById('interiorArea').value);
    const areaExterior = parseFloat(document.getElementById('exteriorArea').value);
    //let descripcionTrabajo = '';

    // Inicializa una variable para el total
    let totalGeneral = 0;

    // Generar el texto dependiendo de las selecciones
    if (areaInterior > 0 && areaExterior > 0) {
        descripcionTrabajo = `La cotización ha sido realizada tomando en cuenta que es para un trabajo en ambas áreas: 
        Interior (${areaInterior} m²) y Exterior (${areaExterior} m²).`;
    } else if (areaInterior > 0) {
        descripcionTrabajo = `La cotización ha sido realizada tomando en cuenta que es para un trabajo en el área interior (${areaInterior} m²).`;
    } else if (areaExterior > 0) {
        descripcionTrabajo = `La cotización ha sido realizada tomando en cuenta que es para un trabajo en el área exterior (${areaExterior} m²).`;
    } else {
        descripcionTrabajo = 'No se ha especificado área interior o exterior.';
    }

        // Precios de prueba
        const precioPerfil = 30; // Precio por metro
        const precioCinta = 1.18; // Precio por metro
        const precioCable = 15;
        const precioTornillos = 0.23; // Precio por pieza
        const precioProductoJuntas = 80; // Precio por litro
        const precioSilicon = 100; // Precio por litro
    
        // Cálculo de subtotales
        const subtotalPerfil = precioPerfil * parseFloat(document.getElementById('perfil').value);
        const subtotalCinta = precioCinta * parseFloat(document.getElementById('cinta').value);
        const subtotalTornillos = precioTornillos * parseFloat(document.getElementById('tornillos').value);
        const subtotalProductoJuntas = precioProductoJuntas * parseFloat(document.getElementById('productoJuntas').value);
        const subtotalSilicon = precioSilicon * parseFloat(document.getElementById('silicon').value);

// Generar la tabla
cotizacionDetalles.innerHTML = `
    <h3>Detalles de la Cotización:</h3>
    <p><strong>${descripcionTrabajo}</strong></p>
    <table>
        <thead>
            <tr>
                <th>Material</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>
            ${generateMaterialRow('Ventanas', document.getElementById('ventanas').value, document.getElementById('ventanaMaterialListPrecio').value)}
            ${generateMaterialRow('Puertas', document.getElementById('puertas').value, document.getElementById('puertaMaterialSelectPrecio').value)}
            ${generateMaterialRow('Tomacorrientes', document.getElementById('tomacorrientes').value, document.getElementById('tomacorrienteMaterialSelectPrecio').value)}
            ${generateMaterialRow('Material de Interior', document.getElementById('interiorArea').value, document.getElementById('interiorMaterialListPrecio').value)}
            ${generateMaterialRow('Material de Exterior', document.getElementById('exteriorArea').value, document.getElementById('exteriorMaterialListPrecio').value)}
            ${generateMaterialRow('Perfiles', document.getElementById('perfil').value, precioPerfil)}
            ${generateMaterialRow('Cinta', document.getElementById('cinta').value, precioCinta)}
            ${generateMaterialRow('Tornillos', document.getElementById('tornillos').value, precioTornillos)}
            ${generateMaterialRow('Producto para Juntas', document.getElementById('productoJuntas').value, precioProductoJuntas)}
            ${generateMaterialRow('Silicón', document.getElementById('silicon').value, precioSilicon)}
            ${generateMaterialRow('Cable', document.getElementById('cable').value, precioCable)}

        </tbody>
    </table>
    <h3>Total: $${totalGeneral.toFixed(2)} MXN</h3>
`;

    // Función para generar filas de materiales
function generateMaterialRow(nombre, cantidad, precio) {
    // Calcula el subtotal
    let subtotal = cantidad * precio;
    // Solo genera la fila si la cantidad es mayor a 0
    if (cantidad > 0) {
        totalGeneral += subtotal; // Sumar al total general
        return `
            <tr>
                <td>${nombre}</td>
                <td>${cantidad}${isNaN(cantidad) ? '' : ' pz|m'}</td>
                <td>$${precio} MXN</td>
                <td>$${subtotal.toFixed(2)} MXN</td>
            </tr>
        `;
    }
    return ''; // Retorna vacío si la cantidad es 0
}
    
    // Ocultar el formulario y mostrar la cotización
    document.getElementById('cotizacionForm').classList.add('hidden');
    document.getElementById('cotizacion').classList.remove('hidden');
}

// Evento para el botón de cotizar
document.getElementById('cotizarBtn').addEventListener('click', mostrarCotizacion);

// Evento para regresar al formulario
document.getElementById('regresarBtn').addEventListener('click', function() {
    document.getElementById('cotizacionForm').classList.remove('hidden');
    document.getElementById('cotizacion').classList.add('hidden');
});


//PDF
// Asumiendo que ya tienes configurado Firebase correctamente con Firebase Storage y Firestore

function generatePDF() {
    // Selecciona el formulario
    var element = document.getElementById('cotizacion');

    // Obtener el nombre del cliente
    var nombreCliente = document.getElementById('nombreCliente').textContent.trim() || 'Cotizacion';

    // Ocultar el botón de PDF y el botón de regresar
    var pdfButton = document.getElementById('pdf');
    var regresarButton = document.getElementById('regresarBtn');
    pdfButton.style.display = 'none';
    regresarButton.style.display = 'none';

    // Usar html2pdf para convertir el contenido a PDF y guardarlo en memoria
    html2pdf()
        .from(element)
        .set({
            margin: 0.5,
            filename: `${nombreCliente}_cotizacion.pdf`,
            html2canvas: { scale: 2 },
            jsPDF: {
                orientation: 'portrait',
                format: 'a4',
                unit: 'in',
                putOnlyUsedFonts: true,
                floatPrecision: 16
            }
        })
        .outputPdf('blob') // Generar el PDF en formato Blob
        .then(function (pdfBlob) {
            // Llamar a la función para subir el PDF a Firebase Storage
            return uploadPDFToFirebase(pdfBlob, `${nombreCliente}_cotizacion.pdf`);
        })
        .then((downloadURL) => {
            // Después de subir el archivo, guardar el enlace en Firestore
            return savePDFLinkToFirestore(downloadURL, nombreCliente);
        })
        .then(() => {
            // Mostrar los botones nuevamente
            pdfButton.style.display = 'block';
            regresarButton.style.display = 'block';
            alert('Cotización guardada exitosamente.');
        })
        .catch((error) => {
            console.error('Error al generar o guardar el PDF:', error);
        });
}

// Función para subir el PDF a Firebase Storage
function uploadPDFToFirebase(pdfBlob, fileName) {
    // Referencia al almacenamiento de Firebase
    var storageRef = firebase.storage().ref();

    // Crear referencia al archivo en Firebase Storage
    var pdfRef = storageRef.child(`cotizaciones/${fileName}`);

    // Subir el archivo PDF
    return pdfRef.put(pdfBlob).then(function (snapshot) {
        // Obtener la URL de descarga del archivo
        return snapshot.ref.getDownloadURL();
    });
}

// Función para guardar la URL del PDF y el nombre del cliente en Firestore
function savePDFLinkToFirestore(downloadURL, nombreCliente) {
    // Referencia a Firestore
    var firestore = firebase.firestore();

    // Guardar la cotización en Firestore
    return firestore.collection('cotizaciones').add({
        nombre: nombreCliente,
        pdfUrl: downloadURL,
        fecha: firebase.firestore.FieldValue.serverTimestamp() // Guardar la fecha actual
    });
}

// Añadir el evento para generar el PDF
document.getElementById('pdf').addEventListener('click', generatePDF,uploadPDFToFirebase,savePDFLinkToFirestore);





/*
document.getElementById('pdf').addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Aquí va el contenido del PDF, como la descripción del trabajo
    doc.text('Detalles de la Cotización', 10, 10);
    doc.text(`Descripción: ${descripcionTrabajo}`, 10, 20);

    // Configura la tabla con autoTable
    doc.autoTable({
        head: [['Material', 'Cantidad', 'Precio Unitario', 'Subtotal']],
        body: [
            [document.getElementById('ventanaMaterialListNombre').value || 'Ventanas', document.getElementById('ventanas').value, document.getElementById('ventanaMaterialListPrecio').value || '0.00', (document.getElementById('ventanas').value * document.getElementById('ventanaMaterialListPrecio').value).toFixed(2)],
            [document.getElementById('puertaMaterialSelectNombre').value || 'Puertas', document.getElementById('puertas').value, document.getElementById('puertaMaterialSelectPrecio').value || '0.00', (document.getElementById('puertas').value * document.getElementById('puertaMaterialSelectPrecio').value).toFixed(2)],
            [document.getElementById('tomacorrienteMaterialSelectNombre').value || 'Tomacorrientes', document.getElementById('tomacorrientes').value, document.getElementById('tomacorrienteMaterialSelectPrecio').value || '0.00', (document.getElementById('tomacorrientes').value * document.getElementById('tomacorrienteMaterialSelectPrecio').value).toFixed(2)],
            // Agrega más filas según sea necesario...
        ]
    });

    // Genera el PDF
    doc.save('cotizacion.pdf');
});
*/





/*
const interiorCheckbox = document.getElementById('interior');
const exteriorCheckbox = document.getElementById('exterior');
const interiorQuestions = document.getElementById('interiorQuestions');
const exteriorQuestions = document.getElementById('exteriorQuestions');
//referencia a los select de materiales
const interiorMaterialSelect = document.getElementById('interiorMaterial');
const exteriorMaterialSelect = document.getElementById('exteriorMaterial');
//Referencia a los campos de metros
const interiorAreaInput = document.getElementById('interiorArea');
const exteriorAreaInput = document.getElementById('exteriorArea');
//referencias para formulario y resultados
const cotizacionForm = document.getElementById('cotizacionForm');
const cotizacionResultado = document.getElementById('cotizacionResultado');
const cotizarBtn = document.getElementById('cotizarBtn');
const atrasBtn = document.getElementById('atrasBtn');
const resultadoInterior = document.getElementById('resultadoInterior');
const resultadoExterior = document.getElementById('resultadoExterior');
const resultadoTotal = document.getElementById('resultadoTotal');

//variables para almacenar los resultados de los calculos
let totalInteriorCost = 0;
let totalExteriorCost = 0;

//----------------------------------------------------------//
//inicializa Firebase
const db = firebase.firestore();

//-------------------------------------------------------------
//Funcion para obtener el precio seleccionado y calcular el costo
function calculateCost(selectElement, areaInput) {
    const selectedIndex = selectElement.selectedIndex;

    if (selectedIndex === -1) {
        console.log('no hay ninguna opcion seleccionada');
        return 0;
    }

    const selectedOption = selectElement.options[selectedIndex];
    const selectedPrice = parseFloat(selectedOption.getAttribute('data-precio'));
    const selectedArea = parseFloat(areaInput.value);

    if (!selectedPrice || isNaN(selectedPrice)) {
        console.log('El precio no está definido para la opción seleccionada.');
        return 0;
    }

    if (!selectedArea || isNaN(selectedArea)) {
        console.log('No se ingresó un valor válido para los metros.');
        return 0;
    }

    //calcula el costo
    const totalCost = selectedPrice * selectedArea;
    console.log(`Material seleccionado: ${selectedOption.value}`);
    console.log(`Precio del material seleccionado: ${selectedPrice}`);
    console.log(`Metros ingresados: ${selectedArea}`);
    console.log(`Costo total: ${totalCost}`);

    return totalCost;

}

//Evento para calcular el costo del interior cuando se cambie el material o el area
interiorMaterialSelect.addEventListener('change', function(){
    totalInteriorCost = calculateCost(interiorMaterialSelect, interiorAreaInput);
});

interiorAreaInput.addEventListener('input', function() {
    totalInteriorCost = calculateCost(interiorMaterialSelect, interiorAreaInput);
});

// Evento para calcular el costo del exterior cuando se cambie el material o el área
exteriorMaterialSelect.addEventListener('change', function() {
    totalExteriorCost = calculateCost(exteriorMaterialSelect, exteriorAreaInput);
});

exteriorAreaInput.addEventListener('input', function() {
    totalExteriorCost = calculateCost(exteriorMaterialSelect, exteriorAreaInput);
});

// Función para obtener el costo total (interior, exterior y la suma)
function getTotalCost() {
    const totalCost = totalInteriorCost + totalExteriorCost;

    console.log(`Costo total del interior: ${totalInteriorCost}`);
    console.log(`Costo total del exterior: ${totalExteriorCost}`);
    console.log(`Costo total del proyecto: ${totalCost}`);
    
    //devuelve un objeto con los 3 valores
    return {
        interior: totalInteriorCost,
        exterior: totalExteriorCost,
        total: totalCost
    };
}

function ver() {
    const v = getTotalCost();

    console.log(`Costo total del interior: ${v.interior}`);
    console.log(`Costo total del exterior: ${v.exterior}`);
    console.log(`Costo total del proyecto: ${v.total}`);
}

//const total = getTotalCost();
//console.log(`el ${total}`);


//------------------------------------------------------------
//actualiza form dependiendo de la primera pregunta
function updateQuestions() {
    if(interiorCheckbox.checked && exteriorCheckbox.checked) {
        //mostrar ambas secciones
        interiorQuestions.classList.remove('hidden');
        exteriorQuestions.classList.remove('hidden');
    } else if (interiorCheckbox.checked) {
        //mostrar solo preguntas del interior
        interiorQuestions.classList.remove('hidden');
        exteriorQuestions.classList.add('hidden');
    } else if (exteriorCheckbox.checked) {
        interiorQuestions.classList.add('hidden');
        exteriorQuestions.classList.remove('hidden');
    } else {
        //si no hay opcion seleccionada, ocultar todo
        interiorQuestions.classList.add('hidden');
        exteriorQuestions.classList.add('hidden');
    }
}



//--------------------------------------------------------------------
//Funcion para cargar materiales desde firestore
function loadMaterials(categoria, selectElement) {
    console.log(`cargando materiales para tipo: ${categoria}`); //verificar que se llama a la funcion 
    db.collection('Productos').where('categoria', '==', categoria).get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                console.log(`No se encontraron materiales para el tipo: ${categoria}`);
            } else {
                querySnapshot.forEach((doc) => {
                    const material = doc.data();
                    console.log(`Material cargado: ${material.nombre}, Precio: ${material.precio}`); // Verificar carga de datos
                    
                    const option = document.createElement('option');
                    option.value = material.nombre; // Puedes usar el ID si lo necesitas
                    option.textContent = material.nombre; // Muestra solo el nombre en la lista
                    
                    //Guardar el precio en un atributo 
                    option.setAttribute('data-precio', material.precio);
                    selectElement.appendChild(option);
                });
            }
        })
        .catch((error) => {
            console.log("Error al obtener materiales: ", error);
        });
}


//-----------------------------------------------------------------
//Funcion para obtener y mostrar el precio seleccionado
function logSelectedPrice(selectElement) {
    //verificar si hay una opcion seleccionada
    const selectedIndex = selectElement.selectedIndex;

    if (selectedIndex === -1) {
        console.log('No hay ninguna opcion seleccionada');
        return;
    }

    const selectedOption = selectElement.options[selectedIndex];
    console.log(`opcion seleccionada: ${selectedOption.value}`);

    const selectedPrice = selectedOption.getAttribute('data-precio');

    if (selectedPrice) {
        console.log(`Material seleccionado: ${selectedOption.value}`);
        console.log(`Precio del material Seleccionado: ${selectedPrice}`);

    } else {
        console.log('El precio no está definido para la opción seleccionada.');
    }
}
////////////////////////////////////


//evento para detectar cuando cambia el material seleccionado en interior
interiorMaterialSelect.addEventListener('change', function(){
    console.log('Cambio detectado en interiorMaterialSelect');
    logSelectedPrice(interiorMaterialSelect);
});

//evento para detectar cuando cambia el material seleccionado en exterior
exteriorMaterialSelect.addEventListener('change', function(){
    console.log('Cambio detectado en exteriorMaterialSelect');
    logSelectedPrice(exteriorMaterialSelect);
});

//ejecutar las funciones cuando la pagina cargue
window.onload = function() {
    updateQuestions();

    //cargar materiales segun el tipo
    loadMaterials('interior', interiorMaterialSelect);
    loadMaterials('exterior', exteriorMaterialSelect);
};

//Agregar eventos de cambio
interiorCheckbox.addEventListener('change', updateQuestions);
exteriorCheckbox.addEventListener('change', updateQuestions);



////////////////////
//Evento para mostrar la cotizacion y ocultar el formulario
cotizarBtn.addEventListener('click', function(){
    const {interior, exterior, total } = getTotalCost();

    //mostrar resultados
    resultadoInterior.textContent = `costo total del interior: $${interior.toFixed(2)}`;
    resultadoExterior.textContent = `costo total del Exterior: $${exterior.toFixed(2)}`;
    resultadoTotal.textContent = `costo total del proyecto: $${total.toFixed(2)}`;

    //ocultar formulario y mostrar resultados
    cotizacionForm.classList.add('hidden');
    cotizacionResultado.classList.remove('hidden');
});

//Evento para regresar al formulario
atrasBtn.addEventListener('click', function() {
    cotizacionForm.classList.remove('hidden');
    cotizacionResultado.classList.add('hidden');
})
*/