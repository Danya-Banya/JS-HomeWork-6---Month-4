const form = document.getElementById("form");
const formTitle = document.getElementById("form-title");
const formDescription = document.getElementById("form-description");
const formBtn = document.getElementById("form-btn");
const formPrice = document.getElementById("form-price");
const createErrorToast = document.getElementById("error-toast");

const patchForm = document.getElementById("patch-form");
const patchFormId = document.getElementById("patch-form-id");
const patchErrorToast = document.getElementById("patch-error-toast");

const contentErrorToast = document.getElementById("content-error-toast");

const isEmpty = (inputValue) => !inputValue.trim();
const clearUI = () => {
  const content = document.getElementById("content");
  content.innerHTML = "";
  patchFormId.innerHTML = '<option value="">Выберите товар</option>';
};

const renderProducts = (products = []) => {
  clearUI();
  const content = document.getElementById("content");
  return products.forEach((product) => {
    const resultPrice =
      product.price && !isNaN(product.price)
        ? `$${product.price}`
        : "Цена не указана";
    const div = document.createElement("div");
    div.setAttribute("class", "product");
    div.innerHTML = `
      <h3>${product.title.trim() || "Отсутствует"}</h3>
      <p>${product.description.trim() || "Отсутствует"}</p>
      <span>${resultPrice}</span> 
      <br>
      <h5>Статус: ${product.status}</h5>
      <button class="deleteProduct" id="deleteProduct${product.id}" onclick="deleteProduct('${product.id}')">Удалить</button>
      `;
    content.append(div);
    const option = document.createElement("option");
    option.setAttribute("class", "productOption");
    option.innerHTML = `${product.title.trim()} — ${product.id}`;
    patchFormId.append(option);
  });
};

const onSubmit = async (event) => {
  event.preventDefault();
  try {
    if (!isEmpty(formTitle.value) && !isEmpty(formDescription.value)) {
      fetch("http://localhost:8000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `${formTitle.value.trim() || "Отсутствует"}`,
          description: `${formDescription.value.trim() || "Отсутствует"}`,
          price: `${formPrice.value || "Цена не указана"}`,
          status: "Отправляется",
        }),
      })
        .then((response) => response.json())
        .then((res) => {
          console.log(`Данные успешно созданы!`, res);
          form.reset();
          getProducts();
        })
        .catch((err) => console.log("Ошибка при отправке данных: ", err));
    } else {
      throw new Error("Поля названия или описания пусты");
    }
  } catch (err) {
    console.log(err.message);
    createErrorToast.textContent = `${err.message}`;
  }
};

const patchProduct = (e) => {
  e.preventDefault();
  const selectedValue = patchFormId.value;
  const patchId = selectedValue ? selectedValue.split(" — ")[1] : null;
  const patchFromData = new FormData(patchForm);
  const statusResult = patchFromData.get("status");
  try {
    if (!patchId) {
      throw new Error("Выберите товар из списка");
    }
    if (!statusResult) {
      throw new Error("Выберите новый статус товара");
    }
    fetch(`http://localhost:8000/products/${patchId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: `${statusResult}`,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }
        return response.json();
      })
      .then((res) => {
        console.log(res);
        patchErrorToast.textContent = "";
        getProducts();
      })
      .catch((err) => {
        console.log(err.message);
        patchErrorToast.textContent = err.message;
      });
  } catch (err) {
    patchErrorToast.textContent = err.message;
    console.log(err);
  }
};
const deleteProduct = (productId) => {
  fetch(`http://localhost:8000/products/${productId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка сервера: ", response.status);
      }
      return response.json();
    })
    .then((res) => {
      getProducts();
    })
    .catch((err) => {
      console.error(err);
      contentErrorToast.textContent = err.message;
    });
};
const getProducts = () => {
  fetch("http://localhost:8000/products")
    .then((res) => res.json())
    .then((response) => {
      return renderProducts(response);
    })
    .catch((err) => {
      contentErrorToast.classList.remove("hidden");
      console.log("Ошибка при получении данных", err);
    });
};
getProducts();

form.addEventListener("submit", onSubmit);
patchForm.addEventListener("submit", patchProduct);
