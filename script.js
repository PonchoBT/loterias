let imagenesCargadas = [];

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
    if (!input.files.length) {
        mostrarModal('Por favor, selecciona al menos una imagen', 'error');
        return false;
    }
    
    if (input.files.length < 9) {
        mostrarModal('Necesitas seleccionar al menos 9 imágenes', 'info');
        return false;
    }

    mostrarModal('¡Imágenes seleccionadas! Haz clic en "Subir Imágenes" para continuar', 'success');
    return true;
}

function subirImagenes() {
    const input = document.getElementById('imageInput');
    
    if (!input.files.length) {
        mostrarModal('Por favor, selecciona al menos una imagen', 'error');
        return;
    }

    if (input.files.length < 9) {
        mostrarModal('Necesitas seleccionar al menos 9 imágenes para crear las tableras', 'error');
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
    
    if (!input.files.length) {
        mostrarModal('Primero debes subir imágenes', 'error');
        return;
    }

    if (input.files.length < 9) {
        mostrarModal('Necesitas al menos 9 imágenes para crear tableras', 'error');
        return;
    }

    const imagenes = Array.from(input.files);
    const tablerosContainer = document.getElementById('tableros');
    tablerosContainer.innerHTML = '';

    // Crear 16 tableras en lugar de 4
    for (let t = 0; t < 16; t++) {
        const imagenesAleatorias = [...imagenes]
            .sort(() => Math.random() - 0.5)
            .slice(0, 9);

        const tablero = document.createElement('div');
        tablero.className = 'tablero';
        tablero.style.cssText = `
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            padding: 20px;
            margin-bottom: 30px;
            border: 2px solid #000;
            border-radius: 10px;
            background: white;
            width: 100%;
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
        `;

        // Agregar 9 imágenes aleatorias
        imagenesAleatorias.forEach(imagen => {
            const carta = document.createElement('div');
            carta.className = 'carta';
            carta.style.cssText = `
                aspect-ratio: 1;
                border: 1px solid #ccc;
                border-radius: 5px;
                overflow: hidden;
            `;

            const img = document.createElement('img');
            img.src = URL.createObjectURL(imagen);
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            `;

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

    // Guardar el contenido original
    const bodyContent = document.body.innerHTML;

    try {
        // Crear el contenido para imprimir
        let contenidoImprimir = `
            <html>
            <head>
                <style>
                    @page {
                        size: letter portrait;
                        margin: 1.5cm;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    .tablero-pagina {
                        page-break-after: always !important;
                        height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0;
                    }
                    .tablero-pagina:last-child {
                        page-break-after: auto;
                    }
                    .tablero {
                        width: 18cm;
                        height: 22cm;
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 12px;
                        padding: 20px;
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
                        border-radius: 5px;
                        overflow: hidden;
                        background: white;
                    }
                    .carta img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        display: block;
                    }
                    @media print {
                        html, body {
                            height: 100%;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .tablero-pagina {
                            display: block !important;
                            page-break-after: always !important;
                            page-break-inside: avoid !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .tablero {
                            margin: 0 auto !important;
                            page-break-inside: avoid !important;
                        }
                    }
                </style>
            </head>
            <body>`;

        // Obtener todos los tableros y procesarlos uno por uno
        const tableros = tablerosContainer.getElementsByClassName('tablero');
        
        // Agregar cada tablero en su propia página
        Array.from(tableros).forEach((tablero, index) => {
            contenidoImprimir += `
                <div class="tablero-pagina">
                    <div class="tablero">
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
    // Limpiar las imágenes cargadas
    document.getElementById('imageInput').value = '';
    
    // Limpiar el contenedor de tableros
    document.getElementById('tableros').innerHTML = `
        <div class="text-center text-muted">
            <i class="fas fa-table fa-2x mb-2"></i>
            <p>Las tableros generadas aparecerán aquí</p>
        </div>
    `;
}
