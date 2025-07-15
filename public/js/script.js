// script.js
let allProperties = [];
let currentFilter = 'all';

// Contact form submission
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
    const response = await fetch('/api/properties');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      allProperties = data.data;
      renderProperties(allProperties);
      console.log('✅ Properties loaded from API:', data.data.length);
    }
  } catch (error) {
    console.error('❌ Error loading properties:', error);
    const propertyList = document.querySelector('.property-list');
    if (propertyList) {
      propertyList.innerHTML = `
        <div class="error-message">
          <p>Unable to load properties. Please try again later.</p>
          <p><small>Error: ${error.message}</small></p>
        </div>
      `;
    }
  }
}

// Render properties with filtering
function renderProperties(properties) {
  const propertyList = document.querySelector('.property-list');
  if (!propertyList) return;

  if (properties.length === 0) {
    propertyList.innerHTML = `
      <div class="no-properties">
        <h3>No properties found</h3>
        <p>Try selecting a different category or check back later.</p>
      </div>
    `;
    return;
  }

  propertyList.innerHTML = properties.map(p => `
    <div class="property-card" data-category="${p.category}" data-id="${p.id}">
      <img src="${p.image_url || 'assets/land1.jpeg'}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p><strong>Price:</strong> Ksh ${p.price.toLocaleString()}</p>
      <p><strong>Location:</strong> ${p.location}</p>
      <p><strong>Category:</strong> ${p.category}</p>
      <p><strong>Status:</strong> <span class="status ${p.status}">${p.status}</span></p>
      <button class="btn view-details-btn" data-id="${p.id}">View Details</button>
    </div>
  `).join('');

  // Add event listeners to View Details buttons
  document.querySelectorAll('.view-details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const propertyId = e.target.getAttribute('data-id');
      showPropertyDetails(propertyId);
    });
  });
}

// Filter properties by category
function filterProperties(category) {
  currentFilter = category;
  updateFilterButtons();
  
  let filteredProperties = allProperties;
  
  if (category !== 'all') {
    filteredProperties = allProperties.filter(p => p.category === category);
  }
  
  renderProperties(filteredProperties);
  
  // Update section title
  const sectionTitle = document.querySelector('#properties h2');
  if (sectionTitle) {
    const titles = {
      'all': 'Available Properties',
      'lands': 'Available Lands',
      'cars': 'Available Cars',
      'apartments': 'Available Apartments'
    };
    sectionTitle.textContent = titles[category] || 'Available Properties';
  }
}

// Update filter button states
function updateFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-filter') === currentFilter) {
      btn.classList.add('active');
    }
  });
}

// Show property details modal
function showPropertyDetails(propertyId) {
  const property = allProperties.find(p => p.id == propertyId);
  if (!property) return;

  // Create modal if it doesn't exist
  let modal = document.getElementById('propertyModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'propertyModal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="closeModal()">&times;</span>
      <div class="modal-header">
        <h2>${property.title}</h2>
        <span class="status ${property.status}">${property.status}</span>
      </div>
      <div class="modal-body">
        <img src="${property.image_url || 'assets/land1.jpeg'}" alt="${property.title}" class="modal-image">
        <div class="property-details">
          <p><strong>Price:</strong> Ksh ${property.price.toLocaleString()}</p>
          <p><strong>Location:</strong> ${property.location}</p>
          <p><strong>Category:</strong> ${property.category}</p>
          <p><strong>Description:</strong> ${property.description || 'No description available'}</p>
          <div class="property-actions">
            <button class="btn btn-primary" onclick="contactAboutProperty('${property.id}')">
              Contact About This Property
            </button>
            <button class="btn btn-secondary" onclick="shareProperty('${property.id}')">
              Share Property
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'block';
}

// Close modal
function closeModal() {
  const modal = document.getElementById('propertyModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Contact about property
function contactAboutProperty(propertyId) {
  const property = allProperties.find(p => p.id == propertyId);
  if (!property) return;

  // Pre-fill contact form with property details
  const contactForm = document.getElementById('contactForm');
  const messageField = document.getElementById('message');
  
  if (messageField) {
    messageField.value = `I'm interested in "${property.title}" located in ${property.location}. Price: Ksh ${property.price.toLocaleString()}. Please provide more details.`;
  }

  // Scroll to contact form
  contactForm.scrollIntoView({ behavior: 'smooth' });
  closeModal();
}

// Share property
function shareProperty(propertyId) {
  const property = allProperties.find(p => p.id == propertyId);
  if (!property) return;

  const shareText = `Check out this property: ${property.title} in ${property.location} - Ksh ${property.price.toLocaleString()}`;
  
  if (navigator.share) {
    navigator.share({
      title: property.title,
      text: shareText,
      url: window.location.href
    });
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Property details copied to clipboard!');
    });
  }
}

// Navigation improvements
document.addEventListener('DOMContentLoaded', function() {
  // Load properties
  loadProperties();

  // Set up navigation click handlers
  document.querySelectorAll('.dropdown-content a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      
      if (href === '#properties') {
        filterProperties('lands');
      } else if (href === '#cars') {
        filterProperties('cars');
      } else if (href === '#apartments') {
        filterProperties('apartments');
      }
      
      // Scroll to properties section
      document.getElementById('properties').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Improve "Get Started" button functionality
  const getStartedBtn = document.querySelector('.hero-content .btn');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', function(e) {
      e.preventDefault();
      // Show all properties and scroll to section
      filterProperties('all');
      document.getElementById('properties').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Close modal when clicking outside
  window.addEventListener('click', function(e) {
    const modal = document.getElementById('propertyModal');
    if (modal && e.target === modal) {
      closeModal();
    }
  });
});

// Signup functionality (basic implementation)
function showSignupModal() {
  let modal = document.getElementById('signupModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'signupModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close" onclick="closeSignupModal()">&times;</span>
        <h2>Sign Up for Property Updates</h2>
        <form id="signupForm">
          <div class="form-group">
            <label for="signupName">Full Name</label>
            <input type="text" id="signupName" name="name" required>
          </div>
          <div class="form-group">
            <label for="signupEmail">Email</label>
            <input type="email" id="signupEmail" name="email" required>
          </div>
          <div class="form-group">
            <label for="signupPhone">Phone Number</label>
            <input type="tel" id="signupPhone" name="phone" required>
          </div>
          <div class="form-group">
            <label for="signupInterests">Interested In</label>
            <select id="signupInterests" name="interests" required>
              <option value="">Select Category</option>
              <option value="lands">Lands</option>
              <option value="cars">Cars</option>
              <option value="apartments">Apartments</option>
              <option value="all">All Properties</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Sign Up</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    // Handle signup form submission
    document.getElementById('signupForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      
      // You can implement actual signup logic here
      console.log('Signup data:', Object.fromEntries(formData));
      alert('Thank you for signing up! We\'ll keep you updated on new properties.');
      closeSignupModal();
    });
  }
  
  modal.style.display = 'block';
}

function closeSignupModal() {
  const modal = document.getElementById('signupModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

console.log('🔥 Enhanced script loaded successfully!');
