/**
 * Funciones de renderizado y formateo de interfaz para el catálogo (Bootstrap 5)
 */

/**
 * Formatea un número como moneda colombiana (COP)
 */
export function formatPrice(price) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Escapa caracteres HTML para prevenir inyecciones XSS
 */
export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

/**
 * Genera el markup HTML de una tarjeta de producto con Bootstrap 5
 */
export function createProductCardHTML(product, isFavorite, isFavoritesList = false) {
  const discount = Number(product.discountPercentage) || 0;
  const oldPrice = discount > 0 ? product.price / (1 - discount / 100) : null;
  const image = product.thumbnail || product.images?.[0] || "";

  return `
    <div class="col">
      <article class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden product-card position-relative">
        <!-- Contenedor de Imagen -->
        <div class="product-image-wrap d-flex align-items-center justify-content-center p-3 position-relative">
          ${
            discount > 0
              ? `
                <span class="badge bg-coral position-absolute top-0 start-0 m-3 rounded-pill fw-bold shadow-sm">
                  -${Math.round(discount)}%
                </span>
              `
              : ""
          }
          <img
            class="product-image img-fluid"
            src="${escapeHTML(image)}"
            alt="${escapeHTML(product.title)}"
            loading="lazy"
          >
        </div>

        <!-- Información del Producto -->
        <div class="card-body d-flex flex-column p-3">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="text-uppercase text-muted fw-bold extra-small tracking-wider">
              ${escapeHTML(product.category)}
            </span>
            <span class="badge bg-light text-dark border d-flex align-items-center gap-1 extra-small fw-semibold">
              <i class="bi bi-star-fill text-warning"></i> ${Number(product.rating).toFixed(1)}
            </span>
          </div>

          <h3 class="card-title h6 fw-bold text-dark mb-1 text-truncate-2" title="${escapeHTML(product.title)}">
            ${escapeHTML(product.title)}
          </h3>

          <div class="mb-2">
            <span class="h6 fw-bold text-dark mb-0">${formatPrice(product.price)}</span>
            ${
              oldPrice !== null
                ? `
                  <span class="text-muted text-decoration-line-through small ms-2">${formatPrice(oldPrice)}</span>
                `
                : ""
            }
          </div>

          <p class="card-text text-secondary small text-truncate-2 mb-3 flex-grow-1">
            ${escapeHTML(product.description)}
          </p>

          <div class="product-actions mt-auto d-flex flex-column gap-2">
            <button
              type="button"
              class="btn btn-primary w-100 rounded-pill py-2 btn-sm fw-semibold add-to-cart"
              data-id="${product.id}"
            >
              <i class="bi bi-bag-plus me-1"></i> Agregar al carrito
            </button>

            <button
              type="button"
              class="btn ${isFavorite ? "btn-primary is-favorite" : "btn-outline-secondary"} w-100 rounded-pill py-2 btn-sm fw-medium btn-favorite"
              data-favorite-id="${product.id}"
              aria-pressed="${isFavorite}"
            >
              <i class="bi ${isFavorite ? "bi-heart-fill" : "bi-heart"} me-1"></i>
              ${
                isFavorite
                  ? isFavoritesList
                    ? "Quitar de favoritos"
                    : "En favoritos"
                  : "Agregar a favoritos"
              }
            </button>
          </div>
        </div>
      </article>
    </div>
  `;
}

/**
 * Renderiza los radio buttons de categorías con estilo Bootstrap form-check
 */
export function renderCategories(container, categories, selectedCategory) {
  container.innerHTML = `
    <div class="form-check mb-2">
      <input
        class="form-check-input"
        type="radio"
        name="category"
        id="cat-all"
        value="all"
        ${selectedCategory === "all" ? "checked" : ""}
      >
      <label class="form-check-label small fw-medium text-dark" for="cat-all">
        Todas las categorías
      </label>
    </div>
    ${categories
      .map(
        (category) => `
        <div class="form-check mb-2">
          <input
            class="form-check-input"
            type="radio"
            name="category"
            id="cat-${category.value}"
            value="${category.value}"
            ${selectedCategory === category.value ? "checked" : ""}
          >
          <label class="form-check-label small text-secondary" for="cat-${category.value}">
            ${category.label}
          </label>
        </div>
      `
      )
      .join("")}
  `;
}

/**
 * Renderiza la lista de productos o el estado vacío
 */
export function renderProducts(container, countElement, products, favoriteIds, onReset) {
  countElement.textContent = `${products.length} productos encontrados`;

  if (products.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="p-4 bg-white rounded-4 shadow-sm border mx-auto" style="max-width: 460px;">
          <i class="bi bi-search display-5 text-muted mb-3 d-block"></i>
          <h5 class="fw-bold text-dark mb-2">Sin resultados</h5>
          <p class="text-secondary small mb-3">No encontramos productos que coincidan con tu búsqueda o filtros seleccionados.</p>
          <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3" id="reset-filters-btn">
            <i class="bi bi-arrow-counterclockwise me-1"></i> Restablecer filtros
          </button>
        </div>
      </div>
    `;

    const resetBtn = container.querySelector("#reset-filters-btn");
    if (resetBtn && typeof onReset === "function") {
      resetBtn.addEventListener("click", onReset);
    }
    return;
  }

  container.innerHTML = products
    .map((product) => createProductCardHTML(product, favoriteIds.includes(product.id)))
    .join("");
}

/**
 * Renderiza la sección de favoritos
 */
export function renderFavorites(container, countElement, allProducts, favoriteIds) {
  const favorites = allProducts.filter((product) =>
    favoriteIds.includes(product.id)
  );

  countElement.textContent = `${favorites.length} ${
    favorites.length === 1 ? "producto guardado" : "productos guardados"
  }`;

  if (favorites.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="p-4 bg-white rounded-4 shadow-sm border mx-auto" style="max-width: 450px;">
          <i class="bi bi-heart display-5 text-muted mb-3 d-block"></i>
          <h5 class="fw-bold text-dark mb-2">Tu lista de favoritos está vacía</h5>
          <p class="text-secondary small mb-0">Explora el catálogo y presiona el corazón para guardar tus prendas y accesorios favoritos aquí.</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = favorites
    .map((product) => createProductCardHTML(product, true, true))
    .join("");
}

/**
 * Renderiza la paginación con componentes de Bootstrap 5
 */
export function renderPagination(container, currentPage, totalPages) {
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let paginationItems = `
    <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
      <button class="page-link" type="button" data-page="${currentPage - 1}" ${
    currentPage === 1 ? 'disabled aria-disabled="true"' : ""
  }>
        <i class="bi bi-chevron-left me-1"></i> Anterior
      </button>
    </li>
  `;

  for (let page = 1; page <= totalPages; page++) {
    if (
      page === 1 ||
      page === totalPages ||
      (page >= currentPage - 1 && page <= currentPage + 1)
    ) {
      paginationItems += `
        <li class="page-item ${page === currentPage ? "active" : ""}">
          <button class="page-link" type="button" data-page="${page}" ${
        page === currentPage ? 'aria-current="page"' : ""
      }>
            ${page}
          </button>
        </li>
      `;
    } else if (page === currentPage - 2 || page === currentPage + 2) {
      paginationItems += `
        <li class="page-item disabled">
          <span class="page-link border-0">…</span>
        </li>
      `;
    }
  }

  paginationItems += `
    <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
      <button class="page-link" type="button" data-page="${currentPage + 1}" ${
    currentPage === totalPages ? 'disabled aria-disabled="true"' : ""
  }>
        Siguiente <i class="bi bi-chevron-right ms-1"></i>
      </button>
    </li>
  `;

  container.innerHTML = `
    <div class="d-flex flex-column align-items-center gap-2">
      <p class="text-secondary small mb-1">
        Página <strong class="text-dark">${currentPage}</strong> de <strong class="text-dark">${totalPages}</strong>
      </p>
      <ul class="pagination pagination-sm justify-content-center flex-wrap mb-0">
        ${paginationItems}
      </ul>
    </div>
  `;
}
