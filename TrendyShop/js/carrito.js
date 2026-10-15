/* Controlador visual e interactivo de la vista del carrito */
const controladorCarrito = {
    formatearPrecio: function(monto) {
        return "$" + Number(monto).toLocaleString("es-CO") + " COP";
    },

    renderizarCarrito: function() {
        const contenedorArticulos = document.getElementById("lista de articulos");
        const vistaConArticulos = document.getElementById("vista con articulos");
        const vistaCarritoVacio = document.getElementById("vista carrito vacio");
        const textoSubtotal = document.getElementById("subtotal de orden");
        const textoTotal = document.getElementById("total de orden");

        if (!contenedorArticulos || !vistaConArticulos || !vistaCarritoVacio) {
            return;
        }

        const articulos = window.cartService ? window.cartService.cargarCarrito() : [];

        if (articulos.length === 0) {
            vistaConArticulos.style.display = "none";
            vistaCarritoVacio.style.display = "block";
            return;
        }

        vistaConArticulos.style.display = "block";
        vistaCarritoVacio.style.display = "none";
        contenedorArticulos.innerHTML = "";

        articulos.forEach(function(item) {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta articulo";

            const elementoImagen = document.createElement("img");
            elementoImagen.className = "imagen articulo";
            elementoImagen.src = item.imagen || item.thumbnail || "../assets/images/logo-icon.png";
            elementoImagen.alt = item.nombre || item.title || "Prenda";
            elementoImagen.loading = "lazy";

            const detalles = document.createElement("div");
            detalles.className = "detalles articulo";

            const titulo = document.createElement("h3");
            titulo.className = "nombre articulo";
            titulo.textContent = item.nombre || item.title;

            const precio = document.createElement("p");
            precio.className = "precio articulo";
            precio.textContent = controladorCarrito.formatearPrecio(item.precio !== undefined ? item.precio : item.price);

            const controles = document.createElement("div");
            controles.className = "controles articulo";

            const selector = document.createElement("div");
            selector.className = "selector cantidad";

            const botonMenos = document.createElement("button");
            botonMenos.type = "button";
            botonMenos.className = "boton cantidad boton restar";
            botonMenos.textContent = "-";
            botonMenos.addEventListener("click", function() {
                controladorCarrito.modificarCantidad(item.id || item.identificador, (item.cantidad || item.quantity) - 1);
            });

            const numero = document.createElement("span");
            numero.className = "numero cantidad";
            numero.textContent = item.cantidad || item.quantity;

            const botonMas = document.createElement("button");
            botonMas.type = "button";
            botonMas.className = "boton cantidad boton sumar";
            botonMas.textContent = "+";
            botonMas.addEventListener("click", function() {
                controladorCarrito.modificarCantidad(item.id || item.identificador, (item.cantidad || item.quantity) + 1);
            });

            selector.appendChild(botonMenos);
            selector.appendChild(numero);
            selector.appendChild(botonMas);

            const botonEliminar = document.createElement("button");
            botonEliminar.type = "button";
            botonEliminar.className = "boton eliminar";
            botonEliminar.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
            botonEliminar.addEventListener("click", function() {
                controladorCarrito.removerProducto(item.id || item.identificador);
            });

            controles.appendChild(selector);
            controles.appendChild(botonEliminar);

            detalles.appendChild(titulo);
            detalles.appendChild(precio);
            detalles.appendChild(controles);

            tarjeta.appendChild(elementoImagen);
            tarjeta.appendChild(detalles);
            contenedorArticulos.appendChild(tarjeta);
        });

        const totalCalculado = window.cartService ? window.cartService.obtenerTotal() : 0;
        const totalFormateado = controladorCarrito.formatearPrecio(totalCalculado);

        if (textoSubtotal) {
            textoSubtotal.textContent = totalFormateado;
        }
        if (textoTotal) {
            textoTotal.textContent = totalFormateado;
        }
    },

    modificarCantidad: function(identificador, nuevaCantidad) {
        if (window.cartService) {
            window.cartService.actualizarCantidad(identificador, nuevaCantidad);
        }
        controladorCarrito.renderizarCarrito();
    },

    removerProducto: function(identificador) {
        if (window.cartService) {
            window.cartService.eliminarProducto(identificador);
        }
        controladorCarrito.renderizarCarrito();
    },

    iniciar: function() {
        controladorCarrito.renderizarCarrito();

        window.addEventListener("trendy:cart-updated", function() {
            controladorCarrito.renderizarCarrito();
        });

        const botonPagar = document.getElementById("boton proceder pago");
        if (botonPagar) {
            botonPagar.addEventListener("click", function() {
                alert("Gracias por tu compra en TrendyShop. Tu pedido sera despachado en cuarenta y ocho horas.");
                if (window.cartService) {
                    window.cartService.vaciarCarrito();
                }
                controladorCarrito.renderizarCarrito();
            });
        }
    }
};

/* Referencias de compatibilidad */
controladorCarrito["formatear precio"] = controladorCarrito.formatearPrecio;
controladorCarrito["renderizar carrito"] = controladorCarrito.renderizarCarrito;
controladorCarrito["modificar cantidad"] = controladorCarrito.modificarCantidad;
controladorCarrito["remover producto"] = controladorCarrito.removerProducto;
controladorCarrito["iniciar"] = controladorCarrito.iniciar;

document.addEventListener("DOMContentLoaded", controladorCarrito.iniciar);
window["controlador carrito"] = controladorCarrito;
