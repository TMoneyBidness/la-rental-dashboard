// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    renderListings(listings);
});

// Render all listings
function renderListings(listingsToRender) {
    const container = document.getElementById('listings');
    
    if (listingsToRender.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>No listings found</h3>
                <p>Try adjusting your filters</p>
            </div>
        `;
        document.getElementById('listingCount').textContent = '0';
        return;
    }
    
    container.innerHTML = listingsToRender.map(listing => `
        <article class="listing-card" onclick="openModal(${listing.id})">
            <img src="${listing.images[0]}" alt="${listing.title}" class="listing-image" loading="lazy">
            <div class="listing-content">
                <h2 class="listing-title">${listing.title}</h2>
                <p class="listing-location">📍 ${listing.neighborhood}</p>
                <p class="listing-price">$${listing.price.toLocaleString()}<span>/month</span></p>
                <div class="listing-details">
                    <span class="detail-badge">🛏️ ${listing.bedrooms} BR</span>
                    <span class="detail-badge">🚿 ${listing.bathrooms} BA</span>
                    <span class="detail-badge">📐 ${listing.sqft} sqft</span>
                </div>
                <div class="listing-tags">
                    ${listing.pets ? '<span class="tag tag-pet">🐾 Pet Friendly</span>' : '<span class="tag tag-no-pet">No Pets</span>'}
                    <span class="tag tag-laundry">${listing.laundry === 'In-unit' ? '👕 In-unit Laundry' : '👕 Shared Laundry'}</span>
                    <span class="tag tag-available">${listing.availability}</span>
                </div>
            </div>
        </article>
    `).join('');
    
    document.getElementById('listingCount').textContent = listingsToRender.length;
}

// Filter and sort
function filterListings() {
    const bedrooms = document.getElementById('bedrooms').value;
    const pets = document.getElementById('pets').value;
    const maxPrice = parseInt(document.getElementById('maxPrice').value);
    
    let filtered = listings.filter(listing => {
        if (bedrooms !== 'all' && listing.bedrooms !== parseInt(bedrooms)) return false;
        if (pets === 'yes' && !listing.pets) return false;
        if (pets === 'no' && listing.pets) return false;
        if (listing.price > maxPrice) return false;
        return true;
    });
    
    // Apply current sort
    filtered = applySorting(filtered);
    renderListings(filtered);
}

function sortListings() {
    filterListings(); // Re-filter and sort
}

function applySorting(listingsToSort) {
    const sortBy = document.getElementById('sort').value;
    
    return [...listingsToSort].sort((a, b) => {
        switch (sortBy) {
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'beds-desc':
                return b.bedrooms - a.bedrooms;
            case 'beds-asc':
                return a.bedrooms - b.bedrooms;
            case 'sqft-desc':
                return b.sqft - a.sqft;
            default:
                return 0;
        }
    });
}

function resetFilters() {
    document.getElementById('sort').value = 'price-asc';
    document.getElementById('bedrooms').value = 'all';
    document.getElementById('pets').value = 'all';
    document.getElementById('maxPrice').value = '10000';
    renderListings(applySorting(listings));
}

// Modal functionality
function openModal(id) {
    const listing = listings.find(l => l.id === id);
    if (!listing) return;
    
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="modal-gallery">
            ${listing.images.map((img, i) => `<img src="${img}" alt="${listing.title} photo ${i + 1}" loading="lazy">`).join('')}
        </div>
        
        <div class="modal-header">
            <h2>${listing.title}</h2>
            <p class="location">📍 ${listing.neighborhood}, ${listing.location}</p>
            <p class="price">$${listing.price.toLocaleString()}<span style="font-size: 1rem; font-weight: 400; color: #64748b;">/month</span></p>
            ${listing.rating ? `<p style="color: #f59e0b; font-weight: 600;">⭐ ${listing.rating} rating</p>` : ''}
        </div>
        
        <div class="modal-section">
            <h3>Property Details</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="icon">🛏️</span>
                    <div>
                        <span class="label">Bedrooms</span>
                        <span class="value">${listing.bedrooms}</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="icon">🚿</span>
                    <div>
                        <span class="label">Bathrooms</span>
                        <span class="value">${listing.bathrooms}</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="icon">📐</span>
                    <div>
                        <span class="label">Square Feet</span>
                        <span class="value">${listing.sqft.toLocaleString()}</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="icon">🛋️</span>
                    <div>
                        <span class="label">Beds</span>
                        <span class="value">${listing.beds.join(', ')}</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="icon">👕</span>
                    <div>
                        <span class="label">Laundry</span>
                        <span class="value">${listing.laundry}</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="icon">🚗</span>
                    <div>
                        <span class="label">Parking</span>
                        <span class="value">${listing.parking}</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="icon">🐾</span>
                    <div>
                        <span class="label">Pets</span>
                        <span class="value">${listing.petPolicy}</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="icon">💡</span>
                    <div>
                        <span class="label">Utilities</span>
                        <span class="value">${listing.utilities}</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="icon">📅</span>
                    <div>
                        <span class="label">Availability</span>
                        <span class="value">${listing.availability}</span>
                    </div>
                </div>
                ${listing.minStay ? `
                <div class="info-item">
                    <span class="icon">⏱️</span>
                    <div>
                        <span class="label">Min Stay</span>
                        <span class="value">${listing.minStay}</span>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
        
        <div class="modal-section">
            <h3>Amenities</h3>
            <div class="amenities-list">
                ${listing.amenities.map(a => `<span class="amenity">✓ ${a}</span>`).join('')}
            </div>
        </div>
        
        <div class="modal-section">
            <h3>Description</h3>
            <p class="description">${listing.description}</p>
        </div>
        
        <a href="${listing.url}" target="_blank" rel="noopener noreferrer" class="source-link">
            View on ${listing.source} →
        </a>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Close modal on backdrop click
document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});
