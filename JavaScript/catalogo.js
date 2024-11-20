// Referencia a la colección de productos en Firestore
const refProductos = firebase.firestore().collection("Productos");

// Variables para almacenar el estado del filtro por categoría y búsqueda por nombre
let filtroCategoriaSeleccionada = "";
let filtroNombre = "";

// Variable para controlar el estado de favoritos
let mostrandoFavoritos = false;

// Función para cargar productos y verificar si están en favoritos
function cargarProductos() {
  const catalogoContainer = document.getElementById("catalogo-container");
  catalogoContainer.innerHTML = ''; // Limpiar el contenedor

  // Aplicar filtro por categoría y búsqueda por nombre
  let consulta = refProductos;
  if (filtroCategoriaSeleccionada) {
    consulta = consulta.where("categoria", "==", filtroCategoriaSeleccionada);
  }

  if (filtroNombre) {
    consulta = consulta.where("nombre", ">=", filtroNombre)
                       .where("nombre", "<=", filtroNombre + '\uf8ff'); // Para búsqueda de coincidencias
  }

  // Obtener la lista de productos desde Firestore
  consulta.get().then((querySnapshot) => {
    const idsAgregados = new Set(); // Para rastrear IDs ya agregados

    querySnapshot.forEach(function (doc) {
      const data = doc.data();
      const productoId = doc.id;

      // Verificar si el ID ya fue agregado
      if (!idsAgregados.has(productoId)) {
        idsAgregados.add(productoId); // Agregar ID a la lista
        const productoItem = document.createElement("div");
        productoItem.classList.add("catalogo-item");

        const img = document.createElement("img");
        img.src = data.url;
        img.alt = data.nombre;
        img.onclick = function () {
          mostrarDetallesProducto(data);
        };

        const nombre = document.createElement("h4");
        nombre.textContent = data.nombre;

        // Botón para ver detalles
        const botonDetalles = document.createElement("button");
        botonDetalles.textContent = "Ver detalles";
        botonDetalles.onclick = function () {
          mostrarDetallesProducto(data);
        };

        const botonFavorito = document.createElement("button");
        botonFavorito.classList.add("boton-favorito");
        botonFavorito.innerHTML = '<i class="fas fa-heart"></i>';

        // Verificar si el producto está en favoritos
        firebase.auth().onAuthStateChanged(function (user) {
          if (user) {
            const usuarioActual = user.uid;
            const refFavoritos = firebase.firestore()
              .collection("Usuarios")
              .doc(usuarioActual)
              .collection("Favoritos")
              .doc(productoId);

            refFavoritos.get().then((docSnapshot) => {
              if (docSnapshot.exists) {
                botonFavorito.style.color = 'red';  // Marcar el ícono en rojo si está en favoritos
              }
            });

            // Agregar/quitar de favoritos al hacer clic
            botonFavorito.onclick = function () {
              toggleFavorito(productoId, usuarioActual, botonFavorito);
            };
          }
        });

        // Añadir elementos al contenedor del producto
        productoItem.appendChild(img);
        productoItem.appendChild(nombre);
        productoItem.appendChild(botonDetalles);
        productoItem.appendChild(botonFavorito);
        catalogoContainer.appendChild(productoItem);
      }
    });
  }).catch((error) => {
    console.error("Error al cargar productos: ", error);
  });
}

// Función para añadir o quitar de favoritos
// Función para añadir o quitar de favoritos
function toggleFavorito(productoId, usuarioActual, botonFavorito) {
  const refFavoritos = firebase.firestore()
    .collection("Usuarios")
    .doc(usuarioActual)
    .collection("Favoritos")
    .doc(productoId);

  refFavoritos.get().then((docSnapshot) => {
    if (docSnapshot.exists) {
      // Si el producto ya está en favoritos, eliminarlo
      refFavoritos.delete().then(() => {
        //alert("Producto eliminado de favoritos");
        botonFavorito.style.color = '';  // Volver al color original

        // Si estamos mostrando favoritos, recargar solo los favoritos
        if (mostrandoFavoritos) {
          mostrarFavoritos();  // Recargar la lista de favoritos
        }
      });
    } else {
      // Si no está en favoritos, agregarlo
      refFavoritos.set({
        productoId: productoId,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        //alert("Producto agregado a favoritos");
        botonFavorito.style.color = 'red';  // Marcar el ícono en rojo

        // Si estamos mostrando favoritos, recargar solo los favoritos
        if (mostrandoFavoritos) {
          mostrarFavoritos();  // Recargar la lista de favoritos
        }
      });
    }
  }).catch((error) => {
    console.error("Error al gestionar favoritos: ", error);
  });
}


// Mostrar detalles del producto en el modal
function mostrarDetallesProducto(data) {
  document.getElementById("modal-img").src = data.url;
  document.getElementById("modal-nombre").textContent = data.nombre;
  document.getElementById("modal-categoria").textContent = data.categoria;
  document.getElementById("modal-detalles").textContent = data.detalles;
  document.getElementById("modal-precio").textContent = data.precio;

  document.getElementById("modal").style.display = "flex";
}

// Cerrar modal
function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}

// Filtro por categorías y búsquedas por nombre
function filtrarProductos() {
  filtroCategoriaSeleccionada = document.getElementById("filtroCategoria").value;
  filtroNombre = document.getElementById("filtroNombre").value.trim(); // Obtener el valor del campo de búsqueda

  cargarProductos();  // Recargar productos con el filtro aplicado
}

// Cargar categorías desde Firestore
function cargarCategorias() {
  const filtroCategoria = document.getElementById("filtroCategoria");

  // Obtener las categorías desde Firestore
  const refCategorias = firebase.firestore().collection('Categorias');

  refCategorias.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const categoria = doc.data().categoria;
      const option = document.createElement("option");
      option.value = categoria;
      option.textContent = categoria;
      filtroCategoria.appendChild(option);
    });
  }).catch((error) => {
    console.error("Error al obtener categorías de Firestore:", error);
  });
}

// Mostrar productos favoritos del usuario
// Mostrar productos favoritos del usuario
function mostrarFavoritos() {
  const catalogoContainer = document.getElementById("catalogo-container");
  catalogoContainer.innerHTML = ''; // Limpiar el contenedor

  const botonFavoritos = document.getElementById("botonFavoritos");

  // Verificar si el usuario está logueado
  let usuarioActual = null;
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      usuarioActual = user.uid;

      if (mostrandoFavoritos) {
        cargarProductos(); // Cargar todos los productos
        mostrandoFavoritos = false;
        botonFavoritos.classList.remove('favoritos-activo');
        botonFavoritos.innerHTML = '<i class="fas fa-heart"></i> Ver Favoritos';
      } else {
        const refFavoritos = firebase.firestore()
          .collection("Usuarios")
          .doc(usuarioActual)
          .collection("Favoritos");

        refFavoritos.get().then((querySnapshot) => {
          const catalogoContainer = document.getElementById("catalogo-container");
          catalogoContainer.innerHTML = ''; // Limpiar el contenedor

          if (querySnapshot.empty) {
            catalogoContainer.innerHTML = '<p>No tienes productos en favoritos.</p>';
            return;
          }

          querySnapshot.forEach(function (doc) {
            const favoritoData = doc.data();
            const productoId = favoritoData.productoId;

            // Obtener los detalles del producto a partir de su ID
            refProductos.doc(productoId).get().then((productoDoc) => {
              const data = productoDoc.data();

              // Crear el elemento de producto favorito
              const productoItem = document.createElement("div");
              productoItem.classList.add("catalogo-item");

              const img = document.createElement("img");
              img.src = data.url;
              img.alt = data.nombre;
              img.onclick = function () {
                mostrarDetallesProducto(data);
              };

              const nombre = document.createElement("h4");
              nombre.textContent = data.nombre;

              // Botón para ver detalles
              const botonDetalles = document.createElement("button");
              botonDetalles.textContent = "Ver detalles";
              botonDetalles.onclick = function () {
                mostrarDetallesProducto(data);
              };

              // Botón de agregar/quitar favoritos
              const botonFavorito = document.createElement("button");
              botonFavorito.classList.add("boton-favorito");
              botonFavorito.innerHTML = '<i class="fas fa-heart"></i>';
              botonFavorito.style.color = 'red'; // Mostrar en rojo porque está en favoritos
              botonFavorito.onclick = function () {
                toggleFavorito(productoId, usuarioActual, botonFavorito);  // Actualizar el ícono de favoritos dinámicamente
              };

              // Añadir elementos al contenedor del producto
              productoItem.appendChild(img);
              productoItem.appendChild(nombre);
              productoItem.appendChild(botonDetalles);
              productoItem.appendChild(botonFavorito);
              catalogoContainer.appendChild(productoItem);
            });
          });
        }).catch((error) => {
          console.error("Error al cargar favoritos: ", error);
        });

        mostrandoFavoritos = true;
        botonFavoritos.classList.add('favoritos-activo');
        botonFavoritos.innerHTML = '<i class="fas fa-heart"></i> Ver Todos los Productos';
      }
    } else {
      alert("Debes iniciar sesión para ver tus favoritos.");
    }
  });
}
// Evento para cerrar el modal
document.getElementById("cerrarModal").onclick = cerrarModal;

// Inicializar la carga de productos y categorías al cargar la página
window.onload = function() {
  cargarProductos();
  cargarCategorias();
};
