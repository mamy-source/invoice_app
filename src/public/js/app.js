const API_BASE_URL = window.location.origin;
const API_PREFIX = '/api/invoices';


let products = [];
let currentInvoiceId = null;
let isProcessing = false;



const form = document.getElementById('invoiceForm');
const clientEmailInput = document.getElementById('clientEmail');
const productsContainer = document.getElementById('productsContainer');
const emptyProducts = document.getElementById('emptyProducts');
const addProductBtn = document.getElementById('addProductBtn');
const createInvoiceBtn = document.getElementById('createInvoiceBtn');
const generatePdfBtn = document.getElementById('generatePdfBtn');
const totalGeneral = document.getElementById('totalGeneral');
const statusContainer = document.getElementById('statusContainer');
const invoicesList = document.getElementById('invoicesList');
const emptyInvoices = document.getElementById('emptyInvoices');
const invoiceCount = document.getElementById('invoiceCount');


function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const colors = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    toast.className = `fixed bottom-4 right-4 z-50 px-6 py-4 rounded-xl text-white font-semibold shadow-2xl toast ${colors[type] || colors.success}`;
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 5000);
}



function generateProductId() {
    return 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function createProductRow(product = null) {
    const id = product?.id || generateProductId();
    const name = product?.name || '';
    const quantity = product?.quantity || 1;
    const unitPrice = product?.unitPrice || 0;

    const row = document.createElement('div');
    row.className = 'product-row grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-xl bg-white/50 border border-gray-100';
    row.dataset.productId = id;

    row.innerHTML = `
        <div class="sm:col-span-5">
            <input
                type="text"
                class="product-name w-full px-3 py-2 rounded-lg border border-gray-200 input-focus bg-white outline-none text-sm"
                placeholder="Nom du produit"
                value="${name}"
                required
            />
        </div>
        <div class="sm:col-span-2">
            <input
                type="number"
                class="product-quantity w-full px-3 py-2 rounded-lg border border-gray-200 input-focus bg-white outline-none text-sm"
                placeholder="Qté"
                value="${quantity}"
                min="1"
                required
            />
        </div>
        <div class="sm:col-span-3">
            <input
                type="number"
                class="product-price w-full px-3 py-2 rounded-lg border border-gray-200 input-focus bg-white outline-none text-sm"
                placeholder="Prix unitaire"
                value="${unitPrice}"
                min="0"
                step="0.01"
                required
            />
        </div>
        <div class="sm:col-span-1 flex items-center justify-center">
            <span class="product-line-total text-sm font-semibold text-emerald-600">
                ${formatCurrency(quantity * unitPrice)}
            </span>
        </div>
        <div class="sm:col-span-1 flex items-center justify-end">
            <button
                type="button"
                class="remove-btn text-red-400 hover:text-red-600 transition-all p-1"
                onclick="removeProduct('${id}')"
                title="Supprimer"
            >
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    const nameInput = row.querySelector('.product-name');
    const quantityInput = row.querySelector('.product-quantity');
    const priceInput = row.querySelector('.product-price');

    const updateLineTotal = () => {
        const qty = parseFloat(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const total = qty * price;
        row.querySelector('.product-line-total').textContent = formatCurrency(total);
        updateTotalGeneral();
    };

    nameInput.addEventListener('input', updateLineTotal);
    quantityInput.addEventListener('input', updateLineTotal);
    priceInput.addEventListener('input', updateLineTotal);

    // Mettre à jour l'état
    if (!product) {
        const newProduct = { id, name: '', quantity: 1, unitPrice: 0 };
        products.push(newProduct);
    }

    return row;
}

function addProduct(product = null) {
    const row = createProductRow(product);
    productsContainer.appendChild(row);
    updateUI();
    updateTotalGeneral();
    row.classList.add('wow', 'animate__animated', 'animate__fadeInRight');
}

function removeProduct(productId) {
    const row = document.querySelector(`[data-product-id="${productId}"]`);
    if (row) {
        row.style.transform = 'translateX(100px)';
        row.style.opacity = '0';
        setTimeout(() => {
            row.remove();
            products = products.filter(p => p.id !== productId);
            updateUI();
            updateTotalGeneral();
        }, 300);
    }
}

function getProductsFromDOM() {
    const rows = productsContainer.querySelectorAll('.product-row');
    const productsList = [];

    rows.forEach(row => {
        const id = row.dataset.productId;
        const name = row.querySelector('.product-name').value.trim();
        const quantity = parseFloat(row.querySelector('.product-quantity').value) || 0;
        const unitPrice = parseFloat(row.querySelector('.product-price').value) || 0;

        if (name) {
            productsList.push({ name, quantity, unitPrice });
        }
    });

    return productsList;
}

//Calcule Total

function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-MG', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount) + ' Ar';
}

function updateTotalGeneral() {
    const productsList = getProductsFromDOM();
    const total = productsList.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
    totalGeneral.textContent = formatCurrency(total);
    return total;
}



function updateUI() {
    const rows = productsContainer.querySelectorAll('.product-row');
    if (rows.length === 0) {
        emptyProducts.classList.remove('hidden');
    } else {
        emptyProducts.classList.add('hidden');
    }
}

//Appel API

async function apiCall(method, endpoint, data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${API_PREFIX}${endpoint}`, options);
    
    // Gérer les réponses 204 No Content
    if (response.status === 204) {
        return { success: true, data: null };
    }

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Une erreur est survenue');
    }

    return result;
}



function getInvoiceData() {
    const clientEmail = clientEmailInput.value.trim();
    if (!clientEmail) {
        showToast('Veuillez entrer un email valide', 'error');
        clientEmailInput.focus();
        return null;
    }

    const productsList = getProductsFromDOM();
    if (productsList.length === 0) {
        showToast('Veuillez ajouter au moins un produit', 'error');
        return null;
    }

    const total = updateTotalGeneral();

    return {
        clientEmail,
        products: productsList,
        total
    };
}



async function createInvoice() {
    if (isProcessing) return;

    const invoiceData = getInvoiceData();
    if (!invoiceData) return;

    isProcessing = true;
    setLoading(true, 'Création de la facture...');

    try {
        //Créer la facture via POST /
        const createResult = await apiCall('POST', '/', invoiceData);
        
        if (!createResult.success && createResult.statusCode === 400) {
            throw new Error(createResult.message || 'Erreur de validation');
        }

        const invoiceId = createResult.data?.id || createResult.id;
        
        if (!invoiceId) {
            throw new Error('ID de facture non reçu');
        }

        currentInvoiceId = invoiceId;
        showToast(' Facture créée avec succès !', 'success');

        // Générer le PDF automatiquement
        setLoading(true, 'Génération du PDF...');
        await apiCall('POST', `/${invoiceId}/export?format=A4`);
        showToast(' PDF généré avec succès !', 'success');

        //  Envoyer l'email automatiquement avec le PDF
        setLoading(true, 'Envoi de l\'email...');
        await apiCall('POST', `/${invoiceId}/email?format=A4`);
        showToast(`Facture envoyée à ${invoiceData.clientEmail} !`, 'success');

        //  Ajouter à l'historique
        addInvoiceToHistory({
            id: invoiceId,
            clientEmail: invoiceData.clientEmail,
            total: invoiceData.total,
            products: invoiceData.products,
            createdAt: new Date().toISOString()
        });

        //Télécharger le PDF
        const downloadUrl = `${API_BASE_URL}${API_PREFIX}/${invoiceId}/download?format=A4`;
        window.open(downloadUrl, '_blank');

        // Réinitialiser le formulaire
        setTimeout(() => {
            resetForm();
        }, 2000);

        showToast('Facture complète ! PDF généré et email envoyé.', 'success');

        return invoiceId;
    } catch (error) {
        console.error('Erreur:', error);
        showToast(error.message || 'Erreur lors de la création', 'error');
        return null;
    } finally {
        isProcessing = false;
        setLoading(false);
    }
}


//Uniquement PDF
async function generatePDFOnly() {
    if (isProcessing) return;

    const invoiceData = getInvoiceData();
    if (!invoiceData) return;

    isProcessing = true;
    setLoading(true, 'Génération du PDF...');

    try {
        // Créer la facture
        const createResult = await apiCall('POST', '/', invoiceData);
        
        if (!createResult.success && createResult.statusCode === 400) {
            throw new Error(createResult.message || 'Erreur de validation');
        }

        const invoiceId = createResult.data?.id || createResult.id;
        currentInvoiceId = invoiceId;

        //Générer le PDF
        await apiCall('POST', `/${invoiceId}/export?format=A4`);

        // Ajouter à l'historique
        addInvoiceToHistory({
            id: invoiceId,
            clientEmail: invoiceData.clientEmail,
            total: invoiceData.total,
            products: invoiceData.products,
            createdAt: new Date().toISOString()
        });

        //Télécharger le PDF
        const downloadUrl = `${API_BASE_URL}${API_PREFIX}/${invoiceId}/download?format=A4`;
        window.open(downloadUrl, '_blank');

        showToast('PDF généré avec succès !', 'success');

        setTimeout(() => {
            resetForm();
        }, 2000);

        return invoiceId;
    } catch (error) {
        showToast(error.message || 'Erreur lors de la génération du PDF', 'error');
        return null;
    } finally {
        isProcessing = false;
        setLoading(false);
    }
}



function resetForm() {
    // Vider les produits
    productsContainer.innerHTML = '';
    products = [];
    
    // Réinitialiser l'email
    clientEmailInput.value = '';
    
    // Ajouter un produit par défaut
    addProduct();
    
    // Mettre à jour le total
    updateTotalGeneral();
    updateUI();
    
    currentInvoiceId = null;
}


//Loading state
function setLoading(loading, message = 'Chargement...') {
    const btns = [createInvoiceBtn, generatePdfBtn, addProductBtn];
    btns.forEach(btn => {
        btn.disabled = loading;
        btn.style.opacity = loading ? '0.6' : '1';
        btn.style.cursor = loading ? 'not-allowed' : 'pointer';
    });

    if (loading) {
        statusContainer.classList.remove('hidden');
        statusContainer.className = 'mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center gap-3';
        statusContainer.innerHTML = `
            <div class="spinner w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>${message}</span>
        `;
    } else {
        statusContainer.classList.add('hidden');
    }
}

//Historique de Facture

function addInvoiceToHistory(invoice) {
    let history = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');

    const existingIndex = history.findIndex(h => h.id === invoice.id);
    if (existingIndex !== -1) {
        history[existingIndex] = invoice;
    } else {
        history.unshift(invoice);
    }

    // Garder seulement les 50 dernières
    if (history.length > 50) {
        history = history.slice(0, 50);
    }

    localStorage.setItem('invoiceHistory', JSON.stringify(history));
    renderInvoiceHistory();
}

function renderInvoiceHistory() {
    const history = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');

    if (history.length === 0) {
        invoicesList.innerHTML = '';
        emptyInvoices.classList.remove('hidden');
        invoiceCount.textContent = '0 factures';
        return;
    }

    emptyInvoices.classList.add('hidden');
    invoiceCount.textContent = `${history.length} facture${history.length > 1 ? 's' : ''}`;

    invoicesList.innerHTML = history.map(invoice => `
        <div class="glass-effect rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all wow animate__animated animate__fadeInUp">
            <div class="flex items-start justify-between mb-2">
                <div>
                    <span class="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        #${invoice.id?.substring(0, 8) || 'N/A'}
                    </span>
                </div>
                <span class="text-xs text-gray-400">
                    ${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'Date inconnue'}
                </span>
            </div>
            <p class="text-sm text-gray-600 truncate">
                <i class="fas fa-envelope text-emerald-500 mr-1"></i>
                ${invoice.clientEmail || 'Email non défini'}
            </p>
            <p class="text-lg font-bold text-emerald-600 mt-2">
                ${formatCurrency(invoice.total || 0)}
            </p>
            <p class="text-xs text-gray-400 mt-1">
                ${invoice.products?.length || 0} produit${invoice.products?.length > 1 ? 's' : ''}
            </p>
            <div class="flex gap-2 mt-3 flex-wrap">
                <button
                    onclick="downloadInvoicePDF('${invoice.id}')"
                    class="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3 py-1 rounded-lg transition-colors"
                >
                    <i class="fas fa-download"></i> PDF
                </button>
                <button
                    onclick="resendInvoiceEmail('${invoice.id}')"
                    class="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-lg transition-colors"
                >
                    <i class="fas fa-paper-plane"></i> Renvoyer
                </button>
                <button
                    onclick="deleteInvoice('${invoice.id}')"
                    class="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-lg transition-colors"
                >
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    if (typeof WOW !== 'undefined') {
        new WOW().init();
    }
}


async function downloadInvoicePDF(invoiceId) {
    try {
        const downloadUrl = `${API_BASE_URL}${API_PREFIX}/${invoiceId}/download?format=A4`;
        window.open(downloadUrl, '_blank');
        showToast('📄 Téléchargement du PDF en cours...', 'info');
    } catch (error) {
        showToast('Erreur lors du téléchargement', 'error');
    }
}

async function resendInvoiceEmail(invoiceId) {
    try {
        setLoading(true, 'Renvoy de la facture...');
        await apiCall('POST', `/${invoiceId}/email?format=A4`);
        showToast('📧 Facture renvoyée avec succès !', 'success');
    } catch (error) {
        showToast(error.message || 'Erreur lors du renvoi', 'error');
    } finally {
        setLoading(false);
    }
}

async function deleteInvoice(invoiceId) {
    if (!confirm('Voulez-vous vraiment supprimer cette facture ?')) return;

    try {
        await apiCall('DELETE', `/${invoiceId}`);
        
        // Supprimer de l'historique
        let history = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');
        history = history.filter(h => h.id !== invoiceId);
        localStorage.setItem('invoiceHistory', JSON.stringify(history));
        
        renderInvoiceHistory();
        showToast('Facture supprimée avec succès', 'success');
    } catch (error) {
        showToast(error.message || 'Erreur lors de la suppression', 'error');
    }
}


// Ajouter un produit
addProductBtn.addEventListener('click', () => {
    addProduct();
});

// Créer la facture (CREATE - Principal)
createInvoiceBtn.addEventListener('click', createInvoice);

// Générer PDF seulement
generatePdfBtn.addEventListener('click', generatePDFOnly);

// Entrée pour ajouter un produit rapidement
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        const inputs = document.querySelectorAll('input');
        const lastInput = inputs[inputs.length - 1];
        if (e.target === lastInput) {
            addProduct();
        }
    }
});


// Ajouter un produit par défaut
addProduct();

// Charger l'historique
renderInvoiceHistory();

console.log('Invoice Manager initialisé avec succès !');
console.log('Fonctionnalités:');
console.log('Création de facture (POST /invoices)');
console.log('Génération PDF (POST /invoices/:id/export)');
console.log('Envoi email (POST /invoices/:id/email)');
console.log('Téléchargement PDF (GET /invoices/:id/download)');
console.log('Historique localStorage');



window.addProduct = addProduct;
window.removeProduct = removeProduct;
window.createInvoice = createInvoice;
window.generatePDFOnly = generatePDFOnly;
window.downloadInvoicePDF = downloadInvoicePDF;
window.resendInvoiceEmail = resendInvoiceEmail;
window.deleteInvoice = deleteInvoice;
window.formatCurrency = formatCurrency;
window.resetForm = resetForm;