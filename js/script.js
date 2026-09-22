
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    const formulario = document.getElementById("formTrabajador");
    const mensaje = document.getElementById("mensaje");
    const tabla = document.getElementById("tablaTrabajadores");
    const sinTrabajadores = document.getElementById("sinTrabajadores");

    const CLAVE = "trabajadoresFaena";


    // Comprobar que los elementos existen

    if (!formulario || !mensaje || !tabla || !sinTrabajadores) {

        console.error(
            "Error: No se encontraron todos los elementos de HU1."
        );

        return;

    }


    // Obtener trabajadores guardados

    function obtenerTrabajadores() {

        try {

            return JSON.parse(localStorage.getItem(CLAVE)) || [];

        } catch (error) {

            console.error("Error al leer trabajadores:", error);

            return [];

        }

    }


    // Guardar trabajadores

    function guardarTrabajadores(trabajadores) {

        localStorage.setItem(
            CLAVE,
            JSON.stringify(trabajadores)
        );

    }


    // Mostrar mensajes

    function mostrarMensaje(texto, tipo) {

        mensaje.className = `alert alert-${tipo}`;
        mensaje.textContent = texto;

    }


    // Mostrar trabajadores en la tabla

    function mostrarTrabajadores() {

        const trabajadores = obtenerTrabajadores();

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

    }


    // Enviar formulario

    formulario.addEventListener("submit", function (evento) {

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


        // Obtener trabajadores actuales

        const trabajadores = obtenerTrabajadores();


        // Comprobar RUT duplicado

        const rutExiste = trabajadores.some(function (trabajador) {

            return trabajador.rut === rut;

        });


        if (rutExiste) {

            mostrarMensaje(
                "Ya existe un trabajador con ese RUT.",
                "danger"
            );

            return;

        }


        // Crear nuevo trabajador

        const trabajador = {

            id: Date.now(),

            nombre: nombre,

            rut: rut,

            cargo: cargo,

            telefono: telefono,

            antecedentes: antecedentes,

            fechaRegistro: new Date().toISOString()

        };


        // Agregar y guardar

        trabajadores.push(trabajador);

        guardarTrabajadores(trabajadores);


        // Actualizar tabla

        mostrarTrabajadores();


        // Mostrar éxito

        mostrarMensaje(
            "Trabajador registrado correctamente.",
            "success"
        );


        // Limpiar formulario

        formulario.reset();

    });


    // Mostrar trabajadores al abrir la página

    mostrarTrabajadores();

});