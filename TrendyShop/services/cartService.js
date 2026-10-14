/* Funciones del servicio de almacenamiento */
const servicioCarrito = {
    "clave almacenamiento": "carrito de compras",

    "cargar carrito": function() {
        try {
            const guardado = localStorage.getItem("carrito de compras");
            return guardado ? JSON.parse(guardado) : [];
        } catch (error) {
            return [];
        }
    },

    "guardar carrito": function(articulos) {
        try {
            localStorage.setItem("carrito de compras", JSON.stringify(articulos));
            return true;
        } catch (error) {
            return false;
        }
    },

    "agregar producto": function(producto) {
        const articulos = servicioCarrito["cargar carrito"]();
        const indice = articulos.findIndex(function(item) {
            return item["identificador"] === producto["identificador"];
        });

        if (indice >= 0) {
            articulos[indice]["cantidad"] = articulos[indice]["cantidad"] + 1;
        } else {
            if (!producto["cantidad"]) {
                producto["cantidad"] = 1;
            }
            articulos.push(producto);
        }

        servicioCarrito["guardar carrito"](articulos);
        return articulos;
    },

    "eliminar producto": function(identificador) {
        const articulos = servicioCarrito["cargar carrito"]();
        const filtrados = articulos.filter(function(item) {
            return item["identificador"] !== identificador;
        });

        servicioCarrito["guardar carrito"](filtrados);
        return filtrados;
    },

    "actualizar cantidad": function(identificador, nuevaCantidad) {
        let articulos = servicioCarrito["cargar carrito"]();
        if (nuevaCantidad <= 0) {
            return servicioCarrito["eliminar producto"](identificador);
        }

        articulos = articulos.map(function(item) {
            if (item["identificador"] === identificador) {
                item["cantidad"] = nuevaCantidad;
            }
            return item;
        });

        servicioCarrito["guardar carrito"](articulos);
        return articulos;
    },

    "vaciar carrito": function() {
        servicioCarrito["guardar carrito"]([]);
        return [];
    },

    "obtener total": function() {
        const articulos = servicioCarrito["cargar carrito"]();
        return articulos.reduce(function(acumulado, item) {
            return acumulado + (item["precio"] * item["cantidad"]);
        }, 0);
    },

    "obtener conteo": function() {
        const articulos = servicioCarrito["cargar carrito"]();
        return articulos.reduce(function(acumulado, item) {
            return acumulado + item["cantidad"];
        }, 0);
    }
};

/* Referencias directas para compatibilidad */
servicioCarrito.cargarCarrito = servicioCarrito["cargar carrito"];
servicioCarrito.guardarCarrito = servicioCarrito["guardar carrito"];
servicioCarrito.agregarProducto = servicioCarrito["agregar producto"];
servicioCarrito.eliminarProducto = servicioCarrito["eliminar producto"];
servicioCarrito.actualizarCantidad = servicioCarrito["actualizar cantidad"];
servicioCarrito.vaciarCarrito = servicioCarrito["vaciar carrito"];
servicioCarrito.obtenerTotal = servicioCarrito["obtener total"];
servicioCarrito.obtenerConteo = servicioCarrito["obtener conteo"];

/* Publicacion en el ambito global */
window["servicio carrito"] = servicioCarrito;
window.cartService = servicioCarrito;
