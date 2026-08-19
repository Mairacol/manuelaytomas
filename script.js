document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('intro-overlay');
    const openInviteBtn = document.getElementById('openInvitationBtn'); 
    const bgMusic = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicToggleBtn');
    const musicIcon = document.getElementById('musicIcon');
    const vinyl = document.getElementById('vinylDisc');

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

    // 1. Evento: Abrir Invitación
    if (openInviteBtn && overlay) {
        openInviteBtn.addEventListener('click', () => {
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'none';
            
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 500);

            // Intentar reproducir al abrir
            if (bgMusic && bgMusic.paused) {
                bgMusic.play()
                    .then(() => syncUI())
                    .catch(err => {
                        console.warn('Autoplay bloqueado por el navegador:', err);
                        syncUI();
                    });
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