"use strict";

document.addEventListener("DOMContentLoaded", function () {

    const formulario = document.getElementById("formTrabajador");
    const mensaje = document.getElementById("mensaje");
    const tabla = document.getElementById("tablaTrabajadores");
    const sinTrabajadores = document.getElementById("sinTrabajadores");

    const API_URL = "/trabajadores";


    // Comprobar que los elementos existen

    if (!formulario || !mensaje || !tabla || !sinTrabajadores) {

        console.error(
            "Error: No se encontraron todos los elementos de HU1."
        );

        return;

    }

    

    // Mostrar mensajes

    function mostrarMensaje(texto, tipo) {

        mensaje.className = `alert alert-${tipo}`;
        mensaje.textContent = texto;

    }


    // Mostrar trabajadores en la tabla

    async function mostrarTrabajadores() {

        try {

            const respuesta = await fetch(API_URL);

            if (!respuesta.ok) {
                throw new Error("No fue posible obtener los trabajadores.");
            }

            const trabajadores = await respuesta.json();

            tabla.innerHTML = "";


            if (trabajadores.length === 0) {

                sinTrabajadores.classList.remove("d-none");

                return;

            }


            sinTrabajadores.classList.add("d-none");


            trabajadores.forEach(function (trabajador) {

                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${trabajador.nombre}</td>
                    <td>${trabajador.rut}</td>
                    <td>${trabajador.cargo}</td>
                    <td>${trabajador.telefono || "No registrado"}</td>
                `;

                tabla.appendChild(fila);

            });

        } catch (error) {

            console.error("Error al cargar trabajadores:", error);

            mostrarMensaje(
                "No fue posible cargar los trabajadores.",
                "danger"
            );

        }

    }


    // Enviar formulario

    formulario.addEventListener("submit", async function (evento) {

        // Evitar que la página se recargue

        evento.preventDefault();

        console.log("Formulario enviado correctamente.");


        // Obtener valores

        const nombre = document.getElementById("nombre").value.trim();

        const rut = document.getElementById("rut").value.trim();

        const cargo = document.getElementById("cargo").value.trim();

        const telefono = document.getElementById("telefono").value.trim();

        const antecedentes = document.getElementById("antecedentes").value.trim();


        // Validar campos obligatorios

        if (!nombre || !rut || !cargo) {

            mostrarMensaje(
                "Debe completar los campos obligatorios.",
                "danger"
            );

            return;

        }


        // Preparar datos para enviar al backend

        const trabajador = {

            nombre: nombre,

            rut: rut,

            cargo: cargo,

            telefono: telefono,

            antecedentes: antecedentes

        };


        try {

            // Enviar trabajador al backend

            const respuesta = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(trabajador)

            });


            const resultado = await respuesta.json();


            // Error por RUT duplicado

            if (respuesta.status === 409) {

                mostrarMensaje(
                    resultado.error,
                    "danger"
                );

                return;

            }


            // Otros errores de validación

            if (!respuesta.ok) {

                mostrarMensaje(
                    resultado.error || "No fue posible registrar el trabajador.",
                    "danger"
                );

                return;

            }


            // Registro exitoso

            mostrarMensaje(
                "Trabajador registrado correctamente.",
                "success"
            );


            // Limpiar formulario

            formulario.reset();


            // Actualizar tabla desde la base de datos

            mostrarTrabajadores();


        } catch (error) {

            console.error("Error al registrar trabajador:", error);

            mostrarMensaje(
                "No fue posible conectar con el servidor.",
                "danger"
            );

        }

    });


    // Mostrar trabajadores al abrir la página

    mostrarTrabajadores();

    // ============================
    // HU2 - REGISTRAR INGRESO
    // ============================

    const formularioIngreso = document.getElementById("formIngreso");
    const mensajeIngreso = document.getElementById("mensajeIngreso");
    const trabajadorIngreso = document.getElementById("trabajadorIngreso");
    const ubicacionIngreso = document.getElementById("ubicacionIngreso");
    const fechaIngreso = document.getElementById("fechaIngreso");
    const horaIngreso = document.getElementById("horaIngreso");

    function mostrarMensajeIngreso(texto, tipo) {
        mensajeIngreso.className = `alert alert-${tipo}`;
        mensajeIngreso.textContent = texto;
    }

    async function cargarTrabajadoresIngreso() {
        try {
            const respuesta = await fetch("/trabajadores/ingreso");

            if (!respuesta.ok) {
                throw new Error("No fue posible obtener los trabajadores.");
            }

            const trabajadores = await respuesta.json();

            trabajadorIngreso.innerHTML = `
                <option value="">
                    Seleccione un trabajador
                </option>
            `;

            trabajadores.forEach(function (trabajador) {

                const opcion = document.createElement("option");

                opcion.value = trabajador.id;

                opcion.textContent =
                    `${trabajador.nombre} - ${trabajador.rut}`;

                trabajadorIngreso.appendChild(opcion);
            });

        } catch (error) {

            console.error(
                "Error al cargar trabajadores para ingreso:",
                error
            );

            mostrarMensajeIngreso(
                "No fue posible cargar los trabajadores.",
                "danger"
            );
        }
    }

    function actualizarFechaHora() {

        const ahora = new Date();

        fechaIngreso.value = ahora.toLocaleDateString("es-CL");

        horaIngreso.value = ahora.toLocaleTimeString("es-CL", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    if (formularioIngreso) {

        actualizarFechaHora();

        cargarTrabajadoresIngreso();

        formularioIngreso.addEventListener(
            "submit",
            async function (evento) {

                evento.preventDefault();

                const trabajador_id = trabajadorIngreso.value;
                const ubicacion = ubicacionIngreso.value.trim();

                if (!trabajador_id || !ubicacion) {

                    mostrarMensajeIngreso(
                        "Debe seleccionar un trabajador e ingresar la ubicación.",
                        "danger"
                    );

                    return;
                }

                try {

                    const respuesta = await fetch("/ingresos", {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            trabajador_id: trabajador_id,
                            ubicacion: ubicacion
                        })

                    });

                    const resultado = await respuesta.json();

                    if (!respuesta.ok) {

                        mostrarMensajeIngreso(
                            resultado.error ||
                            "No fue posible registrar el ingreso.",
                            "danger"
                        );

                        return;
                    }

                    mostrarMensajeIngreso(
                        "Ingreso registrado correctamente.",
                        "success"
                    );

                    actualizarFechaHora();

                    formularioIngreso.reset();

                    actualizarFechaHora();

                } catch (error) {

                    console.error(
                        "Error al registrar ingreso:",
                        error
                    );

                    mostrarMensajeIngreso(
                        "No fue posible conectar con el servidor.",
                        "danger"
                    );
                }
            }
        );
    }

});