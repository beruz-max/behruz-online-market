/*
 * Public payment endpoint configuration only. Never put Click merchant secrets,
 * API passwords, signatures, or raw card data in browser code.
 *
 * Once a secure backend exists, set clickCreateUrl to its authenticated HTTPS
 * payment-session endpoint. The server must price/validate the cart and create
 * the Click checkout session using server-side merchant credentials.
 */
window.VOLT_PAYMENT_CONFIG = Object.freeze({
  clickCreateUrl: ''
});
