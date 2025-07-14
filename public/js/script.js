// script.js
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  fetch('/api/contact/submit', {
    method: 'POST', 
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify({
      name: new FormData(e.target).get('name'), 
      email: new FormData(e.target).get('email'), 
      message: new FormData(e.target).get('message')
    })
  }).then(r => r.json()).then(d => {
    alert(d.success ? 'Message sent successfully!' : 'Error: ' + d.message); 
    if(d.success) e.target.reset();
  });
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

// API Integration - Load Properties
async function loadProperties() {
  try {
    console.log('🔄 Loading properties from API...');
    const response = await fetch('/api/properties?limit=6');
    const data = await response.json();
    
    if (data.success) {
      const propertyList = document.querySelector('.property-list');
      if (propertyList) {
        propertyList.innerHTML = data.data.map(p => `
          <div class="property-card">
            <img src="${p.image_url || 'assets/land1.jpeg'}" alt="${p.title}">
            <h3>${p.title}</h3>
            <p><strong>Price:</strong> Ksh ${p.price.toLocaleString()}</p>
            <p><strong>Location:</strong> ${p.location}</p>
            <a href="#" class="btn">View Details</a>
          </div>
        `).join('');
        console.log('✅ Properties loaded from API:', data.data.length);
      }
    }
  } catch (error) {
    console.error('❌ Error loading properties:', error);
  }
}

// Load properties when page loads
document.addEventListener('DOMContentLoaded', loadProperties);

console.log('🔥 Script loaded successfully!');
