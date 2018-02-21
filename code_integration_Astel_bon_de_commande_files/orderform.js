/**/
/*
 * Astel SPRL Order Form injector
 * All rights reserved
 * No use or modification without consent
 * Creator : Charles Vanbeneden
 <charlesv@vanbemakers.com>
 * Contact : Clientele Astel
 <clientele@astel.be>
 */
var p = '', e = '', i = 1;

function cleanUp() {
	sessionStorage.setItem('token', null);
	/*
	Detruit aussi la session du comparateur
	sessionStorage.clear();
	*/
}

/*
 * Used to serialize a form's data when making ajax request
 */

function getAstelOrderForm(language, productId, divId, mode, pid) {
	try {
		// store language to session storage
		sessionStorage.setItem('language', language);
		// store mode to session storage
		mode = (typeof mode === "undefined") ? 1 : mode;
		sessionStorage.setItem('mode', mode);
		// store the div id to session storage
		sessionStorage.setItem('dataTargetDiv', divId);
		// store the product id in session
		sessionStorage.setItem('productId', productId);
		// store the pid in session
		sessionStorage.setItem('pid', pid);
		// add support for serialization of form data
		addSerializeScript();

		getHtmlForCurrentStep();

		goToTop();
	}
	catch (err) {
		console.log(err);
	}
}

function getHtmlForCurrentStep() {
// make a get request to retieve the html data to display
	var token = sessionStorage.getItem('token');
	var orpIdToShow = sessionStorage.getItem('orpIdToShow');
	var url = '//order.astel.be/orderForms/get/';
	var mode = sessionStorage.getItem('mode');
	var language = sessionStorage.getItem('language');
	var productId = sessionStorage.getItem('productId');
	var pid = sessionStorage.getItem('pid');
	var parameters = [language, productId, mode, pid, token, orpIdToShow];
	makeAjaxGetRequest(url, parameters);
}

function goBackward() {
	var token = sessionStorage.getItem('token');
	var form = document.getElementById('formStep');
	var url = '//order.astel.be/orderForms/goBackward/' + token;
	var postParameters = serialize(form);

	makeAjaxPostRequest(url, postParameters, 'validateCallBackSuccess', 'validateCallBackFailure');
}

function goForward() {
	validateStep();
}


function editExistingMobile(fromOrpId, toOrpId) {
	var token = sessionStorage.getItem('token');
	sessionStorage.setItem('windowGoToOrp', '1');
	var form = document.getElementById('formStep');
	// recup id goOrpid
	var url = '//order.astel.be/orderForms/editExistingMobile/' + token;
	var postParameters = serialize(form);
	postParameters += '&data[fromOrpId]=' + fromOrpId;
	postParameters += '&data[toOrpId]=' + toOrpId;
	makeAjaxPostRequest(url, postParameters, 'validateCallBackSuccess', 'validateCallBackFailure');
}


function cancelOrder() {
	var url = '//order.astel.be/orderForms/cancelOrder/';
	var token = sessionStorage.getItem('token');
	makeAjaxGetRequest(url, token);
	goToTop();
}

/*Validates and in case of success, display next step*/
function validateStep() {
	var token = sessionStorage.getItem('token');
	var form = document.getElementById('formStep');
	var url = '//order.astel.be/orderForms/validateStep/' + token;
	var postParameters = serialize(form);
	makeAjaxPostRequest(url, postParameters, 'validateCallBackSuccess', 'validateCallBackFailure');
}

function validateCallBackSuccess(data) {

	if (isJsonString(data)) {

		jsonResponse = JSON.parse(response);

		// Set the orpIdToShow in function of response
		// 1 - If switch between existing mobile
		if (jsonResponse.orpIdToShow) {
			sessionStorage.setItem('orpIdToShow', jsonResponse.orpIdToShow);
		}
		// 2 - If we had a new one
		if (jsonResponse.newOrpId){
			sessionStorage.setItem('orpIdToShow', jsonResponse.newOrpId);
		}

		if (jsonResponse.code == '1') {
			if (jsonResponse.redirectURL) {
				// end of the current session
				cleanUp();
				window.location.replace(jsonResponse.redirectURL);
				return true;
			}
			if (jsonResponse.ajaxNoReload) {
				// end of the current session
				return true;
			}

			// reload the display
			getHtmlForCurrentStep();

			if (jsonResponse.goToTop != 0) {
				goToTop();
			}

		} else {
			if (jsonResponse.code == '-1') {
				showMessageOnErrorModal(jsonResponse.message, 'validationErrorModal');
				highlightFieldsInErrorFromjson(jsonResponse.fieldsInError);
			} else {
				if (jsonResponse.code == '2') {
					// Do nothing, first step, display a special form
				} else {
					// Should never be in this place ?!?
					console.log('Error decoding response: Wrong json code');
				}
			}
		}
	} else {
		console.log('Error decoding response');
		divId = sessionStorage.getItem('dataTargetDiv');
		loadContentInDiv(data, divId);
		addClassToElement('orderForm', divId);
		goToTop();
		executeAfterLoad();
	}
}


function windowGoTo() {
	var orpIdToShow = sessionStorage.getItem('orpIdToShow');
	var y = getOffset(document.getElementById(orpIdToShow)).top;
	y -= 50;
	window.scrollTo(0, y);
}

/*Validates and in case of success, display next step*/
function validateStepZip() {
	var token = sessionStorage.getItem('token');
	var form = document.getElementById('formStep');
	var url = '//order.astel.be/orderForms/validateStep/' + token;
	var postParameters = serialize(form);

	makeAjaxPostRequest(url, postParameters, 'validateCallBackSuccessZip', 'validateCallBackFailure');
}

function validateCallBackSuccessZip(data) {
	if (isJsonString(data)) {
		jsonResponse = JSON.parse(response);
		if (jsonResponse.code == '1') {
			getHtmlForCurrentStep();
		} else {
			if (jsonResponse.code == '2') {
				showBackLink(jsonResponse.arguments);
			} else {
				showMessageOnErrorModal(jsonResponse.message, 'validationErrorModal');
				highlightFieldsInErrorFromjson(jsonResponse.fieldsInError);
			}
		}
	}
}

function showBackLink(url) {
//var backLink = document.getElementById('goBackLink');
	document.getElementById("goBackLink").style.display = "initial";
	document.getElementById("btnVerifZip").style.visibility = "hidden";
	document.getElementById("otherProductLink").href = url;
//
//if (backLink != null){
//    backLink.style.display = 'block';
//}
}


function validateCallBackFailure(data) {
	showMessageOnErrorModal(data, 'validationErrorModal');
	console.log('failed callback validate');
}

function bindJSFunctionsToButtons() {
	setElementClickAction('btnBackward', 'goBackward');
	setElementClickAction('btnForward', 'goForward');
	setElementClickAction('btnVerifZip', 'validateStepZip');

	var modalTitle = 'Erreurs';
	var modalButton = 'Fermer';
	if (sessionStorage.getItem('language') == 'EN') {
		modalTitle = 'Errors';
		modalButton = 'Close';
	}
	if (sessionStorage.getItem('language') == 'NL') {
		modalTitle = 'Fouten';
		modalButton = 'Sluiten';
	}
	if (sessionStorage.getItem('language') == 'DE') {
		modalTitle = 'Irrtum';
		modalButton = 'Schließen';
	}

	createModalOnDocument('orderFormModal', 'validationErrorModal', modalTitle, modalButton);
//makeSameHeight();
}

defaultSuccessCallback = function (data) {
	getAstelOrderFormSuccess(data);
}

defaultFailureCallback = function (data) {
	getAstelOrderFormFailure(data);
}

/* END Overrides default callbacks */

function getAstelOrderFormSuccess(data) {
// data is the HTML output to load in the content div
	divId = sessionStorage.getItem('dataTargetDiv');
	loadContentInDiv(data, divId);
	addClassToElement('orderForm', divId);

// set actions related to current step
	var stepElement = document.getElementById('step');

	bindJSFunctionsToButtons();

	setToken();

	var needCleanup = document.getElementById('do_cleanup');

	if (needCleanup != null) {
		cleanUp();
	}

	// We move the window to the Orp to show if we edit a mobile
	var windowGoToOrp = sessionStorage.getItem('windowGoToOrp');
	if (windowGoToOrp == '1') {
		windowGoTo();
	}
	sessionStorage.setItem('windowGoToOrp', '0');

	executeAfterLoad();
}

function setToken() {
	// get the token from inner div field
	var token = document.getElementById('token');

	if (token != null) {
		sessionStorage.setItem('token', token.value);
	}
}

function getAstelOrderFormFailure(data) {
	console.log('Failed to get astel order form');
}

function addMobileSubscription(fromOrpId) {
	sessionStorage.setItem('windowGoToOrp', '1');
	var token = sessionStorage.getItem('token');
	var form = document.getElementById('formStep');
	var url = '//order.astel.be/orderForms/addMobileSubscription/' + token;
	var postParameters = serialize(form);
	postParameters += '&data[fromOrpId]=' + fromOrpId;
	makeAjaxPostRequest(url, postParameters, 'validateCallBackSuccess', 'validateCallBackFailure');
}

function chooseMobileSubscription(elt) {
	var token = sessionStorage.getItem('token');
	var url = '//order.astel.be/orderForms/chooseMobileSubscription/' + token;
	var postParameters = "or_play_id=" + elt.getAttribute("or_play_id") + "&" + "product_id=" + elt.getAttribute("product_id");
	makeAjaxPostRequest(url, postParameters, 'validateCallBackSuccess', 'validateCallBackFailure');
}

function removeMobileSubscription(id, fromOrpId) {
	var token = sessionStorage.getItem('token');
	var form = document.getElementById('formStep');
	var url = '//order.astel.be/orderForms/removeMobileSubscription/' + token + '/' + id;
	var postParameters = serialize(form);
	postParameters += '&data[fromOrpId]=' + fromOrpId;
	makeAjaxPostRequest(url, postParameters, 'validateCallBackSuccess', 'validateCallBackFailure');
}

function callBeforeProcessingOrder() {
	var token = sessionStorage.getItem('token');
	var checkbox = 0;
	if (document.getElementById("call_before_processing_order").checked) {
		checkbox = 1;
	}
	var url = '//order.astel.be/orderForms/callBeforeProcessingOrder/' + token + '/' + checkbox;
	makeAjaxPostRequest(url, '', 'validateCallBackSuccess', 'validateCallBackFailure');
}

function getFieldsIdsFromJson(json) {
	var fieldsInError = [];

	for (var index in json) {
		fieldsInError.push(json[index]);
	}

	return fieldsInError;
}

function highlightFieldsInErrorFromjson(json) {
	resetFieldsInError();

	var fieldsIds = getFieldsIdsFromJson(json);
	// add focus to error form element
	document.getElementById(fieldsIds[0]).focus();

	for (var idx in fieldsIds) {
		/* Special cases... */
		if (fieldsIds[idx] == 'date_of_birth') {
			var inputs = document.querySelectorAll('#date_of_birth select');

			for (var i = 0; i < inputs.length; i++) {
				inputs[i].classList.add('in-error');
			}

			continue;
		}

		if (fieldsIds[idx] == 'address') {
			var inputs = document.querySelectorAll('#address input.required');

			for (var i = 0; i < inputs.length; i++) {
				inputs[i].classList.add('in-error');
			}

			continue;
		}

		if (fieldsIds[idx] == 'invoicing_address') {
			var inputs = document.querySelectorAll('#invoicing_address input.required');

			for (var i = 0; i < inputs.length; i++) {
				inputs[i].classList.add('in-error');
			}

			continue;
		}

		if (fieldsIds[idx] == 'delivery_address') {
			var inputs = document.querySelectorAll('#delivery_address input.required');

			for (var i = 0; i < inputs.length; i++) {
				inputs[i].classList.add('in-error');
			}

			continue;
		}

		if (fieldsIds[idx] == 'official_address') {
			var inputs = document.querySelectorAll('#official_address input.required');

			for (var i = 0; i < inputs.length; i++) {
				inputs[i].classList.add('in-error');
			}

			continue;
		}
		/* END Special cases... */

		var field = document.getElementById(fieldsIds[idx]);

		if (field != null) {
			field.classList.add('in-error');
		}
	}
}

function resetFieldsInError() {
	var fieldsInError = document.querySelectorAll('.in-error');

	for (var i = 0; i < fieldsInError.length; i++) {
		fieldsInError[i].classList.remove('in-error');
	}
}

function makeSameHeight() {
	var results = document.querySelectorAll(".orderForm .options.sized .option");
	var maxHeight = 250;
// get tallest option's height
	for (var i = 0; i < results.length; i++) {
		if (results[i].clientHeight > maxHeight) {
			var maxHeight = results[i].clientHeight;
		}
	}
// and apply to all options
	for (var i = 0; i < results.length; i++) {
		results[i].style.height = maxHeight + 'px';
	}
}

function toggleBlock(chkElement, targetBlock) {
	var tagetBlockElement = document.getElementById(targetBlock);

	if (tagetBlockElement != null) {
		if (chkElement.checked == true) {
			tagetBlockElement.style.display = 'block';
			chkElement.value = '1';
		}
		else {
			tagetBlockElement.style.display = 'none';
			chkElement.value = '0';
		}
	}
}

function toggleBlockInv(chkElement, targetBlock) {
	var tagetBlockElement = document.getElementById(targetBlock);

	if (tagetBlockElement != null) {
		if (chkElement.checked == false) {
			tagetBlockElement.style.display = 'block';
			chkElement.value = '0';
		}
		else {
			tagetBlockElement.style.display = 'none';
			chkElement.value = '1';
		}
	}
}

function hideBlock(id) {
	var input = document.getElementById(id);

	if (input != null) {
		input.style.display = 'none';
	}
}

function hideOptionDetails(id) {
	hideBlock('optionDetails_' + id);
}

function hideOptionGroupDetails(id) {
	hideBlock('optionGroupDetails_' + id);
}

function showBlock(id) {
	var input = document.getElementById(id);
	if (input != null) {
		input.style.display = 'block';
	}
}

function showHide(blockid) {
	if (document.getElementById(blockid).style.display == 'none') {
		document.getElementById(blockid).style.display = 'block';
	} else {
		document.getElementById(blockid).style.display = 'none';
	}
}

function showOptionDetails(id) {
	showBlock('optionDetails_' + id);
}

function showOptionGroupDetails(id) {
	showBlock('optionGroupDetails_' + id);
}

function executeAfterLoad() {
	mask4Chars('iban');
}

function mask4Chars(blockID) {
	var input = document.getElementById(blockID);
	if (input != null) {
		input.addEventListener('input', function (e) {
				var target = e.target, position = target.selectionEnd, length = target.value.length;
				target.value = target.value.replace(/[^\dA-Za-z]/g, '').replace(/(.{4})/g, '$1 ').trim();
				target.selectionEnd = position += ((target.value.charAt(position - 1) === ' ' && target.value.charAt(length - 1) === ' ' && length !== target.value.length) ? 1 : 0);
			}
		);
	}
}

function calculatePriceLocale(price1, price2, operator) {
	var operators = {
		'+': function (a, b) {
			return a + b
		},
		'-': function (a, b) {
			return a - b
		},
		// Replace operation
		'r': function (a, b) {
			return b
		},
	};
	var price1Float = parseFloat(price1.replace(",", "."));
	if (isNaN(price1Float)) {
		price1Float = 0;
	}
	var price2Float = parseFloat(price2.replace(",", "."));
	if (isNaN(price2Float)) {
		price2Float = 0;
	}
	var parsedPrice = operators[operator](price1Float, price2Float);
	parsedPrice = parseFloat(Math.round(parsedPrice * 100) / 100);//.toFixed(2);
	return parsedPrice.toString().replace(".", ",");
}

function recalculateCart(element, orPlayID, price, activation, setup) {
	var operator = '-';
	if (element.checked) {
		operator = '+';
	}
	if (price != '0') {
		var price_total = document.getElementById('cart-subscription-total');
		var price_totalDiscount = document.getElementById('cart-subscription-total-discount');
		var price_orPlay = document.getElementById('cart-subscription-' + orPlayID);
		var price_orPlayDiscount = document.getElementById('cart-subscription-' + orPlayID + '-discount');
		price_total.innerHTML = calculatePriceLocale(price_total.innerHTML, price, operator);
		if (price_totalDiscount != null) {
			price_totalDiscount.innerHTML = calculatePriceLocale(price_totalDiscount.innerHTML, price, operator);
		}
		price_orPlay.innerHTML = calculatePriceLocale(price_orPlay.innerHTML, price, operator);
		if (price_orPlayDiscount != null) {
			price_orPlayDiscount.innerHTML = calculatePriceLocale(price_orPlayDiscount.innerHTML, price, operator);
		}
	}

	if (activation != '0') {
		var activation_total = document.getElementById('cart-activationfee-total');
		var activation_orPlay = document.getElementById('cart-activationfee-' + orPlayID);

		calculatePriceLocaleAndDisplayText(activation_total, activation_total.innerHTML, activation, operator);
		calculatePriceLocaleAndDisplayText(activation_orPlay, activation_orPlay.innerHTML, activation, operator);
	}

	if (setup != '0') {
		var setup_total = document.getElementById('cart-setupfee-total');
		var setup_orPlay = document.getElementById('cart-setupfee-' + orPlayID);
		calculatePriceLocaleAndDisplayText(setup_total, setup_total.innerHTML, setup, operator);
		calculatePriceLocaleAndDisplayText(setup_orPlay, setup_orPlay.innerHTML, setup, operator);
	}
}

function calculatePriceLocaleAndDisplayText(element, price1, price2, operator) {
	var wrapUpPrice = 0;
	var price1Float = parseFloat(price1.toString().replace(",", "."));
	if (isNaN(price1Float)) {
		wrapUpPrice = 1;
	}
	var price2Float = parseFloat(price2.toString().replace(",", "."));
	if (isNaN(price2Float)) {
		wrapUpPrice = 1;
	}
	var calculatedPrice = calculatePriceLocale(price1, price2, operator);
	var toReturn = calculatedPrice;
	if (calculatedPrice === '0,00' || calculatedPrice === '0' || calculatedPrice === '0.00') {
		var free_text = document.getElementById('cart-text-free');
		var elementID = element.id;
		var parent = element.parentNode;
		// Remove all elements childs of the direct parent
		while (parent.firstChild) {
			parent.removeChild(parent.firstChild);
		}
		parent.innerHTML = '<span id="' + elementID + '">' + free_text.innerHTML + '</span>';
	} else {
		if (wrapUpPrice === 1) {
			var price_particle = document.getElementById('cart-text-price-particle');
			var elementID = element.id;
			var parent = element.parentNode;
			// Remove all elements childs of the direct parent
			while (parent.firstChild) {
				parent.removeChild(parent.firstChild);
			}
			parent.innerHTML = '<span id="' + elementID + '">' + toReturn + '</span>' + price_particle.innerHTML;
		} else {
			// Price increase / decrease, no Free to display nor to add € TVAC
			element.innerHTML = toReturn;
		}
	}
}

function recalculateCartActivationOG(orPlayID, optionGroupID, operation) {
	var hiddenfield = document.getElementById('option_group_hidden_' + orPlayID + '_' + optionGroupID);
	var oldPrice = hiddenfield.getAttribute('cartprice');
	var oldActivation = hiddenfield.getAttribute('cartactivation');
	var oldSetup = hiddenfield.getAttribute('cartsetup');

	var price_total = document.getElementById('cart-subscription-total');
	var price_orPlay = document.getElementById('cart-subscription-' + orPlayID);
	var price_totalDiscount = document.getElementById('cart-subscription-total-discount');
	var price_orPlayDiscount = document.getElementById('cart-subscription-' + orPlayID + '-discount');
	price_total.innerHTML = calculatePriceLocale(price_total.innerHTML, oldPrice, operation);
	if (null != price_orPlay) {
		price_orPlay.innerHTML = calculatePriceLocale(price_orPlay.innerHTML, oldPrice, operation);
	}
	if (price_totalDiscount != null) {
		price_totalDiscount.innerHTML = calculatePriceLocale(price_totalDiscount.innerHTML, oldPrice, operation);
	}
	if (price_orPlayDiscount != null) {
		price_orPlayDiscount.innerHTML = calculatePriceLocale(price_orPlayDiscount.innerHTML, oldPrice, operation);
	}

	var activation_total = document.getElementById('cart-activationfee-total');
	var activation_orPlay = document.getElementById('cart-activationfee-' + orPlayID);
	calculatePriceLocaleAndDisplayText(activation_total, activation_total.innerHTML, oldActivation, operation);
	if (null != activation_orPlay) {
		calculatePriceLocaleAndDisplayText(activation_orPlay, activation_orPlay.innerHTML, oldActivation, operation);
	}

	var setup_total = document.getElementById('cart-setupfee-total');
	var setup_orPlay = document.getElementById('cart-setupfee-' + orPlayID);
	calculatePriceLocaleAndDisplayText(setup_total, setup_total.innerHTML, oldSetup, operation);
	if (null != setup_orPlay) {
		calculatePriceLocaleAndDisplayText(setup_orPlay, setup_orPlay.innerHTML, oldSetup, operation);
	}
}

function recalculateCartOG(element, orPlayID, optionGroupID, operation, price, activation, setup) {
	var operator = 'r';
	if (operation != 'r' && operation != '+') {
		operator = '-';
		if (element.checked) {
			operator = '+';
		}
	}
	var hiddenfield = document.getElementById('option_group_hidden_' + orPlayID + '_' + optionGroupID);
	// Price
	var oldPrice = hiddenfield.getAttribute('cartprice');
	var newPrice = calculatePriceLocale(oldPrice, price, operator);
	var diffPrice = calculatePriceLocale(newPrice, oldPrice, '-');
	hiddenfield.setAttribute('cartprice', newPrice);

	var price_total = document.getElementById('cart-subscription-total');
	var price_totalDiscount = document.getElementById('cart-subscription-total-discount');
	var price_orPlay = document.getElementById('cart-subscription-' + orPlayID);
	var price_orPlayDiscount = document.getElementById('cart-subscription-' + orPlayID + '-discount');
	price_total.innerHTML = calculatePriceLocale(price_total.innerHTML, diffPrice, '+');
	if (price_totalDiscount != null) {
		price_totalDiscount.innerHTML = calculatePriceLocale(price_totalDiscount.innerHTML, diffPrice, '+');
	}
	if (price_orPlay != null) {
		price_orPlay.innerHTML = calculatePriceLocale(price_orPlay.innerHTML, diffPrice, '+');
	}
	if (price_orPlayDiscount != null) {
		price_orPlayDiscount.innerHTML = calculatePriceLocale(price_orPlayDiscount.innerHTML, diffPrice, '+');
	}

	// Activation
	var oldActivation = hiddenfield.getAttribute('cartactivation');
	var newActivation = calculatePriceLocale(oldActivation, activation, operator);
	var diffActivation = calculatePriceLocale(newActivation, oldActivation, '-');
	hiddenfield.setAttribute('cartactivation', newActivation);

	var activation_total = document.getElementById('cart-activationfee-total');
	var activation_orPlay = document.getElementById('cart-activationfee-' + orPlayID);
	calculatePriceLocaleAndDisplayText(activation_total, activation_total.innerHTML, diffActivation, '+');
	if (activation_orPlay != null) {
		calculatePriceLocaleAndDisplayText(activation_orPlay, activation_orPlay.innerHTML, diffActivation, '+');
	}

	// Setup
	var oldSetup = hiddenfield.getAttribute('cartsetup');
	var newSetup = calculatePriceLocale(oldSetup, setup, operator);
	var diffSetup = calculatePriceLocale(newSetup, oldSetup, '-');
	hiddenfield.setAttribute('cartsetup', newSetup);

	var setup_total = document.getElementById('cart-setupfee-total');
	var setup_orPlay = document.getElementById('cart-setupfee-' + orPlayID);
	calculatePriceLocaleAndDisplayText(setup_total, setup_total.innerHTML, diffSetup, '+');
	if (setup_orPlay != null) {
		calculatePriceLocaleAndDisplayText(setup_orPlay, setup_orPlay.innerHTML, diffSetup, '+');
	}
}


function getOffset(el) {
	var _x = 0;
	var _y = 0;
	while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
		_x += el.offsetLeft - el.scrollLeft;
		_y += el.offsetTop - el.scrollTop;
		el = el.offsetParent;
	}
	return {top: _y, left: _x};
}