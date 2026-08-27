export const LIBROS_ACTUALIZADOS = 'biblioteca:libros-actualizados';

export function notificarLibrosActualizados() {
  window.dispatchEvent(new Event(LIBROS_ACTUALIZADOS));
}
