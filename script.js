let imagenesCargadas = [];

function obtenerCantidadPorTablero() {
    const select = document.getElementById('cantidadPorTablero');
    const valor = parseInt(select?.value, 10);
    return Number.isNaN(valor) ? 9 : valor;
}

function actualizarCantidadTablero() {
    const cantidad = obtenerCantidadPorTablero();
    const minimoSpan = document.getElementById('minimoImagenes');
    const cantidadSpan = document.getElementById('cantidadImagenesTablero');

    if (minimoSpan) {
        minimoSpan.textContent = cantidad;
    }

    if (cantidadSpan) {
        cantidadSpan.textContent = cantidad;
    }

    mostrarCantidadImagenes();
}

function mostrarModal(mensaje, tipo = 'info') {
    const modalAnterior = document.getElementById('mensajeModal');
    if (modalAnterior) {
        document.body.removeChild(modalAnterior);
    }

    const modal = document.createElement('div');
    modal.id = 'mensajeModal';
    
    const icono = tipo === 'error' ? '❌' : 
                 tipo === 'success' ? '✅' : 
                 '📝';
    
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-contenido ${tipo}">
                <div class="modal-icono">${icono}</div>
                <div class="modal-mensaje">${mensaje}</div>
                <button class="modal-cerrar" onclick="cerrarModal()">Aceptar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function cerrarModal() {
    const modal = document.getElementById('mensajeModal');
    if (modal) {
        modal.querySelector('.modal-overlay').style.animation = 'fadeOut 0.3s';
        modal.querySelector('.modal-contenido').style.animation = 'slideDown 0.3s';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }
}

function validarImagenes() {
    const input = document.getElementById('imageInput');
    const cantidadMinima = obtenerCantidadPorTablero();
    if (!input.files.length) {
        mostrarModal('Por favor, selecciona al menos una imagen', 'error');
        return false;
    }
    
    if (input.files.length < cantidadMinima) {
        mostrarModal(`Necesitas seleccionar al menos ${cantidadMinima} imágenes`, 'info');
        return false;
    }

    mostrarModal('¡Imágenes seleccionadas! Haz clic en "Generar" para continuar', 'success');
    return true;
}

function subirImagenes() {
    const input = document.getElementById('imageInput');
    const cantidadMinima = obtenerCantidadPorTablero();
    
    if (!input.files.length) {
        mostrarModal('Por favor, selecciona al menos una imagen', 'error');
        return;
    }

    if (input.files.length < cantidadMinima) {
        mostrarModal(`Necesitas seleccionar al menos ${cantidadMinima} imágenes para crear las tableras`, 'error');
        return;
    }

    const archivosValidos = Array.from(input.files).every(file => 
        file.type.startsWith('image/'));

    if (!archivosValidos) {
        mostrarModal('Por favor, selecciona solo archivos de imagen', 'error');
        return;
    }

    mostrarModal('¡Imágenes cargadas correctamente! Ahora puedes crear las tableras', 'success');
}

function generarTableras() {
    const input = document.getElementById('imageInput');
    const cantidadPorTablero = obtenerCantidadPorTablero();
    
    if (!input.files.length) {
        mostrarModal('Primero debes subir imágenes', 'error');
        return;
    }

    if (input.files.length < cantidadPorTablero) {
        mostrarModal(`Necesitas al menos ${cantidadPorTablero} imágenes para crear tableras`, 'error');
        return;
    }

    const imagenes = Array.from(input.files);
    const tablerosContainer = document.getElementById('tableros');
    tablerosContainer.innerHTML = '';

    // Crear 16 tableras en lugar de 4
    for (let t = 0; t < 16; t++) {
        const imagenesAleatorias = [...imagenes]
            .sort(() => Math.random() - 0.5)
            .slice(0, cantidadPorTablero);

        const tablero = document.createElement('div');
        const columnas = (cantidadPorTablero === 16 || cantidadPorTablero === 12) ? 4 : 3;
        const claseTamano = cantidadPorTablero === 16 ? 'tablero-16' : (cantidadPorTablero === 12 ? 'tablero-12' : 'tablero-9');
        tablero.className = (cantidadPorTablero === 16 || cantidadPorTablero === 12)
            ? `tablero tablero-4 ${claseTamano}`
            : `tablero tablero-3 ${claseTamano}`;
        tablero.dataset.cols = columnas;
        tablero.dataset.size = cantidadPorTablero;

        // Agregar 9 imágenes aleatorias
        imagenesAleatorias.forEach(imagen => {
            const carta = document.createElement('div');
            carta.className = 'carta';

            const img = document.createElement('img');
            img.src = URL.createObjectURL(imagen);
            img.className = 'carta-img';

            carta.appendChild(img);
            tablero.appendChild(carta);
        });

        tablerosContainer.appendChild(tablero);
    }

    mostrarModal('¡16 tableras generadas correctamente!', 'success');
}

async function imprimirTableros() {
    const tablerosContainer = document.getElementById('tableros');
    if (!tablerosContainer.querySelector('.tablero')) {
        mostrarModal('Primero debes generar las tableras', 'error');
        return;
    }

    try {
        // Obtener todos los tableros y procesarlos uno por uno
        const tableros = tablerosContainer.getElementsByClassName('tablero');
        const size = parseInt(tableros[0]?.dataset.size || '9', 10);

        const contenidoImprimir9 = `
            <html>
            <head>
                <style>
                    @page { size: letter portrait; margin: 1.5cm; }
                    body { margin: 0; padding: 0; }
                    .tablero-pagina {
                        page-break-after: always !important;
                        height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0;
                    }
                    .tablero-pagina:last-child { page-break-after: auto; }
                    .tablero {
                        width: 18cm;
                        height: 22cm;
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 12px;
                        padding: 18px;
                        border: 2.5px solid #000;
                        border-radius: 10px;
                        background: white;
                        margin: auto;
                        page-break-inside: avoid !important;
                        align-content: space-around;
                    }
                    .carta {
                        aspect-ratio: 1;
                        border: 1px solid #ccc;
                        border-radius: 6px;
                        overflow: hidden;
                        background: white;
                    }
                    .carta img { width: 100%; height: 100%; object-fit: cover; display: block; }
                    @media print {
                        html, body { height: 100%; margin: 0 !important; padding: 0 !important; }
                        .tablero-pagina { display: block !important; page-break-after: always !important; page-break-inside: avoid !important; margin: 0 !important; padding: 0 !important; }
                        .tablero { margin: 0 auto !important; page-break-inside: avoid !important; }
                    }
                </style>
            </head>
            <body>`;

        const contenidoImprimir12 = `
            <html>
            <head>
                <style>
                    @page { size: letter portrait; margin: 1.5cm; }
                    body { margin: 0; padding: 0; }
                    .tablero-pagina {
                        page-break-after: always !important;
                        height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0;
                    }
                    .tablero-pagina:last-child { page-break-after: auto; }
                    .tablero {
                        width: 18cm;
                        height: 22cm;
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 12px;
                        padding: 16px;
                        border: 2.5px solid #000;
                        border-radius: 10px;
                        background: white;
                        margin: auto;
                        page-break-inside: avoid !important;
                        align-content: space-around;
                    }
                    .carta {
                        aspect-ratio: 1;
                        border: 1px solid #ccc;
                        border-radius: 6px;
                        overflow: hidden;
                        background: white;
                    }
                    .carta img { width: 100%; height: 100%; object-fit: cover; display: block; }
                    @media print {
                        html, body { height: 100%; margin: 0 !important; padding: 0 !important; }
                        .tablero-pagina { display: block !important; page-break-after: always !important; page-break-inside: avoid !important; margin: 0 !important; padding: 0 !important; }
                        .tablero { margin: 0 auto !important; page-break-inside: avoid !important; }
                    }
                </style>
            </head>
            <body>`;

        const contenidoImprimir16 = `
            <html>
            <head>
                <style>
                    @page { size: letter portrait; margin: 1.5cm; }
                    body { margin: 0; padding: 0; }
                    .tablero-pagina {
                        page-break-after: always !important;
                        height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0;
                    }
                    .tablero-pagina:last-child { page-break-after: auto; }
                    .tablero {
                        width: 18cm;
                        height: 22cm;
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 6px;
                        padding: 8px;
                        border: 2.5px solid #000;
                        border-radius: 10px;
                        background: white;
                        margin: auto;
                        page-break-inside: avoid !important;
                        align-content: stretch;
                    }
                    .carta {
                        aspect-ratio: 1;
                        border: 1px solid #ccc;
                        border-radius: 5px;
                        overflow: hidden;
                        background: white;
                    }
                    .carta img { width: 100%; height: 100%; object-fit: cover; display: block; }
                    @media print {
                        html, body { height: 100%; margin: 0 !important; padding: 0 !important; }
                        .tablero-pagina { display: block !important; page-break-after: always !important; page-break-inside: avoid !important; margin: 0 !important; padding: 0 !important; }
                        .tablero { margin: 0 auto !important; page-break-inside: avoid !important; }
                    }
                </style>
            </head>
            <body>`;

        let contenidoImprimir = contenidoImprimir9;
        if (size === 12) contenidoImprimir = contenidoImprimir12;
        if (size === 16) contenidoImprimir = contenidoImprimir16;

        const claseTablero = size === 9 ? 'tablero tablero-3 tablero-9' : `tablero tablero-4 tablero-${size}`;

        Array.from(tableros).forEach((tablero) => {
            contenidoImprimir += `
                <div class="tablero-pagina">
                    <div class="${claseTablero}">
                        ${tablero.innerHTML}
                    </div>
                </div>`;
        });

        contenidoImprimir += `</body></html>`;

        // Crear un iframe temporal para la impresión
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        // Escribir el contenido en el iframe
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(contenidoImprimir);
        doc.close();

        // Esperar a que las imágenes se carguen en el iframe
        const imagenes = doc.getElementsByTagName('img');
        await Promise.all(Array.from(imagenes).map(img => {
            return new Promise((resolve) => {
                if (img.complete) {
                    resolve();
                } else {
                    img.onload = resolve;
                    img.onerror = resolve;
                }
            });
        }));

        // Esperar un momento para asegurar que todo esté renderizado
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Imprimir el iframe
        iframe.contentWindow.print();

        // Limpiar después de imprimir
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);

    } catch (error) {
        console.error('Error al imprimir:', error);
        mostrarModal('Error al imprimir. Por favor, intenta de nuevo.', 'error');
    }
}

// Asegurarse de que html2pdf esté cargado
function verificarHTML2PDF() {
    if (typeof html2pdf === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        document.head.appendChild(script);
        
        script.onload = () => {
            console.log('html2pdf cargado correctamente');
        };
        
        script.onerror = () => {
            console.error('Error al cargar html2pdf');
        };
    }
}

// Llamar a la función de verificación cuando se carga la página
document.addEventListener('DOMContentLoaded', verificarHTML2PDF);

const estilos = `
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s;
    }
    .modal-contenido {
        background: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        animation: slideUp 0.3s;
    }
    .modal-icono { font-size: 48px; margin-bottom: 20px; }
    .modal-mensaje {
        font-size: 18px;
        margin-bottom: 25px;
        color: #333;
        font-family: Arial, sans-serif;
    }
    .modal-cerrar {
        background: #007bff;
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 25px;
        font-size: 16px;
        cursor: pointer;
        transition: background 0.3s;
    }
    .tablero {
        break-inside: avoid;
        page-break-inside: avoid;
    }
    .carta {
        position: relative;
        background: white;
        transition: transform 0.2s;
    }
    .carta img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes slideUp {
        from { transform: translateY(50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;

const style = document.createElement('style');
style.textContent = estilos;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', validarImagenes);
    }
    actualizarCantidadTablero();
});

// Asegurarse de que las imágenes se carguen como data URLs
function convertirImagenADataURL(img) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 1.0));
    });
}

function volverACargar() {
    document.getElementById('imageInput').value = '';
    document.getElementById('tableros').innerHTML = `
        <div class="text-center text-muted">
            <i class="fas fa-table fa-2x mb-2"></i>
            <p>Los tableros generados aparecerán aquí</p>
        </div>
    `;
    document.getElementById('labelImagenes').innerHTML = 'Seleccionar imágenes';
    
    const labelContainer = document.querySelector('label[for="imageInput"]');
    labelContainer.style.borderColor = '#3498db';
    labelContainer.style.background = '#f8f9fa';

    window.location.reload(true);
}

function mostrarCantidadImagenes() {
    const input = document.getElementById('imageInput');
    const label = document.getElementById('labelImagenes');
    const numArchivos = input.files.length;
    const cantidadMinima = obtenerCantidadPorTablero();
    
    if (numArchivos > 0) {
        label.innerHTML = `${numArchivos} imágenes seleccionadas`;
        if (numArchivos < cantidadMinima) {
            label.innerHTML += ` (necesitas al menos ${cantidadMinima})`;
        }
    } else {
        label.innerHTML = 'Seleccionar imágenes';
    }
    
    actualizarEstiloLabel(numArchivos, cantidadMinima);
}

function actualizarEstiloLabel(numArchivos, cantidadMinima) {
    const labelContainer = document.querySelector('label[for="imageInput"]');
    if (numArchivos >= cantidadMinima) {
        labelContainer.style.borderColor = '#27ae60';
        labelContainer.style.background = '#f0fff4';
    } else if (numArchivos > 0) {
        labelContainer.style.borderColor = '#f39c12';
        labelContainer.style.background = '#fff9f0';
    } else {
        labelContainer.style.borderColor = '#3498db';
        labelContainer.style.background = '#f8f9fa';
    }
}
