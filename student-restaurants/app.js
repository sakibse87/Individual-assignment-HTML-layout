// =========================
// API
// =========================

const API_URL = "https://media2.edu.metropolia.fi/restaurant";


// =========================
// DOM elements
// =========================

const restaurantList = document.getElementById("restaurantList");

const searchInput = document.getElementById("searchInput");

const cityFilter = document.getElementById("cityFilter");

const restaurantCount = document.getElementById("restaurantCount");

const loading = document.getElementById("loading");

const errorMessage = document.getElementById("errorMessage");

const menuSection = document.getElementById("menuSection");

const selectedRestaurantName =
    document.getElementById("selectedRestaurantName");

const selectedRestaurantAddress =
    document.getElementById("selectedRestaurantAddress");

const dailyButton = document.getElementById("dailyButton");

const weeklyButton = document.getElementById("weeklyButton");

const dailyMenu = document.getElementById("dailyMenu");

const weeklyMenu = document.getElementById("weeklyMenu");

const dailyMenuContent =
    document.getElementById("dailyMenuContent");

const weeklyMenuContent =
    document.getElementById("weeklyMenuContent");

const closeMenuButton =
    document.getElementById("closeMenuButton");


// =========================
// Application state
// =========================

let restaurants = [];

let selectedRestaurant = null;


// =========================
// Load restaurants
// =========================

async function loadRestaurants() {

    try {

        loading.classList.remove("hidden");

        errorMessage.classList.add("hidden");

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch restaurants");
        }

        const data = await response.json();

        restaurants = data;

        console.log("Restaurants:", restaurants);

        createCityFilter();

        displayRestaurants(restaurants);

    } catch (error) {

        console.error(error);

        errorMessage.classList.remove("hidden");

    } finally {

        loading.classList.add("hidden");

    }
}


// =========================
// Display restaurants
// =========================

function displayRestaurants(list) {

    restaurantList.innerHTML = "";

    restaurantCount.textContent =
        `${list.length} restaurant${list.length !== 1 ? "s" : ""}`;


    if (list.length === 0) {

        restaurantList.innerHTML = `
            <div class="message">
                No restaurants found.
            </div>
        `;

        return;
    }


    list.forEach(function (restaurant) {

        const card = document.createElement("article");

        card.className = "restaurant-card";


        const name =
            restaurant.name || "Unknown restaurant";

        const address =
            restaurant.address || "Address not available";

        const city =
            restaurant.city || "City not available";

        const provider =
            restaurant.company || restaurant.provider || "Not available";


        card.innerHTML = `

            <h3>${name}</h3>

            <div class="restaurant-info">
                <strong>Address:</strong>
                ${address}
            </div>

            <div class="restaurant-info">
                <strong>City:</strong>
                ${city}
            </div>

            <div class="restaurant-info">
                <strong>Provider:</strong>
                ${provider}
            </div>

            <button class="view-menu-button">
                View Menu
            </button>
        `;


        const button =
            card.querySelector(".view-menu-button");


        button.addEventListener("click", function () {

            openRestaurantMenu(restaurant);

        });


        restaurantList.appendChild(card);

    });

}


// =========================
// Create city filter
// =========================

function createCityFilter() {

    const cities = restaurants
        .map(function (restaurant) {
            return restaurant.city;
        })
        .filter(function (city) {
            return city;
        });


    const uniqueCities = [...new Set(cities)];


    uniqueCities.sort();


    cityFilter.innerHTML = `
        <option value="all">All cities</option>
    `;


    uniqueCities.forEach(function (city) {

        const option =
            document.createElement("option");

        option.value = city;

        option.textContent = city;

        cityFilter.appendChild(option);

    });

}


// =========================
// Search and filtering
// =========================

function filterRestaurants() {

    const searchText =
        searchInput.value.toLowerCase().trim();

    const selectedCity =
        cityFilter.value;


    const filteredRestaurants =
        restaurants.filter(function (restaurant) {

            const restaurantName =
                (restaurant.name || "").toLowerCase();

            const restaurantCity =
                (restaurant.city || "").toLowerCase();


            const matchesSearch =
                restaurantName.includes(searchText) ||
                restaurantCity.includes(searchText);


            const matchesCity =
                selectedCity === "all" ||
                restaurant.city === selectedCity;


            return matchesSearch && matchesCity;

        });


    displayRestaurants(filteredRestaurants);

}


searchInput.addEventListener(
    "input",
    filterRestaurants
);


cityFilter.addEventListener(
    "change",
    filterRestaurants
);


// =========================
// Open restaurant menu
// =========================

async function openRestaurantMenu(restaurant) {

    selectedRestaurant = restaurant;


    selectedRestaurantName.textContent =
        restaurant.name || "Restaurant Menu";


    selectedRestaurantAddress.textContent =
        restaurant.address || "Address not available";


    menuSection.classList.remove("hidden");


    menuSection.scrollIntoView({
        behavior: "smooth"
    });


    dailyButton.classList.add("active");

    weeklyButton.classList.remove("active");

    dailyMenu.classList.remove("hidden");

    weeklyMenu.classList.add("hidden");


    await loadDailyMenu(restaurant);

}


// =========================
// Daily menu
// =========================

async function loadDailyMenu(restaurant) {

    dailyMenuContent.innerHTML =
        `<p>Loading today's menu...</p>`;


    try {

        const restaurantId =
            restaurant.id;


        if (!restaurantId) {

            dailyMenuContent.innerHTML = `
                <p>
                    Restaurant ID is not available.
                </p>
            `;

            return;
        }


        const response = await fetch(
            `${API_URL}/${restaurantId}/daily`
        );


        if (!response.ok) {
            throw new Error("Daily menu not found");
        }


        const menu = await response.json();

        console.log("Daily menu:", menu);


        displayDailyMenu(menu);


    } catch (error) {

        console.error(error);

        dailyMenuContent.innerHTML = `
            <div class="message">
                Today's menu could not be loaded.
            </div>
        `;

    }

}


// =========================
// Display daily menu
// =========================

function displayDailyMenu(menu) {

    if (!menu) {

        dailyMenuContent.innerHTML = `
            <p>No menu available.</p>
        `;

        return;
    }


    let items = [];


    if (Array.isArray(menu)) {

        items = menu;

    } else if (menu.courses) {

        items = menu.courses;

    } else if (menu.menu) {

        items = menu.menu;

    } else {

        items = [menu];

    }


    dailyMenuContent.innerHTML = "";


    items.forEach(function (item) {

        const menuItem =
            document.createElement("div");

        menuItem.className = "menu-item";


        if (typeof item === "string") {

            menuItem.textContent = item;

        } else {

            menuItem.textContent =
                item.name ||
                item.title ||
                item.description ||
                JSON.stringify(item);

        }


        dailyMenuContent.appendChild(menuItem);

    });

}


// =========================
// Weekly menu
// =========================

async function loadWeeklyMenu(restaurant) {

    weeklyMenuContent.innerHTML =
        `<p>Loading weekly menu...</p>`;


    try {

        const restaurantId =
            restaurant.id;


        if (!restaurantId) {

            weeklyMenuContent.innerHTML = `
                <p>
                    Restaurant ID is not available.
                </p>
            `;

            return;
        }


        const response = await fetch(
            `${API_URL}/${restaurantId}/weekly`
        );


        if (!response.ok) {
            throw new Error("Weekly menu not found");
        }


        const menu = await response.json();

        console.log("Weekly menu:", menu);


        displayWeeklyMenu(menu);


    } catch (error) {

        console.error(error);

        weeklyMenuContent.innerHTML = `
            <div class="message">
                Weekly menu could not be loaded.
            </div>
        `;

    }

}


// =========================
// Display weekly menu
// =========================

function displayWeeklyMenu(menu) {

    if (!menu) {

        weeklyMenuContent.innerHTML =
            "<p>No weekly menu available.</p>";

        return;
    }


    weeklyMenuContent.innerHTML = "";


    if (Array.isArray(menu)) {

        menu.forEach(function (day) {

            const dayContainer =
                document.createElement("div");

            dayContainer.className =
                "menu-day";


            const heading =
                document.createElement("h4");

            heading.textContent =
                day.day ||
                day.date ||
                "Menu";


            dayContainer.appendChild(heading);


            const courses =
                day.courses ||
                day.menu ||
                day.items ||
                [];


            if (Array.isArray(courses)) {

                courses.forEach(function (course) {

                    const item =
                        document.createElement("div");

                    item.className =
                        "menu-item";


                    if (typeof course === "string") {

                        item.textContent = course;

                    } else {

                        item.textContent =
                            course.name ||
                            course.title ||
                            course.description ||
                            JSON.stringify(course);

                    }


                    dayContainer.appendChild(item);

                });

            }


            weeklyMenuContent.appendChild(
                dayContainer
            );

        });

    } else {

        weeklyMenuContent.innerHTML = `
            <div class="menu-day">
                <div class="menu-item">
                    ${JSON.stringify(menu)}
                </div>
            </div>
        `;

    }

}


// =========================
// Daily / Weekly buttons
// =========================

dailyButton.addEventListener(
    "click",
    async function () {

        dailyButton.classList.add("active");

        weeklyButton.classList.remove("active");

        dailyMenu.classList.remove("hidden");

        weeklyMenu.classList.add("hidden");


        if (selectedRestaurant) {

            await loadDailyMenu(
                selectedRestaurant
            );

        }

    }
);


weeklyButton.addEventListener(
    "click",
    async function () {

        weeklyButton.classList.add("active");

        dailyButton.classList.remove("active");

        weeklyMenu.classList.remove("hidden");

        dailyMenu.classList.add("hidden");


        if (selectedRestaurant) {

            await loadWeeklyMenu(
                selectedRestaurant
            );

        }

    }
);


// =========================
// Close menu
// =========================

closeMenuButton.addEventListener(
    "click",
    function () {

        menuSection.classList.add("hidden");

    }
);


// =========================
// Start application
// =========================

loadRestaurants();