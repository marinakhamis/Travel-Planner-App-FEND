//Declaring global variables 
const geonamesURL = "http://api.geonames.org/searchJSON?q=";
const user = "&username=ADD YOUR USER NAME HERE ";
const currentWeatherURL = "http://api.weatherbit.io/v2.0/current?"
const forecastWeatherURL = "http://api.weatherbit.io/v2.0/forecast/daily?"
const weatherbitAPI = "&key=ADD YOUR KEY HERE ";
const pixabayURL = "https://pixabay.com/api/?"
const pixabayAPI = "&key=ADD YOUR KEY HERE &q=";

var weatherbitURL;
var postObject;

//To validate that the user entered a city name
const error = document.getElementById("error")
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("generate").addEventListener("click", ValidCity);
})

function ValidCity() {
    const cityHolder = document.getElementById("city")
    const city = cityHolder.value;
    if (city == "") {
        cityHolder.setAttribute("placeholder", "This cannot be empty")
        cityHolder.style.border = "2px solid #f00"

    } else {
        cityHolder.style.border = "none"

        ValidData(city)
    }
}

function ValidData(city) {

    const d = document.getElementById("date").value;
    let currentDate = new Date().getTime();
    let tripDate = new Date(d).getTime();
    let dateDiffernce = Math.floor((tripDate - currentDate) / (1000 * 3600 * 24))
    console.log(dateDiffernce)
    if (isNaN(dateDiffernce)) {
        error.style.display = "block"
        error.innerHTML = "Please select the right a date"
    } else if (dateDiffernce < 0) {
        error.style.display = "block"
        error.innerHTML = "please select a date after today"

    } else if (dateDiffernce <= 7) {
        error.style.display = "none"
        weatherbitURL = currentWeatherURL
        Action(city, weatherbitURL, dateDiffernce)

    } else if (dateDiffernce > 7) {
        error.style.display = "none"
        weatherbitURL = forecastWeatherURL
        Action(city, weatherbitURL, dateDiffernce)


    }

}




//Setting up APIs and Calculating how many days left 
function Action(city, weatherbitURL, dateDiffernce) {

    getCityInfo(geonamesURL, city, user)
        .then((data) => {
            if (data.totalResultsCount === 0) {
                error.innerHTML = "The City You entered doesn't exist"
                error.style.cssText = "display:block; color:#f00; background:#fff"
            } else {
                let lat = `&lat=${data.geonames[0].lat}`
                let lon = `&lon=${data.geonames[0].lng}`
                let country = `${data.geonames[0].countryName}`
                getWeatherData(weatherbitURL, lat, lon, weatherbitAPI)
                    .then((data) => {
                        console.log(weatherbitURL)
                        console.log(data)

                        if (weatherbitURL == currentWeatherURL) {
                            postObject = {
                                city: data.data[0].city_name,
                                country: country,
                                date: dateDiffernce,
                                temp: data.data[0].app_temp,
                                sky: data.data[0].weather.description,

                            }
                        }
                        if (weatherbitURL == forecastWeatherURL && dateDiffernce <= 15) {
                            postObject = {
                                city: data.city_name,
                                country: country,
                                date: dateDiffernce,
                                temp: data.data[dateDiffernce].temp,
                                sky: data.data[dateDiffernce].weather.description
                            }
                        }
                        if (weatherbitURL == forecastWeatherURL && dateDiffernce >= 16) {
                            postObject = {
                                city: data.city_name,
                                country: country,
                                date: dateDiffernce,
                                temp: data.data[15].temp,
                                sky: data.data[15].weather.description
                            }
                        }
                        console.log(data)

                        Post("http://localhost:8080/Post", postObject)

                            .then(getImage(pixabayURL, pixabayAPI, city))
                            .then(getCountryInfo("https://restcountries.eu/rest/v2/name/", country))
                            .then(() => {
                                updateUI()
                            })

                    })
            }
        })

}


const getCountryInfo = async (url, country) => {
    const res = await fetch(url + country)
    console.log(res)
    try {
        const data = await res.json();
        console.log(data);
        document.getElementById("title").innerHTML = `About ${country}`;
        document.getElementById("about-country").innerHTML = ` ${data[0].name} is The official name,
        The capital of which is ${data[0].capital}.
        ${data[0].languages[0].name} is the native language.`;
        let flag = document.getElementById("flag")
        flag.style.display = "block"
        flag.src = `${data[0].flag}`

    } catch (error) {
        console.log("error in getCountryInfo function", error);
    }
}

const getCityInfo = async (url, city, user) => {

    const res = await fetch(url + city + user)
    try {
        const data = await res.json();
        console.log(data);
        return (data)

    } catch (error) {
        console.log("error in getCityInfo function", error);
    }


}


const getWeatherData = async (url, lat, lon, api) => {
    const res = await fetch(url + lat + lon + api)
    try {
        const weatherdata = await res.json();
        console.log(weatherdata);
        return (weatherdata)



    } catch (error) {
        console.log("error in getWeatherData function", error);
    }

}



//the POST request function 
const Post = async (url = "", data = {}) => {
    const response = await fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)

    })
    try {
        const newData = await response.json();
        console.log(newData);
        return newData
    } catch (error) {
        console.log("error in Post function", error);
    }
}

const getImage = async (url, key, query) => {
    const res = await fetch(url + key + query);
    try {
        const imgData = await res.json();
        console.log(imgData);
        let img = imgData.hits[0].previewURL
        console.log(img)
        let imageTag = document.getElementById("city-image")
        imageTag.style.display = "block"
        imageTag.src = img;

    } catch (error) {
        console.log("error in getImage function", error);
    }

}


// To update the UI and generate tthe country in
const updateUI = async () => {
    const res = await fetch("http://localhost:8080/all");
    try {
        const allData = await res.json();
        document.getElementById("destination").innerHTML = `${allData.city},${allData.country}`;
        document.getElementById("dep-date").innerHTML = ` ${allData.date} days left`;
        document.getElementById("weather").innerHTML = `The temp is ${allData.temp} and there is ${allData.sky}`;

    } catch (error) { console.log("error in updateUI function", error); }

}



export { ValidCity, ValidData, Action }