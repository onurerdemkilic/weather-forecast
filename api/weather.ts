import axios from "axios";
import { API_KEY } from "../constants";


const forecastEndpoint  = (params:any) => `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${params.cityName}&days=${params.days}&aqi=no&alerts=no`;
const locationsEndpoint  = (params:any) => `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${params.cityName}`;

const apiCall = async (endpoint:string) => {
    const options = {
        method: "GET",
        url: endpoint
    };
    try {
        const response = await axios.request(options);
        return response.data;
    }
    catch(err) {
        console.log(err);
        return null;
    }
}

export const fetchWeatherForecast = (params:any) => {
    let forecastUrl = forecastEndpoint(params);
    return apiCall(forecastUrl);
}

export const fetchLocations = (params:any) => {
    let forecastUrl = locationsEndpoint(params);
    return apiCall(forecastUrl);
}