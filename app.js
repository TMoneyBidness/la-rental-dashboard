// LA Rental Dashboard - with drag-drop ranking and notes

let listings = [];
let rankings = {};
let notes = {};

// Load saved rankings and notes from localStorage
function loadSavedData() {
    const savedRankings = localStorage.getItem('la-rental-rankings');
    const savedNotes = localStorage.getItem('la-rental-notes');
    if (savedRankings) rankings = JSON.parse(savedRankings);
    if (savedNotes) notes = JSON.parse(savedNotes);
}

// Save rankings and notes to localStorage
function saveData() {
    localStorage.setItem('la-rental-rankings', JSON.stringify(rankings));
    localStorage.setItem('la-rental-notes', JSON.stringify(notes));
}

// Initialize the app
function init() {
    loadSavedData();
    
    // Apply saved order or use default
    if (Object.keys(rankings).length > 0) {
        listings = window.listingsData.slice().sort((a, b) => {
            const rankA = rankings[a.id] ?? 999;
            const rankB = rankings[b.id] ?? 999;
            return rankA - rankB;
        });
    } else {
        listings = window.listingsData.slice();
        listings.forEach((listing, idx) => {
            rankings[listing.id] = idx + 1;
        });
    }
    
    renderListings();
    setupFilters();
    updateStats();
}

// Render all listing cards
function renderListings(filteredListings = null) {
    const container = document.getElementById('listings-container');
    const data = filteredListings || listings;
    
    container.innerHTML = data.map((listing, index) => {
        const rank = rankings[listing.id] || index + 1;
        const note = notes[listing.id] || '';
        
        return `
        <div class="listing-card" draggable="true" data-id="${listing.id}" data-rank="${rank}">
            <div class="rank-badge">#${rank}</div>
            <div class="drag-handle" title="Drag to reorder">⋮⋮</div>
            <div class="listing-image" style="background-image: url('${listing.images[0] || ''}'); background-size: cover; background-position: center;">
                <span class="listing-price">$${listing.price.toLocaleString()}/mo</span>
                ${listing.source ? `<span class="listing-source">${listing.source}</span>` : ''}
            </div>
            <div class="listing-content">
                <h3 class="listing-title">${listing.title}</h3>
                <p class="listing-location">📍 ${listing.neighborhood}</p>
                <div class="listing-details">
                    <span>🛏 ${listing.bedrooms} BR</span>
                    <span>🚿 ${listing.bathrooms} BA</span>
                    ${listing.sqft ? `<span>📐 ${listing.sqft} sqft</span>` : ''}
                </div>
                <div class="listing-tags">
                    ${listing.petsAllowed ? '<span class="tag tag-pets">🐕 Pets OK</span>' : ''}
                    ${listing.utilitiesIncluded ? '<span class="tag tag-utilities">⚡ Utils Incl</span>' : ''}
                    ${listing.parking ? '<span class="tag tag-parking">🚗 Parking</span>' : ''}
                    ${listing.laundry ? '<span class="tag tag-laundry">🧺 Laundry</span>' : ''}
                </div>
                <div class="notes-section">
                    <label class="notes-label">📝 Notes for Outreach:</label>
                    <textarea class="notes-input" data-id="${listing.id}" placeholder="Add notes about this property...">${note}</textarea>
                    <button class="save-notes-btn" data-id="${listing.id}">💾 Save</button>
                </div>
                <button class="expand-btn" data-id="${listing.id}">View Full Details →</button>
            </div>
        </div>
        `;
    }).join('');
    
    setupDragAndDrop();
    setupNotes();
    setupExpandButtons();
}

// Setup drag and drop
function setupDragAndDrop() {
    const cards = document.querySelectorAll('.listing-card');
    const container = document.getElementById('listings-container');
    
    let draggedItem = null;
    
    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            draggedItem = card;
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => card.style.opacity = '0.5', 0);
        });
        
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            card.style.opacity = '1';
            draggedItem = null;
            updateRankings();
        });
        
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        
        card.addEventListener('dragenter', (e) => {
            e.preventDefault();
            if (card !== draggedItem) {
                card.classList.add('drag-over');
            }
        });
        
        card.addEventListener('dragleave', () => {
            card.classList.remove('drag-over');
        });
        
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('drag-over');
            if (draggedItem && card !== draggedItem) {
                const allCards = [...container.querySelectorAll('.listing-card')];
                const draggedIdx = allCards.indexOf(draggedItem);
                const targetIdx = allCards.indexOf(card);
                
                if (draggedIdx < targetIdx) {
                    card.parentNode.insertBefore(draggedItem, card.nextSibling);
                } else {
                    card.parentNode.insertBefore(draggedItem, card);
                }
            }
        });
    });
}

// Update rankings after drag
function updateRankings() {
    const cards = document.querySelectorAll('.listing-card');
    cards.forEach((card, index) => {
        const id = parseInt(card.dataset.id);
        const newRank = index + 1;
        rankings[id] = newRank;
        
        const badge = card.querySelector('.rank-badge');
        badge.textContent = '#' + newRank;
        badge.classList.add('rank-updated');
        setTimeout(() => badge.classList.remove('rank-updated'), 500);
    });
    
    const newOrder = [...cards].map(card => {
        const id = parseInt(card.dataset.id);
        return listings.find(l => l.id === id);
    });
    listings = newOrder;
    
    saveData();
    showToast('Rankings saved!');
}

// Setup notes functionality
function setupNotes() {
    document.querySelectorAll('.save-notes-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const textarea = document.querySelector(`.notes-input[data-id="${id}"]`);
            notes[id] = textarea.value;
            saveData();
            
            btn.textContent = '✓ Saved!';
            btn.classList.add('saved');
            setTimeout(() => {
                btn.textContent = '💾 Save';
                btn.classList.remove('saved');
            }, 2000);
        });
    });
    
    // Auto-save on blur
    document.querySelectorAll('.notes-input').forEach(textarea => {
        textarea.addEventListener('blur', () => {
            const id = parseInt(textarea.dataset.id);
            if (notes[id] !== textarea.value) {
                notes[id] = textarea.value;
                saveData();
            }
        });
    });
}

// Show toast notification
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// Setup expand buttons
function setupExpandButtons() {
    document.querySelectorAll('.expand-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const listing = listings.find(l => l.id === id);
            showModal(listing);
        });
    });
}

// Show modal with full details
function showModal(listing) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    const note = notes[listing.id] || '';
    
    modalContent.innerHTML = `
        <button class="modal-close" onclick="closeModal()">&times;</button>
        <div class="modal-gallery">
            ${listing.images.map((img, i) => `
                <img src="${img}" alt="${listing.title} - Photo ${i+1}" class="modal-image" loading="lazy">
            `).join('')}
        </div>
        <h2>${listing.title}</h2>
        <p class="modal-price">$${listing.price.toLocaleString()}/month</p>
        <p class="modal-location">📍 ${listing.neighborhood}</p>
        <div class="modal-details">
            <div class="detail-item"><strong>🛏 Bedrooms:</strong> ${listing.bedrooms}</div>
            <div class="detail-item"><strong>🚿 Bathrooms:</strong> ${listing.bathrooms}</div>
            ${listing.sqft ? `<div class="detail-item"><strong>📐 Sqft:</strong> ${listing.sqft}</div>` : ''}
            <div class="detail-item"><strong>🐕 Pets:</strong> ${listing.petPolicy || (listing.petsAllowed ? 'Allowed' : 'Not allowed')}</div>
            <div class="detail-item"><strong>⚡ Utilities:</strong> ${listing.utilities || (listing.utilitiesIncluded ? 'Included' : 'Not included')}</div>
            <div class="detail-item"><strong>🚗 Parking:</strong> ${listing.parking || 'Not specified'}</div>
            <div class="detail-item"><strong>🧺 Laundry:</strong> ${listing.laundry || 'Not specified'}</div>
            <div class="detail-item"><strong>📅 Available:</strong> ${listing.availability}</div>
        </div>
        <div class="modal-description">
            <h3>Description</h3>
            <p>${listing.description || 'No description available.'}</p>
        </div>
        ${listing.amenities && listing.amenities.length ? `
        <div class="modal-amenities">
            <h3>Amenities</h3>
            <ul>${listing.amenities.map(a => `<li>${a}</li>`).join('')}</ul>
        </div>
        ` : ''}
        <div class="modal-notes">
            <h3>📝 Your Notes</h3>
            <textarea class="modal-notes-input" id="modal-notes-${listing.id}">${note}</textarea>
            <button class="save-modal-notes-btn" onclick="saveModalNotes(${listing.id})">💾 Save Notes</button>
        </div>
        <a href="${listing.url}" target="_blank" class="modal-link">View Original Listing →</a>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function saveModalNotes(id) {
    const textarea = document.getElementById(`modal-notes-${id}`);
    notes[id] = textarea.value;
    saveData();
    
    // Also update the card's notes
    const cardTextarea = document.querySelector(`.notes-input[data-id="${id}"]`);
    if (cardTextarea) cardTextarea.value = textarea.value;
    
    showToast('Notes saved!');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    document.body.style.overflow = '';
}

// Setup filters
function setupFilters() {
    document.getElementById('sort-select')?.addEventListener('change', applyFilters);
    document.getElementById('bedrooms-filter')?.addEventListener('change', applyFilters);
    document.getElementById('pets-filter')?.addEventListener('change', applyFilters);
    document.getElementById('price-filter')?.addEventListener('input', applyFilters);
    
    // Add reset rankings button handler
    document.getElementById('reset-rankings')?.addEventListener('click', () => {
        if (confirm('Reset all rankings to default order?')) {
            rankings = {};
            listings = window.listingsData.slice();
            listings.forEach((listing, idx) => {
                rankings[listing.id] = idx + 1;
            });
            saveData();
            renderListings();
            showToast('Rankings reset!');
        }
    });
}

function applyFilters() {
    let filtered = listings.slice();
    
    const sort = document.getElementById('sort-select')?.value;
    const bedrooms = document.getElementById('bedrooms-filter')?.value;
    const pets = document.getElementById('pets-filter')?.value;
    const maxPrice = document.getElementById('price-filter')?.value;
    
    if (bedrooms && bedrooms !== 'all') {
        filtered = filtered.filter(l => l.bedrooms === parseInt(bedrooms));
    }
    if (pets === 'yes') {
        filtered = filtered.filter(l => l.petsAllowed);
    }
    if (maxPrice) {
        filtered = filtered.filter(l => l.price <= parseInt(maxPrice));
    }
    
    if (sort === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'bedrooms') {
        filtered.sort((a, b) => b.bedrooms - a.bedrooms);
    } else if (sort === 'rank') {
        filtered.sort((a, b) => (rankings[a.id] || 999) - (rankings[b.id] || 999));
    }
    
    renderListings(filtered);
}

// Update stats
function updateStats() {
    const prices = listings.map(l => l.price);
    const totalEl = document.getElementById('total-listings');
    const minEl = document.getElementById('min-price');
    const maxEl = document.getElementById('max-price');
    const avgEl = document.getElementById('avg-price');
    
    if (totalEl) totalEl.textContent = listings.length;
    if (minEl) minEl.textContent = '$' + Math.min(...prices).toLocaleString();
    if (maxEl) maxEl.textContent = '$' + Math.max(...prices).toLocaleString();
    if (avgEl) avgEl.textContent = '$' + Math.round(prices.reduce((a,b) => a+b, 0) / prices.length).toLocaleString();
}

// Close modal on escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
