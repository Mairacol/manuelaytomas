document.addEventListener('DOMContentLoaded', () => {

    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxM2ADI6ucvoWPhj9w2xNpK8X09PgP01V-cWB0AHVL0sHGdFaZ60rjz-XyLQeF5T1hs/exec";

    // -------------------------------------------------------------
    // 0. DETECCIÓN DE PARÁMETROS Y VISIBILIDAD INICIAL
    // -------------------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const rawParam = urlParams.get("nombre") || urlParams.get("familia") || urlParams.get("invitados");

    const rsvpSection = document.getElementById("rsvpSection");
    const triviaSection = document.getElementById("trivia");
    const giftsContainerSection = document.getElementById("giftsSection"); // Si tienes un contenedor general para la sección de regalos

    // Si NO hay parámetros (entran a la web limpia), ocultamos RSVP, Trivia y Regalos
    if (!rawParam) {
        if (rsvpSection) rsvpSection.style.display = "none";
        if (triviaSection) triviaSection.style.display = "none";
        if (giftsContainerSection) giftsContainerSection.style.display = "none";
    } else {
        // Si SÍ hay parámetros, los mostramos correctamente
        if (rsvpSection) rsvpSection.style.display = "flex";
        if (triviaSection) triviaSection.style.display = "block";
        if (giftsContainerSection) giftsContainerSection.style.display = "block";
    }

    // -------------------------------------------------------------
    // 1. MÚSICA Y OVERLAY DE ENTRADA
    // -------------------------------------------------------------
    const overlay = document.getElementById('intro-overlay');
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
    // 2. PARÁMETROS DE LA URL (TÍTULO PRINCIPAL DINÁMICO)
    // -------------------------------------------------------------
    let displayTitle = "INVITADO ESPECIAL";
    if (rawParam) {
        displayTitle = rawParam.replace(/-/g, " ").replace(/,/g, " y ").toUpperCase();
    }

    const totalSlots = parseInt(urlParams.get("pases") || urlParams.get("inv") || "1", 10);
    const guestID = urlParams.get("id") || "SIN_ID";

    const familyNameEl = document.getElementById("familyName");
    const slotsEl = document.getElementById("slots");
    const guestsContainer = document.getElementById("guests");
    const submitBtn = document.getElementById("submitBtn");
    const formError = document.getElementById("formError");

    if (familyNameEl) {
        familyNameEl.textContent = displayTitle;
    }
    
    if (slotsEl) {
        slotsEl.textContent = totalSlots === 1 ? "1 LUGAR RESERVADO" : `${totalSlots} LUGARES RESERVADOS`;
    }

    // Generar formularios individuales por invitado
    if (guestsContainer) {
        guestsContainer.innerHTML = ""; 

        for (let i = 1; i <= totalSlots; i++) {
            const guestCard = document.createElement("div");
            guestCard.className = "guest-editorial-card";

            guestCard.innerHTML = `
                <div class="guest-card-top">
                    <span class="guest-number">Invitado ${i}</span>
                </div>

                <div class="field-block">
                    <label class="editorial-label">Nombre</label>
                    <input type="text" class="editorial-input guest-firstname" placeholder="Nombre" required>
                </div>

                <div class="field-block">
                    <label class="editorial-label">Apellido</label>
                    <input type="text" class="editorial-input guest-lastname" placeholder="Apellido" required>
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

            guestCard.querySelectorAll(`input[name="attendance_${i}"]`).forEach(radio => {
                radio.addEventListener('change', (e) => {
                    radioPills.forEach(pill => pill.classList.remove('active'));
                    e.target.closest('.radio-pill').classList.add('active');
                });
            });

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

    // -------------------------------------------------------------
    // 3. ENVÍO DEL FORMULARIO A GOOGLE SHEETS (Con protección Honeypot)
    // -------------------------------------------------------------
    if (submitBtn) {
        submitBtn.addEventListener("click", function (e) {
            e.preventDefault();

            const botCheck = document.getElementById("validationCode").value;
            if (botCheck !== "") {
                console.warn("Actividad de bot detectada y bloqueada.");
                return; 
            }

            if (formError) formError.style.display = "none";

            const guestCards = document.querySelectorAll(".guest-editorial-card");
            let allValid = true;
            let rsvpData = [];

            guestCards.forEach((card, index) => {
                const firstNameInput = card.querySelector(".guest-firstname");
                const lastNameInput = card.querySelector(".guest-lastname");
                const attendanceInput = card.querySelector(`input[name="attendance_${index + 1}"]:checked`);
                const menuSelect = card.querySelector(".guest-menu");
                const dietInput = card.querySelector(".guest-diet");

                const isAttending = attendanceInput ? attendanceInput.value === "Sí" : true;

                let firstNameValid = !!firstNameInput.value.trim();
                let lastNameValid = !!lastNameInput.value.trim();
                let menuValid = isAttending ? !!menuSelect.value : true;

                if (!firstNameValid || !lastNameValid || !menuValid) {
                    allValid = false;
                    firstNameInput.style.borderBottomColor = firstNameValid ? "var(--color-corn-gold)" : "var(--color-terracotta)";
                    lastNameInput.style.borderBottomColor = lastNameValid ? "var(--color-corn-gold)" : "var(--color-terracotta)";
                    if (isAttending) {
                        menuSelect.style.borderBottomColor = menuValid ? "var(--color-corn-gold)" : "var(--color-terracotta)";
                    }
                } else {
                    firstNameInput.style.borderBottomColor = "var(--color-corn-gold)";
                    lastNameInput.style.borderBottomColor = "var(--color-corn-gold)";
                    if (menuSelect) menuSelect.style.borderBottomColor = "var(--color-corn-gold)";
                }

                rsvpData.push({
                    nombre: firstNameInput.value.trim(),
                    apellido: lastNameInput.value.trim(),
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

            const payload = {
                familia: displayTitle,
                id: guestID,
                puntos: window.triviaPuntos || 0,
                invitados: rsvpData
            };

            fetch(APPS_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ payload: JSON.stringify(payload) })
            })
            .then(() => {
                mostrarModalAgradecimiento();
                submitBtn.disabled = false;
                submitBtn.textContent = "CONFIRMAR ASISTENCIA";
            })
            .catch(err => {
                console.error("Error al enviar respuesta:", err);
                if (formError) {
                    formError.style.display = "block";
                    formError.textContent = "Ocurrió un error al guardar. Intentá nuevamente.";
                }
                submitBtn.disabled = false;
                submitBtn.textContent = "CONFIRMAR ASISTENCIA";
            });
        });
    }

    function mostrarModalAgradecimiento() {
        let modal = document.getElementById("thanksModal");
        if (modal) {
            modal.classList.remove("hidden");
            modal.style.display = "flex";
        }
    }

    // -------------------------------------------------------------
    // 4. LÓGICA DE LA TRIVIA (3 PREGUNTAS)
    // -------------------------------------------------------------
    window.triviaPuntos = 0;
    
    const triviaForm = document.getElementById('triviaForm');
    if (triviaForm) {
        triviaForm.addEventListener('change', () => {
            let puntos = 0;
            const q1 = document.querySelector('input[name="q1"]:checked');
            const q2 = document.querySelector('input[name="q2"]:checked');
            const q3 = document.querySelector('input[name="q3"]:checked');

            if (q1 && q1.value === "correcta") puntos += 10;
            if (q2 && q2.value === "correcta") puntos += 10;
            if (q3 && q3.value === "correcta") puntos += 10;

            window.triviaPuntos = puntos;
        });
    }
});

function closeThanksModal() {
    let modal = document.getElementById("thanksModal");
    if (modal) {
        modal.classList.add("hidden");
        modal.style.display = "none";
        window.location.reload();
    }
}

function toggleDatos() {
    const urlParams = new URLSearchParams(window.location.search);
    const rawParam = urlParams.get("nombre") || urlParams.get("familia") || urlParams.get("invitados");

    // Seguridad: Si entran sin parámetros, bloqueamos la visualización de los datos bancarios
    if (!rawParam) {
        alert("Esta sección está disponible únicamente mediante invitación personalizada.");
        return;
    }

    const card = document.getElementById("giftsBankCard");
    const btn = document.querySelector(".btn-underline");
    
    if (card && card.style.display === "none") {
        card.style.display = "block";
        if (btn) btn.innerText = "Ocultar datos bancarios";
    } else if (card) {
        card.style.display = "none";
        if (btn) btn.innerText = "Ver datos bancarios";
    }
}

function copiarCBU() {
    const cbu = document.getElementById("cbuText")?.innerText;
    if (cbu) {
        navigator.clipboard.writeText(cbu).then(() => {
            alert("¡CBU copiado al portapapeles!");
        }).catch(err => {
            console.error("Error al copiar: ", err);
        });
    }
}

// -------------------------------------------------------------
// 5. REVEAL
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.25 
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(section => {
      observer.observe(section);
    });
});