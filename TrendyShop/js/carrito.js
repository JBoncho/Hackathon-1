/* Logica interactiva del carrito de compras */
const controladorCarrito = {
    "formatear precio": function(monto) {
        return "$" + monto.toLocaleString("es-CO") + " COP";
    },

    "renderizar carrito": function() {
        const contenedorArticulos = document.getElementById("lista de articulos");
        const vistaConArticulos = document.getElementById("vista con articulos");
        const vistaCarritoVacio = document.getElementById("vista carrito vacio");
        const textoSubtotal = document.getElementById("subtotal de orden");
        const textoTotal = document.getElementById("total de orden");

        if (!contenedorArticulos || !vistaConArticulos || !vistaCarritoVacio) {
            return;
        }

        const articulos = window["servicio carrito"]["cargar carrito"]();

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

            const detalles = document.createElement("div");
            detalles.className = "detalles articulo";

            const titulo = document.createElement("h3");
            titulo.className = "nombre articulo";
            titulo.textContent = item["nombre"];

            const precio = document.createElement("p");
            precio.className = "precio articulo";
            precio.textContent = controladorCarrito["formatear precio"](item["precio"]);

            const controles = document.createElement("div");
            controles.className = "controles articulo";

            const selector = document.createElement("div");
            selector.className = "selector cantidad";

            const botonMenos = document.createElement("button");
            botonMenos.type = "button";
            botonMenos.className = "boton cantidad boton restar";
            botonMenos.textContent = "-";
            botonMenos.addEventListener("click", function() {
                controladorCarrito["modificar cantidad"](item["identificador"], item["cantidad"] - 1);
            });

            const numero = document.createElement("span");
            numero.className = "numero cantidad";
            numero.textContent = item["cantidad"];

            const botonMas = document.createElement("button");
            botonMas.type = "button";
            botonMas.className = "boton cantidad boton sumar";
            botonMas.textContent = "+";
            botonMas.addEventListener("click", function() {
                controladorCarrito["modificar cantidad"](item["identificador"], item["cantidad"] + 1);
            });

            selector.appendChild(botonMenos);
            selector.appendChild(numero);
            selector.appendChild(botonMas);

            const botonEliminar = document.createElement("button");
            botonEliminar.type = "button";
            botonEliminar.className = "boton eliminar";
            botonEliminar.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
            botonEliminar.addEventListener("click", function() {
                controladorCarrito["remover producto"](item["identificador"]);
            });

            controles.appendChild(selector);
            controles.appendChild(botonEliminar);

            detalles.appendChild(titulo);
            detalles.appendChild(precio);
            detalles.appendChild(controles);

            tarjeta.appendChild(detalles);
            contenedorArticulos.appendChild(tarjeta);
        });

        const totalCalculado = window["servicio carrito"]["obtener total"]();
        const totalFormateado = controladorCarrito["formatear precio"](totalCalculado);

        if (textoSubtotal) {
            textoSubtotal.textContent = totalFormateado;
        }

        if (textoTotal) {
            textoTotal.textContent = totalFormateado;
        }
    },

    "modificar cantidad": function(identificador, nuevaCantidad) {
        window["servicio carrito"]["actualizar cantidad"](identificador, nuevaCantidad);
        controladorCarrito["renderizar carrito"]();
        if (window["actualizar contador global"]) {
            window["actualizar contador global"]();
        }
    },

    "remover producto": function(identificador) {
        window["servicio carrito"]["eliminar producto"](identificador);
        controladorCarrito["renderizar carrito"]();
        if (window["actualizar contador global"]) {
            window["actualizar contador global"]();
        }
    },

    "iniciar": function() {
        controladorCarrito["renderizar carrito"]();

        const botonPagar = document.getElementById("boton proceder pago");
        if (botonPagar) {
            botonPagar.addEventListener("click", function() {
                alert("Gracias por tu compra en TrendyShop. Tu pedido sera despachado en cuarenta y ocho horas.");
                window["servicio carrito"]["vaciar carrito"]();
                controladorCarrito["renderizar carrito"]();
                if (window["actualizar contador global"]) {
                    window["actualizar contador global"]();
                }
            });
        }
    }
};

/* Inicializacion automatica al cargar el DOM */
document.addEventListener("DOMContentLoaded", controladorCarrito["iniciar"]);

/* Publicacion en el ambito global */
window["controlador carrito"] = controladorCarrito;
