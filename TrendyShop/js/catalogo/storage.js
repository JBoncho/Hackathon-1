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
    const claveSecundaria = "carrito de compras";
    const guardado =
      localStorage.getItem(CART_KEY) || localStorage.getItem(claveSecundaria) || localStorage.getItem("cart");
    let lista = guardado ? JSON.parse(guardado) : [];
    if (!Array.isArray(lista)) lista = [];

    const idBuscado = String(product.id || product.identificador);
    const indice = lista.findIndex((item) => String(item.id || item.identificador) === idBuscado);
    const titulo = product.title || product.nombre || "Prenda TrendyShop";
    const precio = Number(product.price !== undefined ? product.price : product.precio) || 0;
    const imagen = product.thumbnail || product.imagen || product.images?.[0] || "";
    const categoria = product.category || product.categoria || "ropa";

    if (indice > -1) {
      const cantidadActual = (Number(lista[indice].quantity || lista[indice].cantidad) || 1) + 1;
      lista[indice].quantity = cantidadActual;
      lista[indice].cantidad = cantidadActual;
      lista[indice].title = titulo;
      lista[indice].nombre = titulo;
      lista[indice].price = precio;
      lista[indice].precio = precio;
      lista[indice].thumbnail = imagen;
      lista[indice].imagen = imagen;
    } else {
      lista.push({
        id: product.id,
        identificador: idBuscado,
        title: titulo,
        nombre: titulo,
        price: precio,
        precio: precio,
        thumbnail: imagen,
        imagen: imagen,
        category: categoria,
        categoria: categoria,
        quantity: 1,
        cantidad: 1,
      });
    }

    const jsonFinal = JSON.stringify(lista);
    localStorage.setItem(CART_KEY, jsonFinal);
    localStorage.setItem(claveSecundaria, jsonFinal);

    const totalConteo = lista.reduce(
      (suma, item) => suma + (Number(item.quantity || item.cantidad) || 1),
      0
    );

    window.dispatchEvent(
      new CustomEvent("trendy:cart-updated", {
        detail: { count: totalConteo },
      })
    );

    if (
      window.HeaderComponent &&
      typeof window.HeaderComponent.updateCartBadge === "function"
    ) {
      window.HeaderComponent.updateCartBadge(totalConteo);
    }
  } catch (err) {
    console.error("Error al guardar en el carrito:", err);
  }
}

