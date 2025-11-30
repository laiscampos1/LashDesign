/* Dynamic time population + validation for booking form */
(function() {
    'use strict';
    // Only run if the booking form exists on the page
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const OPEN_MIN = 8 * 60; // 08:00
    const CLOSE_MIN = 18 * 60; // 18:00
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    const serviceSelect = document.getElementById('service');
    const dateNote = document.getElementById('date-note');
    const timeError = document.getElementById('time-error');
    const formFeedback = document.getElementById('form-feedback');
    // Basic check that all inputs exist; exit if not present
    if (!dateInput || !timeSelect || !serviceSelect) return;

    // Build half-hour time slots
    function formatTime(mins) {
        const hh = Math.floor(mins / 60).toString().padStart(2,'0');
        const mm = (mins % 60).toString().padStart(2,'0');
        return `${hh}:${mm}`;
    }

    function populateTimes() {
        // Reset
        timeSelect.innerHTML = '<option value="">Selecione um horário</option>';
        for (let m = OPEN_MIN; m <= CLOSE_MIN - 30; m += 30) {
            const opt = document.createElement('option');
            opt.value = formatTime(m);
            opt.textContent = formatTime(m);
            timeSelect.appendChild(opt);
        }
    }

    function serviceDuration() {
        const opt = serviceSelect.options[serviceSelect.selectedIndex];
        return opt && opt.dataset.duration ? Number(opt.dataset.duration) : 30;
    }

    function filterTimes() {
        const duration = serviceDuration();
        for (let i = 0; i < timeSelect.options.length; i++) {
            const opt = timeSelect.options[i];
            if (!opt.value) continue;
            const [hh, mm] = opt.value.split(':').map(Number);
            const startMins = hh * 60 + mm;
            const endMins = startMins + duration;
            opt.disabled = endMins > CLOSE_MIN;
        }
    }

    function validateDate() {
        const v = dateInput.value;
        if (!v) { if (dateNote) dateNote.style.display = 'none'; return; }
        const day = new Date(v + 'T00:00:00').getDay();
        // Sunday = 0, Monday = 1. Allow Tue(2) - Sat(6)
        if (day === 0 || day === 1) {
            if (dateNote) dateNote.style.display = 'block';
        } else {
            if (dateNote) dateNote.style.display = 'none';
        }
    }

    // Inline messaging helpers
    function showFormError(msg) {
        if (!formFeedback) return;
        formFeedback.textContent = msg;
        formFeedback.classList.add('show');
        formFeedback.style.display = 'block';
    }

    function clearFormFeedback() {
        if (!formFeedback) return;
        formFeedback.textContent = '';
        formFeedback.classList.remove('show');
        formFeedback.style.display = 'none';
    }

    function showTimeError(msg) {
        if (!timeError) return;
        timeError.textContent = msg;
        timeError.style.display = 'block';
    }

    function clearTimeError() {
        if (!timeError) return;
        timeError.textContent = '';
        timeError.style.display = 'none';
    }

    document.addEventListener('DOMContentLoaded', () => {
        populateTimes();
        filterTimes();
    });

    serviceSelect.addEventListener('change', () => {
        clearFormFeedback(); clearTimeError();
        filterTimes();
    });

    dateInput.addEventListener('change', () => { clearFormFeedback(); clearTimeError(); validateDate(); });
    timeSelect.addEventListener('change', () => { clearTimeError(); clearFormFeedback(); });

    form.addEventListener('submit', (e) => {
        validateDate();
        const v = dateInput.value;
        if (!v) return; // HTML required will handle
        const day = new Date(v + 'T00:00:00').getDay();
        if (day === 0 || day === 1) {
            e.preventDefault();
            clearTimeError();
            showFormError('O salão não funciona nesse dia (Domingo ou Segunda). Escolha uma data entre Terça e Sábado.');
            dateInput.focus();
            return;
        }
        // Validate time + service duration
        const duration = serviceDuration();
        const timeVal = timeSelect.value;
        if (!timeVal) return; // required will handle
        const [hh, mm] = timeVal.split(':').map(Number);
        const start = hh * 60 + mm;
        if (start + duration > CLOSE_MIN) {
            e.preventDefault();
            clearFormFeedback();
            showTimeError('O horário selecionado não permite que o serviço termine antes do fechamento. Escolha um horário mais cedo.');
            timeSelect.focus();
            return;
        }
    });
})();
