// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.token = localStorage.getItem('adminToken');
        this.baseURL = '/api';
        this.currentSection = 'dashboard';
        this.properties = [];
        this.messages = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        
        if (this.token) {
            this.verifyToken();
        } else {
            this.showLoginModal();
        }
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });

        // Add property button
        document.getElementById('addPropertyBtn').addEventListener('click', () => {
            this.showPropertyModal();
        });

        // Property form
        document.getElementById('propertyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePropertySubmit();
        });

        // Filters
        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.loadProperties();
        });

        document.getElementById('statusFilter').addEventListener('change', () => {
            this.loadProperties();
        });

        document.getElementById('messageStatusFilter').addEventListener('change', () => {
            this.loadMessages();
        });

        // Change password form
        document.getElementById('changePasswordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleChangePassword();
        });
    }

    // Authentication Methods
    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            this.showLoading();
            
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                localStorage.setItem('adminToken', this.token);
                document.getElementById('adminUsername').textContent = data.user.username;
                this.hideLoginModal();
                this.showDashboard();
                this.loadDashboardData();
                this.showToast('Login successful!', 'success');
            } else {
                errorDiv.textContent = data.message || 'Login failed';
                errorDiv.classList.add('show');
            }
        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = 'An error occurred during login';
            errorDiv.classList.add('show');
        } finally {
            this.hideLoading();
        }
    }

    async verifyToken() {
        try {
            const response = await fetch(`${this.baseURL}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                document.getElementById('adminUsername').textContent = data.user.username;
                this.showDashboard();
                this.loadDashboardData();
            } else {
                this.handleLogout();
            }
        } catch (error) {
            console.error('Token verification error:', error);
            this.handleLogout();
        }
    }

    handleLogout() {
        localStorage.removeItem('adminToken');
        this.token = null;
        this.showLoginModal();
        this.hideDashboard();
    }

    // UI Methods
    showLoginModal() {
        document.getElementById('loginModal').classList.add('active');
        document.getElementById('loginError').classList.remove('show');
    }

    hideLoginModal() {
        document.getElementById('loginModal').classList.remove('active');
    }

    showDashboard() {
        document.getElementById('adminDashboard').classList.remove('hidden');
    }

    hideDashboard() {
        document.getElementById('adminDashboard').classList.add('hidden');
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}Section`).classList.add('active');

        this.currentSection = sectionName;

        // Load section data
        switch (sectionName) {
            case 'dashboard':
                this.loadDashboardStats();
                break;
            case 'properties':
                this.loadProperties();
                break;
            case 'messages':
                this.loadMessages();
                break;
        }
    }

    showLoading() {
        document.getElementById('loadingSpinner').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingSpinner').classList.add('hidden');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.getElementById('toastContainer').appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

        // Data Loading Methods
    async loadDashboardData() {
        await Promise.all([
            this.loadDashboardStats(),
            this.loadProperties(),
            this.loadMessages()
        ]);
    }

    async loadDashboardStats() {
        try {
            const response = await fetch(`${this.baseURL}/properties/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateDashboardStats(data.data);
            }
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }

        // Load contact stats
        try {
            const response = await fetch(`${this.baseURL}/contact/stats`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateContactStats(data.data);
            }
        } catch (error) {
            console.error('Error loading contact stats:', error);
        }
    }

    updateDashboardStats(stats) {
        document.getElementById('totalProperties').textContent = stats.totalProperties || 0;
        document.getElementById('totalApartments').textContent = stats.propertiesByCategory.apartments || 0;
        document.getElementById('totalLands').textContent = stats.propertiesByCategory.lands || 0;
        document.getElementById('totalCars').textContent = stats.propertiesByCategory.cars || 0;
        document.getElementById('availableProperties').textContent = stats.propertiesByStatus.available || 0;
    }

    updateContactStats(stats) {
        document.getElementById('totalMessages').textContent = stats.totalMessages || 0;
        document.getElementById('unreadCount').textContent = stats.messagesByStatus.unread || 0;
        
        // Update badge visibility
        const badge = document.getElementById('unreadCount');
        if (stats.messagesByStatus.unread > 0) {
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    }

    async loadProperties() {
        try {
            this.showLoading();
            
            const category = document.getElementById('categoryFilter').value;
            const status = document.getElementById('statusFilter').value;
            
            let url = `${this.baseURL}/properties`;
            const params = new URLSearchParams();
            
            if (category) params.append('category', category);
            if (status) params.append('status', status);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                this.properties = data.data;
                this.renderPropertiesTable();
            } else {
                this.showToast('Failed to load properties', 'error');
            }
        } catch (error) {
            console.error('Error loading properties:', error);
            this.showToast('Error loading properties', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderPropertiesTable() {
        const tbody = document.getElementById('propertiesTableBody');
        tbody.innerHTML = '';

        if (this.properties.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No properties found</td></tr>';
            return;
        }

        this.properties.forEach(property => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    ${property.image_url ? 
                        `<img src="${property.image_url}" alt="${property.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">` : 
                        '<div style="width: 60px; height: 60px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-image"></i></div>'
                    }
                </td>
                <td>
                    <strong>${property.title}</strong>
                    <br>
                    <small style="color: #666;">${property.description ? property.description.substring(0, 50) + '...' : ''}</small>
                </td>
                <td>
                    <span class="category-badge category-${property.category}">
                        ${property.category.charAt(0).toUpperCase() + property.category.slice(1)}
                    </span>
                </td>
                <td><strong>KSH ${this.formatPrice(property.price)}</strong></td>
                <td>${property.location}</td>
                <td>
                    <span class="status-badge status-${property.status || 'available'}">
                        ${(property.status || 'available').charAt(0).toUpperCase() + (property.status || 'available').slice(1)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-small btn-primary" onclick="adminDashboard.editProperty(${property.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-small btn-danger" onclick="adminDashboard.deleteProperty(${property.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadMessages() {
        try {
            this.showLoading();
            
            const status = document.getElementById('messageStatusFilter').value;
            
            let url = `${this.baseURL}/contact`;
            if (status) {
                url += `?status=${status}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.messages = data.data;
                this.renderMessagesTable();
            } else {
                this.showToast('Failed to load messages', 'error');
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            this.showToast('Error loading messages', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderMessagesTable() {
        const tbody = document.getElementById('messagesTableBody');
        tbody.innerHTML = '';

        if (this.messages.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No messages found</td></tr>';
            return;
        }

        this.messages.forEach(message => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${message.name}</strong></td>
                <td>${message.email}</td>
                <td>${message.phone || 'N/A'}</td>
                <td>
                    <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
                        ${message.message.substring(0, 100)}${message.message.length > 100 ? '...' : ''}
                    </div>
                </td>
                <td>
                    <span class="status-badge status-${message.status}">
                        ${message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                    </span>
                </td>
                <td>${this.formatDate(message.created_at)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-small btn-primary" onclick="adminDashboard.viewMessage(${message.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-small btn-success" onclick="adminDashboard.updateMessageStatus(${message.id}, 'replied')">
                            <i class="fas fa-reply"></i>
                        </button>
                        <button class="btn btn-small btn-danger" onclick="adminDashboard.deleteMessage(${message.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

        // Property Management Methods
    showPropertyModal(property = null) {
        const modal = document.getElementById('propertyModal');
        const form = document.getElementById('propertyForm');
        const title = document.getElementById('propertyModalTitle');
        
        if (property) {
            // Edit mode
            title.textContent = 'Edit Property';
            this.populatePropertyForm(property);
        } else {
            // Add mode
            title.textContent = 'Add Property';
            form.reset();
            document.getElementById('propertyId').value = '';
            document.getElementById('currentImage').innerHTML = '';
        }
        
        modal.classList.add('active');
    }

    populatePropertyForm(property) {
        document.getElementById('propertyId').value = property.id;
        document.getElementById('propertyTitle').value = property.title;
        document.getElementById('propertyCategory').value = property.category;
        document.getElementById('propertyPrice').value = property.price;
        document.getElementById('propertyLocation').value = property.location;
        document.getElementById('propertySize').value = property.size || '';
        document.getElementById('propertyStatus').value = property.status || 'available';
        document.getElementById('propertyDescription').value = property.description || '';
        document.getElementById('propertyFeatures').value = property.features || '';
        
        // Show current image
        const currentImageDiv = document.getElementById('currentImage');
        if (property.image_url) {
            currentImageDiv.innerHTML = `
                <p>Current Image:</p>
                <img src="${property.image_url}" alt="Current image" style="max-width: 200px; height: auto; border-radius: 4px;">
            `;
        } else {
            currentImageDiv.innerHTML = '';
        }
    }

    async handlePropertySubmit() {
        try {
            this.showLoading();
            
            const form = document.getElementById('propertyForm');
            const formData = new FormData(form);
            const propertyId = document.getElementById('propertyId').value;
            
            const url = propertyId ? 
                `${this.baseURL}/properties/${propertyId}` : 
                `${this.baseURL}/properties`;
            
            const method = propertyId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast(
                    propertyId ? 'Property updated successfully!' : 'Property added successfully!', 
                    'success'
                );
                this.closePropertyModal();
                this.loadProperties();
                this.loadDashboardStats();
            } else {
                this.showToast(data.message || 'Failed to save property', 'error');
            }
        } catch (error) {
            console.error('Error saving property:', error);
            this.showToast('Error saving property', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async editProperty(id) {
        const property = this.properties.find(p => p.id === id);
        if (property) {
            this.showPropertyModal(property);
        } else {
            // Fetch property details
            try {
                const response = await fetch(`${this.baseURL}/properties/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    this.showPropertyModal(data.data);
                } else {
                    this.showToast('Failed to load property details', 'error');
                }
            } catch (error) {
                console.error('Error loading property:', error);
                this.showToast('Error loading property', 'error');
            }
        }
    }

    async deleteProperty(id) {
        if (!confirm('Are you sure you want to delete this property?')) {
            return;
        }
        
        try {
            this.showLoading();
            
            const response = await fetch(`${this.baseURL}/properties/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast('Property deleted successfully!', 'success');
                this.loadProperties();
                this.loadDashboardStats();
            } else {
                this.showToast(data.message || 'Failed to delete property', 'error');
            }
        } catch (error) {
            console.error('Error deleting property:', error);
            this.showToast('Error deleting property', 'error');
        } finally {
            this.hideLoading();
        }
    }

    closePropertyModal() {
        document.getElementById('propertyModal').classList.remove('active');
    }

    // Message Management Methods
    async viewMessage(id) {
        try {
            const response = await fetch(`${this.baseURL}/contact/${id}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.showMessageModal(data.data);
                
                // Mark as read if unread
                if (data.data.status === 'unread') {
                    await this.updateMessageStatus(id, 'read', false);
                }
            } else {
                this.showToast('Failed to load message', 'error');
            }
        } catch (error) {
            console.error('Error loading message:', error);
            this.showToast('Error loading message', 'error');
        }
    }

    showMessageModal(message) {
        const modal = document.getElementById('messageModal');
        const content = document.getElementById('messageContent');
        
        content.innerHTML = `
            <div class="message-details">
                <div class="message-header">
                    <h4>${message.name}</h4>
                    <span class="status-badge status-${message.status}">
                        ${message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                    </span>
                </div>
                <div class="message-info">
                    <p><strong>Email:</strong> ${message.email}</p>
                    <p><strong>Phone:</strong> ${message.phone || 'N/A'}</p>
                    <p><strong>Date:</strong> ${this.formatDate(message.created_at)}</p>
                </div>
                <div class="message-body">
                    <h5>Message:</h5>
                    <p>${message.message}</p>
                </div>
                <div class="message-actions">
                    <button class="btn btn-success" onclick="adminDashboard.updateMessageStatus(${message.id}, 'replied')">
                        <i class="fas fa-reply"></i> Mark as Replied
                    </button>
                    <button class="btn btn-danger" onclick="adminDashboard.deleteMessage(${message.id}); adminDashboard.closeMessageModal();">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
    }

    async updateMessageStatus(id, status, showToast = true) {
        try {
            const response = await fetch(`${this.baseURL}/contact/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            
            const data = await response.json();
            
            if (data.success) {
                if (showToast) {
                    this.showToast(`Message marked as ${status}!`, 'success');
                }
                this.loadMessages();
                this.loadDashboardStats();
            } else {
                if (showToast) {
                    this.showToast(data.message || 'Failed to update message status', 'error');
                }
            }
        } catch (error) {
            console.error('Error updating message status:', error);
            if (showToast) {
                this.showToast('Error updating message status', 'error');
            }
        }
    }

    async deleteMessage(id) {
        if (!confirm('Are you sure you want to delete this message?')) {
            return;
        }
        
        try {
            this.showLoading();
            
            const response = await fetch(`${this.baseURL}/contact/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast('Message deleted successfully!', 'success');
                this.loadMessages();
                this.loadDashboardStats();
            } else {
                this.showToast(data.message || 'Failed to delete message', 'error');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            this.showToast('Error deleting message', 'error');
        } finally {
            this.hideLoading();
        }
    }

    closeMessageModal() {
        document.getElementById('messageModal').classList.remove('active');
    }

        // Password Change Method
    async handleChangePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (newPassword !== confirmPassword) {
            this.showToast('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showToast('New password must be at least 6 characters long', 'error');
            return;
        }

        try {
            this.showLoading();
            
            const response = await fetch(`${this.baseURL}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast('Password changed successfully!', 'success');
                document.getElementById('changePasswordForm').reset();
            } else {
                this.showToast(data.message || 'Failed to change password', 'error');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            this.showToast('Error changing password', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Utility Methods
    formatPrice(price) {
        return new Intl.NumberFormat('en-KE', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatCurrency(amount) {
        return `KSH ${this.formatPrice(amount)}`;
    }

    truncateText(text, maxLength = 100) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // API Helper Methods
    async apiRequest(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        };

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            
            if (response.status === 401) {
                this.handleLogout();
                throw new Error('Unauthorized');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Data Export Methods
    async exportProperties() {
        try {
            this.showLoading();
            
            const response = await fetch(`${this.baseURL}/properties/export`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `properties_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                this.showToast('Properties exported successfully!', 'success');
            } else {
                this.showToast('Failed to export properties', 'error');
            }
        } catch (error) {
            console.error('Error exporting properties:', error);
            this.showToast('Error exporting properties', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async exportMessages() {
        try {
            this.showLoading();
            
            const response = await fetch(`${this.baseURL}/contact/export`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `messages_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                this.showToast('Messages exported successfully!', 'success');
            } else {
                this.showToast('Failed to export messages', 'error');
            }
        } catch (error) {
            console.error('Error exporting messages:', error);
            this.showToast('Error exporting messages', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Search and Filter Methods
    searchProperties(query) {
        const filteredProperties = this.properties.filter(property => 
            property.title.toLowerCase().includes(query.toLowerCase()) ||
            property.description.toLowerCase().includes(query.toLowerCase()) ||
            property.location.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderFilteredProperties(filteredProperties);
    }

    renderFilteredProperties(properties) {
        const tbody = document.getElementById('propertiesTableBody');
        tbody.innerHTML = '';

        if (properties.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No properties found</td></tr>';
            return;
        }

        properties.forEach(property => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    ${property.image_url ? 
                        `<img src="${property.image_url}" alt="${property.title}">` : 
                        '<div class="no-image"><i class="fas fa-image"></i></div>'
                    }
                </td>
                <td>
                    <strong>${property.title}</strong>
                    <br>
                    <small>${this.truncateText(property.description, 50)}</small>
                </td>
                <td>
                    <span class="category-badge category-${property.category}">
                        ${property.category.charAt(0).toUpperCase() + property.category.slice(1)}
                    </span>
                </td>
                <td><strong>${this.formatCurrency(property.price)}</strong></td>
                <td>${property.location}</td>
                <td>
                    <span class="status-badge status-${property.status || 'available'}">
                        ${(property.status || 'available').charAt(0).toUpperCase() + (property.status || 'available').slice(1)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-small btn-primary" onclick="adminDashboard.editProperty(${property.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-small btn-danger" onclick="adminDashboard.deleteProperty(${property.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Bulk Operations
    async bulkUpdatePropertyStatus(propertyIds, status) {
        try {
            this.showLoading();
            
            const response = await fetch(`${this.baseURL}/properties/bulk-update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    propertyIds,
                    status
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast(`${propertyIds.length} properties updated successfully!`, 'success');
                this.loadProperties();
                this.loadDashboardStats();
            } else {
                this.showToast(data.message || 'Failed to update properties', 'error');
            }
        } catch (error) {
            console.error('Error updating properties:', error);
            this.showToast('Error updating properties', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Real-time Updates
    setupWebSocket() {
        if (typeof WebSocket !== 'undefined') {
            const ws = new WebSocket(`ws://localhost:3000/admin-updates`);
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                
                switch (data.type) {
                    case 'new_message':
                        this.handleNewMessage(data.message);
                        break;
                    case 'property_updated':
                        this.handlePropertyUpdate(data.property);
                        break;
                }
            };
            
            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        }
    }

    handleNewMessage(message) {
        // Update unread count
        const currentCount = parseInt(document.getElementById('unreadCount').textContent);
        document.getElementById('unreadCount').textContent = currentCount + 1;
        document.getElementById('unreadCount').style.display = 'inline';
        
        // Show notification
        this.showToast(`New message from ${message.name}`, 'info');
        
        // Refresh messages if on messages section
        if (this.currentSection === 'messages') {
            this.loadMessages();
        }
    }

    handlePropertyUpdate(property) {
        // Refresh properties if on properties section
        if (this.currentSection === 'properties') {
            this.loadProperties();
        }
        
        // Update dashboard stats
        this.loadDashboardStats();
    }
}

// Global Functions for onclick handlers
function closePropertyModal() {
    adminDashboard.closePropertyModal();
}

function closeMessageModal() {
    adminDashboard.closeMessageModal();
}

// Initialize Admin Dashboard
let adminDashboard;

document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});

// Handle page visibility change to refresh data
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && adminDashboard && adminDashboard.token) {
        adminDashboard.loadDashboardStats();
    }
});