$(function() {
    //BEGIN
    $(".accordion1__title").on("click", function(e) {
        e.preventDefault();
        var $this = $(this);
        if (!$this.hasClass("accordion1-active")) {
            $(".accordion1__content").slideUp(400);
            $(".accordion1__title").removeClass("accordion1-active");
            $('.accordion1__arrow').removeClass('accordion1__rotate');
        }
        $this.toggleClass("accordion1-active");
        $this.next().slideToggle();
        $('.accordion1__arrow',this).toggleClass('accordion1__rotate');
    });
    //END
});

(function($) {
    $(function() {
        $("ul.product1-tabs__caption").on("click", "li:not(.product1-active)", function() {
            $(this)
                .addClass("product1-active")
                .siblings()
                .removeClass("product1-active")
                .closest("div.product1-tabs")
                .find("div.product1-tabs__content")
                .removeClass("product1-active")
                .eq($(this).index())
                .addClass("product1-active");
        });
    });
})(jQuery);

const swiper = new Swiper(".pdp-thumbs-slider:not(.mobile)", { //1
    spaceBetween: 20,
    slidesPerView: 4,
    freeMode: true,
    watchSlidesProgress: true,
});

const swiper2 = new Swiper(".pdp-main-slider:not(.mobile)", { //2
    slidesPerView: 1,
    spaceBetween: 20,
    navigation: {
        nextEl: ".pdp-main-slider:not(.mobile) .swiper-button-next",
        prevEl: ".pdp-main-slider:not(.mobile) .swiper-button-prev",
    },
    thumbs: {
        swiper: swiper,
    },
});

const swiper3 = new Swiper(".pdp-thumbs-slider.mobile", { //1
    spaceBetween: 20,
    slidesPerView: 4,
    freeMode: true,
    watchSlidesProgress: true,
});

const swiper4 = new Swiper(".pdp-main-slider.mobile", { //2
    slidesPerView: 1,
    spaceBetween: 20,
    navigation: {
        nextEl: ".pdp-main-slider.mobile .swiper-button-next",
        prevEl: ".pdp-main-slider.mobile .swiper-button-prev",
    },
    thumbs: {
        swiper: swiper3,
    },
});

$('.subscription-product__variant').click(function() {
    $('.subscription-product__variant-active').removeClass('subscription-product__variant-active');
    $('.subscription-product__button-not-active').removeClass('subscription-product__button-not-active');
    $(this).addClass('subscription-product__variant-active').find('input').prop('checked', true)
    const radio = $(this).find('input');
    const sellingPlanId = $(this).attr('selling-plan-id')
    $('#button-subscribe').attr("href", function(i, href){
        const index = href.indexOf("?");
        return (index == -1 ? href : href.substring(0, index)) + "?selling-plan-id=" + sellingPlanId;
    });

    if ($(this).prop('id') === "radio-subscribe") {
        $('#button-add-to-cart').addClass('subscription-product__button-not-active')
        $('#add-to-cart-modal-opener').addClass('subscription-product__button-not-active')
    }
    if ($(this).prop('id') === "radio-add-to-cart") {
        $('#button-subscribe').addClass('subscription-product__button-not-active')
    }
});

$(document).ready(function(){
    if($('.mcd_description-text-open').length){
        $('.mcd_description-text-open').on('click', function (e) {
            e.preventDefault();
            $('.mcd_description-text').toggleClass('short');
        });
    }
});

function getCartData() {
    return new Promise(resolve => {
        $.get( window.Shopify.routes.root + 'cart.aio.min.js', function( data ) {
            resolve(data);
        });
    })
}

async function checkCartQTY(block, id) {
    let cart_qty = 0;
    let cartJson = await getCartData();
    cart = JSON.parse(cartJson);
    console.log(cart)
    for (let i = 0; i < cart.items.length; i++) {
        if (cart.items[i].id == id) {
            cart_qty = cart.items[i].quantity
        }
    }
    let val = block.val();
    let max = block.attr('max') - cart_qty;
    if (val >= max) {
        if (block.parents('.product-form__quantity').find('.warning').length > 0) {
            block.parents('.product-form__quantity').find('.warning').css('display', 'flex');
        } else {
            block.parents('.product__info-container').find('.warning').css('display', 'flex');
        }

        block.parent().find('.quantity__button.plus').attr('disabled', 'disabled');
        this.value = max;
    } else if(val < max){
        $('.warning').css('display', 'none');
        block.parent().find('.quantity__button.plus').removeAttr('disabled');
    }
    if (block.attr('max') == cart_qty) {
        if (block.closest('form').length > 0) {
            block.closest('form').find('.product-form__submit').attr('disabled', 'disabled');
        } else {
            block.closest('.product__info-container').find('.product-form__submit').attr('disabled', 'disabled');
        }
    } else if(val < max){
        if (block.closest('form').length > 0) {
            block.closest('form').find('.product-form__submit').removeAttr('disabled');
        } else {
            block.closest('.product__info-container').find('.product-form__submit').removeAttr('disabled');
        }
    }
    console.log(val);
    console.log(max);
}

$('.quantity__input').change(function() {
    let id = 0;
    if ($(this).closest('form').length > 0) {
        id = $(this).closest('form').find('[name="id"]').val()
    } else {
        id = $(this).closest('.product2__form-block').find('[name="id"]').val()
    }
    checkCartQTY($(this),id);
});

$(document).ready(function(){
    $('.quantity__input').each(function() {
        let id = 0;
        if ($(this).closest('form').length > 0) {
            id = $(this).closest('form').find('[name="id"]').val()
        } else {
            id = $(this).closest('.product2__form-block').find('[name="id"]').val()
        }
        checkCartQTY($(this),id);
    });

    let intervalCounter = 0;

    let checkSealsubs = setInterval(function () {
        if ($('.sealsubs-target-element').length > 0 && !$('.sealsubs-target-element').is(':empty')) {
            changePurchaseOptionsPrice();
                $('.sls-option-container').click(function (){
                changePurchaseOptionsPrice($(this));
            })
            clearInterval(checkSealsubs);
        } else if(intervalCounter === 100) {
            clearInterval(checkSealsubs);
        }
        intervalCounter++;
    },500);

    function changePurchaseOptionsPrice(element) {
        if (element) {
            let price = element.find('.sls-price .conversion-bear-money').text();
            $('.price-block__price').text(price);
        } else {
            let price = $('.sls-option:checked').parents('.sls-option-container').find('.sls-price .conversion-bear-money').text();
            $('.price-block__price').text(price);
        }
    }
})