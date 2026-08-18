/* ==========================================================================
   WILLIAN SANTOS - PERSONAL TRAINER DE ALTA PERFORMANCE
   JAVASCRIPT INTERACTIONS, THREE.JS WEBGL SHADER & SCROLL REVEAL
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initScrollProgress();
  initScrollReveal();
  initCursorSpotlight();
  initThreeAboutShader();
  init3DTiltCards();
  initMagneticButtons();
  initNavbar();
  initAnimatedCounters();
  initBeforeAfterSliders();
  initResultsCarousel();
  initFaqAccordion();
  initDynamicGreeting();
  initPixCopy();
  initAnamneseWizard();
});

/* --------------------------------------------------------------------------
   1. PRELOADER SCREEN
   -------------------------------------------------------------------------- */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const progressBar = document.getElementById('preloader-progress');
  const percentText = document.getElementById('preloader-percent');
  if (!preloader || !progressBar) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 12) + 8;
    if (progress >= 100) {
      progress = 100;
      progressBar.style.width = '100%';
      if (percentText) percentText.textContent = '100%';
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add('fade-out');
      }, 450);
    } else {
      progressBar.style.width = `${progress}%`;
      if (percentText) percentText.textContent = `${progress}%`;
    }
  }, 75);
}

/* --------------------------------------------------------------------------
   2. SCROLL PROGRESS BAR TOP
   -------------------------------------------------------------------------- */
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress-bar');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  });
}

/* --------------------------------------------------------------------------
   3. SCROLL REVEAL ANIMATIONS (FADE-UP ON SCROLL DOWN)
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   4. GOLDEN SPOTLIGHT CURSOR GLOW
   -------------------------------------------------------------------------- */
function initCursorSpotlight() {
  const cursor = document.getElementById('cursor-spotlight');
  if (!cursor || window.innerWidth < 768) return;

  window.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });
}

/* --------------------------------------------------------------------------
   5. THREE.JS WEBGL DOT MATRIX SHADER (SOBRE O TREINADOR SECTION)
   -------------------------------------------------------------------------- */
function initThreeAboutShader() {
  const canvas = document.getElementById('sobre-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const section = document.getElementById('sobre');
  if (!section) return;

  let renderer, scene, camera, geometry, material, animationId;

  const width = section.clientWidth || window.innerWidth;
  const height = section.clientHeight || window.innerHeight;

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(width * 2, height * 2) },
    u_opacities: { value: [0.15, 0.25, 0.35, 0.45, 0.6, 0.75, 0.85, 0.95, 1.0, 1.0] },
    u_colors: {
      value: [
        new THREE.Vector3(0.88, 0.91, 0.94), // Silver (#E2E8F0)
        new THREE.Vector3(0.97, 0.98, 0.99), // Platinum (#F8FAFC)
        new THREE.Vector3(0.58, 0.64, 0.72), // Metallic Steel (#94A3B8)
        new THREE.Vector3(0.88, 0.91, 0.94),
        new THREE.Vector3(0.97, 0.98, 0.99),
        new THREE.Vector3(0.58, 0.64, 0.72)
      ]
    },
    u_total_size: { value: 24.0 },
    u_dot_size: { value: 5.0 },
    u_reverse: { value: 0 }
  };

  material = new THREE.ShaderMaterial({
    vertexShader: `
      precision mediump float;
      uniform vec2 u_resolution;
      out vec2 fragCoord;
      void main() {
        gl_Position = vec4(position, 1.0);
        fragCoord = (position.xy + 1.0) * 0.5 * u_resolution;
        fragCoord.y = u_resolution.y - fragCoord.y;
      }
    `,
    fragmentShader: `
      precision mediump float;
      in vec2 fragCoord;

      uniform float u_time;
      uniform float u_opacities[10];
      uniform vec3 u_colors[6];
      uniform float u_total_size;
      uniform float u_dot_size;
      uniform vec2 u_resolution;
      uniform int u_reverse;

      out vec4 fragColor;

      float PHI = 1.61803398874989484820459;
      float random(vec2 xy) {
          return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
      }

      void main() {
          vec2 st = fragCoord.xy;
          st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
          st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));

          float opacity = step(0.0, st.x) * step(0.0, st.y);

          vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

          float frequency = 5.0;
          float show_offset = random(st2);
          float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
          opacity *= u_opacities[int(rand * 10.0)];
          opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
          opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

          vec3 color = u_colors[int(show_offset * 6.0)];

          float animation_speed_factor = 2.0;
          vec2 center_grid = u_resolution / 2.0 / u_total_size;
          float dist_from_center = distance(center_grid, st2);

          float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);

          float current_timing_offset = timing_offset_intro;
          opacity *= step(current_timing_offset, u_time * animation_speed_factor);
          opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);

          fragColor = vec4(color, opacity * 0.3);
          fragColor.rgb *= fragColor.a;
      }
    `,
    uniforms: uniforms,
    glslVersion: THREE.GLSL3,
    blending: THREE.CustomBlending,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.OneFactor,
    transparent: true
  });

  geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const startTime = performance.now();
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    uniforms.u_time.value = (performance.now() - startTime) / 1000.0;
    renderer.render(scene, camera);
  };
  animate();

  const handleResize = () => {
    const w = section.clientWidth || window.innerWidth;
    const h = section.clientHeight || window.innerHeight;
    renderer.setSize(w, h);
    uniforms.u_resolution.value.set(w * 2, h * 2);
  };
  window.addEventListener('resize', handleResize);
}

/* --------------------------------------------------------------------------
   6. 3D TILT EFFECT ON CARDS
   -------------------------------------------------------------------------- */
function init3DTiltCards() {
  const tiltCards = document.querySelectorAll('.diff-card, .plan-card, .result-carousel-card');
  if (window.innerWidth < 768) return;

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    });
  });
}

/* --------------------------------------------------------------------------
   7. MAGNETIC BUTTON HOVER EFFECT
   -------------------------------------------------------------------------- */
function initMagneticButtons() {
  const buttons = document.querySelectorAll('.btn-gold, .btn-outline');
  if (window.innerWidth < 768) return;

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `translate(0px, 0px)`;
    });
  });
}

/* --------------------------------------------------------------------------
   8. NAVBAR & MOBILE MENU
   -------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else if (!document.querySelector('.anamnese-page')) {
      navbar?.classList.remove('scrolled');
    }
  });

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }
}

/* --------------------------------------------------------------------------
   9. ANIMATED STAT COUNTERS
   -------------------------------------------------------------------------- */
function initAnimatedCounters() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        const prefix = el.textContent.includes('+') ? '+' : '';
        let count = 0;
        const speed = target > 100 ? 2500 : 1500;
        const stepTime = Math.abs(Math.floor(speed / target));

        const timer = setInterval(() => {
          count += 1;
          el.textContent = `${prefix}${count}`;
          if (count >= target) {
            el.textContent = `${prefix}${target}`;
            clearInterval(timer);
          }
        }, stepTime);

        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(num => observer.observe(num));
}

/* --------------------------------------------------------------------------
   10. BEFORE / AFTER COMPARISON SLIDER
   -------------------------------------------------------------------------- */
function initBeforeAfterSliders() {
  const containers = document.querySelectorAll('.comparison-slider-container');

  containers.forEach(container => {
    const beforeImage = container.querySelector('.before-image');
    const handle = container.querySelector('.slider-handle');
    let isDragging = false;

    if (!beforeImage || !handle) return;

    const setPosition = (x) => {
      const rect = container.getBoundingClientRect();
      let pos = ((x - rect.left) / rect.width) * 100;
      if (pos < 0) pos = 0;
      if (pos > 100) pos = 100;

      beforeImage.style.width = `${pos}%`;
      handle.style.left = `${pos}%`;
    };

    // Stop propagation so carousel drag is not triggered when dragging the slider
    handle.addEventListener('mousedown', (e) => { isDragging = true; e.stopPropagation(); });
    window.addEventListener('mouseup', () => isDragging = false);
    container.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.stopPropagation();
      setPosition(e.clientX);
    });

    handle.addEventListener('touchstart', (e) => { isDragging = true; e.stopPropagation(); }, { passive: true });
    window.addEventListener('touchend', () => isDragging = false);
    container.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      e.stopPropagation();
      setPosition(e.touches[0].clientX);
    }, { passive: true });
  });
}

/* --------------------------------------------------------------------------
   11b. RESULTS CAROUSEL — DRAG & SWIPE
   -------------------------------------------------------------------------- */
function initResultsCarousel() {
  const track = document.getElementById('resultsCarousel');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dots = document.querySelectorAll('.carousel-dot');

  if (!track) return;

  const cards = track.querySelectorAll('.result-carousel-card');
  const cardCount = cards.length;
  let currentIndex = 0;

  // ---------- Utility: scroll to index ----------
  const scrollToIndex = (idx) => {
    if (idx < 0) idx = 0;
    if (idx >= cardCount) idx = cardCount - 1;
    currentIndex = idx;

    const card = cards[idx];
    const trackRect = track.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const offset = cardRect.left - trackRect.left - (trackRect.width / 2 - cardRect.width / 2);
    track.scrollBy({ left: offset, behavior: 'smooth' });

    updateDots();
  };

  // ---------- Dots ----------
  const updateDots = () => {
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  };

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => scrollToIndex(i));
  });

  // ---------- Arrow Buttons ----------
  prevBtn?.addEventListener('click', () => scrollToIndex(currentIndex - 1));
  nextBtn?.addEventListener('click', () => scrollToIndex(currentIndex + 1));

  // ---------- Update active dot on scroll ----------
  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // Find which card is most centered
      let minDist = Infinity;
      let closest = 0;
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(trackCenter - cardCenter);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      currentIndex = closest;
      updateDots();
    }, 80);
  });

  // ---------- Mouse Drag ----------
  let isPointerDown = false;
  let pointerStartX = 0;
  let scrollStartLeft = 0;
  let hasDragged = false;

  track.addEventListener('pointerdown', (e) => {
    // Don't hijack if target is a slider handle
    if (e.target.closest('.slider-handle') || e.target.closest('.comparison-slider-container')) return;
    isPointerDown = true;
    hasDragged = false;
    pointerStartX = e.clientX;
    scrollStartLeft = track.scrollLeft;
    track.classList.add('is-dragging');
    track.setPointerCapture(e.pointerId);
  });

  track.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;
    const dx = e.clientX - pointerStartX;
    if (Math.abs(dx) > 4) hasDragged = true;
    track.scrollLeft = scrollStartLeft - dx;
  });

  const endDrag = () => {
    if (!isPointerDown) return;
    isPointerDown = false;
    track.classList.remove('is-dragging');
  };

  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);

  // Prevent click after drag
  track.addEventListener('click', (e) => {
    if (hasDragged) e.stopPropagation();
  }, true);
}

/* --------------------------------------------------------------------------
   11. FAQ ACCORDION
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach(i => i.classList.remove('active'));

      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   12. DYNAMIC GREETING FOR ANAMNESE PAGE
   -------------------------------------------------------------------------- */
function initDynamicGreeting() {
  const greetingEl = document.getElementById('dynamic-greeting');
  if (!greetingEl) return;

  const currentHour = new Date().getHours();
  let greetingText = 'Bom dia!';

  if (currentHour >= 12 && currentHour < 18) {
    greetingText = 'Boa tarde!';
  } else if (currentHour >= 18 || currentHour < 5) {
    greetingText = 'Boa noite!';
  }

  greetingEl.textContent = `${greetingText} Seja muito bem-vindo(a).`;
}

/* --------------------------------------------------------------------------
   13. COPY PIX KEY
   -------------------------------------------------------------------------- */
function initPixCopy() {
  const btnCopy = document.getElementById('btn-copy-pix');
  const pixKeyVal = document.getElementById('pix-key')?.textContent || '(21) 99957-6359';

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      navigator.clipboard.writeText(pixKeyVal.replace(/\D/g, '')).then(() => {
        const originalText = btnCopy.textContent;
        btnCopy.textContent = '✓ Chave Copiada!';
        btnCopy.style.background = 'rgba(212, 175, 55, 0.2)';
        btnCopy.style.borderColor = 'var(--gold-primary)';

        setTimeout(() => {
          btnCopy.textContent = originalText;
          btnCopy.style.background = '';
          btnCopy.style.borderColor = '';
        }, 3000);
      });
    });
  }
}

/* --------------------------------------------------------------------------
   14. ANAMNESE MULTI-STEP WIZARD FORM & AUTOSAVE
   -------------------------------------------------------------------------- */
function initAnamneseWizard() {
  const form = document.getElementById('anamnese-form');
  if (!form) return;

  let currentStep = 1;
  const totalSteps = 5;

  const steps = document.querySelectorAll('.wizard-step');
  const indicators = document.querySelectorAll('.step-indicator-item');
  const progressFill = document.getElementById('progress-fill');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnSubmit = document.getElementById('btn-submit');
  const successBox = document.getElementById('anamnese-success');

  const STORAGE_KEY = 'ws_anamnese_draft';
  const loadSavedDraft = () => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        Object.keys(parsed).forEach(key => {
          const input = form.querySelector(`[name="${key}"]`);
          if (input && input.type !== 'file' && input.type !== 'checkbox') {
            input.value = parsed[key];
          } else if (input && input.type === 'checkbox') {
            input.checked = parsed[key];
          }
        });
      } catch (e) {
        console.error('Error loading draft', e);
      }
    }
  };

  const saveDraft = () => {
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        data[key] = value;
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  form.addEventListener('input', saveDraft);
  loadSavedDraft();

  document.querySelectorAll('.upload-card').forEach(card => {
    const fileInput = card.querySelector('input[type="file"]');
    if (fileInput) {
      card.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          card.style.borderColor = 'var(--gold-primary)';
          card.style.background = 'rgba(212, 175, 55, 0.15)';
          const title = card.querySelector('.upload-title');
          if (title) title.textContent = `✓ ${e.target.files[0].name.slice(0, 12)}...`;
        }
      });
    }
  });

  const updateWizard = () => {
    steps.forEach(s => {
      s.classList.remove('active');
      if (parseInt(s.getAttribute('data-step'), 10) === currentStep) {
        s.classList.add('active');
      }
    });

    indicators.forEach(ind => {
      const stepNum = parseInt(ind.getAttribute('data-step'), 10);
      ind.classList.remove('active', 'completed');
      if (stepNum === currentStep) {
        ind.classList.add('active');
      } else if (stepNum < currentStep) {
        ind.classList.add('completed');
      }
    });

    const progressPercent = (currentStep / totalSteps) * 100;
    if (progressFill) progressFill.style.width = `${progressPercent}%`;

    if (btnPrev) btnPrev.style.display = currentStep > 1 ? 'inline-flex' : 'none';
    if (btnNext) btnNext.style.display = currentStep < totalSteps ? 'inline-flex' : 'none';
    if (btnSubmit) btnSubmit.style.display = currentStep === totalSteps ? 'inline-flex' : 'none';

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validateStep = (stepNumber) => {
    const currentStepEl = document.querySelector(`.wizard-step[data-step="${stepNumber}"]`);
    if (!currentStepEl) return true;

    const inputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!input.checkValidity() || !input.value.trim()) {
        isValid = false;
        input.style.borderColor = '#ff4d4d';
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
      } else {
        input.style.borderColor = '';
      }
    });

    if (!isValid) {
      alert('Por favor, preencha todos os campos obrigatórios (*) da etapa atual.');
    }

    return isValid;
  };

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
          currentStep++;
          updateWizard();
        }
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateWizard();
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    const termsCheckbox = document.getElementById('declaracao_termos');
    if (termsCheckbox && !termsCheckbox.checked) {
      alert('Você precisa declarar que as informações fornecidas são verdadeiras.');
      return;
    }

    const formData = new FormData(form);
    let message = `📋 *NOVA ANAMNESE - WILLIAN SANTOS PERSONAL*\n\n`;
    message += `👤 *Nome:* ${formData.get('nome') || ''}\n`;
    message += `⚖️ *Peso:* ${formData.get('peso') || ''}kg | *Altura:* ${formData.get('altura') || ''} | *Idade:* ${formData.get('idade') || ''}\n`;
    message += `📧 *E-mail:* ${formData.get('email') || ''}\n`;
    message += `📱 *WhatsApp:* ${formData.get('telefone') || ''}\n\n`;
    message += `🎯 *Objetivo:* ${formData.get('objetivo') || ''}\n`;
    message += `💪 *Foco de incomodo:* ${formData.get('corpo_incomoda') || ''}\n`;
    message += `💼 *Profissão:* ${formData.get('profissao') || ''}\n`;
    message += `⏱️ *Treinos/semana:* ${formData.get('treinos_semana') || ''} (${formData.get('tempo_treino_medio') || ''})\n\n`;
    message += `🏥 *Saúde/Dores:* ${formData.get('problemas_saude') || 'Nenhum'} / ${formData.get('dores_articulares') || 'Nenhuma'}\n`;
    message += `📝 *Obs Extra:* ${formData.get('informacao_extra') || 'Nenhuma'}\n`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5521999576359?text=${encodedMessage}`;

    form.style.display = 'none';
    const indicatorBox = document.querySelector('.wizard-steps-indicator');
    const progressBox = document.querySelector('.wizard-progress-bar');
    if (indicatorBox) indicatorBox.style.display = 'none';
    if (progressBox) progressBox.style.display = 'none';

    if (successBox) {
      successBox.style.display = 'block';
      const btnWhatsappSuccess = document.getElementById('btn-whatsapp-success');
      if (btnWhatsappSuccess) {
        btnWhatsappSuccess.href = whatsappUrl;
      }
    }

    localStorage.removeItem(STORAGE_KEY);
  });
}

/* --------------------------------------------------------------------------
   14. VIP VIDEO MODAL CONTROLLER
   -------------------------------------------------------------------------- */
function openVideoModal(videoSrc, title) {
  const modal = document.getElementById('video-modal');
  const player = document.getElementById('modalVideoPlayer');
  const titleEl = document.getElementById('modalVideoTitle');

  if (!modal || !player) return;

  if (titleEl && title) {
    titleEl.textContent = title;
  }

  player.src = videoSrc;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Play video gracefully
  player.play().catch(err => {
    console.log('Autoplay visual prevented or video source not found:', err);
  });
}

function closeVideoModal(event) {
  if (event && event.stopPropagation) {
    event.stopPropagation();
  }

  const modal = document.getElementById('video-modal');
  const player = document.getElementById('modalVideoPlayer');

  if (!modal) return;

  if (player) {
    player.pause();
    player.src = '';
  }

  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Close on Escape key press
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeVideoModal();
  }
});

/* --------------------------------------------------------------------------
   15. AUTOMATIC & TOUCH-SWIPE TESTIMONIALS CAROUSEL
   -------------------------------------------------------------------------- */
function initTestimonialsCarousel() {
  const track = document.getElementById('testimonialsTrack');
  const viewport = document.getElementById('testimonialsViewport');
  const prevBtn = document.getElementById('tPrevBtn');
  const nextBtn = document.getElementById('tNextBtn');
  const dotsContainer = document.getElementById('testimonialsDots');

  if (!track || !viewport) return;

  const cards = track.querySelectorAll('.testimonial-card');
  if (cards.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  let startX = 0;
  let isDragging = false;

  // Determine items visible per view
  const getVisibleCount = () => window.innerWidth >= 768 ? 2 : 1;
  const getMaxIndex = () => Math.max(0, cards.length - getVisibleCount());

  // Render dots
  const updateDots = () => {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const maxIdx = getMaxIndex();
    for (let i = 0; i <= maxIdx; i++) {
      const dot = document.createElement('div');
      dot.className = `t-dot ${i === currentIndex ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        goToSlide(i);
        resetAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  };

  const goToSlide = (index) => {
    const maxIdx = getMaxIndex();
    if (index < 0) index = maxIdx;
    if (index > maxIdx) index = 0;
    currentIndex = index;

    const cardWidthPercent = 100 / getVisibleCount();
    track.style.transform = `translateX(-${currentIndex * cardWidthPercent}%)`;

    updateDots();
  };

  // Nav buttons
  prevBtn?.addEventListener('click', () => {
    goToSlide(currentIndex - 1);
    resetAutoplay();
  });

  nextBtn?.addEventListener('click', () => {
    goToSlide(currentIndex + 1);
    resetAutoplay();
  });

  // Autoplay
  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 4500);
  };

  const stopAutoplay = () => {
    if (autoplayTimer) clearInterval(autoplayTimer);
  };

  const resetAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  viewport.addEventListener('mouseenter', stopAutoplay);
  viewport.addEventListener('mouseleave', startAutoplay);

  // Touch Swipe & Drag
  viewport.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    stopAutoplay();
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diffX = currentX - startX;
    if (Math.abs(diffX) > 40) {
      if (diffX < 0) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(currentIndex - 1);
      }
      isDragging = false;
    }
  }, { passive: true });

  viewport.addEventListener('touchend', () => {
    isDragging = false;
    startAutoplay();
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    if (currentIndex > getMaxIndex()) {
      currentIndex = getMaxIndex();
    }
    goToSlide(currentIndex);
  });

  // Init
  updateDots();
  goToSlide(0);
  startAutoplay();
}

// Initialize on DOM Ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTestimonialsCarousel);
} else {
  initTestimonialsCarousel();
}


