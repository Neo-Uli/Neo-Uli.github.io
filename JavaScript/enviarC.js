//obtener una referencia a la coleccion "Usuarios" en firestore
const cotizaciones = firebase.firestore().collection('Cotizar');

//Select de pregunta interior o exterior
const interiorCheckbox = document.getElementById('interior');
const exteriorCheckbox = document.getElementById('exterior');

//Actualizar form dependiendo de el area para el que se requiere el trabajo
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

//ejecutar las funciones cuando la pagina cargue
window.onload = function() {
    updateQuestions();
};

//Agregar eventos de cambio
interiorCheckbox.addEventListener('change', updateQuestions);
exteriorCheckbox.addEventListener('change', updateQuestions);

function SendCotiza() {
    const nombreElement = document.getElementById('nombre');
    if (!nombreElement) {
        console.error('No se pudo encontrar el campo de nombre');
        return;
    }
    const nombre = nombreElement.value.trim();
    //const tipo_area = document.querySelector('input[name="tipo_area"]:checked')?.value;
    const metros_interior = parseInt(document.getElementById('interiorArea').value, 10);
    const metros_exterior = parseInt(document.getElementById('exteriorArea').value, 10);
    const ventanas = parseInt(document.getElementById('ventanas').value, 10);
    const puertas = parseInt(document.getElementById('puertas').value, 10);
    const tomacorrientes = parseInt(document.getElementById('tomacorrientes').value, 10);
    const acabados = Array.from(document.querySelectorAll('input[name="acabado"]:checked')).map(checkbox => checkbox.value);
    const notas = document.getElementById('notas').value;

    // Validar si los campos obligatorios están completos
    if (!nombre) {
        alert('Por favor, ingresa un nombre.');
        return;
    }
    /*
    if (!tipo_area) {
        alert('Por favor, selecciona si es interior o exterior.');
        return;
    }
    */    
    if (isNaN(metros_interior) || isNaN(metros_exterior) || isNaN(ventanas) || isNaN(puertas) || isNaN(tomacorrientes)) {
        alert('Por favor, completa todos los campos numéricos.');
        return;
    }
    
    // Para agregar a Firestore
    const nuevaCotiza = {
        nombre: nombre,
        //tipo_area: tipo_area,
        metros_interior: metros_interior,
        metros_exterior: metros_exterior,
        ventanas: ventanas,
        puertas: puertas,
        tomacorrientes: tomacorrientes,
        acabados: acabados,
        notas: notas || 'Sin notas adicionales',
        fecha: new Date(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp() // Registrar la fecha y hora
    };

    cotizaciones.add(nuevaCotiza)
    .then((docRef) => {
        console.log('Documento agregado con ID:', docRef.id);
        alert('Cotización enviada con éxito');

                // Resetear el formulario
                const formulario = document.getElementById('cotizacionForm'); // Cambia 'miFormulario' por el ID de tu formulario
                formulario.reset(); // Restablecer el formulario
    })
    .catch((error) => {
        console.log('Error al agregar:', error);
    });
}
