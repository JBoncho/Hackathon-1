/* Servicio unificado de persistencia del carrito */
const servicioCarrito = {
    clavePrimaria: "trendy" + String.fromCharCode(95) + "cart",
    claveSecundaria: "carrito de compras",

    normalizarProducto: function(producto) {
        const idTexto = String(producto.id || producto.identificador || Date.now());
        const nombreFinal = producto.nombre || producto.title || "Prenda TrendyShop";
        const precioNumero = Number(producto.precio !== undefined ? producto.precio : (producto.price !== undefined ? producto.price : 0));
        const imagenFinal = producto.imagen || producto.thumbnail || "";
        const cantidadNumero = Number(producto.cantidad || producto.quantity || 1);

        return {
            id: idTexto,
            identificador: idTexto,
            title: nombreFinal,
            nombre: nombreFinal,
            price: precioNumero,
            precio: precioNumero,
            thumbnail: imagenFinal,
            imagen: imagenFinal,
            quantity: cantidadNumero,
            cantidad: cantidadNumero
        };
    },

    cargarCarrito: function() {
        try {
            const datoPrimario = localStorage.getItem(servicioCarrito.clavePrimaria);
            if (datoPrimario) {
                const parseadoPrimario = JSON.parse(datoPrimario);
                if (Array.isArray(parseadoPrimario) && parseadoPrimario.length > 0) {
                    return parseadoPrimario.map(servicioCarrito.normalizarProducto);
                }
            }
            const datoSecundario = localStorage.getItem(servicioCarrito.claveSecundaria);
            if (datoSecundario) {
                const parseadoSecundario = JSON.parse(datoSecundario);
                if (Array.isArray(parseadoSecundario)) {
                    return parseadoSecundario.map(servicioCarrito.normalizarProducto);
                }
            }
            return [];
        } catch (error) {
            return [];
        }
    },

    guardarCarrito: function(articulos) {
        try {
            const articulosNormalizados = articulos.map(servicioCarrito.normalizarProducto);
            const cadenaJson = JSON.stringify(articulosNormalizados);
            localStorage.setItem(servicioCarrito.clavePrimaria, cadenaJson);
            localStorage.setItem(servicioCarrito.claveSecundaria, cadenaJson);
            servicioCarrito.notificarCambio();
            return true;
        } catch (error) {
            return false;
        }
    },

    notificarCambio: function() {
        const totalConteo = servicioCarrito.obtenerConteo();
        window.dispatchEvent(new CustomEvent("trendy:cart-updated", {
            detail: { count: totalConteo }
        }));
        if (window.HeaderComponent && typeof window.HeaderComponent.updateCartBadge === "function") {
            window.HeaderComponent.updateCartBadge(totalConteo);
        }
    },

    agregarProducto: function(producto) {
        const articulos = servicioCarrito.cargarCarrito();
        const idBuscado = String(producto.id || producto.identificador);
        const indice = articulos.findIndex(function(item) {
            return String(item.id || item.identificador) === idBuscado;
        });

        if (indice >= 0) {
            const nuevaCantidad = (articulos[indice].cantidad || 1) + 1;
            articulos[indice].cantidad = nuevaCantidad;
            articulos[indice].quantity = nuevaCantidad;
        } else {
            articulos.push(servicioCarrito.normalizarProducto(producto));
        }

        servicioCarrito.guardarCarrito(articulos);
        return articulos;
    },

    eliminarProducto: function(identificador) {
        const articulos = servicioCarrito.cargarCarrito();
        const idTexto = String(identificador);
        const filtrados = articulos.filter(function(item) {
            return String(item.id || item.identificador) !== idTexto;
        });
        servicioCarrito.guardarCarrito(filtrados);
        return filtrados;
    },

    actualizarCantidad: function(identificador, nuevaCantidad) {
        if (nuevaCantidad <= 0) {
            return servicioCarrito.eliminarProducto(identificador);
        }
        let articulos = servicioCarrito.cargarCarrito();
        const idTexto = String(identificador);
        articulos = articulos.map(function(item) {
            if (String(item.id || item.identificador) === idTexto) {
                item.cantidad = nuevaCantidad;
                item.quantity = nuevaCantidad;
            }
            return item;
        });
        servicioCarrito.guardarCarrito(articulos);
        return articulos;
    },

    vaciarCarrito: function() {
        servicioCarrito.guardarCarrito([]);
        return [];
    },

    obtenerTotal: function() {
        const articulos = servicioCarrito.cargarCarrito();
        return articulos.reduce(function(acumulado, item) {
            const precioActual = Number(item.precio !== undefined ? item.precio : item.price) || 0;
            const cantidadActual = Number(item.cantidad !== undefined ? item.cantidad : item.quantity) || 1;
            return acumulado + (precioActual * cantidadActual);
        }, 0);
    },

    obtenerConteo: function() {
        const articulos = servicioCarrito.cargarCarrito();
        return articulos.reduce(function(acumulado, item) {
            return acumulado + (Number(item.cantidad || item.quantity) || 1);
        }, 0);
    }
};

/* Referencias de compatibilidad */
servicioCarrito["clave almacenamiento"] = servicioCarrito.clavePrimaria;
servicioCarrito["cargar carrito"] = servicioCarrito.cargarCarrito;
servicioCarrito["guardar carrito"] = servicioCarrito.guardarCarrito;
servicioCarrito["agregar producto"] = servicioCarrito.agregarProducto;
servicioCarrito["eliminar producto"] = servicioCarrito.eliminarProducto;
servicioCarrito["actualizar cantidad"] = servicioCarrito.actualizarCantidad;
servicioCarrito["vaciar carrito"] = servicioCarrito.vaciarCarrito;
servicioCarrito["obtener total"] = servicioCarrito.obtenerTotal;
servicioCarrito["obtener conteo"] = servicioCarrito.obtenerConteo;

window["servicio carrito"] = servicioCarrito;
window.cartService = servicioCarrito;
