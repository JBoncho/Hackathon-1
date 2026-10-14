/* #Cambio# Catálogo con filtros, paginación y favoritos */

const API_URL = "https://dummyjson.com/products?limit=0";
const PRODUCTS_PER_PAGE = 12;
const FAVORITES_KEY = "trendyshop-favorites";

const productsGrid = document.getElementById("products-grid");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const categoryFilters = document.getElementById("category-filters");
const productCount = document.getElementById("product-count");
const clearFiltersButton = document.getElementById("clear-filters");
const pagination = document.getElementById("pagination");
const favoritesGrid = document.getElementById("favorites-grid");
const favoritesCount = document.getElementById("favorites-count");

let favoriteIds = loadSavedFavorites();
let allProducts = [];
let filteredProducts = [];
let selectedCategory = "all";
let currentPage = 1;

// #Cambio# Leer favoritos guardados
function loadSavedFavorites() {
  try {
    const savedFavorites = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "[]",
    );

    return Array.isArray(savedFavorites) ? savedFavorites : [];
  } catch (error) {
    console.error("Error al leer los favoritos:", error);
    return [];
  }
}

// Cargar todos los productos disponibles
async function loadProducts() {
  try {
    productsGrid.innerHTML = `
            <p class="status-message">Cargando productos...</p>
        `;

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("No se pudieron cargar los productos.");
    }

    const data = await response.json();

    allProducts = data.products;

    // #Cambio# Conservar solo IDs que existan en la API
    favoriteIds = favoriteIds.filter((id) =>
      allProducts.some((product) => product.id === id),
    );

    saveFavorites();

    renderCategories();
    applyFilters();
    renderFavorites();
  } catch (error) {
    console.error("Error al cargar productos:", error);

    productsGrid.innerHTML = `
            <p class="status-message">
                No fue posible cargar los productos.
                Verifica tu conexión e inténtalo de nuevo.
            </p>
        `;

    productCount.textContent = "Error de conexión";
    pagination.innerHTML = "";
  }
}

// Crear filtros de categorías
function renderCategories() {
  const categories = [
    { value: "mens-shirts", label: "Camisas para hombre" },
    { value: "mens-shoes", label: "Calzado para hombre" },
    { value: "mens-watches", label: "Relojes para hombre" },
    { value: "tops", label: "Tops" },
    { value: "womens-dresses", label: "Vestidos" },
    { value: "womens-shoes", label: "Calzado para mujer" },
    { value: "womens-bags", label: "Bolsos" },
    { value: "womens-watches", label: "Relojes para mujer" },
    { value: "sunglasses", label: "Gafas de sol" },
    { value: "beauty", label: "Belleza" },
    { value: "skin-care", label: "Cuidado de la piel" },
    { value: "fragrances", label: "Fragancias" },
  ];

  categoryFilters.innerHTML = `
        <label class="category-option">
            <input
                type="radio"
                name="category"
                value="all"
                checked
            >
            Todas las categorías
        </label>
    `;

  categories.forEach((category) => {
    const label = document.createElement("label");

    label.className = "category-option";

    label.innerHTML = `
            <input
                type="radio"
                name="category"
                value="${category.value}"
            >
            ${category.label}
        `;

    categoryFilters.appendChild(label);
  });
}

// Filtrar y ordenar todos los productos
function applyFilters() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm);

    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  switch (sortSelect.value) {
    case "price-asc":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;

    case "price-desc":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;

    case "name-asc":
      filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
      break;
  }

  // Volver a la primera página al cambiar filtros
  currentPage = 1;

  renderProducts();
}

// Mostrar los 12 productos de la página actual
function renderProducts() {
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  productCount.textContent = `${totalProducts} productos encontrados`;

  if (totalProducts === 0) {
    productsGrid.innerHTML = `
            <p class="status-message">
                No encontramos productos con esos criterios.
            </p>
        `;

    pagination.innerHTML = "";
    return;
  }

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const visibleProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE,
  );

  productsGrid.innerHTML = visibleProducts
    .map((product) => {
      const discount = Number(product.discountPercentage) || 0;

      const oldPrice =
        discount > 0 ? product.price / (1 - discount / 100) : null;

      const image = product.thumbnail || product.images?.[0] || "";
      const isFavorite = favoriteIds.includes(product.id);

      return `
            <article class="product-card">
                <div class="product-image-wrap">
                    ${
                      discount > 0
                        ? `
                                <span class="product-discount">
                                    -${Math.round(discount)}%
                                </span>
                            `
                        : ""
                    }

                    <img
                        class="product-image"
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(product.title)}"
                        loading="lazy"
                    >
                </div>

                <div class="product-info">
                    <p class="product-category">
                        ${escapeHTML(product.category)}
                    </p>

                    <h3 class="product-title">
                        ${escapeHTML(product.title)}
                    </h3>

                    <p class="product-rating">
                        ★ ${Number(product.rating).toFixed(1)} / 5
                    </p>

                    <p class="product-price">
                        ${formatPrice(product.price)}

                        ${
                          oldPrice !== null
                            ? `
                                    <span class="product-old-price">
                                        ${formatPrice(oldPrice)}
                                    </span>
                                `
                            : ""
                        }
                    </p>

                    <p class="product-description">
                        ${escapeHTML(product.description)}
                    </p>

                    <div class="product-actions">
                        <button
                            type="button"
                            class="btn btn-primary add-to-cart"
                            data-id="${product.id}"
                        >
                            Agregar al carrito
                        </button>

                        <button
                            type="button"
                            class="btn btn-favorite ${isFavorite ? "is-favorite" : ""}"
                            data-favorite-id="${product.id}"
                            aria-pressed="${isFavorite}"
                        >
                            ${
                              isFavorite
                                ? "♥ En favoritos"
                                : "♡ Agregar a favoritos"
                            }
                        </button>
                    </div>
                </div>
            </article>
        `;
    })
    .join("");

  renderPagination(totalPages);
}

// Crear los botones de paginación
function renderPagination(totalPages) {
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  pagination.innerHTML = `
        <p class="pagination-info">
            Página ${currentPage} de ${totalPages}
        </p>

        <button
            type="button"
            data-page="${currentPage - 1}"
            ${currentPage === 1 ? "disabled" : ""}
        >
            Anterior
        </button>

        ${Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;

          return `
                <button
                    type="button"
                    data-page="${page}"
                    class="${page === currentPage ? "active" : ""}"
                    ${page === currentPage ? 'aria-current="page"' : ""}
                >
                    ${page}
                </button>
            `;
        }).join("")}

        <button
            type="button"
            data-page="${currentPage + 1}"
            ${currentPage === totalPages ? "disabled" : ""}
        >
            Siguiente
        </button>
    `;
}

// Cambiar de página
pagination.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-page]");

  if (!button || button.disabled) {
    return;
  }

  currentPage = Number(button.dataset.page);

  renderProducts();

  document.querySelector(".catalog-heading").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});

// Formatear precios
function formatPrice(price) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);
}

// Escapar texto para evitar interpretarlo como HTML
function escapeHTML(value) {
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

/* #Cambio# Funciones de favoritos */

// Guardar favoritos en el navegador
function saveFavorites() {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
  } catch (error) {
    console.error("No fue posible guardar los favoritos:", error);
  }
}

// Agregar o quitar un producto de favoritos
function toggleFavorite(productId) {
  if (favoriteIds.includes(productId)) {
    favoriteIds = favoriteIds.filter((id) => id !== productId);
  } else {
    favoriteIds.push(productId);
  }

  saveFavorites();

  // Actualizar botones y sección de favoritos
  renderProducts();
  renderFavorites();
}

// Dibujar la sección de favoritos
function renderFavorites() {
  const favorites = allProducts.filter((product) =>
    favoriteIds.includes(product.id),
  );

  favoritesCount.textContent = `${favorites.length} ${
    favorites.length === 1 ? "producto guardado" : "productos guardados"
  }`;

  if (favorites.length === 0) {
    favoritesGrid.innerHTML = `
            <p class="status-message">
                Todavía no has agregado favoritos.
                Pulsa ♡ en cualquier producto para guardarlo aquí.
            </p>
        `;

    return;
  }

  favoritesGrid.innerHTML = favorites
    .map((product) => {
      const image = product.thumbnail || product.images?.[0] || "";

      return `
            <article class="product-card">
                <div class="product-image-wrap">
                    <img
                        class="product-image"
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(product.title)}"
                        loading="lazy"
                    >
                </div>

                <div class="product-info">
                    <p class="product-category">
                        ${escapeHTML(product.category)}
                    </p>

                    <h3 class="product-title">
                        ${escapeHTML(product.title)}
                    </h3>

                    <p class="product-rating">
                        ★ ${Number(product.rating).toFixed(1)} / 5
                    </p>

                    <p class="product-price">
                        ${formatPrice(product.price)}
                    </p>

                    <div class="product-actions">
                        <button
                            type="button"
                            class="btn btn-primary add-to-cart"
                            data-id="${product.id}"
                        >
                            Agregar al carrito
                        </button>

                        <button
                            type="button"
                            class="btn btn-favorite is-favorite"
                            data-favorite-id="${product.id}"
                            aria-pressed="true"
                        >
                            ♥ Quitar de favoritos
                        </button>
                    </div>
                </div>
            </article>
        `;
    })
    .join("");
}

// Escuchar favoritos en el catálogo
productsGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-favorite-id]");

  if (!button) {
    return;
  }

  toggleFavorite(Number(button.dataset.favoriteId));
});

// Escuchar favoritos en la sección inferior
favoritesGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-favorite-id]");

  if (!button) {
    return;
  }

  toggleFavorite(Number(button.dataset.favoriteId));
});

// Eventos de búsqueda y ordenamiento
searchInput.addEventListener("input", applyFilters);
sortSelect.addEventListener("change", applyFilters);

// Seleccionar categorías
categoryFilters.addEventListener("change", (event) => {
  if (event.target.name === "category") {
    selectedCategory = event.target.value;
    applyFilters();
  }
});

// Limpiar filtros
clearFiltersButton.addEventListener("click", () => {
  searchInput.value = "";
  sortSelect.value = "default";
  selectedCategory = "all";

  const allRadio = categoryFilters.querySelector('input[value="all"]');

  if (allRadio) {
    allRadio.checked = true;
  }

  applyFilters();
});

// Iniciar el catálogo
loadProducts();
