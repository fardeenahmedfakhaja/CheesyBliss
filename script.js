// Restaurant Order Management System
class RestaurantOrderSystem {
    constructor() {
        // Initialize data structures
        this.menu = this.loadMenu();
        this.categories = this.loadData('categories') || this.getDefaultCategories();
        this.orders = this.loadData('orders') || [];
        this.completedOrders = this.loadData('completedOrders') || [];
        this.nextOrderId = this.loadData('nextOrderId') || 1001;
        this.salesChart = null;
        
        // Initialize UI
        this.initEventListeners();
        this.renderMenu();
        this.renderOngoingOrders();
        this.renderCompletedOrders();
        this.renderMenuManagement();
        this.updateBadges();
        this.updateCategoryDropdown();
        
        // Auto-refresh ongoing orders every 10 seconds
        setInterval(() => this.renderOngoingOrders(), 10000);
        
        // Show welcome message
        console.log('Restaurant Order System Loaded');
    }
    
    // Default menu data
    defaultMenu = [
        // APPETIZERS
        { id: 1, category: 'APPETIZERS', name: 'Chicken loaded fries', price: 140 },
        { id: 2, category: 'APPETIZERS', name: 'Cheesy veg loaded fries', price: 125 },
        { id: 3, category: 'APPETIZERS', name: 'Salted fries', price: 99 },
        { id: 4, category: 'APPETIZERS', name: 'Peri peri fries', price: 109 },
        { id: 5, category: 'APPETIZERS', name: 'Chicken Nuggets (4 pcs)', price: 75 },
        { id: 6, category: 'APPETIZERS', name: 'Chicken Nuggets (6 pcs)', price: 99 },
        
        // WRAPS
        { id: 7, category: 'WRAPS', name: 'Chicken tikka wrap', price: 130 },
        { id: 8, category: 'WRAPS', name: 'Paneer tikka wrap', price: 120 },
        { id: 9, category: 'WRAPS', name: 'Chicken zinger wrap', price: 150 },
        { id: 10, category: 'WRAPS', name: 'Chicken nugget wrap', price: 120 },
        
        // BURGERS
        { id: 11, category: 'BURGERS', name: 'Classic Veg burger', price: 115 },
        { id: 12, category: 'BURGERS', name: 'Chicken Bliss burger', price: 135 },
        
        // SALADS
        { id: 13, category: 'SALADS', name: 'Veg salad', price: 99 },
        { id: 14, category: 'SALADS', name: 'Signature chicken salad', price: 130 },
        
        // DESSERTS
        { id: 15, category: 'DESSERTS', name: 'Chocolate brownie', price: 90 },
        { id: 16, category: 'DESSERTS', name: 'Red velvet brownie', price: 90 },
        { id: 17, category: 'DESSERTS', name: 'Lotus biscoff drip brownie', price: 130 },
        { id: 18, category: 'DESSERTS', name: 'Strawberry choco brownie', price: 110 },
        { id: 19, category: 'DESSERTS', name: 'Chocolate strawberry cup', price: 120 }
    ];
    
    // Default categories
    getDefaultCategories() {
        return [
            { id: 1, name: 'APPETIZERS', description: 'Appetizers and Starters' },
            { id: 2, name: 'WRAPS', description: 'Fresh Wraps' },
            { id: 3, name: 'BURGERS', description: 'Burgers' },
            { id: 4, name: 'SALADS', description: 'Healthy Salads' },
            { id: 5, name: 'DESSERTS', description: 'Sweet Desserts' }
        ];
    }
    
    // Current order
    currentOrder = {
        items: [],
        customerName: '',
        customerNumber: '',
        orderTime: null
    };
    
    // Load menu from localStorage or use default
    loadMenu() {
        let savedMenu = this.loadData('menu');
        if (!savedMenu || savedMenu.length === 0) {
            this.saveData('menu', this.defaultMenu);
            return this.defaultMenu;
        }
        return savedMenu;
    }
    
    // Local storage methods
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
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
        
        // Place order button
        document.getElementById('place-order-btn').addEventListener('click', () => this.placeOrder());
        
        // Clear order button
        document.getElementById('clear-order-btn').addEventListener('click', () => this.clearCurrentOrder());
        
        // Complete order button in modal
        document.getElementById('complete-order-btn').addEventListener('click', () => this.completeOrder());
        
        // Clear completed orders button
        document.getElementById('clear-completed-btn').addEventListener('click', () => this.clearCompletedOrders());
        
        // Download PDF button
        document.getElementById('download-pdf-btn').addEventListener('click', () => this.downloadPDFReport());
        
        // Menu item form
        document.getElementById('menu-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMenuItem();
        });
        
        // Cancel edit button
        document.getElementById('cancel-edit-btn').addEventListener('click', () => this.cancelEditMenuItem());
        
        // Add category button
        document.getElementById('add-category-btn').addEventListener('click', () => this.showAddCategoryModal());
        
        // New category button
        document.getElementById('new-category-btn').addEventListener('click', () => this.showNewCategoryInput());
        
        // Save new category button
        document.getElementById('save-new-category-btn').addEventListener('click', () => this.saveNewCategory());
        
        // Cancel new category button
        document.getElementById('cancel-new-category-btn').addEventListener('click', () => this.hideNewCategoryInput());
        
        // Category form
        document.getElementById('category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewCategory();
        });
        
        // Update customer info
        document.getElementById('customer-name').addEventListener('input', (e) => {
            this.currentOrder.customerName = e.target.value;
            this.updateOrderSummary();
        });
        
        document.getElementById('customer-number').addEventListener('input', (e) => {
            this.currentOrder.customerNumber = e.target.value;
        });
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
        }
    }
    
    // Render menu items for ordering
    renderMenu() {
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
        
        // Sort categories by order
        const sortedCategories = Object.keys(categories).sort();
        
        // Create category sections
        sortedCategories.forEach(category => {
            const items = categories[category];
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'menu-category col-12';
            categoryDiv.innerHTML = `<h5>${category}</h5><div class="row" id="category-${category}"></div>`;
            
            const itemsContainer = categoryDiv.querySelector(`#category-${category}`);
            
            items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'col-md-6 col-lg-4 mb-3';
                itemDiv.innerHTML = `
                    <div class="menu-item-card" data-item-id="${item.id}">
                        <div>
                            <div class="menu-item-name">${item.name}</div>
                            <div class="menu-item-price">₹${item.price}</div>
                        </div>
                        <div class="menu-item-quantity">
                            <button class="quantity-btn minus-btn" data-item-id="${item.id}">-</button>
                            <input type="number" class="quantity-input" id="qty-${item.id}" value="0" min="0" data-item-id="${item.id}">
                            <button class="quantity-btn plus-btn" data-item-id="${item.id}">+</button>
                        </div>
                    </div>
                `;
                
                itemsContainer.appendChild(itemDiv);
                
                // Add event listeners for quantity buttons
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
        
        let grandTotal = 0;
        
        this.currentOrder.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>
                    <div class="input-group input-group-sm" style="width: 120px;">
                        <button class="btn btn-outline-secondary" type="button" onclick="restaurantSystem.adjustQuantity(${item.id}, -1)">-</button>
                        <input type="number" class="form-control text-center" value="${item.quantity}" min="1" onchange="restaurantSystem.setQuantity(${item.id}, this.value)">
                        <button class="btn btn-outline-secondary" type="button" onclick="restaurantSystem.adjustQuantity(${item.id}, 1)">+</button>
                    </div>
                </td>
                <td>₹${item.price}</td>
                <td>₹${item.total}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="restaurantSystem.setQuantity(${item.id}, 0)">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
            grandTotal += item.total;
        });
        
        document.getElementById('grand-total').textContent = `₹${grandTotal}`;
        
        // Show/hide table based on items
        if (this.currentOrder.items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No items selected. Click on menu items to add them to the order.</td></tr>`;
        }
    }
    
    // Update order summary
    updateOrderSummary() {
        // Update customer info
        document.getElementById('display-customer').textContent = 
            this.currentOrder.customerName || 'Not specified';
        
        // Update time
        const now = new Date();
        document.getElementById('display-time').textContent = 
            now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Update items summary
        const summaryContainer = document.getElementById('summary-items');
        summaryContainer.innerHTML = '';
        
        let total = 0;
        
        this.currentOrder.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'd-flex justify-content-between mb-1';
            itemDiv.innerHTML = `
                <span>${item.name} x${item.quantity}</span>
                <span>₹${item.total}</span>
            `;
            summaryContainer.appendChild(itemDiv);
            total += item.total;
        });
        
        if (this.currentOrder.items.length === 0) {
            summaryContainer.innerHTML = '<p class="text-muted text-center">No items selected</p>';
        }
        
        document.getElementById('summary-total').textContent = total;
    }
    
    // Place new order
    placeOrder() {
        if (this.currentOrder.items.length === 0) {
            alert('Please add at least one item to the order');
            return;
        }
        
        // Calculate total
        const total = this.currentOrder.items.reduce((sum, item) => sum + item.total, 0);
        
        // Create order object
        const order = {
            id: this.nextOrderId++,
            customerName: this.currentOrder.customerName,
            customerNumber: this.currentOrder.customerNumber,
            items: [...this.currentOrder.items],
            total: total,
            orderTime: new Date().toISOString(),
            status: 'preparing'
        };
        
        // Add to orders array
        this.orders.unshift(order); // Add to beginning for newest first
        
        // Save data
        this.saveData('orders', this.orders);
        this.saveData('nextOrderId', this.nextOrderId);
        
        // Clear current order
        this.clearCurrentOrder();
        
        // Switch to ongoing orders tab
        this.switchTab('ongoing-orders');
        
        // Update badges
        this.updateBadges();
        
        // Show success message
        alert(`Order #${order.id} placed successfully!`);
        
        // Render ongoing orders
        this.renderOngoingOrders();
    }
    
    // Clear current order
    clearCurrentOrder() {
        this.currentOrder = {
            items: [],
            customerName: '',
            customerNumber: '',
            orderTime: null
        };
        
        // Reset form
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-number').value = '';
        
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
        tbody.innerHTML = '';
        
        // Sort by order time (newest first)
        const sortedOrders = [...this.orders].sort((a, b) => 
            new Date(b.orderTime) - new Date(a.orderTime)
        );
        
        sortedOrders.forEach(order => {
            const orderTime = new Date(order.orderTime);
            const formattedTime = orderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Get first few items for display
            const itemsPreview = order.items.slice(0, 2).map(item => 
                `${item.name} (x${item.quantity})`
            ).join(', ');
            
            const moreItems = order.items.length > 2 ? ` +${order.items.length - 2} more` : '';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>#${order.id}</strong></td>
                <td>${formattedTime}</td>
                <td>${order.customerName || 'Walk-in'}</td>
                <td>${itemsPreview}${moreItems}</td>
                <td>₹${order.total}</td>
                <td><span class="status-badge status-preparing">Preparing</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1 view-order-btn" data-order-id="${order.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success me-1 complete-order-btn" data-order-id="${order.id}">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-order-btn" data-order-id="${order.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = parseInt(e.currentTarget.getAttribute('data-order-id'));
                this.showOrderDetails(orderId);
            });
        });
        
        document.querySelectorAll('.complete-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = parseInt(e.currentTarget.getAttribute('data-order-id'));
                this.completeOrderDirectly(orderId);
            });
        });
        
        document.querySelectorAll('.delete-order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = parseInt(e.currentTarget.getAttribute('data-order-id'));
                this.deleteOrder(orderId);
            });
        });
        
        // Update badge
        this.updateBadges();
    }
    
    // Show order details in modal
    showOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;
        
        // Populate modal
        document.getElementById('modal-order-no').textContent = order.id;
        document.getElementById('modal-customer').textContent = 
            order.customerName || 'Walk-in Customer';
        
        const orderTime = new Date(order.orderTime);
        document.getElementById('modal-order-time').textContent = 
            orderTime.toLocaleString();
        
        // Populate items
        const tbody = document.getElementById('modal-items-body');
        tbody.innerHTML = '';
        
        order.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price}</td>
                <td>₹${item.total}</td>
            `;
            tbody.appendChild(row);
        });
        
        document.getElementById('modal-total').textContent = order.total;
        
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
        
        // Add to completed orders
        this.completedOrders.unshift(completedOrder);
        
        // Save data
        this.saveData('orders', this.orders);
        this.saveData('completedOrders', this.completedOrders);
        
        // Update UI
        this.renderOngoingOrders();
        this.renderCompletedOrders();
        this.updateBadges();
        
        // Show confirmation
        alert(`Order #${orderId} marked as completed!`);
    }
    
    // Delete order (cancelled order)
    deleteOrder(orderId) {
        if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            return;
        }
        
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;
        
        // Remove from orders array
        this.orders.splice(orderIndex, 1);
        
        // Save data
        this.saveData('orders', this.orders);
        
        // Update UI
        this.renderOngoingOrders();
        this.updateBadges();
        
        // Show confirmation
        alert(`Order #${orderId} has been deleted!`);
    }
    
    // Render completed orders
    renderCompletedOrders() {
        const tbody = document.getElementById('completed-orders-body');
        const emptyState = document.getElementById('no-completed-orders');
        
        if (this.completedOrders.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            this.updateSalesSummary();
            return;
        }
        
        emptyState.style.display = 'none';
        tbody.innerHTML = '';
        
        this.completedOrders.forEach(order => {
            const orderTime = new Date(order.orderTime);
            const completedTime = new Date(order.completedTime);
            
            const formattedOrderTime = orderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const formattedCompletedTime = completedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Get items count
            const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>#${order.id}</strong></td>
                <td>${formattedOrderTime}</td>
                <td>${order.customerName || 'Walk-in'}</td>
                <td>${itemsCount} items</td>
                <td>₹${order.total}</td>
                <td>${formattedCompletedTime}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Update sales summary
        this.updateSalesSummary();
    }
    
    // Update sales summary
    updateSalesSummary() {
        // Calculate total revenue
        const totalRevenue = this.completedOrders.reduce((sum, order) => sum + order.total, 0);
        document.getElementById('total-revenue').textContent = `₹${totalRevenue}`;
        document.getElementById('total-orders-count').textContent = this.completedOrders.length;
        
        // Calculate item-wise sales
        const itemSales = {};
        
        this.completedOrders.forEach(order => {
            order.items.forEach(item => {
                if (!itemSales[item.name]) {
                    itemSales[item.name] = {
                        quantity: 0,
                        revenue: 0,
                        category: this.getMenuItemCategory(item.name)
                    };
                }
                itemSales[item.name].quantity += item.quantity;
                itemSales[item.name].revenue += item.total;
            });
        });
        
        // Render item summary
        const tbody = document.getElementById('item-summary-body');
        tbody.innerHTML = '';
        
        // Sort by revenue (highest first)
        const sortedItems = Object.entries(itemSales).sort((a, b) => b[1].revenue - a[1].revenue);
        
        sortedItems.forEach(([itemName, data]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${itemName}</td>
                <td>${data.quantity}</td>
                <td>₹${data.revenue}</td>
            `;
            tbody.appendChild(row);
        });
        
        if (sortedItems.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted py-3">
                        No sales data available
                    </td>
                </tr>
            `;
        }
        
        // Update sales chart
        this.updateSalesChart(itemSales);
    }
    
    // Get menu item category
    getMenuItemCategory(itemName) {
        const item = this.menu.find(i => i.name === itemName);
        return item ? item.category : 'Unknown';
    }
    
    // Update sales chart
    updateSalesChart(itemSales) {
        const ctx = document.getElementById('salesChart').getContext('2d');
        
        // Prepare data for chart
        const labels = Object.keys(itemSales);
        const quantities = Object.values(itemSales).map(data => data.quantity);
        const revenues = Object.values(itemSales).map(data => data.revenue);
        
        // Destroy existing chart if it exists
        if (this.salesChart) {
            this.salesChart.destroy();
        }
        
        // Create new chart
        this.salesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Quantity Sold',
                        data: quantities,
                        backgroundColor: 'rgba(255, 107, 53, 0.6)',
                        borderColor: 'rgba(255, 107, 53, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Revenue (₹)',
                        data: revenues,
                        backgroundColor: 'rgba(41, 128, 185, 0.6)',
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
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
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
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: true
                    }
                }
            }
        });
    }
    
    // Download PDF report
    downloadPDFReport() {
        if (this.completedOrders.length === 0) {
            alert('No completed orders to generate report!');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
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
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Summary', 20, 45);
        
        doc.setFontSize(11);
        doc.text(`Total Orders: ${this.completedOrders.length}`, 20, 55);
        doc.text(`Total Revenue: ₹${totalRevenue}`, 20, 62);
        
        // Calculate item-wise sales for table
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
            `₹${data.revenue}`
        ]);
        
        // Add item-wise sales table
        doc.autoTable({
            head: [['#', 'Item Name', 'Quantity', 'Revenue']],
            body: tableData,
            startY: 70,
            theme: 'grid',
            headStyles: { fillColor: [255, 107, 53] },
            margin: { top: 70 }
        });
        
        // Add recent orders table
        const recentOrders = this.completedOrders.slice(0, 10); // Last 10 orders
        const recentOrdersData = recentOrders.map((order, index) => [
            order.id,
            new Date(order.orderTime).toLocaleDateString(),
            order.customerName || 'Walk-in',
            order.items.length,
            `₹${order.total}`
        ]);
        
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Recent Completed Orders', 20, 20);
        
        doc.autoTable({
            head: [['Order #', 'Date', 'Customer', 'Items', 'Total']],
            body: recentOrdersData,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }
        });
        
        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: 'right' });
            doc.text('Restaurant Order System - Generated Report', 105, 285, { align: 'center' });
        }
        
        // Save the PDF
        doc.save(`sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
    }
    
    // Clear all completed orders
    clearCompletedOrders() {
        if (this.completedOrders.length === 0) return;
        
        if (confirm('Are you sure you want to clear all completed orders? This action cannot be undone.')) {
            this.completedOrders = [];
            this.saveData('completedOrders', this.completedOrders);
            this.renderCompletedOrders();
            this.updateBadges();
            alert('All completed orders have been cleared.');
        }
    }
    
    // Render menu management
    renderMenuManagement() {
        const tbody = document.getElementById('menu-management-body');
        tbody.innerHTML = '';
        
        // Group by category
        const categories = {};
        this.menu.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });
        
        // Get all categories from categories list
        const allCategories = this.categories.map(cat => cat.name);
        
        // Add categories that might be in menu but not in categories list
        Object.keys(categories).forEach(catName => {
            if (!allCategories.includes(catName)) {
                this.categories.push({ id: this.categories.length + 1, name: catName, description: '' });
            }
        });
        
        // Sort categories
        const sortedCategories = Object.keys(categories).sort();
        
        // Render each category
        sortedCategories.forEach(category => {
            // Add category header row
            const headerRow = document.createElement('tr');
            headerRow.className = 'table-active';
            headerRow.innerHTML = `
                <td colspan="4" class="fw-bold">
                    ${category}
                    <button class="btn btn-sm btn-outline-danger float-end delete-category-btn" data-category="${category}">
                        <i class="fas fa-trash"></i> Delete Category
                    </button>
                </td>
            `;
            tbody.appendChild(headerRow);
            
            // Add event listener for delete category button
            headerRow.querySelector('.delete-category-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const categoryName = e.currentTarget.getAttribute('data-category');
                this.deleteCategory(categoryName);
            });
            
            // Add items in this category
            const items = categories[category];
            items.forEach(item => {
                const row = document.createElement('tr');
                row.className = 'menu-management-row';
                row.innerHTML = `
                    <td></td>
                    <td>${item.name}</td>
                    <td>₹${item.price}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary edit-menu-item" data-item-id="${item.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-menu-item" data-item-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
                
                // Add event listeners
                row.querySelector('.edit-menu-item').addEventListener('click', () => this.editMenuItem(item.id));
                row.querySelector('.delete-menu-item').addEventListener('click', () => this.deleteMenuItem(item.id));
            });
        });
        
        // Add "Add New Item" row
        const addRow = document.createElement('tr');
        addRow.className = 'table-info';
        addRow.innerHTML = `
            <td colspan="4" class="text-center">
                <button class="btn btn-sm btn-success" id="add-new-item-btn">
                    <i class="fas fa-plus"></i> Add New Menu Item
                </button>
            </td>
        `;
        tbody.appendChild(addRow);
        
        document.getElementById('add-new-item-btn').addEventListener('click', () => {
            this.cancelEditMenuItem(); // Reset form
        });
        
        // Update category dropdown
        this.updateCategoryDropdown();
    }
    
    // Update category dropdown
    updateCategoryDropdown() {
        const categorySelect = document.getElementById('item-category');
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        
        // Sort categories alphabetically
        const sortedCategories = [...this.categories].sort((a, b) => a.name.localeCompare(b.name));
        
        sortedCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }
    
    // Show add category modal
    showAddCategoryModal() {
        const modal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
        modal.show();
    }
    
    // Add new category
    addNewCategory() {
        const name = document.getElementById('category-name').value.trim();
        const description = document.getElementById('category-description').value.trim();
        
        if (!name) {
            alert('Please enter a category name');
            return;
        }
        
        // Check if category already exists
        if (this.categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
            alert('Category already exists!');
            return;
        }
        
        // Add new category
        const newId = Math.max(...this.categories.map(c => c.id)) + 1;
        this.categories.push({
            id: newId,
            name: name.toUpperCase(),
            description: description
        });
        
        // Save categories
        this.saveData('categories', this.categories);
        
        // Update UI
        this.updateCategoryDropdown();
        this.renderMenuManagement();
        
        // Hide modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
        modal.hide();
        document.getElementById('category-form').reset();
        
        alert(`Category "${name}" added successfully!`);
    }
    
    // Show new category input
    showNewCategoryInput() {
        document.getElementById('new-category-input').classList.remove('d-none');
        document.getElementById('new-category-name').focus();
    }
    
    // Hide new category input
    hideNewCategoryInput() {
        document.getElementById('new-category-input').classList.add('d-none');
        document.getElementById('new-category-name').value = '';
    }
    
    // Save new category from inline input
    saveNewCategory() {
        const name = document.getElementById('new-category-name').value.trim();
        
        if (!name) {
            alert('Please enter a category name');
            return;
        }
        
        // Check if category already exists
        if (this.categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
            alert('Category already exists!');
            return;
        }
        
        // Add new category
        const newId = Math.max(...this.categories.map(c => c.id)) + 1;
        this.categories.push({
            id: newId,
            name: name.toUpperCase(),
            description: ''
        });
        
        // Save categories
        this.saveData('categories', this.categories);
        
        // Update UI
        this.updateCategoryDropdown();
        this.renderMenuManagement();
        
        // Hide input and reset
        this.hideNewCategoryInput();
        
        // Set the new category as selected
        document.getElementById('item-category').value = name.toUpperCase();
        
        alert(`Category "${name}" added successfully!`);
    }
    
    // Delete category
    deleteCategory(categoryName) {
        // Check if category has items
        const itemsInCategory = this.menu.filter(item => item.category === categoryName);
        
        if (itemsInCategory.length > 0) {
            if (!confirm(`Category "${categoryName}" has ${itemsInCategory.length} item(s). Deleting it will also delete all items in this category. Are you sure?`)) {
                return;
            }
            
            // Remove all items in this category
            this.menu = this.menu.filter(item => item.category !== categoryName);
            this.saveData('menu', this.menu);
        }
        
        // Remove category from categories list
        this.categories = this.categories.filter(cat => cat.name !== categoryName);
        this.saveData('categories', this.categories);
        
        // Update UI
        this.renderMenu();
        this.renderMenuManagement();
        this.clearCurrentOrder();
        
        alert(`Category "${categoryName}" deleted successfully!`);
    }
    
    // Edit menu item
    editMenuItem(itemId) {
        const item = this.menu.find(i => i.id === itemId);
        if (!item) return;
        
        // Populate form
        document.getElementById('item-category').value = item.category;
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-price').value = item.price;
        document.getElementById('edit-item-id').value = item.id;
        
        // Update button text
        document.getElementById('save-menu-item-btn').innerHTML = '<i class="fas fa-save me-1"></i> Update Item';
        
        // Scroll to form
        document.getElementById('item-category').focus();
    }
    
    // Save menu item
    saveMenuItem() {
        const category = document.getElementById('item-category').value;
        const name = document.getElementById('item-name').value.trim();
        const price = parseInt(document.getElementById('item-price').value);
        const editItemId = document.getElementById('edit-item-id').value;
        
        if (!category || !name || !price || price <= 0) {
            alert('Please fill in all fields with valid values');
            return;
        }
        
        // Check if category exists in categories list, if not add it
        if (!this.categories.some(cat => cat.name === category)) {
            const newId = Math.max(...this.categories.map(c => c.id)) + 1;
            this.categories.push({
                id: newId,
                name: category,
                description: ''
            });
            this.saveData('categories', this.categories);
        }
        
        if (editItemId) {
            // Update existing item
            const itemId = parseInt(editItemId);
            const itemIndex = this.menu.findIndex(i => i.id === itemId);
            
            if (itemIndex !== -1) {
                this.menu[itemIndex].category = category;
                this.menu[itemIndex].name = name;
                this.menu[itemIndex].price = price;
                
                alert('Menu item updated successfully!');
            }
        } else {
            // Add new item
            const newId = Math.max(...this.menu.map(i => i.id)) + 1;
            this.menu.push({
                id: newId,
                category: category,
                name: name,
                price: price
            });
            
            alert('New menu item added successfully!');
        }
        
        // Save menu
        this.saveData('menu', this.menu);
        
        // Reset form
        this.cancelEditMenuItem();
        
        // Update all views that use menu
        this.renderMenu();
        this.renderMenuManagement();
        this.clearCurrentOrder();
    }
    
    // Cancel edit menu item
    cancelEditMenuItem() {
        document.getElementById('menu-item-form').reset();
        document.getElementById('edit-item-id').value = '';
        document.getElementById('save-menu-item-btn').innerHTML = '<i class="fas fa-save me-1"></i> Save Item';
    }
    
    // Delete menu item
    deleteMenuItem(itemId) {
        if (!confirm('Are you sure you want to delete this menu item? This will remove it from the menu.')) {
            return;
        }
        
        const itemIndex = this.menu.findIndex(i => i.id === itemId);
        if (itemIndex !== -1) {
            this.menu.splice(itemIndex, 1);
            this.saveData('menu', this.menu);
            
            // Update all views
            this.renderMenu();
            this.renderMenuManagement();
            this.clearCurrentOrder();
            
            alert('Menu item deleted successfully!');
        }
    }
    
    // Update badge counts
    updateBadges() {
        document.getElementById('ongoing-badge').textContent = this.orders.length;
        document.getElementById('completed-badge').textContent = this.completedOrders.length;
    }
}

// Initialize the system when page loads
let restaurantSystem;

document.addEventListener('DOMContentLoaded', () => {
    restaurantSystem = new RestaurantOrderSystem();
    
    // Make system globally available for inline event handlers
    window.restaurantSystem = restaurantSystem;
    
    // Show take order tab by default
    restaurantSystem.switchTab('take-order');
});
