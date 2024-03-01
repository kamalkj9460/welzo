$(document).ready(function (){
    let includeToOrderList = [];

    // Re-order button listener
    $('.customer.account .re-order-btn').click(function (){
        doReOrder($(this).data('order-id'), $(this), false);
    });

    // Order details page Re-order button listener
    $('.customer.order .re-order-btn').click(function (){
        doReOrder($(this).data('order-id'), $(this), true);
    });

    // Order details page listener
    $('.order-details .re-order-checkbox').click(function (){
        let listId = $(this).data('list-id');
        let isChecked = $(this).is(':checked');

        if (listId === '#'){
            $('.re-order-checkbox').not('[data-list-id="#"]').prop('checked', isChecked);
        } else {

            // change total checkbox
            $('.re-order-checkbox[data-list-id="#"]').prop('checked', isAllCheckded());
        }

        makeIncludeToOrderList();
    })

    function isAllCheckded(){
        let checked = true;
        let allTableCheckbox = $('.re-order-checkbox').not('[data-list-id="#"]');

        allTableCheckbox.each(function (item){
            if ($(this).is(':checked') === false) {
                checked = false;
            }
        })

        return checked;
    }

    function makeIncludeToOrderList() {
        let allTableCheckbox = $('.re-order-checkbox').not('[data-list-id="#"]');
        let atLeastOneChecked = false;
        includeToOrderList = [];

        allTableCheckbox.each(function (item){
            includeToOrderList.push($(this).is(':checked'));

            if ($(this).is(':checked')) {
                atLeastOneChecked = true;
            }
        })

        if (atLeastOneChecked === false) {
            $('.re-order-btn').prop('disabled', true);

        } else {
            $('.re-order-btn').prop('disabled', false);
        }
    }

    // re-order function
    async function doReOrder(orderId, element, isOrderDetails){
        let order;

        // find current order
        odersList.forEach(function (item){
            let itemOrderId = Object.keys(item)[0];

           if (itemOrderId.includes(orderId)) {
               order = item[itemOrderId];
           }
        });

        if (order) {
            let requestData = {
                items: []
            };
            let count = 0;

            // add properties and add product to request data
            order.forEach(function (item) {
                let properties = {};

                item.properties.forEach(function (item){
                    let itemKey = item[0];
                    let itemValue = item[1];
                    properties[itemKey] = itemValue;
                });

                if (isOrderDetails === true && includeToOrderList.length > 0) {
                    if (includeToOrderList[count]) {
                        requestData.items.push({
                            quantity: item.quantity,
                            maxQuantity: item.maxQuantity,
                            id: item.variant_id,
                            productId: item.product.id,
                            properties: properties
                        });
                    }
                } else {
                    requestData.items.push({
                        quantity: item.quantity,
                        maxQuantity: item.maxQuantity,
                        id: item.variant_id,
                        productId: item.product.id,
                        properties: properties
                    });
                }

                count++;
            });

            // add animated loader
            element.append('<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_ajPY{transform-origin:center;animation:spinner_AtaB .75s infinite linear}@keyframes spinner_AtaB{100%{transform:rotate(360deg)}}</style><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z" class="spinner_ajPY"/></svg>');
            element.addClass('loading');

            /// check cart product limit
            let isPass = await checkCartProductQuantity(requestData).then(function (result){
                return result;
            });

            // send request
            if (isPass) {
                $.ajax({
                    type: 'post',
                    url: '/cart/add.js',
                    data: requestData,
                    dataType: 'json',
                    success: function(response){
                        element.find('svg').remove();
                        element.removeClass('loading');
                    }
                });
            } else {
                element.find('svg').remove();
                element.removeClass('loading');
            }
        }
    }

    // check product quantity limit
    async function checkCartProductQuantity(requestData) {
        let isPass = true;
        let cartResponse = await getCart();
        let cartItems = cartResponse.items;
        let requestItems = requestData.items;

        cartItems.forEach(function (cartItem){
            let cartQuantity = parseInt(cartItem.quantity);
            let cartItemId = cartItem.product_id;

            requestItems.forEach(function (requestItem){
                let maxQuantity = parseInt(requestItem.maxQuantity);
                let requestQuantity = parseInt(requestItem.quantity);
                let requestItemId = requestItem.productId;
                let potentialQuantity = cartQuantity + requestQuantity;

                if (cartItemId === requestItemId){
                    if (potentialQuantity - maxQuantity > -1) {
                        isPass = false;
                    }
                }
            });
        });

        return isPass;
    }

    // get item from cart
    function getCart() {
        return $.ajax({
            type: 'GET',
            url: '/cart.js',
            cache: false,
            dataType: 'json',
            success: function(cart) {
                return cart;
            }
        });
    }
});