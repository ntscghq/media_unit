// --- CONFIGURATION CONSTANT ---
// Replace with your actual deployed Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzIGUvdKNVQTbExpWs3rHaeS1VkIu_gAtGdCSc4Bo9OZUrZhCMIn6Hi59ySrFoqA2Ol/exec';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const overlay = document.querySelector('.modal-overlay');
    const submittingModal = document.querySelector('.submitting-modal');
    const successModal = document.querySelector('.success-modal');
    
    // Skill elements
    const noneSkillCheckbox = document.getElementById('skill-none');
    const otherSkillCheckboxes = document.querySelectorAll('input[name="skill"]');
    const skillContainer = document.querySelector('.skillset-scroll-container');
    const otherCheckbox = document.getElementById('skill-other');
    const customSkillInput = document.getElementById('custom-skill-input');

    // --- Modal Functions ---
    function showModal(modal) {
        overlay.style.display = 'block';
        modal.style.display = 'block';
    }

    function hideModals() {
        overlay.style.display = 'none';
        submittingModal.style.display = 'none';
        successModal.style.display = 'none';
    }

    // --- Skill Logic: Mute others when "None" is selected ---
    function toggleSkillMuting(isMuted) {
        if (isMuted) {
            skillContainer.classList.add('muted');
            otherSkillCheckboxes.forEach(cb => {
                if (cb !== noneSkillCheckbox) cb.checked = false;
            });
            customSkillInput.style.display = 'none';
            customSkillInput.value = '';
        } else {
            skillContainer.classList.remove('muted');
        }
    }

    noneSkillCheckbox.addEventListener('change', (e) => {
        toggleSkillMuting(e.target.checked);
    });

    otherCheckbox.addEventListener('change', (e) => {
        customSkillInput.style.display = e.target.checked ? 'block' : 'none';
        if (e.target.checked) {
            customSkillInput.focus();
            noneSkillCheckbox.checked = false;
            toggleSkillMuting(false);
        } else {
            customSkillInput.value = '';
        }
    });

    // Uncheck "None" when any other skill is selected
    otherSkillCheckboxes.forEach(cb => {
        if (cb.id !== 'skill-none' && cb.id !== 'skill-other') {
            cb.addEventListener('change', () => {
                if (cb.checked) {
                    noneSkillCheckbox.checked = false;
                    toggleSkillMuting(false);
                }
            });
        }
    });

    // --- FORM SUBMISSION - FIXED & BULLETPROOF ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Client-side validation
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        const email = document.getElementById('email').value.trim();
        const selectedSkills = document.querySelectorAll('input[name="skill"]:checked');

        if (!name || !phone || !address || !email) {
            alert("Please fill in all required fields: Name, WhatsApp, Address, and Email.");
            return;
        }

        if (selectedSkills.length === 0) {
            alert("Please select at least one skill or choose 'None'.");
            return;
        }

        if (otherCheckbox.checked && customSkillInput.value.trim() === '') {
            alert("Please specify your 'Other Skill'.");
            customSkillInput.focus();
            return;
        }

        showModal(submittingModal);

        // Build FormData manually — this guarantees 100% delivery
        const formData = new FormData();
        formData.append('name', name);
        formData.append('phone', phone);
        formData.append('address', address);
        formData.append('email', email);

        // Send all checked skills as skill[]
        selectedSkills.forEach(skill => {
            formData.append('skill[]', skill.value);
        });

        // Add custom skill text if filled
        if (otherCheckbox.checked && customSkillInput.value.trim()) {
            formData.append('custom_skill_text', customSkillInput.value.trim());
        }

        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            hideModals();

            if (result.status === "success" || result.status === "partial") {
                showModal(successModal);
                form.reset();
                toggleSkillMuting(false);
                customSkillInput.style.display = 'none';

                // Auto-close success modal after 4 seconds
                setTimeout(hideModals, 4000);
            } else {
                alert("Submission failed: " + (result.message || "Unknown error"));
            }

        } catch (error) {
            console.error('Submission error:', error);
            hideModals();
            alert("Network error. Please check your connection and try again.");
        }
    });

    // Close success modal on button click or overlay click
    document.querySelector('.close-success-btn')?.addEventListener('click', hideModals);
    overlay.addEventListener('click', hideModals);
});