// Restaurant Order Management System
class RestaurantOrderSystem {
    constructor() {
        // Initialize data
        this.menu = this.loadData('menu') || this.getDefaultMenu();
        this.categories = this.loadData('categories') || this.getDefaultCategories();
        this.orders = this.loadData('orders') || [];
        this.completedOrders = this.loadData('completedOrders') || [];
        this.orderTemplates = this.loadData('orderTemplates') || [];
        this.settings = this.loadData('settings') || this.getDefaultSettings();
        this.nextOrderId = this.loadData('nextOrderId') || 1001;
        
        // Current order state
        this.currentOrder = {
            items: [],
            customerName: '',
            customerPhone: '',
            orderType: 'dine-in',
            paymentMethod: 'cash',
            notes: ''
        };
        
        // Charts
        this.salesChart = null;
        
        // Initialize
        this.init();
    }
    
    // Default menu items
    getDefaultMenu() {
        return [
            // APPETIZERS
            { id: 1, category: 'APPETIZERS', name: 'Chicken loaded fries', price: 140, cost: 70, stock: 50, status: 'available' },
            { id: 2, category: 'APPETIZERS', name: 'Cheesy veg loaded fries', price: 125, cost: 60, stock: 50, status: 'available' },
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
    }
    
    // Default categories
    getDefaultCategories() {
        return [
            'APPETIZERS',
            'WRAPS', 
            'BURGERS',
            'SALADS',
            'DESSERTS'
        ];
    }
    
    // Default settings
    getDefaultSettings() {
        return {
            taxRate: 5,
            currency: '₹',
            restaurantName: 'Restaurant POS'
        };
    }
    
    // Local storage methods
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving data:', e);
            return false;
        }
    }
    
    loadData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading data:', e);
            return null;
        }
    }
    
    // Initialize the system
    init() {
        this.initEventListeners();
        this.renderMenu();
        this.renderOngoingOrders();
        this.renderCompletedOrders();
        this.renderMenuManagement();
        this.updateSummary();
        this.updateStats();
        this.updateBadges();
        this.updateNextOrderNumber();
        
        // Auto-save every 30 seconds
        setInterval(() => this.autoSave(), 30000);
        
        // Check if mobile
        this.checkMobile();
    }
    
    // Check if mobile device
    checkMobile() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            document.body.classList.add('mobile-view');
        }
    }
    
    // Auto-save data
    autoSave() {
        this.saveAllData();
        console.log('Auto-save completed');
    }
    
    // Save all data
    saveAllData() {
        this.saveData('menu', this.menu);
        this.saveData('categories', this.categories);
        this.saveData('orders', this.orders);
        this.saveData('completedOrders', this.completedOrders);
        this.saveData('orderTemplates', this.orderTemplates);
        this.saveData('settings', this.settings);
        this.saveData('nextOrderId', this.nextOrderId);
    }
    
    // Initialize event listeners
    initEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = element.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
        
        // Customer info
        document.getElementById('customer-name').addEventListener('input', (e) => {
            this.currentOrder.customerName = e.target.value;
            this.updateSummary();
        });
        
        document.getElementById('customer-phone').addEventListener('input', (e) => {
            this.currentOrder.customerPhone = e.target.value;
        });
        
        document.getElementById('order-type').addEventListener('change', (e) => {
            this.currentOrder.orderType = e.target.value;
            this.updateSummary();
        });
        
        document.getElementById('payment-method').addEventListener('change', (e) => {
            this.currentOrder.paymentMethod = e.target.value;
            this.updateSummary();
        });
        
        // Menu search
        document.getElementById('menu-search').addEventListener('input', (e) => {
            this.renderMenu(e.target.value.toLowerCase());
        });
        
        // Action buttons
        document.getElementById('clear-order-btn').addEventListener('click', () => this.clearCurrentOrder());
        document.getElementById('place-order-btn').addEventListener('click', () => this.placeOrder());
        document.getElementById('save-template-btn').addEventListener('click', () => this.saveOrderTemplate());
        document.getElementById('hold-order-btn').addEventListener('click', () => this.holdOrder());
        
        // Quick action buttons
        document.getElementById('quick-drinks').addEventListener('click', () => this.showCategory('DRINKS'));
        document.getElementById('quick-desserts').addEventListener('click', () => this.showCategory('DESSERTS'));
        document.getElementById('quick-appetizers').addEventListener('click', () => this.showCategory('APPETIZERS'));
        document.getElementById('quick-wraps').addEventListener('click', () => this.showCategory('WRAPS'));
        
        // Refresh orders
        document.getElementById('refresh-orders-btn').addEventListener('click', () => this.renderOngoingOrders());
        
        // Print all
        document.getElementById('print-all-btn').addEventListener('click', () => this.printAllOrders());
        
        // Download PDF
        document.getElementById('download-pdf-btn').addEventListener('click', () => this.downloadPDFReport());
        
        // Clear completed
        document.getElementById('clear-completed-btn').addEventListener('click', () => this.clearCompletedOrders());
        
        // Date filter
        document.getElementById('date-filter').addEventListener('change', () => this.renderCompletedOrders());
        
        // Menu management
        document.getElementById('menu-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMenuItem();
        });
        
        document.getElementById('cancel-edit-btn').addEventListener('click', () => this.cancelEditMenuItem());
        document.getElementById('add-category-btn').addEventListener('click', () => this.showNewCategoryInput());
        document.getElementById('new-category-btn').addEventListener('click', () => this.showNewCategoryInput());
        document.getElementById('save-category-btn').addEventListener('click', () => this.saveNewCategory());
        document.getElementById('cancel-category-btn').addEventListener('click', () => this.hideNewCategoryInput());
        
        // Complete order in modal
        document.getElementById('complete-order-btn').addEventListener('click', () => {
            const orderId = parseInt(document.getElementById('complete-order-btn').getAttribute('data-order-id'));
            this.completeOrder(orderId);
        });
        
        // Window resize for mobile
        window.addEventListener('resize', () => this.checkMobile());
    }
    
    // Switch between tabs
    switchTab(tabId) {
        // Update active tab in desktop nav
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-tab') === tabId) {
                link.classList.add('active');
            }
        });
        
        // Update active tab in mobile nav
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            }
        });
        
        // Show selected tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
        
        // Scroll to top on mobile
        if (window.innerWidth <= 768) {
            window.scrollTo(0, 0);
        }
        
        // Update content if needed
        if (tabId === 'ongoing-orders') {
            this.renderOngoingOrders();
        } else if (tabId === 'completed-orders') {
            this.renderCompletedOrders();
        } else if (tabId === 'menu-management') {
            this.renderMenuManagement();
        }
    }
    
    // Render menu items
    renderMenu(searchTerm = '') {
        const container = document.getElementById('menu-items-container');
        container.innerHTML = '';
        
        // Group items by category
        const categories = {};
        this.menu.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });
        
        // Create category sections
        this.categories.forEach(categoryName => {
            const items = categories[categoryName] || [];
            
            // Filter by search term
            const filteredItems = items.filter(item => 
                searchTerm === '' || 
                item.name.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm)
            );
            
            if (filteredItems.length === 0 && searchTerm !== '') return;
            
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'menu-category';
            categoryDiv.innerHTML = `
                <h6>${categoryName}</h6>
                <div class="row" id="category-${categoryName}"></div>
            `;
            
            const itemsContainer = categoryDiv.querySelector(`#category-${categoryName}`);
            
            filteredItems.forEach(item => {
                const colSize = window.innerWidth <= 576 ? 'col-6' : 'col-md-4 col-lg-3';
                const itemDiv = document.createElement('div');
                itemDiv.className = `${colSize}`;
                
                // Check if item is in current order
                const currentItem = this.currentOrder.items.find(i => i.id === item.id);
                const quantity = currentItem ? currentItem.quantity : 0;
                const isSelected = quantity > 0;
                const isOutOfStock = item.stock <= 0;
                
                itemDiv.innerHTML = `
                    <div class="menu-item-card ${isSelected ? 'selected' : ''} ${isOutOfStock ? 'opacity-50' : ''}" 
                         data-item-id="${item.id}">
                        ${isOutOfStock ? '<span class="badge bg-danger position-absolute top-0 end-0 m-1">Out of Stock</span>' : ''}
                        <div>
                            <div class="menu-item-name">${item.name}</div>
                            <div class="menu-item-price">₹${item.price}</div>
                            ${item.stock !== undefined ? `<small class="text-muted">Stock: ${item.stock}</small>` : ''}
                        </div>
                        <div class="menu-item-quantity">
                            <button class="quantity-btn minus-btn" data-item-id="${item.id}" ${isOutOfStock ? 'disabled' : ''}>
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" class="quantity-input" id="qty-${item.id}" 
                                   value="${quantity}" min="0" data-item-id="${item.id}" ${isOutOfStock ? 'disabled' : ''}>
                            <button class="quantity-btn plus-btn" data-item-id="${item.id}" ${isOutOfStock ? 'disabled' : ''}>
                                <i class="fas fa-plus"></i>
                            </button>
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
    
    // Adjust item quantity
    adjustQuantity(itemId, change) {
        const input = document.getElementById(`qty-${itemId}`);
        if (!input) return;
        
        let currentValue = parseInt(input.value) || 0;
        let newValue = currentValue + change;
        
        if (newValue < 0) newValue = 0;
        
        // Check stock
        const menuItem = this.menu.find(item => item.id === itemId);
        if (menuItem && menuItem.stock !== undefined && newValue > menuItem.stock) {
            newValue = menuItem.stock;
            this.showNotification(`Only ${menuItem.stock} items available in stock!`, 'warning');
        }
        
        input.value = newValue;
        this.setQuantity(itemId, newValue);
    }
    
    // Set item quantity
    setQuantity(itemId, quantity) {
        // Find the item in current order
        const existingItemIndex = this.currentOrder.items.findIndex(item => item.id === itemId);
        
        if (quantity > 0) {
            const menuItem = this.menu.find(item => item.id === itemId);
            
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
        this.updateSummary();
        
        // Update menu item card
        const menuCard = document.querySelector(`.menu-item-card[data-item-id="${itemId}"]`);
        const qtyInput = document.getElementById(`qty-${itemId}`);
        
        if (menuCard && qtyInput) {
            if (quantity > 0) {
                menuCard.classList.add('selected');
                qtyInput.value = quantity;
            } else {
                menuCard.classList.remove('selected');
                qtyInput.value = 0;
            }
        }
    }
    
    // Update selected items table
    updateSelectedItemsTable() {
        const tbody = document.getElementById('selected-items-body');
        
        if (this.currentOrder.items.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        No items selected
                    </td>
                </tr>
            `;
            
            document.getElementById('subtotal').textContent = '₹0';
            document.getElementById('tax-amount').textContent = '₹0';
            document.getElementById('grand-total').textContent = '₹0';
            
            return;
        }
        
        let html = '';
        let subtotal = 0;
        
        this.currentOrder.items.forEach((item, index) => {
            subtotal += item.total;
            html += `
                <tr>
                    <td>${item.name}</td>
                    <td>
                        <div class="input-group input-group-sm" style="width: 100px;">
                            <button class="btn btn-outline-secondary" type="button" 
                                    onclick="restaurantSystem.adjustQuantity(${item.id}, -1)">-</button>
                            <input type="number" class="form-control text-center" 
                                   value="${item.quantity}" min="1" 
                                   onchange="restaurantSystem.setQuantity(${item.id}, this.value)">
                            <button class="btn btn-outline-secondary" type="button" 
                                    onclick="restaurantSystem.adjustQuantity(${item.id}, 1)">+</button>
                        </div>
                    </td>
                    <td>₹${item.price}</td>
                    <td>₹${item.total}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-danger" 
                                onclick="restaurantSystem.setQuantity(${item.id}, 0)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
        const tax = subtotal * 0.05;
        const grandTotal = subtotal + tax;
        
        document.getElementById('subtotal').textContent = `₹${subtotal}`;
        document.getElementById('tax-amount').textContent = `₹${tax.toFixed(2)}`;
        document.getElementById('grand-total').textContent = `₹${grandTotal.toFixed(2)}`;
    }
    
    // Update order summary
    updateSummary() {
        // Update customer info
        document.getElementById('summary-customer').textContent = 
            this.currentOrder.customerName || 'Not specified';
        
        // Update order type
        const typeMap = {
            'dine-in': 'Dine In',
            'takeaway': 'Takeaway',
            'delivery': 'Delivery'
        };
        document.getElementById('summary-type').textContent = typeMap[this.currentOrder.orderType] || 'Dine In';
        
        // Update payment method
        const paymentMap = {
            'cash': 'Cash',
            'card': 'Card',
            'upi': 'UPI'
        };
        document.getElementById('summary-payment').textContent = 
            paymentMap[this.currentOrder.paymentMethod] || 'Cash';
        
        // Update items in summary
        const container = document.getElementById('summary-items');
        let html = '';
        let subtotal = 0;
        
        this.currentOrder.items.forEach(item => {
            subtotal += item.total;
            html += `
                <div class="summary-item">
                    <span>${item.name} x${item.quantity}</span>
                    <span>₹${item.total}</span>
                </div>
            `;
        });
        
        container.innerHTML = html || '<div class="text-muted small">No items selected</div>';
        
        // Update totals
        const tax = subtotal * 0.05;
        const grandTotal = subtotal + tax;
        
        document.getElementById('summary-subtotal').textContent = `₹${subtotal}`;
        document.getElementById('summary-tax').textContent = `₹${tax.toFixed(2)}`;
        document.getElementById('summary-total').textContent = `₹${grandTotal.toFixed(2)}`;
    }
    
    // Update stats
    updateStats() {
        // Today's date
        const today = new Date().toISOString().split('T')[0];
        
        // Filter today's completed orders
        const todayOrders = this.completedOrders.filter(order => 
            order.completedTime && order.completedTime.startsWith(today)
        );
        
        // Calculate stats
        const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
        const todayItems = todayOrders.reduce((sum, order) => 
            sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        
        // Update display
        document.getElementById('today-orders').textContent = todayOrders.length;
        document.getElementById('today-revenue').textContent = `₹${todayRevenue}`;
        document.getElementById('today-items').textContent = todayItems;
    }
    
    // Update badges
    updateBadges() {
        document.getElementById('ongoing-badge').textContent = this.orders.length;
        document.getElementById('completed-badge').textContent = this.completedOrders.length;
        document.getElementById('mobile-ongoing-badge').textContent = this.orders.length;
        document.getElementById('mobile-completed-badge').textContent = this.completedOrders.length;
    }
    
    // Update next order number
    updateNextOrderNumber() {
        document.getElementById('next-order-number').textContent = this.nextOrderId;
    }
    
    // Place new order
    placeOrder() {
        if (this.currentOrder.items.length === 0) {
            this.showNotification('Please add items to the order', 'error');
            return;
        }
        
        // Check stock availability
        for (const item of this.currentOrder.items) {
            const menuItem = this.menu.find(m => m.id === item.id);
            if (menuItem && menuItem.stock < item.quantity) {
                this.showNotification(`Insufficient stock for ${item.name}`, 'error');
                return;
            }
        }
        
        // Calculate totals
        const subtotal = this.currentOrder.items.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.05;
        const grandTotal = subtotal + tax;
        
        // Create order
        const order = {
            id: this.nextOrderId++,
            customerName: this.currentOrder.customerName,
            customerPhone: this.currentOrder.customerPhone,
            orderType: this.currentOrder.orderType,
            paymentMethod: this.currentOrder.paymentMethod,
            items: [...this.currentOrder.items],
            subtotal: subtotal,
            tax: tax,
            total: grandTotal,
            orderTime: new Date().toISOString(),
            status: 'preparing',
            placedBy: 'System'
        };
        
        // Deduct stock
        this.deductStock(order.items);
        
        // Add to orders
        this.orders.unshift(order);
        
        // Save data
        this.saveAllData();
        
        // Clear current order
        this.clearCurrentOrder();
        
        // Update UI
        this.updateBadges();
        this.updateStats();
        this.updateNextOrderNumber();
        
        // Show success message
        this.showNotification(`Order #${order.id} placed successfully!`, 'success');
        
        // Switch to ongoing orders tab
        this.switchTab('ongoing-orders');
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
    
    // Clear current order
    clearCurrentOrder() {
        this.currentOrder = {
            items: [],
            customerName: '',
            customerPhone: '',
            orderType: 'dine-in',
            paymentMethod: 'cash',
            notes: ''
        };
        
        // Reset form
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-phone').value = '';
        document.getElementById('order-type').value = 'dine-in';
        document.getElementById('payment-method').value = 'cash';
        
        // Reset all quantity inputs
        this.menu.forEach(item => {
            const input = document.getElementById(`qty-${item.id}`);
            if (input) input.value = 0;
            
            const menuCard = document.querySelector(`.menu-item-card[data-item-id="${item.id}"]`);
            if (menuCard) menuCard.classList.remove('selected');
        });
        
        // Update UI
        this.updateSelectedItemsTable();
        this.updateSummary();
    }
    
    // Save order template
    saveOrderTemplate() {
        if (this.currentOrder.items.length === 0) {
            this.showNotification('No items to save as template', 'error');
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
        
        this.showNotification(`Template "${templateName}" saved!`, 'success');
    }
    
    // Hold order
    holdOrder() {
        if (this.currentOrder.items.length === 0) {
            this.showNotification('No items to hold', 'error');
            return;
        }
        
        // Create temporary order
        const tempOrder = {
            id: `TEMP_${Date.now()}`,
            ...this.currentOrder,
            orderTime: new Date().toISOString(),
            status: 'hold'
        };
        
        this.orders.unshift(tempOrder);
        this.saveData('orders', this.orders);
        
        this.clearCurrentOrder();
        this.updateBadges();
        
        this.showNotification('Order placed on hold', 'success');
        this.switchTab('ongoing-orders');
    }
    
    // Show category
    showCategory(category) {
        const element = document.querySelector(`#category-${category}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Render ongoing orders
    renderOngoingOrders() {
        const tbody = document.getElementById('ongoing-orders-body');
        const emptyState = document.getElementById('no-ongoing-orders');
        
        if (this.orders.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        let html = '';
        
        this.orders.forEach(order => {
            const orderTime = new Date(order.orderTime);
            const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const itemsText = order.items.slice(0, 2).map(item => `${item.name} (x${item.quantity})`).join(', ');
            const moreItems = order.items.length > 2 ? ` +${order.items.length - 2} more` : '';
            
            html += `
                <tr>
                    <td><strong>#${order.id}</strong></td>
                    <td>${orderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>${order.customerName || 'Walk-in'}</td>
                    <td>${itemsText}${moreItems}</td>
                    <td>₹${order.total.toFixed(2)}</td>
                    <td>
                        <span class="status-badge status-${order.status}">
                            ${order.status}
                        </span>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary view-order-btn" data-order-id="${order.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-success complete-order-btn" data-order-id="${order.id}">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-outline-danger delete-order-btn" data-order-id="${order.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
        // Add event listeners
        document.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.currentTarget.getAttribute('data-order-id');
                this.viewOrderDetails(orderId);
            });
        });
        
        document.querySelectorAll('.complete-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.currentTarget.getAttribute('data-order-id');
                this.completeOrder(orderId);
            });
        });
        
        document.querySelectorAll('.delete-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = e.currentTarget.getAttribute('data-order-id');
                this.deleteOrder(orderId);
            });
        });
    }
    
    // View order details
    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id == orderId) || 
                     this.completedOrders.find(o => o.id == orderId);
        
        if (!order) return;
        
        // Populate modal
        document.getElementById('modal-order-no').textContent = order.id;
        document.getElementById('modal-customer').textContent = order.customerName || 'Walk-in';
        document.getElementById('modal-phone').textContent = order.customerPhone || 'N/A';
        document.getElementById('modal-order-time').textContent = new Date(order.orderTime).toLocaleString();
        document.getElementById('modal-order-type').textContent = order.orderType;
        
        // Populate items
        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price}</td>
                    <td>₹${item.total}</td>
                </tr>
            `;
        });
        
        document.getElementById('modal-items-body').innerHTML = itemsHtml;
        document.getElementById('modal-total').textContent = order.total.toFixed(2);
        
        // Set order id on complete button
        const completeBtn = document.getElementById('complete-order-btn');
        completeBtn.setAttribute('data-order-id', order.id);
        
        // Show/hide complete button based on order status
        if (order.status === 'completed') {
            completeBtn.style.display = 'none';
        } else {
            completeBtn.style.display = 'inline-block';
        }
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        modal.show();
    }
    
    // Complete order
    completeOrder(orderId) {
        const orderIndex = this.orders.findIndex(o => o.id == orderId);
        if (orderIndex === -1) return;
        
        // Remove from ongoing orders
        const [completedOrder] = this.orders.splice(orderIndex, 1);
        
        // Update order details
        completedOrder.status = 'completed';
        completedOrder.completedTime = new Date().toISOString();
        completedOrder.completedBy = 'System';
        
        // Add to completed orders
        this.completedOrders.unshift(completedOrder);
        
        // Save data
        this.saveAllData();
        
        // Update UI
        this.renderOngoingOrders();
        this.renderCompletedOrders();
        this.updateBadges();
        this.updateStats();
        
        // Show success
        this.showNotification(`Order #${orderId} completed!`, 'success');
        
        // Close modal if open
        const modal = bootstrap.Modal.getInstance(document.getElementById('orderDetailsModal'));
        if (modal) modal.hide();
    }
    
    // Delete order
    deleteOrder(orderId) {
        if (!confirm('Are you sure you want to delete this order?')) {
            return;
        }
        
        const orderIndex = this.orders.findIndex(o => o.id == orderId);
        if (orderIndex === -1) return;
        
        // Restore stock if needed
        const order = this.orders[orderIndex];
        this.restoreStock(order.items);
        
        // Remove order
        this.orders.splice(orderIndex, 1);
        
        // Save data
        this.saveAllData();
        
        // Update UI
        this.renderOngoingOrders();
        this.updateBadges();
        
        this.showNotification(`Order #${orderId} deleted`, 'success');
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
    
    // Print all orders
    printAllOrders() {
        window.print();
    }
    
    // Render completed orders
    renderCompletedOrders() {
        const tbody = document.getElementById('completed-orders-body');
        const emptyState = document.getElementById('no-completed-orders');
        const dateFilter = document.getElementById('date-filter').value;
        
        // Filter orders
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
            this.updateSalesSummary([]);
            return;
        }
        
        emptyState.style.display = 'none';
        let html = '';
        
        filteredOrders.forEach(order => {
            const orderTime = new Date(order.orderTime);
            const completedTime = new Date(order.completedTime);
            const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            
            html += `
                <tr>
                    <td><strong>#${order.id}</strong></td>
                    <td>${orderTime.toLocaleDateString()}</td>
                    <td>${order.customerName || 'Walk-in'}</td>
                    <td>${itemsCount} items</td>
                    <td>₹${order.total.toFixed(2)}</td>
                    <td>${completedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
        // Update sales summary
        this.updateSalesSummary(filteredOrders);
    }
    
    // Update sales summary
    updateSalesSummary(orders) {
        // Calculate totals
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = orders.length;
        
        document.getElementById('total-revenue').textContent = `₹${totalRevenue.toFixed(2)}`;
        document.getElementById('total-orders').textContent = totalOrders;
        
        // Calculate item-wise sales
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
        
        // Update top items table
        const topItems = Object.entries(itemSales)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 5);
        
        let topItemsHtml = '';
        topItems.forEach(([itemName, data]) => {
            topItemsHtml += `
                <tr>
                    <td>${itemName}</td>
                    <td>${data.quantity}</td>
                    <td>₹${data.revenue.toFixed(2)}</td>
                </tr>
            `;
        });
        
        document.getElementById('top-items-body').innerHTML = topItemsHtml || 
            '<tr><td colspan="3" class="text-center text-muted">No data</td></tr>';
        
        // Update sales chart
        this.updateSalesChart(topItems);
    }
    
    // Update sales chart
    updateSalesChart(topItems) {
        const ctx = document.getElementById('salesChart').getContext('2d');
        
        // Destroy existing chart
        if (this.salesChart) {
            this.salesChart.destroy();
        }
        
        // Prepare data
        const labels = topItems.map(item => item[0]);
        const quantities = topItems.map(item => item[1].quantity);
        const revenues = topItems.map(item => item[1].revenue);
        
        // Create chart
        this.salesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Quantity Sold',
                        data: quantities,
                        backgroundColor: 'rgba(255, 107, 53, 0.7)',
                        borderColor: 'rgba(255, 107, 53, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Revenue (₹)',
                        data: revenues,
                        backgroundColor: 'rgba(41, 128, 185, 0.7)',
                        borderColor: 'rgba(41, 128, 185, 1)',
                        borderWidth: 1,
                        yAxisID: 'y1',
                        type: 'line'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Quantity'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Revenue (₹)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }
    
    // Download PDF report
    downloadPDFReport() {
        if (this.completedOrders.length === 0) {
            this.showNotification('No completed orders to generate report', 'error');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text('Restaurant Sales Report', 105, 20, { align: 'center' });
        
        // Add date
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
        
        // Add summary
        const totalRevenue = this.completedOrders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = this.completedOrders.length;
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Summary', 20, 45);
        
        doc.setFontSize(11);
        doc.text(`Total Orders: ${totalOrders}`, 20, 55);
        doc.text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`, 20, 62);
        
        // Calculate item-wise sales
        const itemSales = {};
        this.completedOrders.forEach(order => {
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
        
        // Prepare table data
        const tableData = Object.entries(itemSales).map(([itemName, data], index) => [
            index + 1,
            itemName,
            data.quantity,
            `₹${data.revenue.toFixed(2)}`
        ]);
        
        // Add item-wise sales table
        doc.autoTable({
            head: [['#', 'Item Name', 'Quantity', 'Revenue']],
            body: tableData,
            startY: 70,
            theme: 'grid',
            headStyles: { fillColor: [255, 107, 53] }
        });
        
        // Save PDF
        doc.save(`sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
        
        this.showNotification('PDF report downloaded!', 'success');
    }
    
    // Clear completed orders
    clearCompletedOrders() {
        if (this.completedOrders.length === 0) {
            this.showNotification('No completed orders to clear', 'error');
            return;
        }
        
        if (confirm('Are you sure you want to clear all completed orders? This action cannot be undone.')) {
            this.completedOrders = [];
            this.saveData('completedOrders', this.completedOrders);
            this.renderCompletedOrders();
            this.updateBadges();
            this.showNotification('All completed orders cleared', 'success');
        }
    }
    
    // Render menu management
    renderMenuManagement() {
        const tbody = document.getElementById('menu-management-body');
        const categorySelect = document.getElementById('item-category');
        
        // Update category dropdown
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
        
        // Group items by category
        const categories = {};
        this.menu.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });
        
        let html = '';
        
        // Render each category
        this.categories.forEach(category => {
            // Category header
            html += `
                <tr class="table-secondary">
                    <td colspan="5" class="fw-bold">
                        ${category}
                        <button class="btn btn-sm btn-outline-danger float-end delete-category-btn" 
                                data-category="${category}">
                            <i class="fas fa-trash"></i> Delete Category
                        </button>
                    </td>
                </tr>
            `;
            
            // Category items
            const items = categories[category] || [];
            items.forEach((item, index) => {
                html += `
                    <tr>
                        <td></td>
                        <td>${item.name}</td>
                        <td>₹${item.price}</td>
                        <td>${item.stock}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary edit-item-btn" 
                                    data-item-id="${item.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-item-btn" 
                                    data-item-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        });
        
        tbody.innerHTML = html;
        
        // Add event listeners
        document.querySelectorAll('.edit-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.currentTarget.getAttribute('data-item-id'));
                this.editMenuItem(itemId);
            });
        });
        
        document.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.currentTarget.getAttribute('data-item-id'));
                this.deleteMenuItem(itemId);
            });
        });
        
        document.querySelectorAll('.delete-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.getAttribute('data-category');
                this.deleteCategory(category);
            });
        });
    }
    
    // Edit menu item
    editMenuItem(itemId) {
        const item = this.menu.find(i => i.id === itemId);
        if (!item) return;
        
        // Populate form
        document.getElementById('item-category').value = item.category;
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-price').value = item.price;
        document.getElementById('item-cost').value = item.cost || '';
        document.getElementById('item-stock').value = item.stock || 0;
        document.getElementById('item-status').value = item.status || 'available';
        document.getElementById('edit-item-id').value = item.id;
        
        // Scroll to form
        document.getElementById('item-name').focus();
    }
    
    // Save menu item
    saveMenuItem() {
        const category = document.getElementById('item-category').value;
        const name = document.getElementById('item-name').value.trim();
        const price = parseInt(document.getElementById('item-price').value);
        const cost = parseInt(document.getElementById('item-cost').value) || 0;
        const stock = parseInt(document.getElementById('item-stock').value) || 0;
        const status = document.getElementById('item-status').value;
        const editItemId = document.getElementById('edit-item-id').value;
        
        if (!category || !name || !price || price <= 0) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (editItemId) {
            // Update existing item
            const itemId = parseInt(editItemId);
            const itemIndex = this.menu.findIndex(i => i.id === itemId);
            
            if (itemIndex !== -1) {
                this.menu[itemIndex].category = category;
                this.menu[itemIndex].name = name;
                this.menu[itemIndex].price = price;
                this.menu[itemIndex].cost = cost;
                this.menu[itemIndex].stock = stock;
                this.menu[itemIndex].status = status;
            }
        } else {
            // Add new item
            const newId = Math.max(...this.menu.map(i => i.id)) + 1;
            this.menu.push({
                id: newId,
                category: category,
                name: name,
                price: price,
                cost: cost,
                stock: stock,
                status: status
            });
        }
        
        // Save data
        this.saveData('menu', this.menu);
        
        // Reset form
        this.cancelEditMenuItem();
        
        // Update UI
        this.renderMenu();
        this.renderMenuManagement();
        
        this.showNotification('Menu item saved successfully!', 'success');
    }
    
    // Cancel edit menu item
    cancelEditMenuItem() {
        document.getElementById('menu-item-form').reset();
        document.getElementById('edit-item-id').value = '';
        document.getElementById('item-status').value = 'available';
    }
    
    // Delete menu item
    deleteMenuItem(itemId) {
        if (!confirm('Are you sure you want to delete this menu item?')) {
            return;
        }
        
        const itemIndex = this.menu.findIndex(i => i.id === itemId);
        if (itemIndex !== -1) {
            this.menu.splice(itemIndex, 1);
            this.saveData('menu', this.menu);
            
            this.renderMenu();
            this.renderMenuManagement();
            
            this.showNotification('Menu item deleted', 'success');
        }
    }
    
    // Show new category input
    showNewCategoryInput() {
        document.getElementById('new-category-input').style.display = 'block';
        document.getElementById('new-category-name').focus();
    }
    
    // Hide new category input
    hideNewCategoryInput() {
        document.getElementById('new-category-input').style.display = 'none';
        document.getElementById('new-category-name').value = '';
    }
    
    // Save new category
    saveNewCategory() {
        const categoryName = document.getElementById('new-category-name').value.trim().toUpperCase();
        
        if (!categoryName) {
            this.showNotification('Please enter a category name', 'error');
            return;
        }
        
        if (this.categories.includes(categoryName)) {
            this.showNotification('Category already exists', 'error');
            return;
        }
        
        // Add category
        this.categories.push(categoryName);
        this.saveData('categories', this.categories);
        
        // Update UI
        this.hideNewCategoryInput();
        this.renderMenuManagement();
        
        // Set as selected in dropdown
        document.getElementById('item-category').value = categoryName;
        
        this.showNotification(`Category "${categoryName}" added`, 'success');
    }
    
    // Delete category
    deleteCategory(category) {
        if (!confirm(`Delete category "${category}"? This will also delete all items in this category.`)) {
            return;
        }
        
        // Remove items in this category
        this.menu = this.menu.filter(item => item.category !== category);
        
        // Remove category
        this.categories = this.categories.filter(c => c !== category);
        
        // Save data
        this.saveData('menu', this.menu);
        this.saveData('categories', this.categories);
        
        // Update UI
        this.renderMenu();
        this.renderMenuManagement();
        
        this.showNotification(`Category "${category}" deleted`, 'success');
    }
    
    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 80px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Initialize the system when page loads
let restaurantSystem;

document.addEventListener('DOMContentLoaded', () => {
    restaurantSystem = new RestaurantOrderSystem();
    
    // Make system globally available for inline event handlers
    window.restaurantSystem = restaurantSystem;
    
    // Handle back button/forward button
    window.addEventListener('popstate', () => {
        // Handle tab switching based on URL hash if needed
    });
    
    // Prevent form submission on enter
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    });
});
