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
    // 1. MÚSICA Y OVERLAY DE ENTRADA (EFECTO CORTINA)
    // -------------------------------------------------------------
    const overlay = document.getElementById('intro-overlay') || document.querySelector('.intro-overlay');
    const openInviteBtn = document.getElementById('intro-enter-btn') || document.getElementById('openInvitationBtn') || document.querySelector('.intro-enter-btn'); 
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
            
            overlay.classList.add('fade-out');
            
            if (heroSection) {
                heroSection.classList.add('is-animating');
            }

            if (bgMusic && bgMusic.paused) {
                playWithFadeIn();
            }

            setTimeout(() => {
                overlay.remove();
            }, 6000);
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

    let displayTitle = "Invitado Especial";
    if (rawParam) {
        // Limpiamos los guiones y comas
        const cleaned = rawParam.replace(/-/g, " ").replace(/,/g, " y ").trim();
        
        // Forzamos la capitalización correcta palabra por palabra de forma segura
        displayTitle = cleaned.toLowerCase().replace(/(^|\s)([a-zà-ÿ])/g, (match, space, letter) => space + letter.toUpperCase());
    }
    // Declaración explícita de variables necesarias
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
                guestLabelEl.textContent = "INVITADA";
            } else if (generoDiscreto === "m") {
                guestLabelEl.textContent = "INVITADO";
            } else {
                const nombreUnico = rawParam ? rawParam.trim().toUpperCase() : "";
                const nombresVaronesExcepcion = ["LUCAS", "MATIAS", "TOBIAS", "BAUTISTA", "JONAS", "NICOLAS", "TOMAS", "EZEQUIEL"];
                
                const esVaronExcepcion = nombresVaronesExcepcion.includes(nombreUnico);
                const terminaEnA = nombreUnico.endsWith('A');

                if (terminaEnA && !esVaronExcepcion) {
                    guestLabelEl.textContent = "INVITADA";
                } else {
                    guestLabelEl.textContent = "INVITADO";
                }
            }
        } else {
            guestLabelEl.textContent = "INVITADOS";
        }
    }

    if (slotsEl) {
        slotsEl.textContent = totalSlots === 1 ? "1 LUGAR RESERVADO" : `${totalSlots} LUGARES RESERVADOS`;
    }

    if (guestsContainer) {
        guestsContainer.innerHTML = ""; 

        for (let i = 1; i <= totalSlots; i++) {
            const guestCard = document.createElement("div");
            guestCard.className = "guest-editorial-card";

          guestCard.innerHTML = `
    <div class="guest-card-top" style="margin-bottom: 15px;">
        <span class="guest-number" style="font-family: var(--font-title); font-size: 0.85rem; color: var(--color-terracotta); text-transform: uppercase;">Invitado ${i}</span>
    </div>

    <div class="field-block" style="margin-bottom: 20px;">
        <input type="text" class="editorial-input guest-firstname" placeholder="Nombre" required>
    </div>

    <div class="field-block" style="margin-bottom: 25px;">
        <input type="text" class="editorial-input guest-lastname" placeholder="Apellido" required>
    </div>

    <div class="field-block" style="margin-bottom: 25px;">
        <label class="editorial-label" style="font-family: var(--font-title); font-size: 0.85rem; letter-spacing: 2px; color: var(--color-terracotta); text-transform: uppercase; display: block; margin-bottom: 10px;">¿Asistirá?</label>
        <div class="editorial-radio-group">
            <label class="radio-pill">
                <input type="radio" name="attendance_${i}" value="Sí"> Sí
            </label>
            <label class="radio-pill">
                <input type="radio" name="attendance_${i}" value="No"> No
            </label>
        </div>
    </div>

    <div class="field-block menu-block" id="menuBlock_${i}" style="margin-bottom: 25px; overflow: hidden; transition: all 0.4s ease;">
        <label class="editorial-label" style="font-family: var(--font-title); font-size: 0.85rem; letter-spacing: 2px; color: var(--color-terracotta); text-transform: uppercase; display: block; margin-bottom: 6px;">Menú (Seleccionar opción)</label>
        <select class="editorial-select guest-menu">
            <option value="" disabled selected>Seleccionar...</option>
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

    // Animación de intersección corregida
    const section = document.querySelector('.date-full-screen');
    if (section) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    section.classList.add('is-visible');
                    observer.unobserve(entry.target); 
                }
            });
        }, { threshold: 0.2 });

        observer.observe(section);
    }

    // -------------------------------------------------------------
    // 3. ENVÍO DEL FORMULARIO A GOOGLE SHEETS
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

            const currentScroll = window.scrollY;

            localStorage.setItem(`rsvp_confirmed_${guestID}`, "true");
            limpiarInterfazRsvp();
            mostrarModalAgradecimiento();
            window.scrollTo({ top: currentScroll, behavior: 'instant' });

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
        const headerBlockEl = document.getElementById("rsvpHeaderBlock");
        const guestInfoEl = document.querySelector(".rsvp-guest-info");

        if (guestsContainerEl) guestsContainerEl.style.display = "none";
        if (submitButtonEl) submitButtonEl.style.display = "none";
        if (headerBlockEl) headerBlockEl.style.display = "none";
        if (guestInfoEl) guestInfoEl.style.display = "none";

        const rsvpInner = document.querySelector('.rsvp-inner');
        if (rsvpInner && !document.getElementById("graciasExito")) {
            const mensajeDiv = document.createElement("div");
            mensajeDiv.id = "graciasExito";
            mensajeDiv.style.cssText = "text-align: center; padding: 40px 20px;";
            mensajeDiv.innerHTML = `
                <h3 style=" display: none ; font-family: var(--font-title); color: var(--color-burgundy); font-size: 2.2rem; margin-bottom: 15px; letter-spacing: 2px;">
                    ¡MUCHAS GRACIAS!
                </h3>
                <p style="display: none;color: var(--color-olive-dark); font-size: 1.1rem; font-family: var(--font-body); letter-spacing: 1px;">Tu respuesta ya fue registrada con éxito.</p>
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

    // -------------------------------------------------------------
    // 5. REVEAL (INTERSECTION OBSERVER)
    // -------------------------------------------------------------
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.25 
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(section => {
        revealObserver.observe(section);
    });
});

// -------------------------------------------------------------
// FUNCIONES GLOBALES (FUERA DEL DOMCONTENTLOADED)
// -------------------------------------------------------------
function closeThanksModal() {
    let modal = document.getElementById("thanksModal");
    if (modal) {
        modal.classList.add("hidden");
        modal.style.display = "none";
    }
    
    // Oculta la sección de confirmación (RSVP)
    const rsvpSection = document.getElementById("rsvpSection");
    if (rsvpSection) {
        rsvpSection.style.display = "none";
    }

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