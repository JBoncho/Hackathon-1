import { FAVORITES_KEY, CART_KEY } from "./constants.js";

/**
 * Lee los IDs de favoritos desde localStorage
 * @returns {number[]} Array con los IDs favoritos
 */
export function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error("Error al leer favoritos de localStorage:", error);
    return [];
  }
}

/**
 * Guarda los IDs de favoritos en localStorage
 * @param {number[]} favoriteIds 
 */
export function saveFavorites(favoriteIds) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
  } catch (error) {
    console.error("Error al guardar favoritos en localStorage:", error);
  }
}

/**
 * Alterna un ID de producto en la lista de favoritos y lo persiste
 * @param {number} productId 
 * @param {number[]} currentFavorites 
 * @returns {number[]} Nueva lista de IDs favoritos
 */
export function toggleFavoriteId(productId, currentFavorites) {
  const isFav = currentFavorites.includes(productId);
  const updated = isFav
    ? currentFavorites.filter((id) => id !== productId)
    : [...currentFavorites, productId];

  saveFavorites(updated);
  return updated;
}

/**
 * Agrega un producto al carrito en localStorage y notifica al Header
 * @param {Object} product 
 */
export function addToCart(product) {
  if (!product || !product.id) return;

  try {
    const stored =
      localStorage.getItem(CART_KEY) || localStorage.getItem("cart");
    let cart = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(cart)) cart = [];

    const existingIndex = cart.findIndex((item) => item.id === product.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail || product.images?.[0] || "",
        category: product.category,
        quantity: 1,
      });
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cart));

    const totalCount = cart.reduce(
      (sum, item) => sum + (item.quantity || 1),
      0
    );

    // Disparar evento para actualizar el badge del Header
    window.dispatchEvent(
      new CustomEvent("trendy:cart-updated", {
        detail: { count: totalCount },
      })
    );

    if (
      window.HeaderComponent &&
      typeof window.HeaderComponent.updateCartBadge === "function"
    ) {
      window.HeaderComponent.updateCartBadge(totalCount);
    }
  } catch (err) {
    console.error("Error al guardar en el carrito:", err);
  }
}
