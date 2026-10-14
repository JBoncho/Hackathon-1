(() => {
  const URL_NOVEDADES = "https://dummyjson.com/products/category/tops?limit=4";
  const TASA_COP = 4000; // la API trae dólares; aquí se convierten a pesos

  // Convierte dólares a pesos y da formato: $89.900 COP
  function formatearPrecioCOP(precioUsd) {
    const pesos = Math.round((precioUsd * TASA_COP) / 100) * 100;
    return `$${pesos.toLocaleString("es-CO")} COP`;
  }

  // Crea el HTML de una tarjeta de producto
  function crearTarjeta(producto) {
    return `
      <div class="col">
        <article class="producto-tarjeta">
          <a class="producto-enlace" href="catalogo/index.html">
            <div class="producto-imagen">
              <img src="${producto.thumbnail}" alt="${producto.title}" loading="lazy">
            </div>
            <div class="producto-cuerpo">
              <h3 class="producto-titulo">${producto.title}</h3>
              <p class="producto-marca">${producto.brand || "TrendyShop"}</p>
              <p class="producto-precio">${formatearPrecioCOP(producto.price)}</p>
            </div>
          </a>
          <span class="insignia insignia-salvia producto-insignia">Nuevo drop</span>
          <button class="btn-favorito" aria-label="Marcar como favorito" aria-pressed="false">
            <i class="bi bi-heart"></i>
          </button>
        </article>
      </div>`;
  }

  // Trae las novedades de la API y las dibuja
  async function cargarNovedades() {
    const contenedor = document.getElementById("lista-novedades");
    contenedor.innerHTML = '<p class="text-center">Cargando novedades...</p>';

    try {
      const respuesta = await fetch(URL_NOVEDADES);
      if (!respuesta.ok) throw new Error("Error al consultar la API");
      const datos = await respuesta.json();
      contenedor.innerHTML = datos.products.map(crearTarjeta).join("");
    } catch (error) {
      contenedor.innerHTML =
        '<p class="text-center">No pudimos cargar las novedades. Visita el catálogo para ver todos los productos.</p>';
    }
  }

  // Corazón de favorito: un solo "oyente" para todas las tarjetas
  function configurarFavoritos() {
    document.getElementById("lista-novedades").addEventListener("click", (evento) => {
      const boton = evento.target.closest(".btn-favorito");
      if (!boton) return;

      const icono = boton.querySelector("i");
      const activo = boton.classList.toggle("activo");
      icono.classList.toggle("bi-heart", !activo);
      icono.classList.toggle("bi-heart-fill", activo);
      boton.setAttribute("aria-pressed", activo);
    });
  }

  // Botón "volver arriba"
  function configurarBotonSubir() {
    const boton = document.getElementById("btn-subir");

    window.addEventListener("scroll", () => {
      boton.classList.toggle("d-none", window.scrollY < 300);
    });

    boton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  cargarNovedades();
  configurarFavoritos();
  configurarBotonSubir();
})();