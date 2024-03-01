
  
if (!customElements.get('product-form')) {
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      if(this.form != null) {
        this.form.querySelector('[name=id]').disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cartNotification = document.querySelector('cart-notification');
      }
    }

    onSubmitHandler(evt) {
      evt.preventDefault();
      const propertiesId = this.querySelector(".properties_id");
      if(propertiesId) {
        const uuid = generateUUID();
        propertiesId.value = uuid;
      }
      const submitButton = this.querySelector('[type="submit"]');
      
      const qtyInput = this.querySelector('.quantity__input');
      
      if (submitButton.classList.contains('loading')) return;

      this.handleErrorMessage();
      this.cartNotification.setActiveElement(document.activeElement);

      submitButton.setAttribute('aria-disabled', true);
      submitButton.classList.add('loading');
      this.querySelector('.loading-overlay__spinner').classList.remove('hidden');

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];

      const formData = new FormData(this.form);
      formData.append('sections', this.cartNotification.getSectionsToRender().map((section) => section.id));
      formData.append('sections_url', window.location.pathname);
      config.body = formData;
      console.log(formData)

      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            this.handleErrorMessage(response.description);
            return;
          }

          this.cartNotification.renderContents(response);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          submitButton.classList.remove('loading');
          submitButton.removeAttribute('aria-disabled');
          if (qtyInput) {
            qtyInput.value = 0;
          } else {
            $('.quantity__input').val(0).change()
          }
          
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

const element = document.querySelector('.customer__input--birth');
element.setAttribute("max", new Date().toISOString().split('T')[0]);
element.addEventListener('input', (e)=>{
        const age = (new Date()).getFullYear() - (new Date(`${m}/${d}/${y}`)).getFullYear();
    if (e.target.value.length === 10) {
        const [d,m,y] = e.target.value.split('/');
        isDateValid = e.target.value.length === 10;
        console.log(age);
        e.target.setAttribute('style', 'border: 2px solid rgb(255, 0, 0);');
    } else {
        isDateValid = false;
      console.log('error');
    }
    if( age > 10) {
      console.log(age + "> 10 ");
    } else {
      console.log(age + "< 10" );
      
    }
    isInputDate = !!e.target.value;

    onErrorBDay();
    onButtonDisabled();
}); 