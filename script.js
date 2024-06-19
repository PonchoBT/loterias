let imagenesCargadas = [];

function subirImagenes() {
  const files = document.getElementById("imageInput").files;
  imagenesCargadas = [];

  if (files.length === 0) {
    alert("Por favor, selecciona al menos una imagen.");
    return;
  }

  Array.from(files).forEach((file) => {
    const url = URL.createObjectURL(file);
    imagenesCargadas.push(url);
  });

  alert("Imágenes cargadas correctamente!");
}

function generarTableras() {
  const tablerosDiv = document.getElementById("tableros");
  tablerosDiv.innerHTML = ""; // Limpiar tableros anteriores

  for (let i = 0; i < 16; i++) {
    const tablero = document.createElement("div");
    tablero.className = "tablero";

    let imagenesUsadas = [];
    for (let j = 0; j < 9; j++) {
      if (imagenesCargadas.length === 0) {
        alert(
          "No hay suficientes imágenes cargadas para completar las tableras."
        );
        return;
      }

      let indiceImagen;
      do {
        indiceImagen = Math.floor(Math.random() * imagenesCargadas.length);
      } while (imagenesUsadas.includes(indiceImagen));

      imagenesUsadas.push(indiceImagen);

      const imgElement = document.createElement("img");
      imgElement.className = "carta";
      imgElement.src = imagenesCargadas[indiceImagen];
      tablero.appendChild(imgElement);
    }

    tablerosDiv.appendChild(tablero);
  }
}

function imprimirTableros() {
  window.print();
}
