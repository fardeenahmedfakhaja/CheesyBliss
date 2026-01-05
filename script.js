// Restaurant Order Management System (Simplified)
class RestaurantOrderSystem {
    constructor() {
        // Initialize data
        this.menu = this.loadData('menu') || this.getDefaultMenu();
        this.categories = this.loadData('categories') || this.getDefaultCategories();
        this.orders = this.loadData('orders') || [];
        this.completedOrders = this.loadData('completedOrders') || [];
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
        
        // Chart instances
        this.revenueProfitChart = null;
        this.categoryRevenueChart = null;
        this.categoryProfitChart = null;
        this.topItemsRevenueChart = null;
        this.categoryItemCharts = {};
        
        // Initialize
        this.init();
    }
    
    // Default menu items with cost
    getDefaultMenu() {
        return [
            // APPETIZERS
            { id: 1, category: 'APPETIZERS', name: 'Chicken loaded fries', price: 140, cost: 70 },
            { id: 2, category: 'APPETIZERS', name: 'Cheesy veg loaded fries', price: 125, cost: 60 },
            { id: 3, category: 'APPETIZERS', name: 'Salted fries', price: 99, cost: 40 },
            { id: 4, category: 'APPETIZERS', name: 'Peri peri fries', price: 109, cost: 45 },
            { id: 5, category: 'APPETIZERS', name: 'Chicken Nuggets (4 pcs)', price: 75, cost: 35 },
            { id: 6, category: 'APPETIZERS', name: 'Chicken Nuggets (6 pcs)', price: 99, cost: 50 },
            
            // WRAPS
            { id: 7, category: 'WRAPS', name: 'Chicken tikka wrap', price: 130, cost: 60 },
            { id: 8, category: 'WRAPS', name: 'Paneer tikka wrap', price: 120, cost: 55 },
            { id: 9, category: 'WRAPS', name: 'Chicken zinger wrap', price: 150, cost: 70 },
            { id: 10, category: 'WRAPS', name: 'Chicken nugget wrap', price: 120, cost: 55 },
            
            // BURGERS
            { id: 11, category: 'BURGERS', name: 'Classic Veg burger', price: 115, cost: 50 },
            { id: 12, category: 'BURGERS', name: 'Chicken Bliss burger', price: 135, cost: 60 },
            
            // SALADS
            { id: 13, category: 'SALADS', name: 'Veg salad', price: 99, cost: 40 },
            { id: 14, category: 'SALADS', name: 'Signature chicken salad', price: 130, cost: 55 },
            
            // DESSERTS
            { id: 15, category: 'DESSERTS', name: 'Chocolate brownie', price: 90, cost: 35 },
            { id: 16, category: 'DESSERTS', name: 'Red velvet brownie', price: 90, cost: 35 },
            { id: 17, category: 'DESSERTS', name: 'Lotus biscoff drip brownie', price: 130, cost: 50 },
            { id: 18, category: 'DESSERTS', name: 'Strawberry choco brownie', price: 110, cost: 45 },
            { id: 19, category: 'DESSERTS', name: 'Chocolate strawberry cup', price: 120, cost: 50 }
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
    
    // Local storage methods
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving data:', e);
            this.showNotification('Error saving data!', 'error');
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
    }
    
    // Save all data
    saveAllData() {
        this.saveData('menu', this.menu);
        this.saveData('categories', this.categories);
        this.saveData('orders', this.orders);
        this.saveData('completedOrders', this.completedOrders);
        this.saveData('nextOrderId', this.nextOrderId);
    }
    
    // Initialize event listeners
    initEventListeners() {
        // Tab navigation - only for nav links now
        document.querySelectorAll('.nav-link').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = element.getAttribute('data-tab');
                this.switchTab(tabId);
                
                // Close navbar on mobile after clicking
                if (window.innerWidth <= 991) {
                    const navbarCollapse = document.getElementById('navbarNav');
                    if (navbarCollapse.classList.contains('show')) {
                        const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                            toggle: false
                        });
                        bsCollapse.hide();
                    }
                }
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
        
        // Analytics period filter
        document.getElementById('analytics-period').addEventListener('change', () => this.updateAnalytics());
        
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
    }
    
    // Switch between tabs
    switchTab(tabId) {
        // Update active tab in nav
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
        } else if (tabId === 'analytics') {
            this.updateAnalytics();
        }
    }
    
    // Render menu items - WITHOUT cost/profit text
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
                
                itemDiv.innerHTML = `
                    <div class="menu-item-card ${isSelected ? 'selected' : ''}" 
                         data-item-id="${item.id}">
                        <div>
                            <div class="menu-item-name">${item.name}</div>
                            <div class="menu-item-price">₹${item.price}</div>
                        </div>
                        <div class="menu-item-quantity">
                            <button class="quantity-btn minus-btn" data-item-id="${item.id}">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" class="quantity-input" id="qty-${item.id}" 
                                   value="${quantity}" min="0" data-item-id="${item.id}">
                            <button class="quantity-btn plus-btn" data-item-id="${item.id}">
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
                
                minusBtn.addEventListener('click', () => this.adjustQuantity(item.id, -1));
                plusBtn.addEventListener('click', () => this.adjustQuantity(item.id, 1));
                qtyInput.addEventListener('change', (e) => this.setQuantity(item.id, parseInt(e.target.value) || 0));
                qtyInput.addEventListener('input', (e) => this.setQuantity(item.id, parseInt(e.target.value) || 0));
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
                this.currentOrder.items[existingItemIndex].totalCost = quantity * menuItem.cost;
                this.currentOrder.items[existingItemIndex].profit = quantity * (menuItem.price - menuItem.cost);
            } else {
                // Add new item
                this.currentOrder.items.push({
                    id: itemId,
                    name: menuItem.name,
                    price: menuItem.price,
                    cost: menuItem.cost,
                    quantity: quantity,
                    total: quantity * menuItem.price,
                    totalCost: quantity * menuItem.cost,
                    profit: quantity * (menuItem.price - menuItem.cost)
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
            
            document.getElementById('grand-total').textContent = '₹0';
            
            return;
        }
        
        let html = '';
        let total = 0;
        let totalCost = 0;
        let totalProfit = 0;
        
        this.currentOrder.items.forEach((item, index) => {
            total += item.total;
            totalCost += item.totalCost || (item.quantity * item.cost);
            totalProfit += item.profit || (item.quantity * (item.price - item.cost));
            
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
        
        document.getElementById('grand-total').textContent = `₹${total}`;
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
        let total = 0;
        let totalProfit = 0;
        
        this.currentOrder.items.forEach(item => {
            total += item.total;
            totalProfit += item.profit || (item.quantity * (item.price - item.cost));
            
            html += `
                <div class="summary-item">
                    <span>${item.name} x${item.quantity}</span>
                    <span>₹${item.total}</span>
                </div>
            `;
        });
        
        container.innerHTML = html || '<div class="text-muted small">No items selected</div>';
        
        // Update total
        document.getElementById('summary-total').textContent = `₹${total}`;
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
        const todayCost = todayOrders.reduce((sum, order) => sum + (order.totalCost || 0), 0);
        const todayProfit = todayRevenue - todayCost;
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
        
        // Calculate totals
        const total = this.currentOrder.items.reduce((sum, item) => sum + item.total, 0);
        const totalCost = this.currentOrder.items.reduce((sum, item) => 
            sum + (item.totalCost || (item.quantity * item.cost)), 0);
        const totalProfit = total - totalCost;
        
        // Create order
        const order = {
            id: this.nextOrderId++,
            customerName: this.currentOrder.customerName,
            customerPhone: this.currentOrder.customerPhone,
            orderType: this.currentOrder.orderType,
            paymentMethod: this.currentOrder.paymentMethod,
            items: [...this.currentOrder.items],
            total: total,
            totalCost: totalCost,
            totalProfit: totalProfit,
            orderTime: new Date().toISOString(),
            status: 'preparing',
            placedBy: 'System'
        };
        
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
    
    // Show category
    showCategory(category) {
        const element = document.querySelector(`#category-${category}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Render ongoing orders with side-by-side buttons
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
                    <td>
                        <button class="btn btn-sm btn-danger delete-order-btn" data-order-id="${order.id}" title="Delete Order">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                    <td><strong>#${order.id}</strong></td>
                    <td>${orderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>${order.customerName || 'Walk-in'}</td>
                    <td>${itemsText}${moreItems}</td>
                    <td>₹${order.total}</td>
                    <td>
                        <span class="status-badge status-${order.status}">
                            ${order.status}
                        </span>
                    </td>
                    <td>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary view-order-btn" data-order-id="${order.id}" title="View Order">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-success complete-order-btn" data-order-id="${order.id}" title="Complete Order">
                                <i class="fas fa-check me-1"></i> Complete
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
        document.getElementById('modal-total').textContent = order.total;
        
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
        
        // Update analytics if on analytics tab
        const currentTab = document.querySelector('.tab-content.active').id;
        if (currentTab === 'analytics') {
            this.updateAnalytics();
        }
        
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
        
        // Remove order
        this.orders.splice(orderIndex, 1);
        
        // Save data
        this.saveAllData();
        
        // Update UI
        this.renderOngoingOrders();
        this.updateBadges();
        
        this.showNotification(`Order #${orderId} deleted`, 'success');
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
            const profit = order.totalProfit || (order.total - (order.totalCost || 0));
            const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
            
            html += `
                <tr>
                    <td><strong>#${order.id}</strong></td>
                    <td>${orderTime.toLocaleDateString()}</td>
                    <td>${order.customerName || 'Walk-in'}</td>
                    <td>${itemsCount} items</td>
                    <td>₹${order.total}</td>
                    <td class="${profitClass}">₹${profit}</td>
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
        const totalCost = orders.reduce((sum, order) => sum + (order.totalCost || 0), 0);
        const totalProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;
        const totalOrders = orders.length;
        
        document.getElementById('total-revenue').textContent = `₹${totalRevenue}`;
        document.getElementById('total-orders').textContent = totalOrders;
        document.getElementById('total-profit').textContent = `₹${totalProfit}`;
        document.getElementById('profit-margin').textContent = `${profitMargin}%`;
        
        // Calculate item-wise sales
        const itemSales = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!itemSales[item.name]) {
                    itemSales[item.name] = {
                        quantity: 0,
                        revenue: 0,
                        cost: 0,
                        profit: 0
                    };
                }
                const itemCost = item.cost || 0;
                const itemProfit = (item.price - itemCost) * item.quantity;
                
                itemSales[item.name].quantity += item.quantity;
                itemSales[item.name].revenue += item.total;
                itemSales[item.name].cost += itemCost * item.quantity;
                itemSales[item.name].profit += itemProfit;
            });
        });
        
        // Update top items table
        const topItems = Object.entries(itemSales)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 10);
        
        let topItemsHtml = '';
        topItems.forEach(([itemName, data]) => {
            const margin = data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : 0;
            const profitClass = data.profit >= 0 ? 'profit-positive' : 'profit-negative';
            topItemsHtml += `
                <tr>
                    <td>${itemName}</td>
                    <td>${data.quantity}</td>
                    <td>₹${data.revenue}</td>
                    <td class="${profitClass}">₹${data.profit}</td>
                    <td>${margin}%</td>
                </tr>
            `;
        });
        
        document.getElementById('top-items-body').innerHTML = topItemsHtml || 
            '<tr><td colspan="5" class="text-center text-muted">No data</td></tr>';
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
        const totalCost = this.completedOrders.reduce((sum, order) => sum + (order.totalCost || 0), 0);
        const totalProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0;
        const totalOrders = this.completedOrders.length;
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Summary', 20, 45);
        
        doc.setFontSize(11);
        doc.text(`Total Orders: ${totalOrders}`, 20, 55);
        doc.text(`Total Revenue: ₹${totalRevenue}`, 20, 62);
        doc.text(`Total Cost: ₹${totalCost}`, 20, 69);
        doc.text(`Total Profit: ₹${totalProfit}`, 20, 76);
        doc.text(`Profit Margin: ${profitMargin}%`, 20, 83);
        
        // Calculate item-wise sales
        const itemSales = {};
        this.completedOrders.forEach(order => {
            order.items.forEach(item => {
                if (!itemSales[item.name]) {
                    itemSales[item.name] = {
                        quantity: 0,
                        revenue: 0,
                        cost: 0,
                        profit: 0
                    };
                }
                const itemCost = item.cost || 0;
                const itemProfit = (item.price - itemCost) * item.quantity;
                
                itemSales[item.name].quantity += item.quantity;
                itemSales[item.name].revenue += item.total;
                itemSales[item.name].cost += itemCost * item.quantity;
                itemSales[item.name].profit += itemProfit;
            });
        });
        
        // Prepare table data for item-wise sales with profit
        const tableData = Object.entries(itemSales).map(([itemName, data], index) => {
            const margin = data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : 0;
            return [
                index + 1,
                itemName,
                data.quantity,
                `₹${data.revenue}`,
                `₹${data.cost}`,
                `₹${data.profit}`,
                `${margin}%`
            ];
        });
        
        // Add item-wise sales table with profit
        doc.autoTable({
            head: [['#', 'Item Name', 'Qty', 'Revenue', 'Cost', 'Profit', 'Margin']],
            body: tableData,
            startY: 90,
            theme: 'grid',
            headStyles: { fillColor: [255, 107, 53] }
        });
        
        // Add recent orders table
        const recentOrders = this.completedOrders.slice(0, 10);
        const recentOrdersData = recentOrders.map((order, index) => {
            const profit = order.totalProfit || (order.total - (order.totalCost || 0));
            const margin = order.total > 0 ? ((profit / order.total) * 100).toFixed(1) : 0;
            return [
                order.id,
                new Date(order.orderTime).toLocaleDateString(),
                order.items.reduce((sum, item) => sum + item.quantity, 0),
                `₹${order.total}`,
                `₹${profit}`,
                `${margin}%`
            ];
        });
        
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Recent Orders with Profit', 20, 20);
        
        doc.autoTable({
            head: [['Order #', 'Date', 'Items', 'Total', 'Profit', 'Margin']],
            body: recentOrdersData,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }
        });
        
        // Add profit trend analysis
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Profit Analysis by Category', 20, 20);
        
        // Calculate profit by category
        const categoryProfit = {};
        this.completedOrders.forEach(order => {
            order.items.forEach(item => {
                const menuItem = this.menu.find(m => m.id === item.id);
                if (menuItem) {
                    const category = menuItem.category;
                    if (!categoryProfit[category]) {
                        categoryProfit[category] = {
                            revenue: 0,
                            cost: 0,
                            profit: 0,
                            items: 0
                        };
                    }
                    const itemProfit = (item.price - (item.cost || menuItem.cost || 0)) * item.quantity;
                    
                    categoryProfit[category].revenue += item.total;
                    categoryProfit[category].cost += (item.cost || menuItem.cost || 0) * item.quantity;
                    categoryProfit[category].profit += itemProfit;
                    categoryProfit[category].items += item.quantity;
                }
            });
        });
        
        const categoryData = Object.entries(categoryProfit).map(([category, data], index) => {
            const margin = data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : 0;
            return [
                index + 1,
                category,
                data.items,
                `₹${data.revenue}`,
                `₹${data.cost}`,
                `₹${data.profit}`,
                `${margin}%`
            ];
        });
        
        doc.autoTable({
            head: [['#', 'Category', 'Items', 'Revenue', 'Cost', 'Profit', 'Margin']],
            body: categoryData,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [102, 51, 153] }
        });
        
        // Save PDF
        doc.save(`sales-profit-report-${new Date().toISOString().split('T')[0]}.pdf`);
        
        this.showNotification('PDF report with profit analysis downloaded!', 'success');
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
    
    // Update analytics
    updateAnalytics() {
        const period = document.getElementById('analytics-period').value;
        let filteredOrders = this.completedOrders;
        
        // Filter orders based on period
        const now = new Date();
        switch(period) {
            case 'today':
                const today = now.toISOString().split('T')[0];
                filteredOrders = this.completedOrders.filter(order => 
                    order.completedTime && order.completedTime.startsWith(today)
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
        
        this.renderAnalyticsCharts(filteredOrders);
        this.updateAnalyticsSummary(filteredOrders);
        this.renderBestItems(filteredOrders);
        this.renderCategoryPerformance(filteredOrders);
        this.renderCategoryItemCharts(filteredOrders);
    }
    
    // Render new analytics charts with improved colors
    renderAnalyticsCharts(orders) {
        // Destroy existing charts if they exist
        if (this.revenueProfitChart) {
            this.revenueProfitChart.destroy();
        }
        if (this.categoryRevenueChart) {
            this.categoryRevenueChart.destroy();
        }
        if (this.categoryProfitChart) {
            this.categoryProfitChart.destroy();
        }
        if (this.topItemsRevenueChart) {
            this.topItemsRevenueChart.destroy();
        }
        
        // Calculate category-wise data
        const categoryData = this.calculateCategoryData(orders);
        const categories = Object.keys(categoryData);
        
        // Prepare data for charts
        const categoryRevenueData = categories.map(cat => categoryData[cat].revenue);
        const categoryProfitData = categories.map(cat => categoryData[cat].profit);
        
        // Calculate item-wise data for top items
        const itemData = this.calculateItemData(orders);
        const topItems = Object.entries(itemData)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 8);
        
        const topItemNames = topItems.map(([name]) => name);
        const topItemRevenue = topItems.map(([, data]) => data.revenue);
        const topItemProfit = topItems.map(([, data]) => data.profit);
        
        // Enhanced color palette with solid appealing colors
        const colors = {
            revenue: '#3498db', // Bright Blue
            profit: '#2ecc71', // Bright Green
            categoryColors: [
                '#e74c3c', // Red
                '#3498db', // Blue
                '#f39c12', // Orange
                '#2ecc71', // Green
                '#9b59b6', // Purple
                '#1abc9c', // Teal
                '#d35400', // Dark Orange
                '#34495e'  // Dark Blue
            ],
            lightColors: [
                'rgba(231, 76, 60, 0.8)',
                'rgba(52, 152, 219, 0.8)',
                'rgba(243, 156, 18, 0.8)',
                'rgba(46, 204, 113, 0.8)',
                'rgba(155, 89, 182, 0.8)',
                'rgba(26, 188, 156, 0.8)',
                'rgba(211, 84, 0, 0.8)',
                'rgba(52, 73, 94, 0.8)'
            ]
        };
        
        // 1. Revenue vs Profit Chart (Overall)
        const revenueProfitCtx = document.getElementById('revenueProfitChart').getContext('2d');
        this.revenueProfitChart = new Chart(revenueProfitCtx, {
            type: 'bar',
            data: {
                labels: ['Revenue', 'Profit'],
                datasets: [{
                    label: 'Amount (₹)',
                    data: [
                        orders.reduce((sum, order) => sum + order.total, 0),
                        orders.reduce((sum, order) => sum + (order.totalProfit || (order.total - (order.totalCost || 0))), 0)
                    ],
                    backgroundColor: [colors.revenue, colors.profit],
                    borderColor: [colors.revenue, colors.profit],
                    borderWidth: 2,
                    borderRadius: 6,
                    hoverBackgroundColor: ['#2980b9', '#27ae60']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Overall Revenue vs Profit',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: '#2c3e50'
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(44, 62, 80, 0.9)',
                        titleColor: '#ecf0f1',
                        bodyColor: '#ecf0f1',
                        callbacks: {
                            label: function(context) {
                                return `₹${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            },
                            font: {
                                weight: 'bold'
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
        // 2. Category-wise Revenue Chart
        const categoryRevenueCtx = document.getElementById('categoryRevenueChart').getContext('2d');
        this.categoryRevenueChart = new Chart(categoryRevenueCtx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: categoryRevenueData,
                    backgroundColor: colors.lightColors.slice(0, categories.length),
                    borderColor: colors.categoryColors.slice(0, categories.length),
                    borderWidth: 2,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    title: {
                        display: true,
                        text: 'Revenue by Category',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: '#2c3e50'
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 15,
                            font: {
                                size: 11,
                                weight: 'bold'
                            },
                            color: '#2c3e50'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(44, 62, 80, 0.9)',
                        titleColor: '#ecf0f1',
                        bodyColor: '#ecf0f1',
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        // 3. Category-wise Profit Chart
        const categoryProfitCtx = document.getElementById('categoryProfitChart').getContext('2d');
        this.categoryProfitChart = new Chart(categoryProfitCtx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Profit (₹)',
                    data: categoryProfitData,
                    backgroundColor: colors.lightColors.slice(0, categories.length),
                    borderColor: colors.categoryColors.slice(0, categories.length),
                    borderWidth: 2,
                    borderRadius: 6,
                    hoverBackgroundColor: colors.categoryColors.slice(0, categories.length)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Profit by Category',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: '#2c3e50'
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(44, 62, 80, 0.9)',
                        titleColor: '#ecf0f1',
                        bodyColor: '#ecf0f1',
                        callbacks: {
                            label: function(context) {
                                return `₹${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            },
                            font: {
                                weight: 'bold'
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
        // 4. Top Items Revenue Chart
        const topItemsCtx = document.getElementById('topItemsRevenueChart').getContext('2d');
        this.topItemsRevenueChart = new Chart(topItemsCtx, {
            type: 'bar',
            data: {
                labels: topItemNames.map(name => name.length > 15 ? name.substring(0, 15) + '...' : name),
                datasets: [
                    {
                        label: 'Revenue',
                        data: topItemRevenue,
                        backgroundColor: colors.revenue,
                        borderColor: colors.revenue,
                        borderWidth: 2,
                        borderRadius: 4,
                        hoverBackgroundColor: '#2980b9'
                    },
                    {
                        label: 'Profit',
                        data: topItemProfit,
                        backgroundColor: colors.profit,
                        borderColor: colors.profit,
                        borderWidth: 2,
                        borderRadius: 4,
                        hoverBackgroundColor: '#27ae60'
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Top Items - Revenue vs Profit',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: '#2c3e50'
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                weight: 'bold'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(44, 62, 80, 0.9)',
                        titleColor: '#ecf0f1',
                        bodyColor: '#ecf0f1',
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ₹${context.parsed.x.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            },
                            font: {
                                weight: 'bold'
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Render category item charts
    renderCategoryItemCharts(orders) {
        // Category-specific charts
        const categories = ['APPETIZERS', 'WRAPS', 'BURGERS', 'DESSERTS'];
        
        categories.forEach(category => {
            // Destroy existing chart if it exists
            if (this.categoryItemCharts[category]) {
                this.categoryItemCharts[category].destroy();
            }
            
            // Get items for this category
            const categoryItems = this.menu.filter(item => item.category === category);
            
            // Calculate sales data for each item
            const itemSales = {};
            categoryItems.forEach(item => {
                itemSales[item.name] = {
                    revenue: 0,
                    profit: 0,
                    quantity: 0
                };
            });
            
            // Calculate totals from orders
            orders.forEach(order => {
                order.items.forEach(orderItem => {
                    const menuItem = this.menu.find(m => m.id === orderItem.id);
                    if (menuItem && menuItem.category === category) {
                        if (!itemSales[menuItem.name]) {
                            itemSales[menuItem.name] = {
                                revenue: 0,
                                profit: 0,
                                quantity: 0
                            };
                        }
                        
                        const itemRevenue = orderItem.price * orderItem.quantity;
                        const itemCost = (orderItem.cost || menuItem.cost || 0) * orderItem.quantity;
                        const itemProfit = itemRevenue - itemCost;
                        
                        itemSales[menuItem.name].revenue += itemRevenue;
                        itemSales[menuItem.name].profit += itemProfit;
                        itemSales[menuItem.name].quantity += orderItem.quantity;
                    }
                });
            });
            
            // Sort items by revenue and take top 5
            const sortedItems = Object.entries(itemSales)
                .filter(([, data]) => data.revenue > 0)
                .sort((a, b) => b[1].revenue - a[1].revenue)
                .slice(0, 5);
            
            const itemNames = sortedItems.map(([name]) => name);
            const itemRevenue = sortedItems.map(([, data]) => data.revenue);
            const itemProfit = sortedItems.map(([, data]) => data.profit);
            
            // Create chart
            const ctx = document.getElementById(`${category.toLowerCase()}Chart`).getContext('2d');
            this.categoryItemCharts[category] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: itemNames.map(name => name.length > 12 ? name.substring(0, 12) + '...' : name),
                    datasets: [
                        {
                            label: 'Revenue',
                            data: itemRevenue,
                            backgroundColor: '#3498db',
                            borderColor: '#3498db',
                            borderWidth: 2,
                            borderRadius: 4,
                            hoverBackgroundColor: '#2980b9'
                        },
                        {
                            label: 'Profit',
                            data: itemProfit,
                            backgroundColor: '#2ecc71',
                            borderColor: '#2ecc71',
                            borderWidth: 2,
                            borderRadius: 4,
                            hoverBackgroundColor: '#27ae60'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `${category} Performance`,
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            color: '#2c3e50'
                        },
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(44, 62, 80, 0.9)',
                            titleColor: '#ecf0f1',
                            bodyColor: '#ecf0f1',
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return '₹' + value.toLocaleString();
                                },
                                font: {
                                    weight: 'bold'
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    weight: 'bold'
                                }
                            }
                        }
                    }
                }
            });
        });
    }
    
    // Calculate category data for charts
    calculateCategoryData(orders) {
        const categoryData = {};
        
        // Initialize with all categories
        this.categories.forEach(category => {
            categoryData[category] = {
                revenue: 0,
                profit: 0,
                itemsSold: 0
            };
        });
        
        // Calculate totals
        orders.forEach(order => {
            order.items.forEach(item => {
                const menuItem = this.menu.find(m => m.id === item.id);
                if (menuItem) {
                    const category = menuItem.category;
                    if (!categoryData[category]) {
                        categoryData[category] = {
                            revenue: 0,
                            profit: 0,
                            itemsSold: 0
                        };
                    }
                    
                    const itemRevenue = item.price * item.quantity;
                    const itemCost = (item.cost || menuItem.cost || 0) * item.quantity;
                    const itemProfit = itemRevenue - itemCost;
                    
                    categoryData[category].revenue += itemRevenue;
                    categoryData[category].profit += itemProfit;
                    categoryData[category].itemsSold += item.quantity;
                }
            });
        });
        
        return categoryData;
    }
    
    // Calculate item data for charts
    calculateItemData(orders) {
        const itemData = {};
        
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!itemData[item.name]) {
                    itemData[item.name] = {
                        revenue: 0,
                        profit: 0,
                        quantity: 0
                    };
                }
                
                const menuItem = this.menu.find(m => m.id === item.id);
                const itemCost = (item.cost || (menuItem ? menuItem.cost : 0) || 0) * item.quantity;
                const itemRevenue = item.price * item.quantity;
                const itemProfit = itemRevenue - itemCost;
                
                itemData[item.name].revenue += itemRevenue;
                itemData[item.name].profit += itemProfit;
                itemData[item.name].quantity += item.quantity;
            });
        });
        
        return itemData;
    }
    
    // Update analytics summary - FIXED
    updateAnalyticsSummary(orders) {
        // Calculate totals
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalCost = orders.reduce((sum, order) => sum + (order.totalCost || 0), 0);
        const totalProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;
        const totalOrders = orders.length;
        
        // Update display - FIXED: Using correct element IDs
        document.getElementById('analytics-revenue').textContent = `₹${totalRevenue.toLocaleString()}`;
        document.getElementById('analytics-profit').textContent = `₹${totalProfit.toLocaleString()}`;
        document.getElementById('analytics-orders').textContent = totalOrders;
        document.getElementById('analytics-margin').textContent = `${profitMargin}%`;
    }
    
    // Render best items table
    renderBestItems(orders) {
        const itemData = this.calculateItemData(orders);
        
        // Get top 5 items by revenue
        const topItems = Object.entries(itemData)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 5);
        
        let html = '';
        topItems.forEach(([itemName, data]) => {
            const profitClass = data.profit >= 0 ? 'profit-positive' : 'profit-negative';
            html += `
                <tr>
                    <td>${itemName}</td>
                    <td>${data.quantity}</td>
                    <td>₹${data.revenue.toLocaleString()}</td>
                    <td class="${profitClass}">₹${data.profit.toLocaleString()}</td>
                </tr>
            `;
        });
        
        document.getElementById('best-items-body').innerHTML = html || 
            '<tr><td colspan="4" class="text-center text-muted">No data</td></tr>';
    }
    
    // Render category performance table - FIXED
    renderCategoryPerformance(orders) {
        const categoryData = this.calculateCategoryData(orders);
        
        // Convert to array and sort by revenue
        const categoryArray = Object.entries(categoryData)
            .map(([category, data]) => ({
                category,
                ...data,
                margin: data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : 0
            }))
            .sort((a, b) => b.revenue - a.revenue);
        
        let html = '';
        categoryArray.forEach(data => {
            const profitClass = data.profit >= 0 ? 'profit-positive' : 'profit-negative';
            html += `
                <tr>
                    <td>${data.category}</td>
                    <td>₹${data.revenue.toLocaleString()}</td>
                    <td class="${profitClass}">₹${data.profit.toLocaleString()}</td>
                    <td>${data.margin}%</td>
                </tr>
            `;
        });
        
        document.getElementById('category-performance-body').innerHTML = html || 
            '<tr><td colspan="4" class="text-center text-muted">No data</td></tr>';
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
                    <td colspan="6" class="fw-bold">
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
                const profit = item.price - item.cost;
                const margin = item.price > 0 ? ((profit / item.price) * 100).toFixed(1) : 0;
                const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
                html += `
                    <tr>
                        <td></td>
                        <td>${item.name}</td>
                        <td>₹${item.cost}</td>
                        <td>₹${item.price}</td>
                        <td class="${profitClass}">
                            ₹${profit} (${margin}%)
                        </td>
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
        document.getElementById('item-cost').value = item.cost || 0;
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
        const editItemId = document.getElementById('edit-item-id').value;
        
        if (!category || !name || !price || price <= 0) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (cost >= price) {
            if (!confirm('Cost is higher than or equal to price. This will result in zero or negative profit. Continue?')) {
                return;
            }
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
            }
        } else {
            // Add new item
            const newId = this.menu.length > 0 ? Math.max(...this.menu.map(i => i.id)) + 1 : 1;
            this.menu.push({
                id: newId,
                category: category,
                name: name,
                price: price,
                cost: cost
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
