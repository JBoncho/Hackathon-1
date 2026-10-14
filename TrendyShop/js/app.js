/* Controlador central de la aplicacion TrendyShop */
const aplicacionPrincipal = {
    "detectar pagina": function() {
        const rutaActual = window.location.pathname;
        if (rutaActual.includes("catalogo")) {
            return "catalogo";
        }
        if (rutaActual.includes("carrito")) {
            return "carrito";
        }
        if (rutaActual.includes("contactanos")) {
            return "contacto";
        }
        if (rutaActual.includes("quienes-somos")) {
            return "institucional";
        }
        return "inicio";
    },

    "sincronizar contador": function() {
        const elementoContador = document.getElementById("header-cart-count") || document.getElementById("contador del carrito") || document.querySelector(".contador.del.carrito");

        let totalPrendas = 0;
        if (window["servicio carrito"]) {
            totalPrendas = window["servicio carrito"]["obtener conteo"]();
        }

        if (elementoContador) {
            elementoContador.textContent = totalPrendas;
            elementoContador.style.display = totalPrendas > 0 ? "inline-flex" : "none";
        }

        /* Notificar a la cabecera mediante el evento de actualizacion */
        window.dispatchEvent(new CustomEvent("trendy:cart-updated", {
            detail: { count: totalPrendas }
        }));
    },

    "conectar botones catalogo": function() {
        const contenedorCatalogo = document.getElementById("contenedor catalogo") || document.querySelector(".contenedor.catalogo");
        if (!contenedorCatalogo) {
            return;
        }

        contenedorCatalogo.addEventListener("click", function(evento) {
            const botonAgregar = evento.target.closest(".boton.agregar");
            if (!botonAgregar) {
                return;
            }

            const tarjetaProducto = botonAgregar.closest(".tarjeta.producto");
            if (!tarjetaProducto) {
                return;
            }

            const identificador = tarjetaProducto.getAttribute("data-id") || tarjetaProducto.getAttribute("data-identificador");
            const nombre = tarjetaProducto.getAttribute("data-nombre") || tarjetaProducto.querySelector(".nombre.producto")?.textContent || "Prenda TrendyShop";
            const precioTexto = tarjetaProducto.getAttribute("data-precio") || tarjetaProducto.querySelector(".precio.producto")?.textContent || "0";
            const precioLimpio = parseFloat(precioTexto.replace(/[^0-9.]/g, "")) || 0;

            const prenda = {
                "identificador": identificador || String(Date.now()),
                "nombre": nombre.trim(),
                "precio": precioLimpio,
                "cantidad": 1
            };

            if (window["servicio carrito"]) {
                window["servicio carrito"]["agregar producto"](prenda);
                aplicacionPrincipal["sincronizar contador"]();
            }
        });
    },

    "conectar formulario contacto": function() {
        const formulario = document.getElementById("formulario de contacto") || document.querySelector(".formulario.contacto");
        const mensajeAviso = document.getElementById("mensaje de confirmacion") || document.querySelector(".mensaje.confirmacion");

        if (!formulario) {
            return;
        }

        formulario.addEventListener("submit", function(evento) {
            evento.preventDefault();

            const campoNombre = formulario.querySelector("input[type='text']");
            const campoEmail = formulario.querySelector("input[type='email']");
            const campoMensaje = formulario.querySelector("textarea");

            if (!campoNombre || !campoEmail || !campoMensaje) {
                return;
            }

            const valorNombre = campoNombre.value.trim();
            const valorEmail = campoEmail.value.trim();
            const valorMensaje = campoMensaje.value.trim();

            if (valorNombre === "" || valorEmail === "" || valorMensaje === "") {
                alert("Por favor completa todos los campos del formulario de atencion.");
                return;
            }

            if (!valorEmail.includes("@") || !valorEmail.includes(".")) {
                alert("Por favor ingresa un correo electronico valido.");
                return;
            }

            formulario.reset();

            if (mensajeAviso) {
                mensajeAviso.textContent = "Mensaje enviado exitosamente. Nos comunicaremos contigo pronto.";
                mensajeAviso.style.display = "block";
            } else {
                alert("Mensaje enviado con exito. Gracias por escribir a TrendyShop.");
            }
        });
    },

    "iniciar aplicacion": function() {
        aplicacionPrincipal["sincronizar contador"]();

        const pagina = aplicacionPrincipal["detectar pagina"]();

        if (pagina === "catalogo") {
            aplicacionPrincipal["conectar botones catalogo"]();
        }

        if (pagina === "contacto") {
            aplicacionPrincipal["conectar formulario contacto"]();
        }
    }
};

/* Referencia global para sincronizaciones externas */
window["actualizar contador global"] = aplicacionPrincipal["sincronizar contador"];
window["aplicacion principal"] = aplicacionPrincipal;

/* Arranque al cargar el documento */
document.addEventListener("DOMContentLoaded", aplicacionPrincipal["iniciar aplicacion"]);
