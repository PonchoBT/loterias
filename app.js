const { useMemo, useRef, useState } = React;

const TOTAL_TABLEROS = 16;
const IMAGENES_MINIMAS = 9;

const estilosInput = {
    width: "0.1px",
    height: "0.1px",
    opacity: 0,
    overflow: "hidden",
    position: "absolute",
    zIndex: -1
};

const estilosLabelBase = {
    width: "100%",
    padding: "12px 20px",
    borderRadius: "8px",
    border: "2px dashed #3498db",
    background: "#f8f9fa",
    transition: "all 0.3s ease",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 500
};

const estilosIconoLabel = {
    color: "#3498db",
    fontSize: "1.2em",
    marginRight: "10px"
};

const textosModal = {
    error: "❌",
    success: "✅",
    info: "📝"
};

const shuffle = (lista) => [...lista].sort(() => Math.random() - 0.5);

const crearTableros = (imagenes) => {
    const tableros = [];
    for (let i = 0; i < TOTAL_TABLEROS; i += 1) {
        const seleccion = shuffle(imagenes).slice(0, IMAGENES_MINIMAS);
        const urls = seleccion.map((imagen) => URL.createObjectURL(imagen));
        tableros.push(urls);
    }
    return tableros;
};

const liberarUrls = (tableros) => {
    tableros.flat().forEach((url) => {
        try {
            URL.revokeObjectURL(url);
        } catch (error) {
            // Ignorar fallos de revocación silenciosamente.
        }
    });
};

const App = () => {
    const [imagenes, setImagenes] = useState([]);
    const [tableros, setTableros] = useState([]);
    const [modal, setModal] = useState(null);
    const inputRef = useRef(null);

    const cantidadImagenes = imagenes.length;

    const textoLabel = useMemo(() => {
        if (cantidadImagenes === 0) return "Seleccionar imágenes";
        if (cantidadImagenes < IMAGENES_MINIMAS) {
            return `${cantidadImagenes} imágenes seleccionadas (necesitas al menos 9)`;
        }
        return `${cantidadImagenes} imágenes seleccionadas`;
    }, [cantidadImagenes]);

    const estiloLabel = useMemo(() => {
        if (cantidadImagenes >= IMAGENES_MINIMAS) {
            return { ...estilosLabelBase, borderColor: "#27ae60", background: "#f0fff4" };
        }
        if (cantidadImagenes > 0) {
            return { ...estilosLabelBase, borderColor: "#f39c12", background: "#fff9f0" };
        }
        return estilosLabelBase;
    }, [cantidadImagenes]);

    const cerrarModal = () => setModal(null);

    const mostrarModal = (mensaje, tipo = "info") => {
        setModal({ mensaje, tipo });
    };

    const manejarCambioImagenes = (event) => {
        const archivos = Array.from(event.target.files || []);
        setImagenes(archivos);

        if (!archivos.length) {
            mostrarModal("Por favor, selecciona al menos una imagen", "error");
            return;
        }

        if (archivos.length < IMAGENES_MINIMAS) {
            mostrarModal("Necesitas seleccionar al menos 9 imágenes", "info");
            return;
        }

        mostrarModal("¡Imágenes seleccionadas! Haz clic en \"Generar\" para continuar", "success");
    };

    const subirImagenes = () => {
        if (!imagenes.length) {
            mostrarModal("Por favor, selecciona al menos una imagen", "error");
            return;
        }

        if (imagenes.length < IMAGENES_MINIMAS) {
            mostrarModal("Necesitas seleccionar al menos 9 imágenes para crear las tableras", "error");
            return;
        }

        const archivosValidos = imagenes.every((file) => file.type.startsWith("image/"));
        if (!archivosValidos) {
            mostrarModal("Por favor, selecciona solo archivos de imagen", "error");
            return;
        }

        mostrarModal("¡Imágenes cargadas correctamente! Ahora puedes crear las tableras", "success");
    };

    const generarTableras = () => {
        if (!imagenes.length) {
            mostrarModal("Primero debes subir imágenes", "error");
            return;
        }

        if (imagenes.length < IMAGENES_MINIMAS) {
            mostrarModal("Necesitas al menos 9 imágenes para crear tableras", "error");
            return;
        }

        liberarUrls(tableros);
        const nuevosTableros = crearTableros(imagenes);
        setTableros(nuevosTableros);
        mostrarModal("¡16 tableras generadas correctamente!", "success");
    };

    const imprimirTableros = async () => {
        if (!tableros.length) {
            mostrarModal("Primero debes generar las tableras", "error");
            return;
        }

        try {
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

            tableros.forEach((tablero) => {
                const cartas = tablero
                    .map((url) => `<div class="carta"><img src="${url}" /></div>`)
                    .join("");
                contenidoImprimir += `
                    <div class="tablero-pagina">
                        <div class="tablero">
                            ${cartas}
                        </div>
                    </div>`;
            });

            contenidoImprimir += `</body></html>`;

            const iframe = document.createElement("iframe");
            iframe.style.position = "fixed";
            iframe.style.right = "0";
            iframe.style.bottom = "0";
            iframe.style.width = "0";
            iframe.style.height = "0";
            iframe.style.border = "0";
            document.body.appendChild(iframe);

            const doc = iframe.contentWindow.document;
            doc.open();
            doc.write(contenidoImprimir);
            doc.close();

            const imagenesIframe = doc.getElementsByTagName("img");
            await Promise.all(Array.from(imagenesIframe).map((img) => new Promise((resolve) => {
                if (img.complete) {
                    resolve();
                } else {
                    img.onload = resolve;
                    img.onerror = resolve;
                }
            })));

            await new Promise((resolve) => setTimeout(resolve, 1000));
            iframe.contentWindow.print();

            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        } catch (error) {
            console.error("Error al imprimir:", error);
            mostrarModal("Error al imprimir. Por favor, intenta de nuevo.", "error");
        }
    };

    const volverACargar = () => {
        liberarUrls(tableros);
        setTableros([]);
        setImagenes([]);
        setModal(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <div>
            <div className="container">
                <div className="text-center">
                    <h1 className="mt-5 mb-4 text-primary">Lotería con tableros</h1>
                    <p className="lead mb-4">Crea y personaliza tus propias tableros de lotería</p>
                </div>

                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                <form className="mb-4" onSubmit={(event) => event.preventDefault()}>
                                    <div className="custom-file mb-3">
                                        <input
                                            ref={inputRef}
                                            type="file"
                                            className="custom-file-input"
                                            id="imageInput"
                                            accept="image/*"
                                            multiple
                                            onChange={manejarCambioImagenes}
                                            style={estilosInput}
                                        />
                                        <label htmlFor="imageInput" style={estiloLabel}>
                                            <i className="fas fa-images" style={estilosIconoLabel}></i>
                                            <span style={{ color: "#2c3e50" }}>{textoLabel}</span>
                                        </label>
                                    </div>
                                    <div className="form-text text-muted mb-2">
                                        <i className="fas fa-info-circle mr-2"></i>
                                        Selecciona las imágenes que deseas usar en tus tableras (mínimo 9 imágenes)
                                    </div>
                                    <button type="button" className="btn btn-primary btn-lg btn-block" onClick={subirImagenes}>
                                        <i className="fas fa-upload mr-2"></i> Subir Imágenes
                                    </button>
                                </form>

                                <div className="form-text text-muted mb-2">
                                    <i className="fas fa-info-circle mr-2"></i> Cada tablera tendrá 9 imágenes distribuidas
                                    aleatoriamente.
                                </div>

                                <button className="btn btn-success btn-lg btn-block mb-3" onClick={generarTableras}>
                                    <i className="fas fa-dice mr-2"></i> Crear Tableras Aleatorias
                                </button>

                                <div id="tableros" className="mt-4 border rounded p-3 bg-light">
                                    {tableros.length === 0 ? (
                                        <div className="text-center text-muted">
                                            <i className="fas fa-table fa-2x mb-2"></i>
                                            <p>Las tableros generadas aparecerán aquí</p>
                                        </div>
                                    ) : (
                                        tableros.map((tablero, index) => (
                                            <div className="tablero" key={`tablero-${index}`}>
                                                {tablero.map((url, cartaIndex) => (
                                                    <div className="carta" key={`carta-${index}-${cartaIndex}`}>
                                                        <img src={url} alt={`Carta ${cartaIndex + 1}`} />
                                                    </div>
                                                ))}
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="floating-buttons">
                                    <button onClick={generarTableras} className="btn btn-primary btn-lg mb-2">
                                        <i className="fas fa-sync-alt"></i> Regenerar Tableras
                                    </button>
                                    <button onClick={imprimirTableros} className="btn btn-success btn-lg mb-2">
                                        <i className="fas fa-print"></i> Imprimir Tableras
                                    </button>
                                    <button onClick={volverACargar} className="btn btn-info btn-lg">
                                        <i className="fas fa-plus"></i> Nuevo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <footer className="footer">
                <div className="container text-center">
                    <p>
                        Hecho con <i className="fas fa-heart"></i> por{" "}
                        <a href="https://www.ponchobt.dev/" target="_blank" rel="noopener noreferrer">PonchoBT.Dev</a>
                    </p>
                </div>
            </footer>

            {modal && (
                <div className="modal-overlay">
                    <div className={`modal-contenido ${modal.tipo}`}>
                        <div className="modal-icono">{textosModal[modal.tipo] || textosModal.info}</div>
                        <div className="modal-mensaje">{modal.mensaje}</div>
                        <button className="modal-cerrar" onClick={cerrarModal}>Aceptar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
