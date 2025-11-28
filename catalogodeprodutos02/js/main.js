// ui glue: depends on produtos.js which provides loadProducts(), productsData and events
$(function() {
    // cache elements used by produtos.js
    window.$loadBtn = $('#load-products');
    window.$loading = $('#loading');
    window.$errorMessage = $('#error-message');
    window.$errorText = $('#error-text');
    window.$successMessage = $('#success-message');
    window.$successText = $('#success-text');
    window.$productsContainer = $('#products-container');
    window.$productsCount = $('#products-count');

    // When products are loaded by produtos.js, populate categories and enable searching/filtering
    $(document).on('productsLoaded', function(ev, produtos) {
        populateCategories(produtos);
        renderCards(produtos);
    });

    // Bind search/filter/sort
    $('#search').on('input', function() {
        applyFilters();
    });
    $('#filterCat').on('change', function(){ applyFilters(); });
    $('#sortBy').on('change', function(){ applyFilters(); });

    // delegate view details
    $(document).on('click', '.view-details', function(){
        const id = $(this).data('id');
        openModalWithProduct(id);
    });

    $('#modal-close').on('click', closeModal);
    $('#modal').on('click', function(e){ if(e.target === this) closeModal(); });

    function populateCategories(produtos){
        const cats = [...new Set(produtos.map(p=>p.categoria))].sort();
        const $sel = $('#filterCat').html('<option value="">Todas as categorias</option>');
        cats.forEach(c=> $sel.append(`<option value="${c}">${c}</option>`));
    }

    function renderCards(produtos){
        $productsContainer.empty();
        if(!produtos || produtos.length===0){
            $productsContainer.html('<div class="no-products">Nenhum produto encontrado</div>');
            return;
        }
        produtos.forEach(p=>{
            $productsContainer.append(createCardHtml(p));
        });
    }

    function createCardHtml(p){
        const stockClass = (p.estoque===0)?'out-of-stock':(p.estoque<10?'low-stock':(p.estoque>30?'high-stock':'medium-stock'));
        const price = typeof p.preco === 'number' ? p.preco.toFixed(2).replace('.',',') : p.preco;
        return `
            <article class="product-card" data-id="${p.id}" data-category="${p.categoria}">
                <div class="product-image"><img src="${p.imagem || 'assets/images/placeholder.png'}" alt="${p.nome}"></div>
                <div class="product-info">
                    <div class="product-category">${p.categoria}</div>
                    <h3 class="product-name">${p.nome}</h3>
                    <p class="product-description">${p.descricao}</p>
                    <div class="product-footer">
                        <div class="product-price">R$ ${price}</div>
                        <div class="product-stock ${stockClass}">${p.estoque} em estoque</div>
                    </div>
                    <div class="product-actions">
                        <button class="btn secondary view-details" data-id="${p.id}">Ver Detalhes</button>
                    </div>
                </div>
            </article>
        `;
    }

    function applyFilters(){
        if(!window.productsData || !window.productsData.produtos) return;
        let list = window.productsData.produtos.slice();
        const termo = $('#search').val().toLowerCase();
        const cat = $('#filterCat').val();
        const sort = $('#sortBy').val();

        if(termo){
            list = list.filter(p=> p.nome.toLowerCase().includes(termo) || (p.descricao||'').toLowerCase().includes(termo));
        }
        if(cat){
            list = list.filter(p=> p.categoria === cat);
        }
        if(sort==='nome'){
            list.sort((a,b)=> a.nome.localeCompare(b.nome));
        } else if(sort==='preco-asc'){
            list.sort((a,b)=> a.preco - b.preco);
        } else if(sort==='preco-desc'){
            list.sort((a,b)=> b.preco - a.preco);
        }

        renderCards(list);
        $('#products-count').text(`${list.length} produto(s) exibido(s)`);
    }

    function openModalWithProduct(id){
        if(!window.productsData || !window.productsData.produtos) return;
        const p = window.productsData.produtos.find(x=> x.id==id);
        if(!p) return;
        const html = `
            <div style="display:flex;gap:16px;flex-wrap:wrap">
              <div style="flex:1 1 260px">
                <img src="${p.imagem || 'assets/images/placeholder.png'}" alt="${p.nome}" style="width:100%;border-radius:8px;max-height:360px;object-fit:contain">
              </div>
              <div style="flex:1 1 320px">
                <h2>${p.nome}</h2>
                <div style="margin:6px 0" class="product-category">${p.categoria}</div>
                <p>${p.descricao}</p>
                <p><strong>Preço:</strong> R$ ${typeof p.preco==='number'?p.preco.toFixed(2).replace('.',','):p.preco}</p>
                <p><strong>Estoque:</strong> ${p.estoque}</p>
              </div>
            </div>
        `;
        $('#modal-body').html(html);
        $('#modal').fadeIn(180);
    }

    function closeModal(){ $('#modal').fadeOut(150); }

    // expose applyFilters for external use
    window.applyFilters = applyFilters;

});
