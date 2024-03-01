if (!customElements.get('subscription-form')) {
  customElements.define('subscription-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.querySelector('[name=id]').disabled = false;
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.cartNotification = document.querySelector('cart-notification');
    }

    onSubmitHandler(evt) {
      evt.preventDefault();
      const propertiesId = this.querySelector(".properties_id");
      const uuid = generateUUID();
      propertiesId.value = uuid;
      const submitButton = this.querySelector('[type="submit"]');
      if (submitButton.classList.contains('loading')) return;

      this.handleErrorMessage();
      this.cartNotification.setActiveElement(document.activeElement);

      submitButton.setAttribute('aria-disabled', true);
      submitButton.classList.add('loading');
      this.querySelector('.loading-overlay__spinner').classList.remove('hidden');

      const config = fetchConfig('javascript');
      config.headers['content-type'] = 'application/json';

      const propertiesArray = document.querySelectorAll('[name*=properties]');
      const properties = {};
      propertiesArray.forEach(node => {
        const middle = node.name.slice(
            node.name.indexOf('[') + 1,
            node.name.lastIndexOf(']'),
        );
        properties[middle] = node.value;
      });

      const variantIDs = document.getElementById("variants_ids").value.split(",");
      const sellingPlan = document.getElementById("selling_plan").value;

      const products = [];
      variantIDs.forEach(variant => {
        variant && products.push({
          id: variant,
          quantity: 1,
          selling_plan: sellingPlan,
          properties: properties,
        })
      })

      let formData = {
        items: products
      };
      config.body = JSON.stringify(formData);
      config.method = 'POST';
      fetch(window.Shopify.routes.root + 'cart/add.js', config)
      // fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            this.handleErrorMessage(response.description);
            return;
          }
          window.location.href = "/checkout";
          this.cartNotification.renderContents(response.items[0]);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          submitButton.classList.remove('loading');
          submitButton.removeAttribute('aria-disabled');
          this.querySelector('.loading-overlay__spinner').classList.add('hidden');
        });
    }

    handleErrorMessage(errorMessage = false) {
      this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    }
  });
}

function generateUUID() {
  let d = new Date().getTime();
  let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16;
    if(d > 0){
      r = (d + r)%16 | 0;
      d = Math.floor(d/16);
    } else {
      r = (d2 + r)%16 | 0;
      d2 = Math.floor(d2/16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
