document.addEventListener('DOMContentLoaded', () => {

    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxM2ADI6ucvoWPhj9w2xNpK8X09PgP01V-cWB0AHVL0sHGdFaZ60rjz-XyLQeF5T1hs/exec";

    // -------------------------------------------------------------
    // 0. DETECCIÓN DE PARÁMETROS Y VISIBILIDAD INICIAL
    // -------------------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const rawParam = urlParams.get("nombre") || urlParams.get("familia") || urlParams.get("invitados");

    const rsvpSection = document.getElementById("rsvpSection");
    const triviaSection = document.getElementById("trivia");
    const giftsContainerSection = document.getElementById("giftsSection"); 

    if (!rawParam) {
        if (rsvpSection) rsvpSection.style.display = "none";
        if (triviaSection) triviaSection.style.display = "none";
        if (giftsContainerSection) giftsContainerSection.style.display = "none";
    } else {
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
        openInviteBtn.addEventListener('click', (e) => {
            e.preventDefault();
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
    const guestLabelEl = document.getElementById("txtGuestLabel"); 
    const guestsContainer = document.getElementById("guests");
    const submitBtn = document.getElementById("submitBtn");
    const formError = document.getElementById("formError");

    if (familyNameEl) {
        familyNameEl.textContent = displayTitle;
    }
    
    if (guestLabelEl) {
        if (totalSlots === 1) {
            const generoDiscreto = urlParams.get("g") ? urlParams.get("g").toLowerCase() : "";
            
            if (generoDiscreto === "f") {
                guestLabelEl.textContent = "Invitada";
            } else if (generoDiscreto === "m") {
                guestLabelEl.textContent = "Invitado";
            } else {
                const nombreUnico = rawParam ? rawParam.trim().toUpperCase() : "";
                const nombresVaronesExcepcion = ["LUCAS", "MATIAS", "TOBIAS", "BAUTISTA", "JONAS", "NICOLAS", "TOMAS", "EZEQUIEL"];
                
                const esVaronExcepcion = nombresVaronesExcepcion.includes(nombreUnico);
                const terminaEnA = nombreUnico.endsWith('A');

                if (terminaEnA && !esVaronExcepcion) {
                    guestLabelEl.textContent = "Invitada";
                } else {
                    guestLabelEl.textContent = "Invitado";
                }
            }
        } else {
            guestLabelEl.textContent = "Invitados";
        }
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
                <div class="guest-card-top" style="border-bottom: 1px solid rgba(202, 184, 123, 0.4); padding-bottom: 8px; margin-bottom: 20px;">
                    <span class="guest-number" style="font-family: var(--font-title); font-size: 0.75rem; letter-spacing: 4px; color: var(--color-burgundy); text-transform: uppercase;">Invitado ${i}</span>
                </div>

                <div class="field-block" style="margin-bottom: 20px;">
                    <input type="text" class="editorial-input guest-firstname" placeholder="Nombre" required>
                </div>

                <div class="field-block" style="margin-bottom: 25px;">
                    <input type="text" class="editorial-input guest-lastname" placeholder="Apellido" required>
                </div>

                <div class="field-block" style="margin-bottom: 25px;">
                    <label class="editorial-label" style="font-family: var(--font-title); font-size: 0.7rem; letter-spacing: 3px; color: var(--color-olive-dark); text-transform: uppercase; display: block; margin-bottom: 8px;">¿Asistirá?</label>
                    <div class="editorial-radio-group">
                        <label class="radio-pill active">
                            <input type="radio" name="attendance_${i}" value="Sí" checked> Sí asistirá
                        </label>
                        <label class="radio-pill">
                            <input type="radio" name="attendance_${i}" value="No"> No podrá asistir
                        </label>
                    </div>
                </div>

                <div class="field-block menu-block" id="menuBlock_${i}" style="margin-bottom: 25px; overflow: hidden; transition: all 0.4s ease;">
                    <select class="editorial-select guest-menu">
                        <option value="" disabled selected>Menú (Seleccionar opción)</option>
                        <option value="General">Menú General</option>
                        <option value="Vegetariano">Vegetariano</option>
                        <option value="Celíaco">Celíaco / Sin TACC</option>
                        <option value="Vegano">Vegano</option>
                    </select>
                </div>

                <div class="field-block" style="margin-bottom: 10px;">
                    <input type="text" class="editorial-input guest-diet" placeholder="Mensaje para los novios (opcional)">
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

            // Oculta completamente el menú si selecciona "No podrá asistir"
            radioNo.addEventListener('change', () => {
                menuSelect.value = "";
                menuSelect.required = false;
                menuBlock.style.display = 'none'; 
            });

            radioSi.addEventListener('change', () => {
                menuSelect.required = true;
                menuBlock.style.display = 'block'; 
            });
        }
    }

    // -------------------------------------------------------------
    // 3. ENVÍO DEL FORMULARIO A GOOGLE SHEETS (Fluido y sin saltos)
    // -------------------------------------------------------------
    if (submitBtn) {
        submitBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            const botCheck = document.getElementById("validationCode")?.value || "";
            if (botCheck !== "") return false;

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
                return false;
            }

            // Fijamos la posición del scroll de inmediato
            const currentScroll = window.scrollY;

            // Actualización visual instantánea en pantalla
            localStorage.setItem(`rsvp_confirmed_${guestID}`, "true");
            limpiarInterfazRsvp();
            mostrarModalAgradecimiento();
            window.scrollTo({ top: currentScroll, behavior: 'instant' });

            // Envío en segundo plano con un pequeño retraso para garantizar fluidez total
            setTimeout(() => {
                const payload = {
                    familia: displayTitle,
                    id: guestID,
                    puntos: window.triviaPuntos || 0,
                    invitados: rsvpData
                };

                fetch(APPS_SCRIPT_URL, {
                    method: "POST",
                    mode: "no-cors",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify(payload)
                }).catch(() => {});
            }, 50);

            return false;
        });
    }

 function limpiarInterfazRsvp() {
    const guestsContainerEl = document.getElementById("guests");
    const submitButtonEl = document.getElementById("submitBtn");
    const headerBlockEl = document.getElementById("rsvpHeaderBlock"); // <--- Apuntamos al ID exacto
    const guestInfoEl = document.querySelector(".rsvp-guest-info");

    if (guestsContainerEl) guestsContainerEl.style.display = "none";
    if (submitButtonEl) submitButtonEl.style.display = "none";
    if (headerBlockEl) headerBlockEl.style.display = "none"; // <--- Lo oculta por completo
    if (guestInfoEl) guestInfoEl.style.display = "none";

    const rsvpInner = document.querySelector('.rsvp-inner');
    if (rsvpInner && !document.getElementById("graciasExito")) {
        const mensajeDiv = document.createElement("div");
        mensajeDiv.id = "graciasExito";
        mensajeDiv.style.cssText = "text-align: center; padding: 40px 20px;";
        mensajeDiv.innerHTML = `
            <h3 style="font-family: var(--font-title); color: var(--color-burgundy); font-size: 2.2rem; margin-bottom: 15px; letter-spacing: 2px;">
                ¡MUCHAS GRACIAS!
            </h3>
            <p style="color: var(--color-olive-dark); font-size: 1.1rem; font-family: var(--font-body); letter-spacing: 1px;">Tu respuesta ya fue registrada con éxito.</p>
        `;
        rsvpInner.appendChild(mensajeDiv);
    }
}
    function mostrarModalAgradecimiento() {
        let modal = document.getElementById("thanksModal");
        if (modal) {
            modal.classList.remove("hidden");
            modal.style.display = "flex";
        }
    }

    // -------------------------------------------------------------
    // 4. LÓGICA DE LA TRIVIA
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
    }
    
    // Opcional: Nos aseguramos de ocultar la intro por si acaso el DOM la vuelve a mostrar
    const overlay = document.getElementById('intro-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function toggleDatos() {
    const urlParams = new URLSearchParams(window.location.search);
    const rawParam = urlParams.get("nombre") || urlParams.get("familia") || urlParams.get("invitados");

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
    const cbu = document.getElementById("cBUText")?.innerText || document.getElementById("cbuText")?.innerText;
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