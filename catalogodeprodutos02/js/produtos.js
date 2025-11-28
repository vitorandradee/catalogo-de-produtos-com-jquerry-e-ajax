// produtos.js - carregamento AJAX e renderização (adaptado)
let productsData = null;
let isLoading = false;

const $loadBtn = $('#load-products');
const $loading = $('#loading');
const $errorMessage = $('#error-message');
const $errorText = $('#error-text');
const $successMessage = $('#success-message');
const $successText = $('#success-text');
const $productsContainer = $('#products-container');
const $productsCount = $('#products-count');

function loadProducts() {
    if (isLoading) return;
    isLoading = true;
    showLoadingState();
    $.ajax({
        url: 'data/produtos.json',
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
            $loadBtn.prop('disabled', false).removeClass('disabled');
        }
    });
}

function showLoadingState() {
    $errorMessage.hide();
    $successMessage.hide();
    $loading.show();
    $loadBtn.prop('disabled', true).addClass('disabled');
    if ($productsCount.length) $productsCount.text('Carregando produtos...');
}

function handleSuccess(response) {
    $loading.hide();
    if (!isValidResponse(response)) {
        showError('Estrutura de dados inválida no arquivo JSON');
        return;
    }
    productsData = response;
    showSuccessMessage(response.mensagem || 'Produtos carregados com sucesso!');
    displayProducts(response.produtos);
    updateProductsCount(response.produtos.length);
    $(document).trigger('productsLoaded', [response.produtos]);
}

function handleError(xhr, status, error) {
    $loading.hide();
    $loadBtn.prop('disabled', false).removeClass('disabled');
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
    $errorText.text(message);
    $errorMessage.fadeIn(300);
    setTimeout(()=> $errorMessage.fadeOut(400), 10000);
}

function showSuccessMessage(message) {
    $successText.text(message);
    $successMessage.fadeIn(300);
    $loadBtn.prop('disabled', false).removeClass('disabled');
    setTimeout(()=> $successMessage.fadeOut(400), 5000);
}

function displayProducts(products) {
    $productsContainer.empty();
    if (!products || products.length === 0) {
        $productsContainer.html('<div class=\"no-products\"><h3>Nenhum produto encontrado</h3></div>');
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
    if ($productsCount.length) $productsCount.text(`${count} produto(s) carregado(s)`);
}

function getProductsData(){ return productsData; }
function isDataLoaded(){ return productsData !== null; }
function reloadProducts(){ productsData = null; loadProducts(); }

$(document).ready(function(){
    $loadBtn.on('click', loadProducts);
    $(document).on('keypress', function(e){ if(e.which===13) loadProducts(); });
    $(document).on('click', '.view-details', function(){ const id=$(this).data('id'); if(productsData && productsData.produtos){ const p = productsData.produtos.find(x=>x.id==id); if(p) showProductDetails(p); } });
});

function showProductDetails(product){ console.log('Detalhes:', product); }
if (typeof module !== 'undefined' && module.exports) module.exports = { loadProducts, getProductsData, isDataLoaded, reloadProducts };
