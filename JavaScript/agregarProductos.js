// Referencias a BD
const categ = firebase.firestore().collection('Categorias');
const product = firebase.firestore().collection('Productos');

const realtimecat = firebase.database().ref("Categoria");
const realtime = firebase.database();

// Agregar Categoria
function AgregarCat() {
    const categoria = document.getElementById("categoria").value;
    const descripcion = document.getElementById("descripcion").value;

    // Para agregar a Firestore
    const nuevaCategoria = {
        categoria: categoria,
        descripcion: descripcion
    };

    // Agregar a Firestore
    categ.add(nuevaCategoria)
    .then((docRef) => {
        console.log('Documento agregado con ID:', docRef.id);
        alert('Categoria agregada con éxito');
                            
        // Restablece el formulario
        document.getElementById("formulario-categoria").reset();

        // Agregar a Realtime Database usando el mismo ID generado por Firestore
        firebase.database().ref('categorias/' + docRef.id).set(nuevaCategoria)
        .then(() => {
            console.log('Categoría también agregada a Realtime Database');
            //alert('Categoría agregada con éxito a ambas bases de datos');
        })
        .catch((error) => {
            console.log('Error al agregar a Realtime Database:', error);
        });
    })
    .catch((error) => {
        console.log('Error al agregar a Firestore:', error);
    });
}

////////////////////////////////////////////////
// Función para cargar categorías desde Firebase
function cargarCategorias(categoriaActual) {
    const categoriaSelect = document.getElementById("categoriaP");
    const filtrarCategoriaSelect = document.getElementById("filtrarCategoria");

    // Verifica que los elementos select existan
    if (!categoriaSelect || !filtrarCategoriaSelect) {
        console.error("El elemento 'categoriaP' o 'filtrarCategoria' no se encuentra en el DOM.");
        return;
    }

    // Escuchar la colección de categorías en tiempo real desde Firestore
    categ.onSnapshot((querySnapshot) => {
        categoriaSelect.innerHTML = ''; // Limpiar el select antes de agregar las categorías
        filtrarCategoriaSelect.innerHTML = '<option value="">Todas las categorías</option>'; // Limpiar filtro y agregar opción predeterminada

        // Iterar sobre los documentos de categorías
        querySnapshot.forEach((doc) => {
            const option = document.createElement('option');
            option.value = doc.data().categoria; // Asignar el valor de la categoría
            option.textContent = doc.data().categoria; // Mostrar el nombre de la categoría
            categoriaSelect.appendChild(option); // Agregar al select de productos

            // Seleccionar la categoría actual si coincide
            if (doc.data().categoria === categoriaActual) {
                option.selected = true; // Seleccionar la opción correspondiente
            }

            const filterOption = option.cloneNode(true); // Clonar el option para el filtro de categorías
            filtrarCategoriaSelect.appendChild(filterOption); // Agregar al filtro de categorías
        });
    }, (error) => {
        console.error("Error al obtener categorías en tiempo real: ", error);
    });
}




////////////////////////////////////////////////
// Agregar Productos
var ref;

function SubirProducto() {
    // Datos de los Productos
    const nombre = document.getElementById("nombre").value.trim();
    const categoria = document.getElementById("categoriaP").value.trim();
    const detalles = document.getElementById("detalles").value.trim();
    const imagen = document.getElementById("fileInput");
    const costo = document.getElementById("precio").value.trim();
    const file = imagen.files[0];

    // Verificar que todos los campos estén llenos
    if (!nombre || !categoria || !detalles || !file || !costo) {
        alert("Por favor, complete todos los campos del formulario.");
        return; // Detener la ejecución si algún campo está vacío
    }

    // Crea una referencia al storage de Firebase
    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child(nombre);

    // Subir el archivo
    fileRef.put(file).then(function(snapshot) {
        console.log('Archivo subido con éxito');

        // Obtener token de acceso
        fileRef.getDownloadURL().then(function(url) {
            console.log('Token de acceso:', url);
            const token = url;

            // Para agregar a Firestore
            const nuevoProducto = {
                nombre: nombre,
                categoria: categoria,
                detalles: detalles,
                url: token,
                precio: costo,
            };

            product.add(nuevoProducto)
            .then((docRef) => {
                console.log('Documento agregado con ID:', docRef.id);
                alert('Producto agregado con éxito');
            })
            .catch((error) => {
                console.log('Error al agregar:', error);
            });

            const ref = realtime.ref("Producto/" + nombre);

            // Subir los datos a la base de datos en tiempo real
            ref.set(nuevoProducto, function(error) {
                if (error) {
                    console.error("Error al subir los datos:", error);
                } else {
                    console.log("Datos subidos con éxito!");

                    // Restablece el formulario
                    document.getElementById("formulario-producto").reset();
                }
            });
        }).catch(function(error) {
            console.error('Error al obtener el token de acceso:', error);
        });
    }).catch(function(error) {
        console.error('Error al subir el archivo:', error);
    });
}

////////////////////////////////////////
// Para Modal
// modal.js

// Botones para abrir formularios
document.getElementById('agregarCategoriaBtn').onclick = function() {
    abrirModal('categoria');
};

document.getElementById('agregarProductoBtn').onclick = function() {
    abrirModal('producto');
};

// Cerrar el modal
document.querySelector('.close').onclick = function() {
    cerrarModal();
};

// Función para abrir el modal
function abrirModal(tipo) {
    const modal = document.getElementById('modal');
    const formContainer = document.getElementById('form-container');

    if (tipo === 'categoria') {
        formContainer.innerHTML = `
            <h2 style="color: #107da2;">Agregar Categoría</h2>
            <form id="formulario-categoria">
                <label for="categoria">Nombre de la categoría:</label>
                <input type="text" id="categoria" required>

                <label for="descripcion">Descripción:</label>
                <input type="text" id="descripcion" required />

                <button type="button" onclick="AgregarCat()">Guardar Categoría</button>
            </form>
        `;
    } else if (tipo === 'producto') {
        formContainer.innerHTML = `
            <h2 style="color: #107da2;">Agregar Producto</h2>
            <form id="formulario-producto">
                <label for="nombre">Nombre del Producto:</label>
                <input type="text" id="nombre" required>

                <label for="categoriaP">Categoría:</label>
                <select id="categoriaP" required></select>

                <label for="detalles">Detalles del Producto:</label>
                <textarea id="detalles" rows="3" required style="width: 100%;"></textarea>

                <label for="precio">Precio del Producto:</label>
                <input type="text" id="precio" required>

                <label for="imagen">Selecciona una imagen:</label>
                <input type="file" id="fileInput" />

                <button type="button" onclick="SubirProducto()">Guardar Producto</button>
            </form>
        `;

        // Cargar las categorías después de agregar el formulario
        cargarCategorias();
    }

    modal.style.display = 'flex'; // Mostrar el modal
}

// Función para cerrar el modal
function cerrarModal() {
    document.getElementById('modal').style.display = 'none'; // Ocultar el modal
}

// Cerrar el modal al hacer clic fuera del contenido
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        cerrarModal();
    }
};

/////////////////////////////////////////
// Catálogo
// Función para cargar productos desde Firestore
function cargarProductos(nombreFiltro = '', categoriaFiltro = '') {
    const catalogo = document.getElementById('catalogo-productos');

    // Escuchar la colección 'productos'
    product.onSnapshot((querySnapshot) => {
        catalogo.innerHTML = ''; // Limpiar el catálogo antes de agregar nuevos productos

        querySnapshot.forEach((doc) => {
            const producto = doc.data();

            // Filtrar por nombre si se ingresó
            const coincideNombre = producto.nombre.toLowerCase().includes(nombreFiltro.toLowerCase());

            // Filtrar por categoría si se seleccionó
            const coincideCategoria = categoriaFiltro === '' || producto.categoria === categoriaFiltro;

            // Mostrar solo productos que coincidan con ambos filtros
            if (coincideNombre && coincideCategoria) {
                const productoDiv = document.createElement('div');
                productoDiv.classList.add('producto');

                // Crear el contenido del producto
                productoDiv.innerHTML = `
                    <img src="${producto.url}" alt="${producto.nombre}">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.detalles}</p>
                    <p>${producto.categoria}</p>
                    <p class="precio">$${producto.precio}</p>
                    <div class="iconos">
                        <span class="icono modificar" onclick="editarProducto('${doc.id}')"><i class="fas fa-edit"></i></span>
                        <span class="icono eliminar" onclick="eliminarProducto('${doc.id}')"><i class="fas fa-trash"></i></span>
                    </div>
                `;

                catalogo.appendChild(productoDiv);
            }
        });
    }, (error) => {
        console.error("Error al obtener productos en tiempo real: ", error);
    });
}

// Función para eliminar un producto
function eliminarProducto(productId) {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este producto?');
    if (confirmacion) {
        product.doc(productId).delete()
        .then(() => {
            alert('Producto eliminado con éxito');
        })
        .catch((error) => {
            console.error("Error al eliminar el producto: ", error);
        });
    }
}

// Función para editar un producto
function editarProducto(productId) {
    // Obtiene el producto a editar
    product.doc(productId).get().then((doc) => {
        if (doc.exists) {
            const producto = doc.data();
            const modal = document.getElementById('modal');
            const formContainer = document.getElementById('form-container');

            // Mostrar contenido en el modal
            formContainer.innerHTML = `
                <h2 style="color: #107da2;">Modificar Producto</h2>
                <form id="formulario-producto">
                    <label for="nombre">Nombre del Producto:</label>
                    <input type="text" id="nombre" value="${producto.nombre}" required>

                    <label for="categoriaP">Categoría:</label>
                    <select id="categoriaP" required></select>

                    <label for="detalles">Detalles del Producto:</label>
                    <textarea id="detalles" rows="3" required style="width: 100%;">${producto.detalles}</textarea>

                    <label for="precio">Precio del Producto:</label>
                    <input type="text" id="precio" value="${producto.precio}" required>

                    <label for="imagen">Selecciona una nueva imagen (opcional):</label>
                    <input type="file" id="fileInput" />

                    <button type="button" onclick="actualizarProducto('${productId}')">Actualizar Producto</button>
                </form>
            `;

            modal.style.display = 'flex'; // Mostrar el modal para editar

            // Llama a cargarCategorias() y selecciona la categoría del producto
            cargarCategorias(producto.categoria); // Pasar la categoría actual del producto
        } else {
            console.log('No se encontró el producto.');
        }
    });
}


// Función para actualizar el producto
function actualizarProducto(productId) {
    const nombre = document.getElementById("nombre").value;
    const categoria = document.getElementById("categoriaP").value;
    const detalles = document.getElementById("detalles").value;
    const costo = document.getElementById("precio").value;
    const imagen = document.getElementById("fileInput");

    // Crear el objeto con los datos actualizados
    const updatedData = {
        nombre: nombre,
        categoria: categoria,
        detalles: detalles,
        precio: costo,
    };

    // Si se seleccionó una nueva imagen, subirla
    if (imagen.files.length > 0) {
        const file = imagen.files[0];
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(nombre);

        fileRef.put(file).then(function(snapshot) {
            fileRef.getDownloadURL().then(function(url) {
                updatedData.url = url; // Agregar la nueva URL al objeto

                // Actualizar el producto en Firestore
                product.doc(productId).update(updatedData)
                .then(() => {
                    alert('Producto actualizado con éxito');
                    cerrarModal();
                })
                .catch((error) => {
                    console.error("Error al actualizar el producto:", error);
                });
            });
        }).catch(function(error) {
            console.error('Error al subir la imagen:', error);
        });
    } else {
        // Si no se seleccionó nueva imagen, actualizar solo los otros campos
        product.doc(productId).update(updatedData)
        .then(() => {
            alert('Producto actualizado con éxito');
            cerrarModal();
        })
        .catch((error) => {
            console.error("Error al actualizar el producto:", error);
        });
    }
}

/////
function buscarProductos() {
    const nombreBusqueda = document.getElementById('buscarNombre').value.toLowerCase(); // Obtiene el valor del campo de búsqueda
    const categoriaSeleccionada = document.getElementById('filtrarCategoria').value; // Obtiene la categoría seleccionada
    const catalogo = document.getElementById('catalogo-productos');

    // Escuchar la colección 'productos'
    product.onSnapshot((querySnapshot) => {
        catalogo.innerHTML = ''; // Limpiar el catálogo antes de agregar nuevos productos

        querySnapshot.forEach((doc) => {
            const producto = doc.data();

            const nombreProducto = producto.nombre.toLowerCase();
            const categoriaProducto = producto.categoria;

            // Condición para mostrar solo los productos que coincidan con la búsqueda por nombre y/o categoría
            if (
                (nombreBusqueda === "" || nombreProducto.includes(nombreBusqueda)) &&  // Búsqueda por nombre
                (categoriaSeleccionada === "" || categoriaProducto === categoriaSeleccionada)  // Filtrado por categoría
            ) {
                const productoDiv = document.createElement('div');
                productoDiv.classList.add('producto');

                // Crear el contenido del producto
                productoDiv.innerHTML = `
                    <img src="${producto.url}" alt="${producto.nombre}">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.detalles}</p>
                    <p>${producto.categoria}</p>
                    <p class="precio">$${producto.precio}</p>
                    <div class="iconos">
                        <span class="icono modificar" onclick="editarProducto('${doc.id}')"><i class="fas fa-edit"></i></span>
                        <span class="icono eliminar" onclick="eliminarProducto('${doc.id}')"><i class="fas fa-trash"></i></span>
                    </div>
                `;

                catalogo.appendChild(productoDiv);
            }
        });
    }, (error) => {
        console.error("Error al obtener productos en tiempo real: ", error);
    });
}

function buscarYFiltrar() {
    const nombreFiltro = document.getElementById('buscarNombre').value;
    const categoriaFiltro = document.getElementById('filtroCategoria').value;

    // Llama a la función cargarProductos con los filtros
    cargarProductos(nombreFiltro, categoriaFiltro);
}


// Llama a la función para cargar productos al cargar la página
cargarProductos();

// Llamada para cargar las categorías
cargarCategorias();

























































