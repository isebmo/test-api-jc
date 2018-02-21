
/* AJAX */
function ajaxEnd() {
    hideAjaxLoader();
}

function ajaxStart() {
    showAjaxLoader();
}

/* Code taken from http://form-serialize.googlecode.com/svn/trunk/serialize-0.2.js
** 99% credits goes to Google
** 1% credit goes to the one who mdodified thsi file to allow html5 input types "tel" and "email" :-p */

function serialize(form) {
    if (!form || form.nodeName !== "FORM") {
        return;
    }
    var i, j, q = [];
    for (i = form.elements.length - 1; i >= 0; i = i - 1) {
        if (form.elements[i].name === "") {
            continue;
        }
        switch (form.elements[i].nodeName) {
            case 'INPUT':
                switch (form.elements[i].type) {
                    case 'text':
                    case 'hidden':
                    case 'password':
                    case 'button':
                    case 'reset':
                    case 'submit':
                    case 'email':
                    case 'tel':
                        q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                        break;
                    case 'checkbox':
                    case 'radio':
                        if (form.elements[i].checked) {
                            q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                        }
                        break;
                    case 'file':
                        break;
                }
                break;
            case 'TEXTAREA':
                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                break;
            case 'SELECT':
                switch (form.elements[i].type) {
                    case 'select-one':
                        q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                        break;
                    case 'select-multiple':
                        for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                            if (form.elements[i].options[j].selected) {
                                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].options[j].value));
                            }
                        }
                        break;
                }
                break;
            case 'BUTTON':
                switch (form.elements[i].type) {
                    case 'reset':
                    case 'submit':
                    case 'button':
                        q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                        break;
                }
                break;
        }
    }
    return q.join("&");
}

function makeAjaxGetRequest(url, parameters, successCallback, failureCallback) {
    if (typeof successCallback == 'undefined') {
        successCallback = 'defaultSuccessCallback';
    }

    if (typeof failureCallback == 'undefined') {
        failureCallback = 'defaultFailureCallback';
    }

    //populate GET url with parameters
    if (parameters.constructor === Array) {
        parameters = parameters.join('/');
    }

    if (parameters.length > 0) {
        if (!url.endsWith('/')) {
            url = url + '/';
        }

        url = url + parameters;
    }

    var request = makeHttpObject();
    request.open('GET', url, true);
    request.send(null);

    request.onreadystatechange = function () {
        response = request.responseText;

        if (request.readyState === 4) {
            if (request.status == 200) {
                window[successCallback](response);
            }
            else {
                window[failureCallback](response);
            }
        }
    }
}

function makeAjaxPostRequest(url, postParameters, successCallback, failureCallback) {
    if (typeof successCallback == 'undefined') {
        successCallback = 'defaultSuccessCallback';
    }

    if (typeof failureCallback == 'undefined') {
        failureCallback = 'defaultFailureCallback';
    }

    var request = makeHttpObject();
    request.open('POST', url, true);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.send(postParameters);

    request.onreadystatechange = function () {
        response = request.responseText;

        if (request.readyState === 4) {
            if (request.status == 200) {
                window[successCallback](response);
            }
            else {
                window[failureCallback](response);
            }
        }
    }
}

function makeAjaxPostRequestWithParametersAsArray(url, parameters, successCallback, failureCallback) {
    if (typeof successCallback == 'undefined') {
        successCallback = 'defaultSuccessCallback';
    }

    if (typeof failureCallback == 'undefined') {
        failureCallback = 'defaultFailureCallback';
    }

    var request = makeHttpObject();
    request.open('POST', url, true);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    var form = document.createElement("form");

    for (var p in parameters) {
        if (parameters.hasOwnProperty(p)) {
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = p;
            input.value = parameters[p];
            form.appendChild(input);
        }
    }

    var data = serialize(form);

    request.send(data);

    request.onreadystatechange = function () {
        response = request.responseText;

        if (request.readyState === 4) {
            if (request.status == 200) {
                window[successCallback](response);
            }
            else {
                window[failureCallback](response);
            }
        }
    }
}

function makeHttpObject() {
    var obj = null;

    try {
        obj = new XMLHttpRequest();
        obj.addEventListener("loadstart", ajaxStart, false);
        obj.addEventListener("loadend", ajaxEnd, false);
        return obj;
    }
    catch (error) {
    }

    try {
        obj = new ActiveXObject('Msxml2.XMLHTTP');
        obj.addEventListener("loadstart", ajaxStart, false);
        obj.addEventListener("loadend", ajaxEnd, false);
        return obj;
    }
    catch (error) {
    }

    try {
        obj = new ActiveXObject('Microsoft.XMLHTTP');
        obj.addEventListener("loadstart", ajaxStart, false);
        obj.addEventListener("loadend", ajaxEnd, false);
        return obj;
    }
    catch (error) {
    }

    throw new Error('Could not create HTTP request object.');
}

/* AJAX LOADER */
function hideAjaxLoader() {
    var loader = document.getElementById('ajaxLoader');

    if (loader != null) {
        loader.style.display = 'none';
    }
}

function showAjaxLoader() {
    var loader = document.getElementById('ajaxLoader');

    if (loader != null) {
        loader.style.display = 'block';
    }
}

/* END AJAX LOADER */
/* END AJAX */

/* CALLBACKS */
var defaultSuccessCallback = function (data) {
};
var defaultFailureCallback = function (data) {
};
/* END CALLBACKS */

/* HELPERS */
String.prototype.startsWith = function (prefix) {
    return this.indexOf(prefix) === 0;
}

String.prototype.endsWith = function (suffix) {
    return this.match(suffix + "$") == suffix;
};

/*
* Used to serialize a form's data when making ajax request
*/
function addSerializeScript() {
    /*var serializeScript = document.createElement('script');
    serializeScript.src = '//files.astel.be/order/js/serialize-0.2.js';
    serializeScript.type = 'text/javascript';
    document.head.appendChild(serializeScript);*/
}

/*
* Used for the datepicker in the order form
*/
function addCalendarScript() {
    var calendarScript = document.createElement('script');
    calendarScript.src = '//files.astel.be/order/js/pikaday.js';
    calendarScript.type = 'text/javascript';
    document.head.appendChild(calendarScript);
}

function addClassToElement(className, elementId) {
    var element = document.getElementById(elementId);

    if (element != null) {
        element.classList.add(className);
    }
}

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }

    return true;
}

function loadContentInDiv(content, divId) {
    var div = document.getElementById(divId);

    if (div != null) {
        // remove div content (cleanup)
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }

        div.innerHTML = content;
    }
    else {
        // if target div doesn't exist, we append a new div to the document
        var div = document.createElement('div');
        divId = (Math.random() + 1).toString(36).substring(20);
        div.setAttribute('id', divId);
        div.innerHTML = content;
        document.body.appendChild(div);
    }

    return divId;
}

function setClickActionOnElementsByClass(className, action, args) {
    var elements = document.querySelectorAll('.' + className);

    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];

        if (element != null) {
            element.onclick = function (e) {
                window[action](args);
            };
        }
    }
}

function setElementClickAction(elementId, action, args) {
    var element = document.getElementById(elementId);
    if (element != null) {
        element.onclick = function (e) {
            window[action](args);
        };
    }
}
function setElementClickActionByClass(elementId, action, args) {
    var element = document.getElementsByClassName(elementId);
    if (element != null) {
        element.onclick = function (e) {
            window[action](args);
        };
    }
}
function setElementClickActionByTag(elementId, action, args) {
    var element = document.getElementsByTagName (elementId);
    if (element != null) {
        element.onclick = function (e) {
            window[action](args);
        };
    }
}

/* END HELPERS */

/* MODAL (based on Twitter Bootstrap's modal) */
function createModalOnDocument(modalClass, modalId, modalTitle, modalCloseButtonText) {
    if (typeof modalCloseButtonText == 'undefined') {
        modalCloseButtonText = 'Close';
    }

    var topModalDiv = document.createElement('div');
    topModalDiv.setAttribute('style', 'display:none');
    topModalDiv.setAttribute('class', modalClass);
    topModalDiv.setAttribute('id', modalId);
    topModalDiv.setAttribute('tabindex', '-1');

    var modalDialog = document.createElement('div');
    modalDialog.setAttribute('class', 'modal-dialog');
    topModalDiv.appendChild(modalDialog);

    var modalContent = document.createElement('div');
    modalContent.setAttribute('class', 'modal-content');
    modalContent.setAttribute('id', 'injected-modal-content');
    modalDialog.appendChild(modalContent);

    var modalHeader = document.createElement('div');
    modalHeader.setAttribute('class', 'modal-header');
    modalContent.appendChild(modalHeader);

    var btnClose = document.createElement('button');
    btnClose.setAttribute('class', 'close');
    btnClose.setAttribute('type', 'button');
    btnClose.setAttribute('onclick', 'closeModalById("' + modalId + '");');
    btnClose.innerHTML = '<span>&times;</span><span class="sr-only">Close</span>';
    modalHeader.appendChild(btnClose);

    var title = document.createElement('h4');
    title.setAttribute('class', 'modal-title');
    title.innerHTML = modalTitle;
    modalHeader.appendChild(title);

    var modalBody = document.createElement('div');
    modalBody.setAttribute('class', 'modal-body');
    modalBody.setAttribute('id', 'modalBody');
    modalContent.appendChild(modalBody);

    var modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    modalContent.appendChild(modalFooter);

    var btnOk = document.createElement('button');
    btnOk.setAttribute('type', 'button');
    btnOk.setAttribute('class', 'btn btn-primary');
    btnOk.setAttribute('onclick', 'closeModalById("' + modalId + '");');
    btnOk.innerHTML = modalCloseButtonText;
    modalFooter.appendChild(btnOk);
    // var orderForm = document.getElementById('orderForm');
    // orderForm.appendChild(topModalDiv);
    document.body.appendChild(topModalDiv);
    // document.getElementsByTagName('body')[0].appendChild(topModalDiv);
    // console.log('body: '+ document.getElementsByTagName('body')[0]);

    // var div = document.body.children[0];
    // console.log(div);
    // div.appendChild(topModalDiv);
}

function addMessageToModalById(message, modalId) {
    var modal = document.getElementById(modalId);
    if (modal != null) {
        var modalBody = modal.querySelector('#modalBody');
        var msg = document.createElement('p');
        msg.innerHTML = message;
        modalBody.appendChild(msg);
    }
}

function clearMessagesFromModalById(modalId) {
    var modal = document.getElementById(modalId);

    if (modal != null) {
        var modalBody = modal.querySelector('#modalBody');

        while (modalBody.lastChild) {
            modalBody.removeChild(modalBody.lastChild);
        }
    }
}

function closeModalById(modalId) {
    var modal = document.getElementById(modalId);

    if (modal != null) {
        modal.classList.remove('visible');
    }
}

function showModalById(modalId) {
    var modal = document.getElementById(modalId);

    if (modal != null) {
        modal.classList.add('visible');
    }
}

function showMessageOnErrorModal(text, modalId) {
    clearMessagesFromModalById(modalId);
    addMessageToModalById(text, modalId);
    showModalById(modalId);
}

/* END MODAL */
function goToTop() {
    window.scrollTo(0, 0);
}