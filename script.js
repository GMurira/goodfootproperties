// script.js
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  alert('Thank you! We will contact you soon.');
});

// Fade-in effect on scroll
const observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1
  }
);

document.querySelectorAll("section").forEach(section => {
  observer.observe(section);
});

const form = document.getElementById("propertyForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const response = await fetch("http://localhost/goodfoot-admin/add_property.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.text();
    alert(result); // Show PHP response
  });
}
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);

    const response = await fetch("http://localhost/goodfoot-admin/send_contact.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.text();
    alert(result);
    contactForm.reset();
  });
}

