import { API_URL } from "./constants.js";

/**
 * Consulta la API de DummyJSON para obtener la lista de productos
 * @returns {Promise<Array>} Lista de productos
 */
export async function fetchProducts() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`Error al cargar productos: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data.products) ? data.products : [];
}
