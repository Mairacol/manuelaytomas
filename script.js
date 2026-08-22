document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('intro-overlay');
    const openInviteBtn = document.getElementById('openInvitationBtn'); 
    const bgMusic = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicToggleBtn');
    const musicIcon = document.getElementById('musicIcon');
    const vinyl = document.getElementById('vinylDisc');
    const heroSection = document.querySelector('.hero-section');

    // Función encargada de actualizar la UI según el estado real del audio
    const syncUI = () => {
        if (!bgMusic) return;
        const isPlaying = !bgMusic.paused;

        if (vinyl) {
            vinyl.classList.toggle('spinning', isPlaying);
        }
        if (musicIcon) {
            musicIcon.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
            musicIcon.style.marginLeft = isPlaying ? '0px' : '1px';
        }
    };

    // Función para alternar reproducción/pausa de forma segura
    const toggleAudio = () => {
        if (!bgMusic) return;

        if (bgMusic.paused) {
            bgMusic.play()
                .then(() => syncUI())
                .catch(err => {
                    console.warn('No se pudo reproducir el audio:', err);
                    syncUI();
                });
        } else {
            bgMusic.pause();
            syncUI();
        }
    };

    // Reproducción suave con Fade-In progresivo de audio
    const playWithFadeIn = () => {
        if (!bgMusic) return;
        bgMusic.volume = 0;
        bgMusic.play()
            .then(() => {
                syncUI();
                let vol = 0;
                const fadeIn = setInterval(() => {
                    if (vol < 0.85) {
                        vol += 0.05;
                        bgMusic.volume = Math.min(vol, 1);
                    } else {
                        clearInterval(fadeIn);
                    }
                }, 100);
            })
            .catch(err => {
                console.warn('Autoplay bloqueado por el navegador:', err);
                syncUI();
            });
    };

    // 1. Evento: Abrir Invitación
    if (openInviteBtn && overlay) {
        openInviteBtn.addEventListener('click', () => {
            // Animación de salida de la portada
            overlay.style.opacity = '0';
            overlay.style.transform = 'translateY(-20px)';
            overlay.style.pointerEvents = 'none';
            
            // Disparar animación de entrada en la sección Hero
            if (heroSection) {
                heroSection.classList.add('is-animating');
            }

            setTimeout(() => {
                overlay.style.display = 'none';
            }, 1000);

            // Intentar reproducir música con fade-in al abrir
            if (bgMusic && bgMusic.paused) {
                playWithFadeIn();
            }
        });
    }

    // 2. Evento: Clic en el botón flotante del vinilo
    if (musicBtn) {
        musicBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAudio();
        });
    }

    // Escuchar eventos nativos del elemento <audio> para mantener la UI 100% sincronizada
    if (bgMusic) {
        bgMusic.addEventListener('play', syncUI);
        bgMusic.addEventListener('pause', syncUI);
        bgMusic.addEventListener('ended', syncUI);
    }
});

// Lógica de URL, RSVP y Confirmación
document.addEventListener("DOMContentLoaded", function () {
    // 1. Obtener parámetros de la URL (ej: ?id=familia-perez&inv=4)
    const urlParams = new URLSearchParams(window.location.search);
    
    const familyNameParam = urlParams.get("nombre") || urlParams.get("id") || "Invitado Especial";
    const totalSlots = parseInt(urlParams.get("pases") || urlParams.get("inv") || "1", 10);

    // 2. Elementos del DOM
    const rsvpSection = document.getElementById("rsvpSection");
    const familyNameEl = document.getElementById("familyName");
    const slotsEl = document.getElementById("slots");
    const guestsContainer = document.getElementById("guests");
    const submitBtn = document.getElementById("submitBtn");
    const formError = document.getElementById("formError");

    // Mostrar la sección si estaba oculta
    if (rsvpSection) {
        rsvpSection.style.display = "block";
    }

    // Rellenar datos principales en la tarjeta
    if (familyNameEl) {
        familyNameEl.textContent = familyNameParam.replace(/-/g, " ").toUpperCase();
    }
    if (slotsEl) {
        slotsEl.textContent = totalSlots === 1 ? "1 Pase disponible" : `${totalSlots} Pases disponibles`;
    }

    // 3. Generar dinámicamente los campos para cada invitado
    if (guestsContainer) {
        guestsContainer.innerHTML = ""; 
        
        for (let i = 1; i <= totalSlots; i++) {
            const guestCard = document.createElement("div");
            guestCard.className = "guest-editorial-card";
            
            guestCard.innerHTML = `
                <div class="guest-card-top">
                    <span class="guest-number">Invitado 0${i}</span>
                </div>
                
                <div class="field-block">
                    <label class="editorial-label">Nombre y Apellido</label>
                    <input type="text" class="editorial-input guest-name" placeholder="Nombre completo" required>
                </div>

                <div class="field-block">
                    <label class="editorial-label">¿Asistirá?</label>
                    <div class="editorial-radio-group">
                        <label class="radio-pill">
                            <input type="radio" name="attendance_${i}" value="Sí" checked> Sí asistirá
                        </label>
                        <label class="radio-pill">
                            <input type="radio" name="attendance_${i}" value="No"> No podrá asistir
                        </label>
                    </div>
                </div>

                <div class="field-block">
                    <label class="editorial-label">Menú / Preferencia</label>
                    <select class="editorial-select guest-menu" required>
                        <option value="" disabled selected>Seleccioná una opción de menú</option>
                        <option value="General">Menú General</option>
                        <option value="Vegetariano">Vegetariano</option>
                        <option value="Celíaco">Celíaco / Sin TACC</option>
                        <option value="Vegano">Vegano</option>
                    </select>
                </div>

                <div class="field-block">
                    <label class="editorial-label">Mensaje (Opcional)</label>
                    <input type="text" class="editorial-input guest-diet" placeholder="Mensaje para los novios...">
                </div>
            `;
            guestsContainer.appendChild(guestCard);
        }
    }

    // 4. Manejar el evento de envío (Submit)
    if (submitBtn) {
        submitBtn.addEventListener("click", function (e) {
            e.preventDefault();

            if (formError) formError.style.display = "none";

            const guestCards = document.querySelectorAll(".guest-editorial-card");
            let allValid = true;
            let rsvpData = [];

            guestCards.forEach((card, index) => {
                const nameInput = card.querySelector(".guest-name");
                const attendanceInput = card.querySelector(`input[name="attendance_${index + 1}"]:checked`);
                const menuSelect = card.querySelector(".guest-menu");
                const dietInput = card.querySelector(".guest-diet");

                if (!nameInput.value.trim() || !menuSelect.value) {
                    allValid = false;
                    if (!nameInput.value.trim()) nameInput.style.borderBottomColor = "#b53737";
                    if (!menuSelect.value) menuSelect.style.borderBottomColor = "#b53737";
                } else {
                    nameInput.style.borderBottomColor = "#cab87b";
                    menuSelect.style.borderBottomColor = "#cab87b";
                }

                rsvpData.push({
                    invitado: nameInput.value.trim(),
                    asistencia: attendanceInput ? attendanceInput.value : "Sí",
                    menu: menuSelect.value,
                    restricciones: dietInput ? dietInput.value.trim() : ""
                });
            });

            if (!allValid) {
                if (formError) formError.style.display = "block";
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = "ENVIANDO...";

            console.log("Datos listos para enviar:", {
                familia: familyNameParam,
                invitados: rsvpData
            });

            setTimeout(() => {
                mostrarModalAgradecimiento();
                submitBtn.disabled = false;
                submitBtn.textContent = "ENVIAR CONFIRMACIÓN";
            }, 1000);
        });
    }

    // 5. Función para mostrar el Modal de Agradecimiento
    function mostrarModalAgradecimiento() {
        let modal = document.getElementById("thankYouModal");
        
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "thankYouModal";
            modal.className = "modal";
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-icon">✓</div>
                    <h3>¡Gracias!</h3>
                    <p>Tu confirmación ha sido registrada con éxito. ¡Te esperamos para celebrar juntos!</p>
                    <button class="modal-btn" id="closeModalBtn">Cerrar</button>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById("closeModalBtn").addEventListener("click", function () {
                modal.classList.add("hidden");
                window.location.reload();
            });
        }
        
        modal.classList.remove("hidden");
    }
});