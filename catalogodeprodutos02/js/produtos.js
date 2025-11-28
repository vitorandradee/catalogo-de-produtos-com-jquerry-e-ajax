// produtos.js - carregamento AJAX e renderização (adaptado)
window.productsData = null;
let isLoading = false;

// Declarar variáveis sem inicializar
let $loadBtn, $loading, $errorMessage, $errorText, $successMessage, $successText, $productsContainer, $productsCount;

function loadProducts() {
    if (isLoading) return;
    isLoading = true;
    showLoadingState();
    $.ajax({
        url: 'produtos.json',
        type: 'GET',
        dataType: 'json',
        timeout: 10000,
        success: function(response) {
            handleSuccess(response);
        },
        error: function(xhr, status, error) {
            handleError(xhr, status, error);
        },
        complete: function() {
            isLoading = false;
            if ($loadBtn) $loadBtn.prop('disabled', false).removeClass('disabled');
        }
    });
}

function showLoadingState() {
    if ($errorMessage) $errorMessage.hide();
    if ($successMessage) $successMessage.hide();
    if ($loading) $loading.show();
    if ($loadBtn) $loadBtn.prop('disabled', true).addClass('disabled');
    if ($productsCount) $productsCount.text('Carregando produtos...');
}

function handleSuccess(response) {
    if ($loading) $loading.hide();
    if (!isValidResponse(response)) {
        showError('Estrutura de dados inválida no arquivo JSON');
        return;
    }
    window.productsData = response;
    showSuccessMessage(response.mensagem || 'Produtos carregados com sucesso!');
    displayProducts(response.produtos);
    updateProductsCount(response.produtos.length);
    $(document).trigger('productsLoaded', [response.produtos]);
}

function handleError(xhr, status, error) {
    if ($loading) $loading.hide();
    if ($loadBtn) $loadBtn.prop('disabled', false).removeClass('disabled');
    let errorMessage = 'Erro ao carregar produtos: ';
    switch (status) {
        case 'timeout':
            errorMessage += 'Tempo de requisição excedido. Verifique sua conexão.';
            break;
        case 'error':
            if (xhr.status === 404) {
                errorMessage += 'Arquivo produtos.json não encontrado. Verifique o caminho.';
            } else if (xhr.status === 0) {
                errorMessage += 'Não foi possível conectar ao servidor. Use Live Server.';
            } else {
                errorMessage += `Erro ${xhr.status}: ${error}`;
            }
            break;
        case 'parsererror':
            errorMessage += 'Erro ao processar JSON. Verifique a sintaxe do arquivo.';
            break;
        case 'abort':
            errorMessage += 'Requisição cancelada.';
            break;
        default:
            errorMessage += `Erro desconhecido: ${error}`;
    }
    showError(errorMessage);
    console.error('Erro AJAX:', {status, error, xhr});
}

function isValidResponse(response) {
    if (!response) return false;
    if (!response.produtos || !Array.isArray(response.produtos)) return false;
    if (response.produtos.length === 0) return true;
    const firstProduct = response.produtos[0];
    const requiredFields = ['id', 'nome', 'categoria', 'preco', 'descricao', 'estoque'];
    for (let field of requiredFields) if (!(field in firstProduct)) return false;
    return true;
}

function showError(message) {
    if ($errorText) $errorText.text(message);
    if ($errorMessage) $errorMessage.fadeIn(300);
    setTimeout(()=> { if ($errorMessage) $errorMessage.fadeOut(400); }, 10000);
}

function showSuccessMessage(message) {
    if ($successText) $successText.text(message);
    if ($successMessage) $successMessage.fadeIn(300);
    if ($loadBtn) $loadBtn.prop('disabled', false).removeClass('disabled');
    setTimeout(()=> { if ($successMessage) $successMessage.fadeOut(400); }, 5000);
}

function displayProducts(products) {
    if (!$productsContainer) return;
    
    $productsContainer.empty();
    if (!products || products.length === 0) {
        $productsContainer.html('<div class="no-products"><h3>Nenhum produto encontrado</h3></div>');
        return;
    }
    products.forEach(product=>{
        const productCard = createProductCard(product);
        $productsContainer.append(productCard);
    });
    $productsContainer.find('.product-card').hide().each(function(index){
        $(this).delay(80*index).fadeIn(220);
    });
}

function createProductCard(product) {
    const stockClass = getStockClass(product.estoque);
    const formattedPrice = formatPrice(product.preco);
    return `
        <div class="product-card" data-id="${product.id}" data-category="${product.categoria}">
            <div class="product-image">
                <img src="${product.imagem || 'assets/images/placeholder.png'}" alt="${product.nome}" onerror="this.src='assets/images/placeholder.png'">
            </div>
            <div class="product-info">
                <span class="product-category">${product.categoria}</span>
                <h3 class="product-name">${product.nome}</h3>
                <p class="product-description">${product.descricao}</p>
                <div class="product-footer">
                    <div class="product-price">R$ ${formattedPrice}</div>
                    <div class="product-stock ${stockClass}">${product.estoque} em estoque</div>
                </div>
                <div class="product-actions">
                    <button class="btn btn-details view-details" data-id="${product.id}">Ver Detalhes</button>
                </div>
            </div>
        </div>
    `;
}

function getStockClass(estoque) {
    if (estoque === 0) return 'out-of-stock';
    if (estoque < 10) return 'low-stock';
    if (estoque > 30) return 'high-stock';
    return 'medium-stock';
}

function formatPrice(price) {
    return parseFloat(price).toFixed(2).replace('.',',');
}

function updateProductsCount(count) {
    if ($productsCount) $productsCount.text(`${count} produto(s) carregado(s)`);
}

function getProductsData(){ return window.productsData; }
function isDataLoaded(){ return window.productsData !== null; }
function reloadProducts(){ window.productsData = null; loadProducts(); }

$(document).ready(function(){
    // INICIALIZAR VARIÁVEIS AQUI - quando o DOM estiver pronto
    $loadBtn = $('#load-products');
    $loading = $('#loading');
    $errorMessage = $('#error-message');
    $errorText = $('#error-text');
    $successMessage = $('#success-message');
    $successText = $('#success-text');
    $productsContainer = $('#products-container');
    $productsCount = $('#products-count');

    $loadBtn.on('click', loadProducts);
    $(document).on('keypress', function(e){ if(e.which===13) loadProducts(); });
    // REMOVIDO: handler duplicado para .view-details
});

if (typeof module !== 'undefined' && module.exports) module.exports = { loadProducts, getProductsData, isDataLoaded, reloadProducts };