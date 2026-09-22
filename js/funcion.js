// FORMULARIO HU1 //

const formulario = document.getElementById("formTrabajador");

const mensaje = document.getElementById("mensaje");


formulario.addEventListener("submit", function (evento) {

    evento.preventDefault();

    // Obtener campos

    const nombre = document.getElementById("nombre");
    const rut = document.getElementById("rut");
    const cargo = document.getElementById("cargo");

    // Reiniciar validaciones

    formulario.classList.add("was-validated");

    // Validar formulario //

    if (!formulario.checkValidity()) {

        mensaje.className = "alert alert-danger";
        mensaje.textContent =
            "Debe completar los campos obligatorios.";

        mensaje.classList.remove("d-none");

        return;
    }

    // Si todos los campos son válidos //

    mensaje.className = "alert alert-success";

    mensaje.textContent =
        "Los datos del trabajador fueron ingresados correctamente.";

    mensaje.classList.remove("d-none");

    // Mostrar información en consola //
    // Temporalmente, antes de conectar la base de datos. //

    console.log("Trabajador registrado:");
    console.log("Nombre:", nombre.value);
    console.log("RUT:", rut.value);
    console.log("Cargo:", cargo.value);

    // Limpiar formulario

    formulario.reset();

    formulario.classList.remove("was-validated");

});