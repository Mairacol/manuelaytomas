document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. MÚSICA Y OVERLAY DE ENTRADA
    // -------------------------------------------------------------
    const overlay = document.getElementById('intro-overlay');
    // Soporta 'intro-enter-btn' o 'openInvitationBtn'
    const openInviteBtn = document.getElementById('intro-enter-btn') || document.getElementById('openInvitationBtn'); 
    const bgMusic = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicToggleBtn');
    const musicIcon = document.getElementById('musicIcon');
    const vinyl = document.getElementById('vinylDisc');
    const heroSection = document.querySelector('.hero-section');

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

    // Evento Abrir Invitación
    if (openInviteBtn && overlay) {
        openInviteBtn.addEventListener('click', () => {
            overlay.style.opacity = '0';
            overlay.style.transform = 'translateY(-20px)';
            overlay.style.pointerEvents = 'none';
            
            if (heroSection) {
                heroSection.classList.add('is-animating');
            }

            setTimeout(() => {
                overlay.style.display = 'none';
            }, 1000);

            if (bgMusic && bgMusic.paused) {
                playWithFadeIn();
            }
        });
    }

    if (musicBtn) {
        musicBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAudio();
        });
    }

    if (bgMusic) {
        bgMusic.addEventListener('play', syncUI);
        bgMusic.addEventListener('pause', syncUI);
        bgMusic.addEventListener('ended', syncUI);
    }

    // -------------------------------------------------------------
    // 2. RSVP Y FORMULARIO DINÁMICO EDITORIAL
    // -------------------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const familyNameParam = urlParams.get("nombre") || urlParams.get("id") || "Invitado Especial";
    const totalSlots = parseInt(urlParams.get("pases") || urlParams.get("inv") || "1", 10);

    const rsvpSection = document.getElementById("rsvpSection");
    const familyNameEl = document.getElementById("familyName");
    const slotsEl = document.getElementById("slots");
    const guestsContainer = document.getElementById("guests");
    const submitBtn = document.getElementById("submitBtn");
    const formError = document.getElementById("formError");

    // Mantiene la visibilidad sin romper la maquetación flex/snap scroll
    if (rsvpSection) {
        rsvpSection.style.display = "flex";
    }

    if (familyNameEl) {
        familyNameEl.textContent = familyNameParam.replace(/-/g, " ").toUpperCase();
    }
    
    if (slotsEl) {
        slotsEl.textContent = totalSlots === 1 ? "1 Lugar reservado" : `${totalSlots} Lugares reservados`;
    }

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
                        <label class="radio-pill active">
                            <input type="radio" name="attendance_${i}" value="Sí" checked> Sí asistirá
                        </label>
                        <label class="radio-pill">
                            <input type="radio" name="attendance_${i}" value="No"> No podrá asistir
                        </label>
                    </div>
                </div>

                <div class="field-block menu-block" id="menuBlock_${i}" style="transition: all 0.4s ease; max-height: 120px; overflow: hidden;">
                    <label class="editorial-label">Menú / Preferencia</label>
                    <select class="editorial-select guest-menu">
                        <option value="" disabled selected>Seleccioná una opción de menú</option>
                        <option value="General">Menú General</option>
                        <option value="Vegetariano">Vegetariano</option>
                        <option value="Celíaco">Celíaco / Sin TACC</option>
                        <option value="Vegano">Vegano</option>
                    </select>
                </div>

                <div class="field-block">
                    <label class="editorial-label">Mensaje para los novios</label>
                    <input type="text" class="editorial-input guest-diet" placeholder="Escribí unas palabras o aclaración...">
                </div>
            `;
            
            guestsContainer.appendChild(guestCard);

            const radioNo = guestCard.querySelector(`input[name="attendance_${i}"][value="No"]`);
            const radioSi = guestCard.querySelector(`input[name="attendance_${i}"][value="Sí"]`);
            const menuBlock = guestCard.querySelector(`#menuBlock_${i}`);
            const menuSelect = guestCard.querySelector(".guest-menu");
            const radioPills = guestCard.querySelectorAll(".radio-pill");

            // Alternar clase activa en radios
            guestCard.querySelectorAll(`input[name="attendance_${i}"]`).forEach(radio => {
                radio.addEventListener('change', (e) => {
                    radioPills.forEach(pill => pill.classList.remove('active'));
                    e.target.closest('.radio-pill').classList.add('active');
                });
            });

            // Ocultar bloque de menú suavemente si indica que "No"
            radioNo.addEventListener('change', () => {
                menuSelect.disabled = true;
                menuBlock.style.opacity = '0.3';
                menuBlock.style.maxHeight = '0px';
                menuBlock.style.marginBottom = '0px';
            });

            radioSi.addEventListener('change', () => {
                menuSelect.disabled = false;
                menuBlock.style.opacity = '1';
                menuBlock.style.maxHeight = '120px';
                menuBlock.style.marginBottom = '24px';
            });
        }
    }

    // Procesamiento y submit
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

                const isAttending = attendanceInput ? attendanceInput.value === "Sí" : true;

                let nameValid = !!nameInput.value.trim();
                let menuValid = isAttending ? !!menuSelect.value : true;

                if (!nameValid || !menuValid) {
                    allValid = false;
                    nameInput.style.borderBottomColor = nameValid ? "var(--color-corn-gold)" : "var(--color-terracotta)";
                    if (isAttending) {
                        menuSelect.style.borderBottomColor = menuValid ? "var(--color-corn-gold)" : "var(--color-terracotta)";
                    }
                } else {
                    nameInput.style.borderBottomColor = "var(--color-corn-gold)";
                    menuSelect.style.borderBottomColor = "var(--color-corn-gold)";
                }

                rsvpData.push({
                    invitado: nameInput.value.trim(),
                    asistencia: attendanceInput ? attendanceInput.value : "Sí",
                    menu: isAttending ? menuSelect.value : "N/A",
                    restricciones: dietInput ? dietInput.value.trim() : ""
                });
            });

            if (!allValid) {
                if (formError) {
                    formError.style.display = "block";
                    formError.textContent = "Por favor, completá los campos requeridos.";
                }
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = "ENVIANDO CONFIRMACIÓN...";

            console.log("Datos listos para enviar:", {
                familia: familyNameParam,
                invitados: rsvpData
            });

            setTimeout(() => {
                mostrarModalAgradecimiento();
                submitBtn.disabled = false;
                submitBtn.textContent = "CONFIRMAR ASISTENCIA";
            }, 800);
        });
    }

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
                    <p>Tu confirmación ha sido registrada con éxito. ¡Nos vemos muy pronto para celebrar!</p>
                    <button class="modal-btn" id="closeModalBtn">CERRAR</button>
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
// Desplegar/ocultar los datos bancarios
function toggleDatos() {
    const card = document.getElementById("giftsBankCard");
    const btn = document.querySelector(".btn-underline");
    
    if (card.style.display === "none") {
        card.style.display = "block";
        btn.innerText = "Ocultar datos bancarios";
    } else {
        card.style.display = "none";
        btn.innerText = "Ver datos bancarios";
    }
}

// Copiar CBU al portapapeles
function copiarCBU() {
    const cbu = document.getElementById("cbuText").innerText;
    navigator.clipboard.writeText(cbu).then(() => {
        alert("¡CBU copiado al portapapeles!");
    }).catch(err => {
        console.error("Error al copiar: ", err);
    });
}