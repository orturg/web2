
document.addEventListener("DOMContentLoaded", function() {
    const productNameTextField = document.getElementById('product-name-textfield');
    const productNameButton = document.getElementById('product-name-button');
    const productList = document.getElementById('product-list');
    const remainingBasket = document.querySelector('.basket .basket-box:nth-of-type(2) .background-basket');
    const boughtBasket = document.querySelector('.basket .basket-box:nth-of-type(4) .background-basket');

    function attachProductItemEvents(productItem) {
        const productNameSpan = productItem.querySelector('.product-name');
        const statusButton = productItem.querySelector('.product-status');
        const deleteButton = productItem.querySelector('.product-delete');
        const plusButton = productItem.querySelector('.plus');
        const minusButton = productItem.querySelector('.minus');

        productNameSpan.addEventListener('click', handleProductNameClick);
        deleteButton.addEventListener('click', handleDeleteButtonClick);
        plusButton.addEventListener('click', handlePlusButtonClick);
        minusButton.addEventListener('click', handleMinusButtonClick);
        statusButton.addEventListener('click', handleStatusButtonClick);
        productNameButton.addEventListener('click', addProduct);
        productNameTextField.addEventListener('keypress', textFieldAction);
    }

    function addProductToBasket(productName, amount = 1, bought = false) {
        const itemButton = document.createElement('div');
        itemButton.classList.add('item-button');
        if (bought) itemButton.classList.add('crossed');

        itemButton.innerHTML = `
            <span class="item-name">${productName}</span>
            <span class="item-amount">${amount}</span>
        `;

        if (bought) {
            boughtBasket.appendChild(itemButton);
        } else {
            remainingBasket.appendChild(itemButton);
        }

        return itemButton;
    }

    function updateBasket(productName, amount, bought) {
        const existingItem = [...remainingBasket.children, ...boughtBasket.children]
            .find(function(item) {
                return item.querySelector('.item-name').textContent === productName;
            });

        if (existingItem) {
            existingItem.querySelector('.item-amount').textContent = amount;
            if (bought) {
                existingItem.classList.add('crossed');
                boughtBasket.appendChild(existingItem);
            } else {
                existingItem.classList.remove('crossed');
                remainingBasket.appendChild(existingItem);
            }
        } else {
            addProductToBasket(productName, amount, bought);
        }
    }

    function addProduct() {
        const productName = productNameTextField.value.trim();
        if (productName === "") return;

         const existingProduct = [...productList.children].find(function(item) {
            return item.querySelector('.product-name').textContent === productName;
        });

        if (existingProduct) {
            alert("Продукт з таким ім'ям вже існує.");
            return;
        }

        const productItem = document.createElement('div');
        productItem.classList.add('product-item');
        
        productItem.innerHTML = `
            <span class="product-name">${productName}</span>
            <span class="product-controls">
                <button class="control-button minus pale" data-tooltip="Зменшити" disabled>-</button>
                <span class="product-amount">1</span>
                <button class="control-button plus" data-tooltip="Додати">+</button>
            </span>
            <button class="product-status" data-tooltip="Купити">Куплено</button>
            <button class="product-delete" data-tooltip="Видалити">x</button>
        `;

        productList.appendChild(productItem);
        productNameTextField.value = "";
        productNameTextField.focus();

        attachProductItemEvents(productItem);
        addProductToBasket(productName, 1, false);
    }

    function editProductName(productNameSpan) {
        const oldProductName = productNameSpan.textContent;
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = oldProductName;
        inputField.classList.add('product-name-edit');

        productNameSpan.replaceWith(inputField);
        inputField.focus();

        inputField.addEventListener('blur', textFieldButtonAction);

        function textFieldButtonAction() {
            const newProductName = inputField.value.trim();

            const existingProductNames = [...productList.querySelectorAll('.product-name')].map(item => item.textContent);
            if (existingProductNames.includes(newProductName)) {
                alert("Продукт з таким ім'ям вже існує.");
                return;
            }

            if (newProductName !== "") {
                const newProductNameSpan = document.createElement('span');
                newProductNameSpan.classList.add('product-name');
                newProductNameSpan.textContent = newProductName;
                inputField.replaceWith(newProductNameSpan);

                newProductNameSpan.addEventListener('click', newName);

                function newName() {
                    if (statusButton.textContent === 'Куплено') {
                        editProductName(newProductNameSpan);
                    }
                }

                const basketItem = [...remainingBasket.children, ...boughtBasket.children]
                    .find(function(item) {
                        return item.querySelector('.item-name').textContent === oldProductName;
                    });
                if (basketItem) {
                    basketItem.querySelector('.item-name').textContent = newProductName;
                }

                updateBasket(newProductName,
                 parseInt(productNameSpan.closest('.product-item').querySelector('.product-amount').textContent), 
                 statusButton.textContent === 'Не куплено');
            } else {
                inputField.replaceWith(productNameSpan);
            }
        }
    }

    function handleProductNameClick(event) {
        const productNameSpan = event.target;
        const productItem = productNameSpan.closest('.product-item');
        const statusButton = productItem.querySelector('.product-status');
        if (statusButton.textContent === 'Куплено') {
            editProductName(productNameSpan);
        }
    }

    function handleDeleteButtonClick(event) {
        const deleteButton = event.target;
        const productItem = deleteButton.closest('.product-item');
        productItem.remove();
        const itemName = productItem.querySelector('.product-name').textContent;
        const basketItem = [...remainingBasket.children, ...boughtBasket.children]
            .find(function(item) {
                return item.querySelector('.item-name').textContent === itemName;
            });
        if (basketItem) basketItem.remove();
    }

    function handlePlusButtonClick(event) {
        const plusButton = event.target;
        const productItem = plusButton.closest('.product-item');
        const amountSpan = productItem.querySelector('.product-amount');
        let amount = parseInt(amountSpan.textContent);
        amount++;
        amountSpan.textContent = amount;
        const minusButton = productItem.querySelector('.minus');
        minusButton.disabled = false;
        minusButton.classList.remove('pale');
        const productNameSpan = productItem.querySelector('.product-name');
        const statusButton = productItem.querySelector('.product-status');
        updateBasket(productNameSpan.textContent, amount, statusButton.textContent === 'Не куплено');
    }

    function handleMinusButtonClick(event) {
        const minusButton = event.target;
        const productItem = minusButton.closest('.product-item');
        const amountSpan = productItem.querySelector('.product-amount');
        let amount = parseInt(amountSpan.textContent);
        if (amount > 1) {
            amount--;
            amountSpan.textContent = amount;
            if (amount === 1) {
                minusButton.disabled = true;
                minusButton.classList.add('pale');
            }
            const productNameSpan = productItem.querySelector('.product-name');
            const statusButton = productItem.querySelector('.product-status');
            updateBasket(productNameSpan.textContent, amount, statusButton.textContent === 'Не куплено');
        }
    }

    function handleStatusButtonClick(event) {
        const statusButton = event.target;
        const productItem = statusButton.closest('.product-item');
        const statusText = statusButton.textContent;
        const productControls = productItem.querySelector('.product-controls');
        const plusButton = productControls.querySelector('.plus');
        const minusButton = productControls.querySelector('.minus');
        const deleteButton = productItem.querySelector('.product-delete');
        const productName = productItem.querySelector('.product-name');
        const paddingRight = productItem.querySelector('.padding-right');
        const paddingLeft = productItem.querySelector('.padding-left');
        const amount = parseInt(productItem.querySelector('.product-amount').textContent);

        if (statusText === 'Куплено') {
            statusButton.textContent = 'Не куплено';
            statusButton.setAttribute('data-tooltip', 'Прибрати');
            updateBasket(productName.textContent, amount, true);
            productName.classList.add('crossed');
            plusButton.style.visibility = 'hidden';
            minusButton.style.visibility = 'hidden';
            deleteButton.style.display = 'none';
            productControls.style.paddingRight = '26.8px';
            paddingRight.style.display = 'none';
        } else {
            statusButton.textContent = 'Куплено';
            statusButton.setAttribute('data-tooltip', 'Купити');
            updateBasket(productName.textContent, amount, false);
            productName.classList.remove('crossed');
            plusButton.style.visibility = 'visible';
            minusButton.style.visibility = 'visible';
            deleteButton.style.display = 'block';
            productControls.style.paddingRight = '';
            paddingRight.style.display = 'none';
        }
    }


    function textFieldAction(event) {
        if (event.key === 'Enter') {
            addProduct();
        }
    }

    productList.querySelectorAll('.product-item').forEach(changeStatus);

    function changeStatus(productItem) {
        attachProductItemEvents(productItem);
        updateBasket(productItem.querySelector('.product-name').textContent,
        parseInt(productItem.querySelector('.product-amount').textContent),
        productItem.querySelector('.product-status').textContent === 'Не куплено');
    }
});


