// Restaurant Order Management System with Enhanced Features
class RestaurantOrderSystem {
    constructor() {
        // Initialize data structures
        this.menu = this.loadMenu();
        this.categories = this.loadData('categories') || this.getDefaultCategories();
        this.orders = this.loadData('orders') || [];
        this.completedOrders = this.loadData('completedOrders') || [];
        this.orderTemplates = this.loadData('orderTemplates') || [];
        this.settings = this.loadData('settings') || this.getDefaultSettings();
        this.users = this.loadData('users') || this.getDefaultUsers();
        this.nextOrderId = this.loadData('nextOrderId') || 1001;
        this.currentUser = this.loadData('currentUser') || null;
        this.salesChart = null;
        this.paymentChart = null;
        this.revenueChart = null;
        this.orderTypeChart = null;
        
        // Initialize current order
        this.currentOrder = {
            items: [],
            customerName: '',
            customerNumber: '',
            orderType: 'dine-in',
            paymentMethod: 'cash',
            notes: '',
            taxRate: this.settings.taxRate || 5
        };
        
        // Setup toastr
        toastr.options = {
            positionClass: 'toast-top-right',
            progressBar: true,
            timeOut: 3000,
            extendedTimeOut: 1000,
            closeButton: true,
            newestOnTop: true
        };
        
        // Initialize UI
        this.initEventListeners();
        this.applySettings();
        this.renderMenu();
        this.renderOngoingOrders();
        this.renderCompletedOrders();
        this.renderMenuManagement();
        this.renderAnalytics();
        this.renderUsers();
        this.updateBadges();
        this.updateCategoryDropdown();
        this.updateQuickItems();
        this.updateLiveStats();
        this.updateDateDisplay();
        
        // Auto-refresh ongoing orders
        setInterval(() => this.renderOngoingOrders(), this.settings.autoRefresh * 1000);
        
        // Auto-save every minute
        setInterval(() => this.autoSave(), 60000);
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Check for low stock
        this.checkLowStock();
        
        console.log('Restaurant Order System Enhanced Version Loaded');
    }
    
    // Default menu data with inventory
    defaultMenu = [
        // APPETIZERS
        { id: 1, category: 'APPETIZERS', name: 'Chicken loaded fries', price: 140, cost: 80, stock: 50, status: 'available' },
        { id: 2, category: 'APPETIZERS', name: 'Cheesy veg loaded fries', price: 125, cost: 70, stock: 50, status: 'available' },
        { id: 3, category: 'APPETIZERS', name: 'Salted fries', price: 99, cost: 40, stock: 100, status: 'available' },
        { id: 4, category: 'APPETIZERS', name: 'Peri peri fries', price: 109, cost: 50, stock: 50, status: 'available' },
        { id: 5, category: 'APPETIZERS', name: 'Chicken Nuggets (4 pcs)', price: 75, cost: 35, stock: 80, status: 'available' },
        { id: 6, category: 'APPETIZERS', name: 'Chicken Nuggets (6 pcs)', price: 99, cost: 50, stock: 80, status: 'available' },
        
        // WRAPS
        { id: 7, category: 'WRAPS', name: 'Chicken tikka wrap', price: 130, cost: 70, stock: 40, status: 'available' },
        { id: 8, category: 'WRAPS', name: 'Paneer tikka wrap', price: 120, cost: 60, stock: 40, status: 'available' },
        { id: 9, category: 'WRAPS', name: 'Chicken zinger wrap', price: 150, cost: 80, stock: 40, status: 'available' },
        { id: 10, category: 'WRAPS', name: 'Chicken nugget wrap', price: 120, cost: 60, stock: 40, status: 'available' },
        
        // BURGERS
        { id: 11, category: 'BURGERS', name: 'Classic Veg burger', price: 115, cost: 50, stock: 60, status: 'available' },
        { id: 12, category: 'BURGERS', name: 'Chicken Bliss burger', price: 135, cost: 70, stock: 60, status: 'available' },
        
        // SALADS
        { id: 13, category: 'SALADS', name: 'Veg salad', price: 99, cost: 40, stock: 30, status: 'available' },
        { id: 14, category: 'SALADS', name: 'Signature chicken salad', price: 130, cost: 60, stock: 30, status: 'available' },
        
        // DESSERTS
        { id: 15, category: 'DESSERTS', name: 'Chocolate brownie', price: 90, cost: 30, stock: 50, status: 'available' },
        { id: 16, category: 'DESSERTS', name: 'Red velvet brownie', price: 90, cost: 30, stock: 50, status: 'available' },
        { id: 17, category: 'DESSERTS', name: 'Lotus biscoff drip brownie', price: 130, cost: 50, stock: 30, status: 'available' },
        { id: 18, category: 'DESSERTS', name: 'Strawberry choco brownie', price: 110, cost: 40, stock: 30, status: 'available' },
        { id: 19, category: 'DESSERTS', name: 'Chocolate strawberry cup', price: 120, cost: 45, stock: 30, status: 'available' }
    ];
    
    // Default categories
    getDefaultCategories() {
        return [
            { id: 1, name: 'APPETIZERS', icon: 'fas fa-utensils', description: 'Appetizers and Starters', active: true },
            { id: 2, name: 'WRAPS', icon: 'fas fa-burrito', description: 'Fresh Wraps', active: true },
            { id: 3, name: 'BURGERS', icon: 'fas fa-hamburger', description: 'Burgers', active: true },
            { id: 4, name: 'SALADS', icon: 'fas fa-leaf', description: 'Healthy Salads', active: true },
            { id: 5, name: 'DESSERTS', icon: 'fas fa-ice-cream', description: 'Sweet Desserts', active: true }
        ];
    }
    
    // Default settings
    getDefaultSettings() {
        return {
            restaurantName: 'Restaurant Order System',
            taxRate: 5,
            currency: '₹',
            autoRefresh: 10,
            soundNotifications: true,
            lowStockAlerts: true,
            lowStockThreshold: 10,
            darkMode: false
        };
    }
    
    // Default users
    getDefaultUsers() {
        return [
            { id: 1, username: 'admin', password: 'admin123', role: 'admin', active: true },
            { id: 2, username: 'manager', password: 'manager123', role: 'manager', active: true },
            { id: 3, username: 'cashier', password: 'cashier123', role: 'cashier', active: true }
        ];
    }
    
    // Local storage methods
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            toastr.error('Error saving data!');
            return false;
        }
    }
    
    loadData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return null;
        }
    }
    
    // Auto-save
    autoSave() {
        this.saveData('menu', this.menu);
        this.saveData('orders', this.orders);
        this.saveData('completedOrders', this.completedOrders);
        this.saveData('settings', this.settings);
        this.saveData('users', this.users);
        console.log('Auto-save completed');
    }
    
    // Backup data
    backupData() {
        const backup = {
            menu: this.menu,
            categories: this.categories,
            orders: this.orders,
            completedOrders: this.completedOrders,
            settings: this.settings,
            users: this.users,
            orderTemplates: this.orderTemplates,
            timestamp: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(backup, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `restaurant-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        toastr.success('Backup created successfully!');
    }
    
    // Restore data
    restoreData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backup = JSON.parse(e.target.result);
                
                if (confirm('This will overwrite all current data. Are you sure?')) {
                    this.menu = backup.menu || this.menu;
                    this.categories = backup.categories || this.categories;
                    this.orders = backup.orders || [];
                    this.completedOrders = backup.completedOrders || [];
                    this.settings = backup.settings || this.settings;
                    this.users = backup.users || this.users;
                    this.orderTemplates = backup.orderTemplates || [];
                    
                    this.saveAllData();
                    this.applySettings();
                    this.renderAll();
                    toastr.success('Data restored successfully!');
                }
            } catch (error) {
                toastr.error('Invalid backup file!');
                console.error('Error restoring backup:', error);
            }
        };
        reader.readAsText(file);
    }
    
    // Save all data
    saveAllData() {
        this.saveData('menu', this.menu);
        this.saveData('categories', this.categories);
        this.saveData('orders', this.orders);
        this.saveData('completedOrders', this.completedOrders);
        this.saveData('settings', this.settings);
        this.saveData('users', this.users);
        this.saveData('orderTemplates', this.orderTemplates);
        this.saveData('nextOrderId', this.nextOrderId);
    }
    
    // Apply settings
    applySettings() {
        // Apply tax rate
        this.currentOrder.taxRate = this.settings.taxRate;
        document.getElementById('tax-percentage').value = this.settings.taxRate;
        
        // Apply currency
        document.querySelectorAll('.currency-symbol').forEach(el => {
            el.textContent = this.settings.currency;
        });
        
        // Apply dark mode
        if (this.settings.darkMode) {
            document.body.setAttribute('data-theme', 'dark');
            document.getElementById('dark-mode-toggle').innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.removeAttribute('data-theme');
            document.getElementById('dark-mode-toggle').innerHTML = '<i class="fas fa-moon"></i>';
        }
        
        // Update restaurant name
        document.getElementById('restaurant-name').value = this.settings.restaurantName;
        document.querySelector('.brand-text').textContent = this.settings.restaurantName;
    }
    
    // Initialize event listeners
    initEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = link.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
        
        // Quick actions
        document.getElementById('quick-clear-btn').addEventListener('click', () => this.clearAllData());
        document.getElementById('quick-print-btn').addEventListener('click', () => this.printSummary());
        document.getElementById('dark-mode-toggle').addEventListener('click', () => this.toggleDarkMode());
        document.getElementById('search-orders').addEventListener('input', (e) => this.searchOrders(e.target.value));
        
        // Order taking
        document.getElementById('place-order-btn').addEventListener('click', () => this.placeOrder());
        document.getElementById('clear-order-btn').addEventListener('click', () => this.clearCurrentOrder());
        document.getElementById('hold-order-btn').addEventListener('click', () => this.holdOrder());
        document.getElementById('save-order-template-btn').addEventListener('click', () => this.saveOrderTemplate());
        document.getElementById('load-templates-btn').addEventListener('click', () => this.showTemplatesModal());
        document.getElementById('add-drinks-btn').addEventListener('click', () => this.addQuickCategory('DRINKS'));
        document.getElementById('add-desserts-btn').addEventListener('click', () => this.addQuickCategory('DESSERTS'));
        
        // Menu search
        document.getElementById('menu-search').addEventListener('input', (e) => this.searchMenu(e.target.value));
        document.getElementById('clear-search').addEventListener('click', () => {
            document.getElementById('menu-search').value = '';
            this.renderMenu();
        });
        
        // Customer info
        document.getElementById('customer-name').addEventListener('input', (e) => {
            this.currentOrder.customerName = e.target.value;
            this.updateOrderSummary();
        });
        document.getElementById('customer-number').addEventListener('input', (e) => {
            this.currentOrder.customerNumber = e.target.value;
        });
        document.getElementById('order-type').addEventListener('change', (e) => {
            this.currentOrder.orderType = e.target.value;
            this.updateOrderSummary();
        });
        document.getElementById('payment-method').addEventListener('change', (e) => {
            this.currentOrder.paymentMethod = e.target.value;
            this.updateOrderSummary();
        });
        document.getElementById('order-notes').addEventListener('input', (e) => {
            this.currentOrder.notes = e.target.value;
        });
        
        // Tax calculation
        document.getElementById('tax-percentage').addEventListener('input', (e) => {
            this.currentOrder.taxRate = parseFloat(e.target.value) || 0;
            this.updateSelectedItemsTable();
        });
        
        // Order management
        document.getElementById('complete-order-btn').addEventListener('click', () => this.completeOrder());
        document.getElementById('edit-order-btn').addEventListener('click', () => this.editOrder());
        
        // Completed orders
        document.getElementById('clear-completed-btn').addEventListener('click', () => this.clearCompletedOrders());
        document.getElementById('download-pdf-btn').addEventListener('click', () => this.downloadPDFReport());
        document.getElementById('export-csv-btn').addEventListener('click', () => this.exportCSV());
        document.getElementById('date-filter').addEventListener('change', () => this.renderCompletedOrders());
        
        // Ongoing orders filters
        document.getElementById('filter-preparing-btn').addEventListener('click', () => this.filterOrders('preparing'));
        document.getElementById('filter-ready-btn').addEventListener('click', () => this.filterOrders('ready'));
        document.getElementById('filter-all-btn').addEventListener('click', () => this.filterOrders('all'));
        document.getElementById('print-kitchen-orders-btn').addEventListener('click', () => this.printKitchenOrders());
        document.getElementById('kitchen-voice-btn').addEventListener('click', () => this.voiceAnnounce());
        
        // Menu management
        document.getElementById('menu-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMenuItem();
        });
        document.getElementById('cancel-edit-btn').addEventListener('click', () => this.cancelEditMenuItem());
        document.getElementById('add-category-btn').addEventListener('click', () => this.showAddCategoryModal());
        document.getElementById('new-category-btn').addEventListener('click', () => this.showNewCategoryInput());
        document.getElementById('save-new-category-btn').addEventListener('click', () => this.saveNewCategory());
        document.getElementById('cancel-new-category-btn').addEventListener('click', () => this.hideNewCategoryInput());
        document.getElementById('import-menu-btn').addEventListener('click', () => document.getElementById('import-menu-file').click());
        document.getElementById('export-menu-btn').addEventListener('click', () => this.exportMenu());
        document.getElementById('import-menu-file').addEventListener('change', (e) => this.importMenu(e.target.files[0]));
        
        // Category form
        document.getElementById('category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewCategory();
        });
        
        // Settings
        document.getElementById('system-settings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings();
        });
        document.getElementById('backup-data-btn').addEventListener('click', () => this.backupData());
        document.getElementById('restore-data-btn').addEventListener('click', () => document.getElementById('import-data-file').click());
        document.getElementById('reset-data-btn').addEventListener('click', () => this.resetData());
        document.getElementById('import-data-file').addEventListener('change', (e) => this.restoreData(e.target.files[0]));
        document.getElementById('test-print-btn').addEventListener('click', () => this.testPrint());
        
        // User management
        document.getElementById('add-user-btn').addEventListener('click', () => this.showAddUserModal());
        document.getElementById('user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addUser();
        });
        
        // Play notification sound
        if (this.settings.soundNotifications) {
            document.getElementById('notification-sound').volume = 0.3;
        }
    }
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only trigger when not in input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key) {
                case 'F1':
                    e.preventDefault();
                    document.getElementById('place-order-btn').click();
                    break;
                case 'F2':
                    e.preventDefault();
                    document.getElementById('clear-order-btn').click();
                    break;
                case 'F3':
                    e.preventDefault();
                    this.switchTab('ongoing-orders');
                    break;
                case 'F4':
                    e.preventDefault();
                    this.switchTab('completed-orders');
                    break;
                case 'F5':
                    e.preventDefault();
                    this.switchTab('take-order');
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.clearCurrentOrder();
                    break;
                case 'd':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.downloadPDFReport();
                    }
                    break;
            }
        });
    }
    
    // Play notification sound
    playNotification(type = 'success') {
        if (!this.settings.soundNotifications) return;
        
        const audio = document.getElementById('notification-sound');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
    }
    
    // Switch between tabs
    switchTab(tabId) {
        // Update active tab in navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-tab') === tabId) {
                link.classList.add('active');
            }
        });
        
        // Show selected tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
        
        // Update data if needed
        if (tabId === 'ongoing-orders') {
            this.renderOngoingOrders();
        } else if (tabId === 'completed-orders') {
            this.renderCompletedOrders();
        } else if (tabId === 'menu-management') {
            this.renderMenuManagement();
        } else if (tabId === 'analytics') {
            this.renderAnalytics();
        }
    }
    
    // Update date display
    updateDateDisplay() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
    }
    
    // Update live stats
    updateLiveStats() {
        // Today's date
        const today = new Date().toISOString().split('T')[0];
        
        // Today's completed orders
        const todayOrders = this.completedOrders.filter(order => 
            order.completedTime && order.completedTime.startsWith(today)
        );
        
        // Today's revenue
        const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
        
        // Update display
        document.getElementById('live-ongoing').textContent = this.orders.length;
        document.getElementById('live-completed').textContent = todayOrders.length;
        document.getElementById('live-revenue').textContent = `${this.settings.currency}${todayRevenue}`;
        document.getElementById('today-revenue').textContent = `${this.settings.currency}${todayRevenue}`;
    }
    
    // Render menu items
    renderMenu() {
        const container = document.getElementById('menu-items-container');
        const searchTerm = document.getElementById('menu-search').value.toLowerCase();
        
        container.innerHTML = '';
        
        // Filter active categories
        const activeCategories = this.categories.filter(cat => cat.active);
        
        // Group items by category
        const categories = {};
        this.menu.forEach(item => {
            if (!item.status || item.status === 'available') {
                if (!categories[item.category]) {
                    categories[item.category] = [];
                }
                categories[item.category].push(item);
            }
        });
        
        // Create category sections
        activeCategories.forEach(category => {
            const catName = category.name;
            const items = categories[catName] || [];
            
            // Filter by search term
            const filteredItems = items.filter(item => 
                searchTerm === '' || 
                item.name.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm)
            );
            
            if (filteredItems.length === 0) return;
            
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'menu-category col-12';
            categoryDiv.innerHTML = `
                <h5>
                    <i class="${category.icon || 'fas fa-utensils'} me-2"></i>
                    ${catName}
                    <span class="badge bg-secondary float-end">${filteredItems.length} items</span>
                </h5>
                <div class="row" id="category-${catName}"></div>
            `;
            
            const itemsContainer = categoryDiv.querySelector(`#category-${catName}`);
            
            filteredItems.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'col-md-6 col-lg-4 mb-3';
                
                // Check stock status
                const isLowStock = item.stock < (this.settings.lowStockThreshold || 10);
                const isOutOfStock = item.stock <= 0;
                
                itemDiv.innerHTML = `
                    <div class="menu-item-card ${isOutOfStock ? 'opacity-50' : ''}" data-item-id="${item.id}">
                        ${isLowStock && !isOutOfStock ? 
                            '<span class="badge bg-warning position-absolute top-0 end-0 m-2">Low Stock</span>' : ''}
                        ${isOutOfStock ? 
                            '<span class="badge bg-danger position-absolute top-0 end-0 m-2">Out of Stock</span>' : ''}
                        <div>
                            <div class="menu-item-name">${item.name}</div>
                            <div class="menu-item-price">${this.settings.currency}${item.price}</div>
                            ${item.cost ? `<div class="small text-muted mt-1">Cost: ${this.settings.currency}${item.cost}</div>` : ''}
                            ${item.stock !== undefined ? `<div class="small mt-1">Stock: ${item.stock}</div>` : ''}
                        </div>
                        <div class="menu-item-quantity">
                            <button class="quantity-btn minus-btn" data-item-id="${item.id}" ${isOutOfStock ? 'disabled' : ''}>-</button>
                            <input type="number" class="quantity-input" id="qty-${item.id}" value="0" min="0" 
                                   data-item-id="${item.id}" ${isOutOfStock ? 'disabled' : ''}>
                            <button class="quantity-btn plus-btn" data-item-id="${item.id}" ${isOutOfStock ? 'disabled' : ''}>+</button>
                        </div>
                    </div>
                `;
                
                itemsContainer.appendChild(itemDiv);
                
                // Add event listeners
                const minusBtn = itemDiv.querySelector('.minus-btn');
                const plusBtn = itemDiv.querySelector('.plus-btn');
                const qtyInput = itemDiv.querySelector('.quantity-input');
                
                if (!isOutOfStock) {
                    minusBtn.addEventListener('click', () => this.adjustQuantity(item.id, -1));
                    plusBtn.addEventListener('click', () => this.adjustQuantity(item.id, 1));
                    qtyInput.addEventListener('change', (e) => this.setQuantity(item.id, parseInt(e.target.value) || 0));
                    qtyInput.addEventListener('input', (e) => this.setQuantity(item.id, parseInt(e.target.value) || 0));
                }
            });
            
            container.appendChild(categoryDiv);
        });
    }
    
    // Search menu
    searchMenu(term) {
        this.renderMenu();
    }
    
    // Search orders
    searchOrders(term) {
        // Implement order search functionality
        console.log('Searching orders for:', term);
    }
    
    // Update quick items
    updateQuickItems() {
        const container = document.getElementById('quick-items');
        container.innerHTML = '';
        
        // Get top 6 popular items from completed orders
        const popularItems = this.getPopularItems(6);
        
        popularItems.forEach(item => {
            const col = document.createElement('div');
            col.className = 'col-6 col-md-4';
            col.innerHTML = `
                <button class="btn btn-outline-secondary w-100 quick-item-btn" data-item-id="${item.id}">
                    ${item.name} (${this.settings.currency}${item.price})
                </button>
            `;
            container.appendChild(col);
            
            col.querySelector('.quick-item-btn').addEventListener('click', () => {
                this.addQuickItem(item.id);
            });
        });
    }
    
    // Get popular items
    getPopularItems(limit = 10) {
        const itemCounts = {};
        
        this.completedOrders.forEach(order => {
            order.items.forEach(orderItem => {
                const menuItem = this.menu.find(item => item.name === orderItem.name);
                if (menuItem) {
                    if (!itemCounts[menuItem.id]) {
                        itemCounts[menuItem.id] = {
                            ...menuItem,
                            count: 0
                        };
                    }
                    itemCounts[menuItem.id].count += orderItem.quantity;
                }
            });
        });
        
        return Object.values(itemCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
    
    // Add quick item
    addQuickItem(itemId) {
        const input = document.getElementById(`qty-${itemId}`);
        if (input) {
            let currentValue = parseInt(input.value) || 0;
            input.value = currentValue + 1;
            this.setQuantity(itemId, currentValue + 1);
        }
    }
    
    // Add quick category
    addQuickCategory(category) {
        // Scroll to category
        const categoryElement = document.querySelector(`#category-${category}`);
        if (categoryElement) {
            categoryElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Adjust quantity
    adjustQuantity(itemId, change) {
        const input = document.getElementById(`qty-${itemId}`);
        if (!input) return;
        
        let currentValue = parseInt(input.value) || 0;
        let newValue = currentValue + change;
        
        if (newValue < 0) newValue = 0;
        
        const menuItem = this.menu.find(item => item.id === itemId);
        if (menuItem && menuItem.stock !== undefined && newValue > menuItem.stock) {
            newValue = menuItem.stock;
            toastr.warning(`Only ${menuItem.stock} items available in stock!`);
        }
        
        input.value = newValue;
        this.setQuantity(itemId, newValue);
    }
    
    // Set quantity
    setQuantity(itemId, quantity) {
        // Find the item in current order
        const existingItemIndex = this.currentOrder.items.findIndex(item => item.id === itemId);
        
        if (quantity > 0) {
            const menuItem = this.menu.find(item => item.id === itemId);
            
            if (!menuItem) return;
            
            // Check stock
            if (menuItem.stock !== undefined && quantity > menuItem.stock) {
                quantity = menuItem.stock;
                toastr.warning(`Only ${menuItem.stock} items available in stock!`);
            }
            
            if (existingItemIndex >= 0) {
                // Update existing item
                this.currentOrder.items[existingItemIndex].quantity = quantity;
                this.currentOrder.items[existingItemIndex].total = quantity * menuItem.price;
            } else {
                // Add new item
                this.currentOrder.items.push({
                    id: itemId,
                    name: menuItem.name,
                    price: menuItem.price,
                    quantity: quantity,
                    total: quantity * menuItem.price
                });
            }
        } else if (existingItemIndex >= 0) {
            // Remove item if quantity is 0
            this.currentOrder.items.splice(existingItemIndex, 1);
        }
        
        // Update UI
        this.updateSelectedItemsTable();
        this.updateOrderSummary();
        
        // Highlight selected menu item
        const menuCard = document.querySelector(`.menu-item-card[data-item-id="${itemId}"]`);
        if (menuCard) {
            if (quantity > 0) {
                menuCard.classList.add('selected');
            } else {
                menuCard.classList.remove('selected');
            }
        }
    }
    
    // Update selected items table
    updateSelectedItemsTable() {
        const tbody = document.getElementById('selected-items-body');
        tbody.innerHTML = '';
        
        let subtotal = 0;
        
        this.currentOrder.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>
                    <div class="input-group input-group-sm" style="width: 120px;">
                        <button class="btn btn-outline-secondary" type="button" onclick="restaurantSystem.adjustQuantity(${item.id}, -1)">-</button>
                        <input type="number" class="form-control text-center" value="${item.quantity}" min="1" 
                               onchange="restaurantSystem.setQuantity(${item.id}, this.value)">
                        <button class="btn btn-outline-secondary" type="button" onclick="restaurantSystem.adjustQuantity(${item.id}, 1)">+</button>
                    </div>
                </td>
                <td>${this.settings.currency}${item.price}</td>
                <td>${this.settings.currency}${item.total}</td>
                <td>
                    <input type="text" class="form-control form-control-sm" placeholder="Notes" 
                           onchange="restaurantSystem.updateItemNotes(${item.id}, this.value)">
                </td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="restaurantSystem.setQuantity(${item.id}, 0)">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
            subtotal += item.total;
        });
        
        const taxAmount = subtotal * (this.currentOrder.taxRate / 100);
        const grandTotal = subtotal + taxAmount;
        
        document.getElementById('subtotal').textContent = `${this.settings.currency}${subtotal}`;
        document.getElementById('tax-amount').textContent = `${this.settings.currency}${taxAmount.toFixed(2)}`;
        document.getElementById('grand-total').textContent = `${this.settings.currency}${grandTotal.toFixed(2)}`;
        
        // Show/hide table based on items
        if (this.currentOrder.items.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        <i class="fas fa-shopping-cart fa-2x mb-3"></i>
                        <p>No items selected. Click on menu items to add them to the order.</p>
                    </td>
                </tr>`;
        }
    }
    
    // Update item notes
    updateItemNotes(itemId, notes) {
        const itemIndex = this.currentOrder.items.findIndex(item => item.id === itemId);
        if (itemIndex >= 0) {
            this.currentOrder.items[itemIndex].notes = notes;
        }
    }
    
    // Update order summary
    updateOrderSummary() {
        // Update order number display
        document.getElementById('display-order-no').textContent = this.nextOrderId;
        
        // Update customer info
        document.getElementById('display-customer').textContent = 
            this.currentOrder.customerName || 'Not specified';
        
        // Update time
        const now = new Date();
        document.getElementById('display-time').textContent = 
            now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Update order type
        const typeMap = {
            'dine-in': 'Dine In',
            'takeaway': 'Takeaway',
            'delivery': 'Delivery'
        };
        document.getElementById('display-type').textContent = typeMap[this.currentOrder.orderType] || 'Dine In';
        
        // Update items summary
        const summaryContainer = document.getElementById('summary-items');
        summaryContainer.innerHTML = '';
        
        let subtotal = 0;
        
        this.currentOrder.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'd-flex justify-content-between mb-1';
            itemDiv.innerHTML = `
                <span class="small">${item.name} x${item.quantity}</span>
                <span class="small">${this.settings.currency}${item.total}</span>
            `;
            summaryContainer.appendChild(itemDiv);
            subtotal += item.total;
        });
        
        if (this.currentOrder.items.length === 0) {
            summaryContainer.innerHTML = '<p class="text-muted text-center small">No items selected</p>';
        }
        
        const taxAmount = subtotal * (this.currentOrder.taxRate / 100);
        const grandTotal = subtotal + taxAmount;
        
        document.getElementById('summary-subtotal').textContent = `${this.settings.currency}${subtotal}`;
        document.getElementById('summary-tax').textContent = `${this.settings.currency}${taxAmount.toFixed(2)}`;
        document.getElementById('summary-total').textContent = `${this.settings.currency}${grandTotal.toFixed(2)}`;
        
        // Update payment method
        const paymentMap = {
            'cash': 'Cash',
            'card': 'Card',
            'upi': 'UPI',
            'online': 'Online'
        };
        document.getElementById('summary-payment').textContent = 
            paymentMap[this.currentOrder.paymentMethod] || 'Cash';
    }
    
    // Place new order
    placeOrder() {
        if (this.currentOrder.items.length === 0) {
            toastr.error('Please add at least one item to the order');
            return;
        }
        
        // Check stock availability
        for (const item of this.currentOrder.items) {
            const menuItem = this.menu.find(m => m.id === item.id);
            if (menuItem && menuItem.stock !== undefined && menuItem.stock < item.quantity) {
                toastr.error(`Insufficient stock for ${item.name}. Available: ${menuItem.stock}`);
                return;
            }
        }
        
        // Calculate totals
        const subtotal = this.currentOrder.items.reduce((sum, item) => sum + item.total, 0);
        const taxAmount = subtotal * (this.currentOrder.taxRate / 100);
        const grandTotal = subtotal + taxAmount;
        
        // Create order object
        const order = {
            id: this.nextOrderId++,
            customerName: this.currentOrder.customerName,
            customerNumber: this.currentOrder.customerNumber,
            orderType: this.currentOrder.orderType,
            paymentMethod: this.currentOrder.paymentMethod,
            notes: this.currentOrder.notes,
            items: [...this.currentOrder.items],
            subtotal: subtotal,
            tax: taxAmount,
            total: grandTotal,
            orderTime: new Date().toISOString(),
            status: 'preparing',
            placedBy: this.currentUser ? this.currentUser.username : 'System'
        };
        
        // Deduct stock
        this.deductStock(order.items);
        
        // Add to orders array
        this.orders.unshift(order);
        
        // Save data
        this.saveData('orders', this.orders);
        this.saveData('nextOrderId', this.nextOrderId);
        this.saveData('menu', this.menu);
        
        // Clear current order
        this.clearCurrentOrder();
        
        // Switch to ongoing orders tab
        this.switchTab('ongoing-orders');
        
        // Update badges and stats
        this.updateBadges();
        this.updateLiveStats();
        
        // Show success message
        toastr.success(`Order #${order.id} placed successfully!`);
        this.playNotification('success');
        
        // Add recent activity
        this.addRecentActivity(`Order #${order.id} placed`, 'success');
        
        // Render ongoing orders
        this.renderOngoingOrders();
    }
    
    // Deduct stock from inventory
    deductStock(items) {
        items.forEach(orderItem => {
            const menuItem = this.menu.find(item => item.id === orderItem.id);
            if (menuItem && menuItem.stock !== undefined) {
                menuItem.stock -= orderItem.quantity;
                if (menuItem.stock < 0) menuItem.stock = 0;
                
                // Update status if out of stock
                if (menuItem.stock === 0) {
                    menuItem.status = 'unavailable';
                }
            }
        });
    }
    
    // Hold order (save as template)
    holdOrder() {
        if (this.currentOrder.items.length === 0) {
            toastr.error('No items to hold');
            return;
        }
        
        const templateName = prompt('Enter template name:', `Template ${this.orderTemplates.length + 1}`);
        if (!templateName) return;
        
        const template = {
            id: Date.now(),
            name: templateName,
            items: [...this.currentOrder.items],
            customerName: this.currentOrder.customerName,
            orderType: this.currentOrder.orderType,
            createdAt: new Date().toISOString()
        };
        
        this.orderTemplates.push(template);
        this.saveData('orderTemplates', this.orderTemplates);
        
        toastr.success(`Template "${templateName}" saved successfully!`);
    }
    
    // Save order template
    saveOrderTemplate() {
        this.holdOrder();
    }
    
    // Show templates modal
    showTemplatesModal() {
        const container = document.getElementById('templates-container');
        container.innerHTML = '';
        
        if (this.orderTemplates.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No templates saved yet.</p>';
        } else {
            this.orderTemplates.forEach(template => {
                const col = document.createElement('div');
                col.className = 'col-md-4 mb-3';
                col.innerHTML = `
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${template.name}</h5>
                            <p class="card-text small">
                                ${template.items.length} items<br>
                                Customer: ${template.customerName || 'N/A'}<br>
                                Type: ${template.orderType}<br>
                                Created: ${new Date(template.createdAt).toLocaleDateString()}
                            </p>
                            <button class="btn btn-sm btn-primary w-100 load-template-btn" data-template-id="${template.id}">
                                Load Template
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(col);
            });
        }
        
        // Add event listeners
        document.querySelectorAll('.load-template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateId = parseInt(e.target.getAttribute('data-template-id'));
                this.loadTemplate(templateId);
                
                const modal = bootstrap.Modal.getInstance(document.getElementById('templatesModal'));
                modal.hide();
            });
        });
        
        const modal = new bootstrap.Modal(document.getElementById('templatesModal'));
        modal.show();
    }
    
    // Load template
    loadTemplate(templateId) {
        const template = this.orderTemplates.find(t => t.id === templateId);
        if (!template) return;
        
        // Clear current order first
        this.clearCurrentOrder();
        
        // Load template data
        this.currentOrder.customerName = template.customerName;
        this.currentOrder.orderType = template.orderType;
        document.getElementById('customer-name').value = template.customerName || '';
        document.getElementById('order-type').value = template.orderType;
        
        // Load items
        template.items.forEach(item => {
            this.setQuantity(item.id, item.quantity);
        });
        
        toastr.success(`Template "${template.name}" loaded!`);
    }
    
    // Clear current order
    clearCurrentOrder() {
        this.currentOrder = {
            items: [],
            customerName: '',
            customerNumber: '',
            orderType: 'dine-in',
            paymentMethod: 'cash',
            notes: '',
            taxRate: this.settings.taxRate
        };
        
        // Reset form
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-number').value = '';
        document.getElementById('order-type').value = 'dine-in';
        document.getElementById('payment-method').value = 'cash';
        document.getElementById('order-notes').value = '';
        document.getElementById('tax-percentage').value = this.settings.taxRate;
        
        // Reset all quantity inputs
        this.menu.forEach(item => {
            const input = document.getElementById(`qty-${item.id}`);
            if (input) input.value = 0;
            
            const menuCard = document.querySelector(`.menu-item-card[data-item-id="${item.id}"]`);
            if (menuCard) menuCard.classList.remove('selected');
        });
        
        // Update UI
        this.updateSelectedItemsTable();
        this.updateOrderSummary();
    }
    
    // Clear all data
    clearAllData() {
        if (confirm('Are you sure you want to clear all current data? This cannot be undone.')) {
            this.orders = [];
            this.saveData('orders', this.orders);
            this.renderOngoingOrders();
            this.updateBadges();
            toastr.success('All orders cleared!');
        }
    }
    
    // Print summary
    printSummary() {
        window.print();
    }
    
    // Toggle dark mode
    toggleDarkMode() {
        this.settings.darkMode = !this.settings.darkMode;
        this.saveData('settings', this.settings);
        this.applySettings();
        
        toastr.info(`Dark mode ${this.settings.darkMode ? 'enabled' : 'disabled'}`);
    }
    
    // Render ongoing orders with enhanced features
    renderOngoingOrders() {
        const tbody = document.getElementById('ongoing-orders-body');
        const emptyState = document.getElementById('no-ongoing-orders');
        
        if (this.orders.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            this.updateKitchenDashboard();
            return;
        }
        
        emptyState.style.display = 'none';
        tbody.innerHTML = '';
        
        // Sort by order time (newest first)
        const sortedOrders = [...this.orders].sort((a, b) => 
            new Date(b.orderTime) - new Date(a.orderTime)
        );
        
        // Calculate statistics
        let preparingCount = 0;
        let readyCount = 0;
        let totalWaitTime = 0;
        
        sortedOrders.forEach(order => {
            // Count by status
            if (order.status === 'preparing') preparingCount++;
            if (order.status === 'ready') readyCount++;
            
            // Calculate wait time
            const orderTime = new Date(order.orderTime);
            const now = new Date();
            const waitMinutes = Math.floor((now - orderTime) / (1000 * 60));
            totalWaitTime += waitMinutes;
            
            // Get items preview
            const itemsPreview = order.items.slice(0, 2).map(item => 
                `${item.name} (x${item.quantity})`
            ).join(', ');
            
            const moreItems = order.items.length > 2 ? ` +${order.items.length - 2} more` : '';
            
            // Order type badge
            const typeBadgeClass = `order-type-${order.orderType}`;
            const typeText = order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>#${order.id}</strong></td>
                <td>${new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>${order.customerName || 'Walk-in'}</td>
                <td>${itemsPreview}${moreItems}</td>
                <td>${this.settings.currency}${order.total.toFixed(2)}</td>
                <td>
                    <span class="status-badge status-${order.status}">${order.status}</span>
                </td>
                <td>${waitMinutes} min</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary view-order-btn" data-order-id="${order.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-success complete-order-btn" data-order-id="${order.id}">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-outline-warning mark-ready-btn" data-order-id="${order.id}">
                            <i class="fas fa-clock"></i>
                        </button>
                        <button class="btn btn-outline-danger delete-order-btn" data-order-id="${order.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Update kitchen dashboard
        this.updateKitchenDashboard(preparingCount, readyCount, totalWaitTime);
        
        // Add event listeners
        this.addOrderEventListeners();
        
        // Update badge
        this.updateBadges();
    }
    
    // Update kitchen dashboard
    updateKitchenDashboard(preparingCount = 0, readyCount = 0, totalWaitTime = 0) {
        const totalOrders = preparingCount + readyCount;
        
        // Update progress bars
        const preparingPercent = totalOrders > 0 ? (preparingCount / totalOrders) * 100 : 0;
        const readyPercent = totalOrders > 0 ? (readyCount / totalOrders) * 100 : 0;
        
        document.getElementById('preparing-progress').style.width = `${preparingPercent}%`;
        document.getElementById('preparing-progress').textContent = `Preparing: ${preparingCount}`;
        
        document.getElementById('ready-progress').style.width = `${readyPercent}%`;
        document.getElementById('ready-progress').textContent = `Ready: ${readyCount}`;
        
        // Update average wait time
        const avgWaitTime = totalOrders > 0 ? Math.round(totalWaitTime / totalOrders) : 0;
        document.getElementById('avg-wait-time').textContent = avgWaitTime;
        
        // Check for long wait times
        if (avgWaitTime > 30) {
            document.getElementById('long-wait-alert').style.display = 'block';
            document.getElementById('alert-message').textContent = `High average wait time: ${avgWaitTime} minutes`;
        } else {
            document.getElementById('long-wait-alert').style.display = 'none';
        }
    }
    
    // Add order event listeners
    addOrderEventListeners() {
        // View order
        document.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = parseInt(e.currentTarget.getAttribute('data-order-id'));
                this.showOrderDetails(orderId);
            });
        });
        
        // Complete order
        document.querySelectorAll('.complete-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = parseInt(e.currentTarget.getAttribute('data-order-id'));
                this.completeOrderDirectly(orderId);
            });
        });
        
        // Mark as ready
        document.querySelectorAll('.mark-ready-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = parseInt(e.currentTarget.getAttribute('data-order-id'));
                this.markOrderReady(orderId);
            });
        });
        
        // Delete order
        document.querySelectorAll('.delete-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = parseInt(e.currentTarget.getAttribute('data-order-id'));
                this.deleteOrder(orderId);
            });
        });
    }
    
    // Mark order as ready
    markOrderReady(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = 'ready';
            order.readyTime = new Date().toISOString();
            this.saveData('orders', this.orders);
            this.renderOngoingOrders();
            toastr.success(`Order #${orderId} marked as ready!`);
        }
    }
    
    // Show order details
    showOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;
        
        // Populate modal
        document.getElementById('modal-order-no').textContent = order.id;
        document.getElementById('modal-customer').textContent = order.customerName || 'Walk-in Customer';
        document.getElementById('modal-phone').textContent = order.customerNumber || 'N/A';
        document.getElementById('modal-order-time').textContent = new Date(order.orderTime).toLocaleString();
        document.getElementById('modal-order-type').textContent = order.orderType;
        document.getElementById('modal-notes').textContent = order.notes || 'No notes';
        
        // Populate items
        const tbody = document.getElementById('modal-items-body');
        tbody.innerHTML = '';
        
        order.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${this.settings.currency}${item.price}</td>
                <td>${this.settings.currency}${item.total}</td>
            `;
            tbody.appendChild(row);
        });
        
        document.getElementById('modal-subtotal').textContent = order.subtotal.toFixed(2);
        document.getElementById('modal-tax').textContent = order.tax.toFixed(2);
        document.getElementById('modal-total').textContent = order.total.toFixed(2);
        
        // Set order id on complete button
        document.getElementById('complete-order-btn').setAttribute('data-order-id', order.id);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        modal.show();
    }
    
    // Complete order from modal
    completeOrder() {
        const orderId = parseInt(document.getElementById('complete-order-btn').getAttribute('data-order-id'));
        this.completeOrderDirectly(orderId);
        
        // Hide modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('orderDetailsModal'));
        modal.hide();
    }
    
    // Complete order directly
    completeOrderDirectly(orderId) {
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        
        // Remove from orders array
        const [completedOrder] = this.orders.splice(orderIndex, 1);
        
        // Add completion time
        completedOrder.completedTime = new Date().toISOString();
        completedOrder.status = 'completed';
        completedOrder.completedBy = this.currentUser ? this.currentUser.username : 'System';
        
        // Add to completed orders
        this.completedOrders.unshift(completedOrder);
        
        // Save data
        this.saveData('orders', this.orders);
        this.saveData('completedOrders', this.completedOrders);
        
        // Update UI
        this.renderOngoingOrders();
        this.renderCompletedOrders();
        this.updateBadges();
        this.updateLiveStats();
        
        // Show confirmation
        toastr.success(`Order #${orderId} marked as completed!`);
        this.playNotification('success');
        
        // Add recent activity
        this.addRecentActivity(`Order #${orderId} completed`, 'success');
    }
    
    // Edit order
    editOrder() {
        const orderId = parseInt(document.getElementById('complete-order-btn').getAttribute('data-order-id'));
        toastr.info('Edit functionality coming soon!');
    }
    
    // Delete order
    deleteOrder(orderId) {
        if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            return;
        }
        
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        
        // Restore stock if needed
        const order = this.orders[orderIndex];
        this.restoreStock(order.items);
        
        // Remove from orders array
        this.orders.splice(orderIndex, 1);
        
        // Save data
        this.saveData('orders', this.orders);
        
        // Update UI
        this.renderOngoingOrders();
        this.updateBadges();
        
        // Show confirmation
        toastr.success(`Order #${orderId} has been deleted!`);
        this.addRecentActivity(`Order #${orderId} deleted`, 'error');
    }
    
    // Restore stock
    restoreStock(items) {
        items.forEach(orderItem => {
            const menuItem = this.menu.find(item => item.id === orderItem.id);
            if (menuItem && menuItem.stock !== undefined) {
                menuItem.stock += orderItem.quantity;
                if (menuItem.status === 'unavailable' && menuItem.stock > 0) {
                    menuItem.status = 'available';
                }
            }
        });
    }
    
    // Filter orders
    filterOrders(status) {
        // This is a simplified implementation
        // In a real app, you would filter the displayed orders
        toastr.info(`Showing ${status} orders`);
    }
    
    // Print kitchen orders
    printKitchenOrders() {
        const printContent = this.generateKitchenPrintContent();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }
    
    // Generate kitchen print content
    generateKitchenPrintContent() {
        let content = `
            <html>
            <head>
                <title>Kitchen Orders</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; }
                    .order { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; }
                    .order-header { background: #f0f0f0; padding: 10px; margin-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background: #f2f2f2; }
                </style>
            </head>
            <body>
                <h1>Kitchen Orders - ${new Date().toLocaleString()}</h1>
        `;
        
        this.orders.forEach(order => {
            content += `
                <div class="order">
                    <div class="order-header">
                        <strong>Order #${order.id}</strong> | 
                        Customer: ${order.customerName || 'Walk-in'} | 
                        Time: ${new Date(order.orderTime).toLocaleTimeString()}
                    </div>
                    <table>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Notes</th>
                        </tr>
            `;
            
            order.items.forEach(item => {
                content += `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.notes || ''}</td>
                    </tr>
                `;
            });
            
            content += `
                    </table>
                    <p><strong>Order Notes:</strong> ${order.notes || 'None'}</p>
                </div>
            `;
        });
        
        content += `
            </body>
            </html>
        `;
        
        return content;
    }
    
    // Voice announce
    voiceAnnounce() {
        if ('speechSynthesis' in window) {
            const speech = new SpeechSynthesisUtterance();
            speech.text = `There are ${this.orders.length} orders in the kitchen. ${this.orders.filter(o => o.status === 'ready').length} orders are ready.`;
            speech.rate = 1;
            speech.pitch = 1;
            speech.volume = 1;
            window.speechSynthesis.speak(speech);
        } else {
            toastr.warning('Speech synthesis not supported in this browser.');
        }
    }
    
    // Add recent activity
    addRecentActivity(message, type = 'info') {
        const container = document.getElementById('recent-activity');
        const activityItem = document.createElement('div');
        activityItem.className = 'list-group-item';
        activityItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span>${message}</span>
                <span class="badge bg-${type}">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        `;
        
        container.insertBefore(activityItem, container.firstChild);
        
        // Keep only last 5 activities
        while (container.children.length > 5) {
            container.removeChild(container.lastChild);
        }
    }
    
    // Render completed orders
    renderCompletedOrders() {
        const tbody = document.getElementById('completed-orders-body');
        const emptyState = document.getElementById('no-completed-orders');
        const dateFilter = document.getElementById('date-filter').value;
        
        // Filter orders by date
        let filteredOrders = this.completedOrders;
        const now = new Date();
        
        switch(dateFilter) {
            case 'today':
                const today = now.toISOString().split('T')[0];
                filteredOrders = this.completedOrders.filter(order => 
                    order.completedTime && order.completedTime.startsWith(today)
                );
                break;
            case 'yesterday':
                const yesterday = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
                filteredOrders = this.completedOrders.filter(order => 
                    order.completedTime && order.completedTime.startsWith(yesterday)
                );
                break;
            case 'week':
                const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
                filteredOrders = this.completedOrders.filter(order => 
                    order.completedTime && order.completedTime >= weekAgo
                );
                break;
            case 'month':
                const monthAgo = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];
                filteredOrders = this.completedOrders.filter(order => 
                    order.completedTime && order.completedTime >= monthAgo
                );
                break;
            // 'all' uses all orders
        }
        
        if (filteredOrders.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            this.updateSalesDashboard(filteredOrders);
            return;
        }
        
        emptyState.style.display = 'none';
        tbody.innerHTML = '';
        
        filteredOrders.forEach(order => {
            const orderTime = new Date(order.orderTime);
            const completedTime = new Date(order.completedTime);
            
            // Get items count
            const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            
            // Order type badge
            const typeBadgeClass = `order-type-${order.orderType}`;
            const typeText = order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1);
            
            // Payment method
            const paymentMap = {
                'cash': 'Cash',
                'card': 'Card',
                'upi': 'UPI',
                'online': 'Online'
            };
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>#${order.id}</strong></td>
                <td>${orderTime.toLocaleString()}</td>
                <td>${order.customerName || 'Walk-in'}</td>
                <td>${itemsCount} items</td>
                <td><span class="order-type-badge ${typeBadgeClass}">${typeText}</span></td>
                <td>${paymentMap[order.paymentMethod] || order.paymentMethod}</td>
                <td>${this.settings.currency}${order.total.toFixed(2)}</td>
                <td>${completedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Update sales dashboard
        this.updateSalesDashboard(filteredOrders);
    }
    
    // Update sales dashboard
    updateSalesDashboard(orders) {
        if (orders.length === 0) {
            // Reset all displays
            document.getElementById('today-total-revenue').textContent = `${this.settings.currency}0`;
            document.getElementById('today-orders-count').textContent = '0';
            document.getElementById('today-avg-order').textContent = `${this.settings.currency}0`;
            document.getElementById('today-items-sold').textContent = '0';
            return;
        }
        
        // Calculate statistics
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = orders.length;
        const avgOrderValue = totalRevenue / totalOrders;
        const totalItems = orders.reduce((sum, order) => 
            sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        
        // Payment method breakdown
        const paymentMethods = {};
        orders.forEach(order => {
            paymentMethods[order.paymentMethod] = (paymentMethods[order.paymentMethod] || 0) + 1;
        });
        
        // Update displays
        document.getElementById('today-total-revenue').textContent = `${this.settings.currency}${totalRevenue.toFixed(2)}`;
        document.getElementById('today-orders-count').textContent = totalOrders;
        document.getElementById('today-avg-order').textContent = `${this.settings.currency}${avgOrderValue.toFixed(2)}`;
        document.getElementById('today-items-sold').textContent = totalItems;
        
        // Update top items
        this.updateTopItems(orders);
        
        // Update payment chart
        this.updatePaymentChart(paymentMethods);
    }
    
    // Update top items
    updateTopItems(orders) {
        const itemSales = {};
        
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!itemSales[item.name]) {
                    itemSales[item.name] = {
                        quantity: 0,
                        revenue: 0
                    };
                }
                itemSales[item.name].quantity += item.quantity;
                itemSales[item.name].revenue += item.total;
            });
        });
        
        // Sort by revenue (highest first)
        const topItems = Object.entries(itemSales)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 5);
        
        const tbody = document.getElementById('top-items-body');
        tbody.innerHTML = '';
        
        topItems.forEach(([itemName, data], index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}. ${itemName}</td>
                <td>${data.quantity}</td>
                <td>${this.settings.currency}${data.revenue.toFixed(2)}</td>
            `;
            tbody.appendChild(row);
        });
    }
    
    // Update payment chart
    updatePaymentChart(paymentMethods) {
        const ctx = document.getElementById('paymentChart').getContext('2d');
        
        // Destroy existing chart
        if (this.paymentChart) {
            this.paymentChart.destroy();
        }
        
        const labels = Object.keys(paymentMethods).map(method => {
            const methodMap = {
                'cash': 'Cash',
                'card': 'Card',
                'upi': 'UPI',
                'online': 'Online'
            };
            return methodMap[method] || method;
        });
        
        const data = Object.values(paymentMethods);
        const colors = ['#ff6b35', '#28a745', '#007bff', '#ffc107'];
        
        this.paymentChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Export CSV
    exportCSV() {
        if (this.completedOrders.length === 0) {
            toastr.error('No data to export!');
            return;
        }
        
        // Create CSV content
        let csv = 'Order ID,Date,Time,Customer,Items,Subtotal,Tax,Total,Payment Method,Order Type\n';
        
        this.completedOrders.forEach(order => {
            const orderTime = new Date(order.orderTime);
            const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            
            csv += `${order.id},`;
            csv += `${orderTime.toLocaleDateString()},`;
            csv += `${orderTime.toLocaleTimeString()},`;
            csv += `"${order.customerName || 'Walk-in'}",`;
            csv += `${itemsCount},`;
            csv += `${order.subtotal},`;
            csv += `${order.tax},`;
            csv += `${order.total},`;
            csv += `${order.paymentMethod},`;
            csv += `${order.orderType}\n`;
        });
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toastr.success('CSV exported successfully!');
    }
    
    // Download PDF report
    downloadPDFReport() {
        if (this.completedOrders.length === 0) {
            toastr.error('No completed orders to generate report!');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Restaurant Info
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text(this.settings.restaurantName, 105, 15, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Sales Report', 105, 25, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 32, { align: 'center' });
        
        // Summary Section
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Summary', 20, 45);
        
        doc.setFontSize(11);
        
        // Calculate statistics
        const totalRevenue = this.completedOrders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = this.completedOrders.length;
        const avgOrderValue = totalRevenue / totalOrders;
        const totalItems = this.completedOrders.reduce((sum, order) => 
            sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        
        doc.text(`Total Orders: ${totalOrders}`, 20, 55);
        doc.text(`Total Revenue: ${this.settings.currency}${totalRevenue.toFixed(2)}`, 20, 62);
        doc.text(`Average Order Value: ${this.settings.currency}
