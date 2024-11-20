const btnLeft = document.querySelector(".btn-left"),
      btnRight = document.querySelector(".btn-right"),
      slider = document.querySelector("#slider");

// Variables para el carrusel
let operacion = 0;
let counter = 0; 
let widthImg = 0;

// Referencia a la base de datos Firestore
const db = firebase.firestore();
const promocionesRef = db.collection('Promociones');

// Cargar las imágenes desde Firestore
promocionesRef.onSnapshot((snapshot) => {
  slider.innerHTML = ''; // Limpiar el carrusel antes de agregar nuevas imágenes
  const imageKeys = snapshot.docs;

  // Recorrer cada documento y crear los elementos en el carrusel
  imageKeys.forEach((doc) => {
    const data = doc.data();
    const section = document.createElement('section');
    section.classList.add('slider-section');

    const img = document.createElement('img');
    img.src = data.imagenPromocional; // Accede a la url de la imagen promocional
    img.alt = data.promo; // Añadir el nombre de la promoción como texto alternativo

    // Agregar un evento de clic para abrir la ventana emergente
    img.addEventListener('click', () => showInfoPopup(data));

    section.appendChild(img);
    slider.appendChild(section);
  });

  // Recalcula el ancho de la imagen y el carrusel
  widthImg = 100 / imageKeys.length;
  slider.style.width = `${100 * imageKeys.length}%`;

  // Selecciona todos los sliderSection ahora que están creados
  const sliderSection = document.querySelectorAll(".slider-section");

  // Agregar los eventos a los botones del carrusel
  btnLeft.addEventListener("click", () => moveToLeft(sliderSection.length));
  btnRight.addEventListener("click", () => moveToRight(sliderSection.length));

  // Mover automáticamente las imágenes cada 3 segundos
  setInterval(() => {
    moveToRight(sliderSection.length);
  }, 3000);
});

// Función para mostrar la ventana emergente
function showInfoPopup(data) {
  const popup = document.createElement('div');
  popup.classList.add('popup-overlay');
  
  const content = document.createElement('div');
  content.classList.add('popup-content');

  const title = document.createElement('h2');
  title.textContent = data.promo; // Mostrar el nombre de la promoción
  
  const image = document.createElement('img');
  image.src = data.imagenInformacion; // Mostrar la imagen de información
  image.alt = data.promo;

  // Modificar la URL para incluir el número de WhatsApp y la imagen en el mensaje
  const whatsappNumber = '527204641051';
  const message = `Hola!%20Me%20interesa%20más%20sobre%20${encodeURIComponent(data.promo)}.%20Aquí%20está%20la%20imagen:%20${encodeURIComponent(data.imagenPromocional)}`;
  
  const whatsappButton = document.createElement('a');
  whatsappButton.href = `https://wa.me/${whatsappNumber}?text=${message}`; // Mensaje predeterminado
  whatsappButton.target = "_blank"; // Abrir en una nueva pestaña
  whatsappButton.classList.add('whatsapp-button'); // Añadir una clase para estilo
  whatsappButton.innerHTML = '<i class="fa-brands fa-whatsapp"></i> Pedir Informes'; // Botón de WhatsApp

  // Agregar elementos al contenido de la ventana emergente
  content.appendChild(title);
  content.appendChild(image);
  content.appendChild(whatsappButton);
  
  popup.appendChild(content);
  document.body.appendChild(popup);

  // Cerrar la ventana emergente al hacer clic fuera de ella
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      document.body.removeChild(popup);
    }
  });
}



// Función para mover el carrusel a la derecha
function moveToRight(length) {
    if (counter >= length - 1) {
        counter = 0;
        operacion = 0;
        slider.style.transform = `translate(-${operacion}%)`;
        slider.style.transition = "none";
        return;
    } 
    counter++;
    operacion += widthImg;
    slider.style.transform = `translate(-${operacion}%)`;
    slider.style.transition = "all ease .6s";
}

// Función para mover el carrusel a la izquierda
function moveToLeft(length) {
    counter--;
    if (counter < 0) {
        counter = length - 1;
        operacion = widthImg * (length - 1);
        slider.style.transform = `translate(-${operacion}%)`;
        slider.style.transition = "none";
        return;
    } 
    operacion -= widthImg;
    slider.style.transform = `translate(-${operacion}%)`;
    slider.style.transition = "all ease .6s";
}
