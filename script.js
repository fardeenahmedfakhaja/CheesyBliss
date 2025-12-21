// Restaurant Order Management System
class RestaurantOrderSystem {
    constructor() {
        // Initialize data structures
        this.menu = this.loadMenu();
        this.orders = this.loadData('orders') || [];
        this.completedOrders = this.loadData('completedOrders') || [];
        this.nextOrderId = this.loadData('nextOrderId') || 1001;
        
        // Initialize UI
        this.initEventListeners();
        this.renderMenu();
        this.renderOngoingOrders();
        this.renderCompletedOrders();
        this.renderMenuManagement();
        this.updateBadges();
        
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
        
        // Menu item form
        document.getElementById('menu-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMenuItem();
        });
        
        // Cancel edit button
        document.getElementById('cancel-edit-btn').addEventListener('click', () => this.cancelEditMenuItem());
        
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
        
        // Create category sections
        for (const [category, items] of Object.entries(categories)) {
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
        }
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
                    <button class="btn btn-sm btn-success complete-order-btn" data-order-id="${order.id}">
                        <i class="fas fa-check"></i> Complete
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
                        revenue: 0
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
        
        // Render each category
        for (const [category, items] of Object.entries(categories)) {
            // Add category header row
            const headerRow = document.createElement('tr');
            headerRow.className = 'table-active';
            headerRow.innerHTML = `
                <td colspan="4" class="fw-bold">${category}</td>
            `;
            tbody.appendChild(headerRow);
            
            // Add items in this category
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
        }
        
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