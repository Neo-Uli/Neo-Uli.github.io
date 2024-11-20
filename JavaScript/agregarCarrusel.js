const realtime = firebase.database();

//const storage = firebase.storage();
var refPromociones = realtime.ref("Carrusel");

var ref;

const storage = firebase.storage();
const firestore = firebase.firestore(); // Inicializa Firestore

function SubirPromo() {
  const promo = document.getElementById("promo").value;
  const img = document.getElementById("fileInput");
  const infoImg = document.getElementById("infor");
  var file = img.files[0];
  var infoFile = infoImg.files[0];

  var storageRef = firebase.storage().ref();
  var promoFileRef = storageRef.child(`Promociones/${promo}_promocion`);
  var infoFileRef = storageRef.child(`Promociones/${promo}_info`);

  // Subir imagen promocional
  promoFileRef.put(file).then(snapshot => {
    return promoFileRef.getDownloadURL();
  }).then(promoUrl => {
    // Subir imagen de información
    return infoFileRef.put(infoFile).then(snapshot => {
      return infoFileRef.getDownloadURL().then(infoUrl => {
        // Guardar ambos URLs en Firestore
        const nuevaPromo = {
          promo: promo,
          imagenPromocional: promoUrl,
          imagenInformacion: infoUrl
        };

        return firebase.firestore().collection("Promociones").add(nuevaPromo);
      });
    });
  }).then(() => {
    console.log("Promoción agregada con éxito!");
    document.getElementById("formulario-promo").reset(); // Restablecer formulario
  }).catch(error => {
    console.error("Error al subir la promoción:", error);
  });
}

// Función para abrir el formulario en la ventana flotante
function abrirFormulario() {
  document.getElementById("modal").style.display = "block";
}

// Función para cerrar el formulario en la ventana flotante
function cerrarFormulario() {
  document.getElementById("modal").style.display = "none";
}

// Cerrar la ventana si se hace clic fuera del contenido
window.onclick = function(event) {
  const modal = document.getElementById("modal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

/////////////////

// Cargar promociones al iniciar y escuchar cambios en tiempo real
function cargarPromociones() {
  const promocionesContainer = document.getElementById("promociones-container");
  promocionesContainer.innerHTML = ''; // Limpiar contenido antes de actualizar

  // Escuchar cambios en Firestore en la colección "Promociones"
  firebase.firestore().collection("Promociones").onSnapshot((querySnapshot) => {
    promocionesContainer.innerHTML = ''; // Limpiar contenido antes de actualizar

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const promoCard = document.createElement("div");
      promoCard.classList.add("promo-card");

      // Crear miniatura de imagen promocional
      const img = document.createElement("img");
      img.src = data.imagenPromocional; // Usar la URL de la imagen promocional
      img.onclick = function() {
        ampliarImagen(data.imagenInformacion); // Mostrar imagen de información al hacer clic
      };

      // Crear nombre de la promoción
      const promoInfo = document.createElement("div");
      promoInfo.classList.add("promo-info");
      promoInfo.textContent = data.promo;

      // Botón para eliminar
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Eliminar";
      deleteButton.onclick = function() {
        eliminarPromo(doc.id, data.imagenPromocional, data.imagenInformacion); // Pasar ID del documento y ambas URLs
      };

      promoCard.appendChild(img);
      promoCard.appendChild(promoInfo);
      promoCard.appendChild(deleteButton);

      promocionesContainer.appendChild(promoCard);
    });
  }, (error) => {
    console.error("Error al cargar promociones: ", error);
  });
}


// Ampliar imagen de información al hacer clic en la imagen promocional
// Ampliar imagen de información al hacer clic en la imagen promocional
function ampliarImagen(url) {
  // Crear o seleccionar el modal para la imagen
  let modal = document.getElementById("modal-imagen");
  
  if (!modal) {
    // Crear el modal si no existe
    modal = document.createElement("div");
    modal.id = "modal-imagen";
    modal.classList.add("modal-imagen");

    // Crear el botón de cerrar
    const closeBtn = document.createElement("span");
    closeBtn.classList.add("close-modal");
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = function() {
      modal.style.display = "none"; // Ocultar el modal al hacer clic en el botón de cerrar
    };

    // Crear la imagen
    const img = document.createElement("img");

    // Crear el contenedor para el contenido del modal
    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-contentIMG");

    // Crear el título
    const titulo = document.createElement("h2");
    titulo.textContent = "Información de la promoción"; // Agregar texto del título
    titulo.classList.add("modal-title"); // Agregar clase para estilos

    // Añadir título, imagen y botón de cerrar al contenedor del modal
    modalContent.appendChild(titulo);
    modalContent.appendChild(img);
    modalContent.appendChild(closeBtn);

    // Añadir el contenedor del modal al modal
    modal.appendChild(modalContent);

    // Añadir el modal al cuerpo del documento
    document.body.appendChild(modal);
  }

  // Establecer la URL de la imagen en el modal y mostrarlo
  modal.querySelector("img").src = url;
  modal.style.display = "flex"; // Mostrar el modal
}




// Eliminar promoción
function eliminarPromo(docId, promoUrl, infoUrl) {
  if (confirm(`¿Estás seguro de eliminar la promoción?`)) {
    // Eliminar de Firestore usando el ID del documento
    firebase.firestore().collection("Promociones").doc(docId).delete()
      .then(() => {
        console.log("Promoción eliminada de Firestore con éxito");

        // Eliminar ambas imágenes del storage
        var fileRefPromo = storage.refFromURL(promoUrl);
        var fileRefInfo = storage.refFromURL(infoUrl);

        return Promise.all([fileRefPromo.delete(), fileRefInfo.delete()]);
      })
      .then(() => {
        console.log("Imágenes eliminadas del Storage con éxito");
        cargarPromociones(); // Actualizar la lista de promociones
      })
      .catch((error) => {
        console.error("Error al eliminar la promoción:", error);
      });
  }
}



// Cargar promociones al inicio
window.onload = cargarPromociones;