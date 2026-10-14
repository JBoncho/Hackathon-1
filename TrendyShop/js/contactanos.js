document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (form.checkValidity()) {
                mostrarMensajeExito();
            }
            form.classList.add('was-validated');
        }, false);
    }

    function mostrarMensajeExito() {
        const cardBody = form.closest('.card');

        if (cardBody) {

            cardBody.innerHTML = `
                <div class="text-center py-5">
                    <div class="mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#198754" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                        </svg>
                    </div>
                    <h3 class="fw-bold mb-3">¡Mensaje enviado con éxito!</h3>
                    <p class="text-muted mb-4">
                        Gracias por escribirnos. Hemos recibido tu solicitud correctamente. 
                        Un asesor se pondrá en contacto contigo.
                    </p>
                    <button class="btn btn-outline-dark px-4 py-2" onclick="location.reload();">
                        Enviar otro mensaje
                    </button>
                </div>
            `;
        }
    }
});