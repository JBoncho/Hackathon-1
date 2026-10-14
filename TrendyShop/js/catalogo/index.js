/**
 * TrendyShop - Catálogo Module
 * Coordinador principal del catálogo (filtros, búsqueda, ordenamiento, favoritos y carrito)
 */

import { CATEGORIES, PRODUCTS_PER_PAGE } from "./constants.js";
import { fetchProducts } from "./api.js";
import {
  loadFavorites,
  saveFavorites,
  toggleFavoriteId,
  addToCart,
} from "./storage.js";
import {
  renderCategories,
  renderProducts,
  renderFavorites,
  renderPagination,
} from "./ui.js";

// Referencias del DOM
const productsGrid = document.getElementById("products-grid");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const categoryFilters = document.getElementById("category-filters");
const productCount = document.getElementById("product-count");
const clearFiltersButton = document.getElementById("clear-filters");
const pagination = document.getElementById("pagination");
const favoritesGrid = document.getElementById("favorites-grid");
const favoritesCount = document.getElementById("favorites-count");

// Estado de la aplicación
let allProducts = [];
let filteredProducts = [];
let favoriteIds = loadFavorites();
let selectedCategory = "all";
let currentPage = 1;

/**
 * Lee el parámetro ?search= de la URL si se originó desde el buscador del Header
 */
function checkUrlSearchParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get("search");
  if (searchParam && searchInput) {
    searchInput.value = searchParam;
  }
}

/**
 * Filtra y ordena los productos en base a los inputs del usuario
 */
function applyFilters() {
  const searchTerm = (searchInput?.value || "").trim().toLowerCase();

  filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm);

    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  switch (sortSelect?.value) {
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

  currentPage = 1;
  updateProductsView();
}

/**
 * Actualiza la vista de productos y la paginación
 */
function updateProductsView() {
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const visibleProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );

  renderProducts(
    productsGrid,
    productCount,
    visibleProducts,
    favoriteIds,
    resetFilters
  );

  renderPagination(pagination, currentPage, totalPages);
}

/**
 * Restablece los filtros al estado por defecto
 */
function resetFilters() {
  if (searchInput) searchInput.value = "";
  if (sortSelect) sortSelect.value = "default";
  selectedCategory = "all";

  const allRadio = categoryFilters?.querySelector('input[value="all"]');
  if (allRadio) allRadio.checked = true;

  applyFilters();
}

/**
 * Alterna el estado de un producto en la lista de favoritos
 */
function handleToggleFavorite(productId) {
  favoriteIds = toggleFavoriteId(productId, favoriteIds);
  updateProductsView();
  renderFavorites(favoritesGrid, favoritesCount, allProducts, favoriteIds);
}

/**
 * Configura los event listeners del catálogo
 */
function attachEventListeners() {
  searchInput?.addEventListener("input", applyFilters);
  sortSelect?.addEventListener("change", applyFilters);

  categoryFilters?.addEventListener("change", (event) => {
    if (event.target.name === "category") {
      selectedCategory = event.target.value;
      applyFilters();
    }
  });

  clearFiltersButton?.addEventListener("click", resetFilters);

  pagination?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-page]");
    if (!button || button.disabled || button.closest(".page-item.disabled")) {
      return;
    }

    currentPage = Number(button.dataset.page);
    updateProductsView();

    const catalogHeading = document.querySelector(".catalog-heading");
    if (catalogHeading) {
      catalogHeading.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });

  // Delegación de eventos para Favoritos y Carrito
  document.addEventListener("click", (event) => {
    const favButton = event.target.closest("[data-favorite-id]");
    if (favButton) {
      handleToggleFavorite(Number(favButton.dataset.favoriteId));
      return;
    }

    const cartBtn = event.target.closest(".add-to-cart");
    if (cartBtn) {
      const productId = Number(cartBtn.dataset.id);
      const product = allProducts.find((p) => p.id === productId);
      if (product) {
        addToCart(product);

        // Feedback visual momentáneo
        const originalContent = cartBtn.innerHTML;
        cartBtn.classList.remove("btn-primary");
        cartBtn.classList.add("btn-success");
        cartBtn.innerHTML = `<i class="bi bi-check2 me-1"></i> ¡Agregado!`;

        setTimeout(() => {
          cartBtn.classList.remove("btn-success");
          cartBtn.classList.add("btn-primary");
          cartBtn.innerHTML = originalContent;
        }, 1200);
      }
    }
  });
}

/**
 * Inicializa el catálogo
 */
async function initCatalog() {
  try {
    checkUrlSearchParams();

    productsGrid.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-coral" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="status-message text-secondary mt-3">Estamos preparando tu colección...</p>
      </div>
    `;

    allProducts = await fetchProducts();

    // Conservar solo IDs que existan en la API
    favoriteIds = favoriteIds.filter((id) =>
      allProducts.some((product) => product.id === id)
    );
    saveFavorites(favoriteIds);

    renderCategories(categoryFilters, CATEGORIES, selectedCategory);
    applyFilters();
    renderFavorites(favoritesGrid, favoritesCount, allProducts, favoriteIds);
    attachEventListeners();
  } catch (error) {
    console.error("Error al inicializar el catálogo:", error);

    productsGrid.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="alert alert-warning border-0 shadow-sm rounded-4 d-inline-block px-4 py-3" role="alert">
          <i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>
          No fue posible cargar los productos. Verifica tu conexión e inténtalo de nuevo.
        </div>
      </div>
    `;

    if (productCount) productCount.textContent = "Error de conexión";
    if (pagination) pagination.innerHTML = "";
  }
}

// Iniciar automáticamente al cargar
initCatalog();
